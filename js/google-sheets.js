// Google Sheets Service - ENHANCED VERSION WITH PERSISTENT SPREADSHEET MANAGEMENT
class GoogleSheetsService {
    constructor() {
        this.clientId = '381159845906-0qpf642gg5uv4dhr8lapmr6dqgqepmnp.apps.googleusercontent.com';
        this.scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ].join(' ');
        this.token = null;
        this.user = null;
        this.spreadsheetId = null;
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // ===== NEW METHOD =====
    // Tambahkan method untuk menangani token expired
    async refreshTokenIfNeeded() {
        // Untuk sekarang, kita redirect ke login ulang jika token expired
        // Di production, ini akan menggunakan refresh token
        const token = localStorage.getItem('stockmint_token');
        
        if (!token || token.startsWith('demo_token_')) {
            return false;
        }
        
        // Cek apakah token masih valid dengan request sederhana
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401) {
                // Token expired, perlu login ulang
                console.log('🔑 Google token expired, redirecting to login...');
                localStorage.removeItem('stockmint_token');
                localStorage.removeItem('stockmint_user');
                localStorage.removeItem('stockmint_plan');
                localStorage.setItem('stockmint_token_expired', 'true');
                alert('Your Google session has expired. Please login again.');
                window.location.href = 'index.html';
                return false;
            }
            
            return response.ok;
        } catch (error) {
            console.warn('Token check failed:', error);
            return false;
        }
    }

    // ===== UPDATED METHOD =====
    // Initialize Google Sheets service
    async init() {
        try {
            console.log('🔄 Initializing Google Sheets service...');
            
            // Check if user is Google authenticated (not demo)
            const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            this.user = user;
            
            if (user.isDemo) {
                console.log('🔄 Demo user - Google Sheets disabled');
                this.initialized = false;
                return false;
            }

            // Check for existing token
            this.token = localStorage.getItem('stockmint_token');
            if (!this.token || this.token.startsWith('demo_token_')) {
                console.log('🚫 No valid Google token found');
                this.initialized = false;
                return false;
            }
            
            // Cek apakah token masih valid
            const tokenValid = await this.refreshTokenIfNeeded();
            if (!tokenValid) {
                this.initialized = false;
                return false;
            }

            // Check for existing spreadsheet ID
            this.spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
            
            // Jika tidak ada spreadsheet ID, coba cari spreadsheet yang sudah ada
            if (!this.spreadsheetId) {
                console.log('🔍 No spreadsheet ID in localStorage, searching for existing spreadsheet...');
                const existingSheet = await this.findExistingSpreadsheet();
                if (existingSheet) {
                    this.spreadsheetId = existingSheet.id;
                    localStorage.setItem('stockmint_google_sheet_id', existingSheet.id);
                    localStorage.setItem('stockmint_google_sheet_url', existingSheet.url);
                    console.log('✅ Found existing spreadsheet:', existingSheet.name);
                } else {
                    console.log('📝 No spreadsheet found, will create during setup');
                }
                this.initialized = true;
                return true;
            }

            console.log('✅ Google Sheets service initialized with existing spreadsheet');
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('❌ Error initializing Google Sheets:', error);
            this.initialized = false;
            return false;
        }
    }

    // ===== NEW METHOD =====
    // Cari spreadsheet yang sudah ada untuk user ini
    async findExistingSpreadsheet() {
        try {
            const user = this.user;
            if (user.isDemo || !user.email || !this.token) return null;
            
            // Cari berdasarkan uniqueId atau email
            const userIdentifier = user.uniqueId ? 
                user.uniqueId.substring(0, 8) : 
                user.email.split('@')[0];
            
            if (!userIdentifier) return null;
            
            // Query untuk mencari spreadsheet dengan pola "StockMint" dan user identifier
            const searchQuery = `name contains 'StockMint' and name contains '${userIdentifier}' and mimeType='application/vnd.google-apps.spreadsheet'`;
            
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,webViewLink,createdTime,modifiedTime)`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.files && searchData.files.length > 0) {
                    // Ambil spreadsheet yang paling baru dimodifikasi
                    const latestSheet = searchData.files.sort((a, b) => 
                        new Date(b.modifiedTime || b.createdTime || 0) - 
                        new Date(a.modifiedTime || a.createdTime || 0)
                    )[0];
                    
                    console.log('📊 Found existing user spreadsheet:', latestSheet.name);
                    return {
                        id: latestSheet.id,
                        name: latestSheet.name,
                        url: latestSheet.webViewLink || `https://docs.google.com/spreadsheets/d/${latestSheet.id}/edit`,
                        created: latestSheet.createdTime,
                        modified: latestSheet.modifiedTime
                    };
                }
            }
            
            // Jika tidak ditemukan dengan pola, coba cari semua spreadsheet StockMint
            const backupSearch = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name contains 'StockMint' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,webViewLink)`,
                {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                }
            );
            
            if (backupSearch.ok) {
                const backupData = await backupSearch.json();
                if (backupData.files && backupData.files.length > 0) {
                    // Ambil yang pertama
                    const sheet = backupData.files[0];
                    console.log('📊 Found StockMint spreadsheet:', sheet.name);
                    return {
                        id: sheet.id,
                        name: sheet.name,
                        url: sheet.webViewLink || `https://docs.google.com/spreadsheets/d/${sheet.id}/edit`
                    };
                }
            }
            
            return null;
            
        } catch (searchError) {
            console.log('🔍 Could not search for existing spreadsheet:', searchError.message);
            return null;
        }
    }

    // Check if service is ready
    isReady() {
        return this.initialized && this.token && !this.user?.isDemo;
    }

    // ===== PERBAIKAN METHOD createSpreadsheet() =====
    async createSpreadsheet(title) {
        try {
            if (!this.token || this.token.startsWith('demo_token_')) {
                throw new Error('Invalid Google token');
            }

            console.log('📝 Creating new spreadsheet:', title);
            
            const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            
            // GENERATE NAMA UNIK BERDASARKAN USER + COMPANY
            let spreadsheetName = title;
            
            // Jika user punya uniqueId, tambahkan ke nama untuk identifikasi
            if (user.uniqueId && !spreadsheetName.includes(user.uniqueId)) {
                spreadsheetName = `${title} [${user.uniqueId.substring(0, 8)}]`;
            }
            
            // Cari spreadsheet yang sudah ada berdasarkan pola
            const existingSheet = await this.findExistingSpreadsheet();
            if (existingSheet) {
                console.log('📊 Using existing spreadsheet:', existingSheet.name);
                this.spreadsheetId = existingSheet.id;
                
                // Save spreadsheet info
                localStorage.setItem('stockmint_google_sheet_id', this.spreadsheetId);
                localStorage.setItem('stockmint_google_sheet_url', existingSheet.url);
                
                return this.spreadsheetId;
            }

            // Buat spreadsheet baru dengan nama yang unik
            const spreadsheetData = {
                properties: {
                    title: spreadsheetName
                },
                sheets: this.getDefaultSheets()
            };

            const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(spreadsheetData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to create spreadsheet: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            this.spreadsheetId = data.spreadsheetId;
            
            // SIMPAN JUGA DI indexedDB ATAU sessionStorage SEBAGAI BACKUP
            this.saveSpreadsheetToBackup(this.spreadsheetId, spreadsheetName);
            
            // Save spreadsheet info
            localStorage.setItem('stockmint_google_sheet_id', this.spreadsheetId);
            localStorage.setItem('stockmint_google_sheet_url', 
                data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`);
            
            console.log('✅ Spreadsheet created:', {
                id: this.spreadsheetId,
                name: spreadsheetName
            });
            
            return this.spreadsheetId;
            
        } catch (error) {
            console.error('❌ Error creating spreadsheet:', error);
            throw error;
        }
    }
    
    // ===== NEW METHOD: getDefaultSheets() =====
    getDefaultSheets() {
        return [
            {
                properties: {
                    title: 'Company',
                    gridProperties: {
                        rowCount: 100,
                        columnCount: 10
                    }
                }
            },
            {
                properties: {
                    title: 'Warehouses',
                    gridProperties: {
                        rowCount: 100,
                        columnCount: 10
                    }
                }
            },
            {
                properties: {
                    title: 'Suppliers',
                    gridProperties: {
                        rowCount: 100,
                        columnCount: 10
                    }
                }
            },
            {
                properties: {
                    title: 'Customers',
                    gridProperties: {
                        rowCount: 100,
                        columnCount: 10
                    }
                }
            },
            {
                properties: {
                    title: 'Categories',
                    gridProperties: {
                        rowCount: 100,
                        columnCount: 10
                    }
                }
            },
            {
                properties: {
                    title: 'Products',
                    gridProperties: {
                        rowCount: 1000,
                        columnCount: 20
                    }
                }
            },
            {
                properties: {
                    title: 'Transactions',
                    gridProperties: {
                        rowCount: 1000,
                        columnCount: 15
                    }
                }
            },
            {
                properties: {
                    title: 'Settings',
                    gridProperties: {
                        rowCount: 50,
                        columnCount: 10
                    }
                }
            }
        ];
    }
    
    // ===== NEW METHOD: saveSpreadsheetToBackup() =====
    saveSpreadsheetToBackup(spreadsheetId, spreadsheetName) {
        try {
            // Simpan di sessionStorage (bertahan selama tab terbuka)
            sessionStorage.setItem('stockmint_sheet_backup', JSON.stringify({
                id: spreadsheetId,
                name: spreadsheetName,
                timestamp: Date.now(),
                user: this.user?.email || 'unknown'
            }));
            
            // Juga simpan di localStorage dengan key yang berbeda
            const backupKey = `stockmint_sheet_${this.user?.uniqueId || this.user?.email || 'unknown'}`;
            localStorage.setItem(backupKey, JSON.stringify({
                id: spreadsheetId,
                name: spreadsheetName,
                created: new Date().toISOString(),
                lastAccess: new Date().toISOString()
            }));
            
            console.log('💾 Spreadsheet info backed up');
            
        } catch (error) {
            console.warn('Failed to backup spreadsheet:', error);
        }
    }

    // Tambahkan method baru untuk request yang lebih sederhana
    async createSpreadsheetSimplified(title) {
        try {
            console.log('📝 Creating spreadsheet (simplified):', title);
            
            const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        title: title || 'StockMint Data'
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Simplified creation failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            this.spreadsheetId = data.spreadsheetId;
            
            // Save spreadsheet info
            localStorage.setItem('stockmint_google_sheet_id', this.spreadsheetId);
            localStorage.setItem('stockmint_google_sheet_url', 
                data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`);
            
            console.log('✅ Spreadsheet created (simplified):', this.spreadsheetId);
            return this.spreadsheetId;
            
        } catch (error) {
            console.error('❌ Simplified creation failed:', error);
            throw error;
        }
    }

    // Get or create spreadsheet
    async getSpreadsheet() {
        // Check if we already have a spreadsheet ID
        let spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        
        if (spreadsheetId) {
            this.spreadsheetId = spreadsheetId;
            return spreadsheetId;
        }

        // Create new spreadsheet if doesn't exist
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        const company = JSON.parse(localStorage.getItem('stockmint_company') || '{}');
        
        let spreadsheetName;
        if (company.name) {
            spreadsheetName = `StockMint - ${company.name}`;
        } else if (user.name) {
            spreadsheetName = `StockMint - ${user.name}`;
        } else {
            spreadsheetName = `StockMint - ${user.email || 'My Inventory'}`;
        }
        
        // Tambahkan tahun jika belum ada
        if (!spreadsheetName.includes(new Date().getFullYear())) {
            spreadsheetName += ` (${new Date().getFullYear()})`;
        }
        
        return await this.createSpreadsheet(spreadsheetName);
    }

    // Save setup data to Google Sheets
    async saveSetupData(setupData) {
        try {
            if (!this.isReady()) {
                console.log('⚠️ Google Sheets not available, saving to localStorage only');
                return false;
            }

            console.log('💾 Saving setup data to Google Sheets...');
            
            // Get or create spreadsheet
            const spreadsheetId = await this.getSpreadsheet();
            
            if (!spreadsheetId) {
                throw new Error('Failed to get spreadsheet');
            }

            // Prepare sheets structure
            const sheets = [
                { name: 'Company', data: setupData.company ? [setupData.company] : [] },
                { name: 'Warehouses', data: setupData.warehouses || [] },
                { name: 'Suppliers', data: setupData.suppliers || [] },
                { name: 'Customers', data: setupData.customers || [] },
                { name: 'Categories', data: setupData.categories || [] },
                { name: 'Products', data: setupData.products || [] },
                { name: 'Opening_Stocks', data: this.createOpeningStockData(setupData) }
            ];

            // Process each sheet
            for (const sheet of sheets) {
                if (sheet.data && sheet.data.length > 0) {
                    await this.saveSheetData(spreadsheetId, sheet.name, sheet.data);
                }
            }

            console.log('✅ All setup data saved to Google Sheets');
            return true;

        } catch (error) {
            console.error('❌ Error saving to Google Sheets:', error);
            throw error;
        }
    }

    // Save data to specific sheet
    async saveSheetData(spreadsheetId, sheetName, data) {
        if (!data || data.length === 0) {
            console.log(`⚠️ No data to save for sheet: ${sheetName}`);
            return;
        }

        try {
            // Get headers from first object
            const headers = Object.keys(data[0]);
            
            // Prepare values array
            const values = [
                headers, // Header row
                ...data.map(item => headers.map(header => {
                    const value = item[header];
                    // Handle different data types
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') return JSON.stringify(value);
                    return value;
                }))
            ];

            // Ensure sheet exists
            await this.ensureSheetExists(spreadsheetId, sheetName);

            // Clear existing data
            await this.clearSheet(spreadsheetId, sheetName);

            // Write data
            const range = `${sheetName}!A1`;
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        range: range,
                        majorDimension: 'ROWS',
                        values: values
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to save ${sheetName}: ${response.statusText}`);
            }

            console.log(`✅ ${sheetName} saved: ${data.length} rows`);
            
        } catch (error) {
            console.error(`❌ Error saving sheet ${sheetName}:`, error);
            throw error;
        }
    }

    // Ensure sheet exists
    async ensureSheetExists(spreadsheetId, sheetName) {
        try {
            // Get spreadsheet metadata
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            const spreadsheet = await response.json();
            const sheetExists = spreadsheet.sheets?.some(sheet => 
                sheet.properties.title === sheetName
            );

            if (!sheetExists) {
                // Add new sheet
                await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            requests: [{
                                addSheet: {
                                    properties: {
                                        title: sheetName
                                    }
                                }
                            }]
                        })
                    }
                );
                console.log(`✅ Created new sheet: ${sheetName}`);
            }

        } catch (error) {
            console.error(`❌ Error ensuring sheet exists ${sheetName}:`, error);
            throw error;
        }
    }

    // Clear sheet content
    async clearSheet(spreadsheetId, sheetName) {
        try {
            await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z1000:clear`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            // Ignore clear errors - sheet might not exist yet
            console.log(`ℹ️ Could not clear sheet ${sheetName}, might be new`);
        }
    }

    // Create opening stock data
    createOpeningStockData(setupData) {
        const warehouses = setupData.warehouses || [];
        const products = setupData.products || [];
        
        if (warehouses.length === 0 || products.length === 0) return [];

        // Find primary warehouse
        let primaryWarehouse = warehouses.find(wh => wh.isPrimary);
        if (!primaryWarehouse && warehouses.length > 0) {
            primaryWarehouse = warehouses[0];
        }

        return products.map(product => ({
            productId: product.id,
            productName: product.name,
            warehouseId: primaryWarehouse?.id || '',
            warehouseName: primaryWarehouse?.name || 'Main Warehouse',
            quantity: product.stock || 0,
            cost: product.purchasePrice || 0,
            date: new Date().toISOString(),
            type: 'opening',
            createdAt: new Date().toISOString()
        }));
    }

    // Get spreadsheet info
    async getSpreadsheetInfo() {
        if (!this.spreadsheetId) {
            this.spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        }
        
        if (!this.spreadsheetId || !this.token) return null;
        
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting spreadsheet info:', error);
        }
        
        return null;
    }

    // Sync local data to Google Sheets
    async syncLocalDataToSheets() {
        try {
            // Load all local data
            const setupData = {
                company: JSON.parse(localStorage.getItem('stockmint_company') || '{}'),
                warehouses: JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]'),
                suppliers: JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]'),
                customers: JSON.parse(localStorage.getItem('stockmint_customers') || '[]'),
                categories: JSON.parse(localStorage.getItem('stockmint_categories') || '[]'),
                products: JSON.parse(localStorage.getItem('stockmint_products') || '[]')
            };

            // Save to Google Sheets
            const result = await this.saveSetupData(setupData);
            
            if (result) {
                console.log('✅ Local data synced to Google Sheets');
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error syncing local data:', error);
            throw error;
        }
    }

    // Load data from Google Sheets to localStorage
    async loadDataFromSheets() {
        try {
            if (!this.spreadsheetId) {
                this.spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
            }
            
            if (!this.spreadsheetId) {
                console.log('📝 No spreadsheet ID found');
                return false;
            }

            console.log('📥 Loading data from Google Sheets...');
            
            // Define sheets to load
            const sheets = ['Company', 'Warehouses', 'Suppliers', 'Customers', 'Categories', 'Products'];
            
            for (const sheetName of sheets) {
                try {
                    const response = await fetch(
                        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!A1:Z1000`,
                        {
                            headers: {
                                'Authorization': `Bearer ${this.token}`
                            }
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.values && data.values.length > 1) {
                            const headers = data.values[0];
                            const rows = data.values.slice(1);
                            
                            const formattedData = rows.map(row => {
                                const obj = {};
                                headers.forEach((header, index) => {
                                    obj[header] = row[index] || '';
                                });
                                return obj;
                            });
                            
                            // Save to localStorage
                            const localStorageKey = `stockmint_${sheetName.toLowerCase()}`;
                            localStorage.setItem(localStorageKey, JSON.stringify(
                                sheetName === 'Company' ? formattedData[0] || {} : formattedData
                            ));
                            
                            console.log(`✅ Loaded ${formattedData.length} ${sheetName} from Google Sheets`);
                        }
                    }
                } catch (sheetError) {
                    console.log(`⚠️ Could not load sheet ${sheetName}:`, sheetError.message);
                    // Continue with other sheets
                }
            }
            
            // Mark setup as completed if we loaded data
            localStorage.setItem('stockmint_setup_completed', 'true');
            console.log('✅ Data loaded from Google Sheets to localStorage');
            return true;
            
        } catch (error) {
            console.error('❌ Error loading data from Google Sheets:', error);
            return false;
        }
    }

    // Test connection to Google Sheets
    async testConnection() {
        try {
            if (!this.token) {
                return { success: false, message: 'No valid token' };
            }
            
            if (!this.spreadsheetId) {
                return { success: false, message: 'No spreadsheet ID' };
            }
            
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );
            
            if (response.ok) {
                return { success: true, message: 'Connected successfully' };
            } else {
                return { success: false, message: `Connection failed: ${response.status}` };
            }
            
        } catch (error) {
            return { success: false, message: `Connection error: ${error.message}` };
        }
    }
    
    // ===== NEW METHOD: Clear ALL data in spreadsheet =====
    async clearAllSheetsData() {
        try {
            if (!this.spreadsheetId || !this.token) {
                throw new Error('Not connected to Google Sheets');
            }
            
            console.log('🧹 Clearing all sheets data...');
            
            // Dapatkan semua sheets dalam spreadsheet
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to get spreadsheet info');
            }
            
            const spreadsheet = await response.json();
            const sheetNames = spreadsheet.sheets.map(sheet => sheet.properties.title);
            
            // Kosongkan setiap sheet
            for (const sheetName of sheetNames) {
                try {
                    await this.clearSheet(this.spreadsheetId, sheetName);
                    console.log(`✅ Cleared sheet: ${sheetName}`);
                } catch (clearError) {
                    console.warn(`Could not clear sheet ${sheetName}:`, clearError.message);
                }
            }
            
            console.log('✅ All sheets cleared successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error clearing sheets:', error);
            throw error;
        }
    }
}

// Create global instance
window.GoogleSheetsService = new GoogleSheetsService();
