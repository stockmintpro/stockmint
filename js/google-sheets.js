// Google Sheets Service
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
    }

    // Initialize Google Sheets service
    async init() {
        try {
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

            console.log('✅ Google Sheets service initialized');
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Error initializing Google Sheets:', error);
            this.initialized = false;
            return false;
        }
    }

    // Check if service is ready
    isReady() {
        return this.initialized && this.token && !this.user?.isDemo;
    }

    // Create new Google Spreadsheet
    async createSpreadsheet(title) {
        try {
            if (!this.isReady()) {
                throw new Error('Google Sheets service not ready');
            }

            console.log('📝 Creating new spreadsheet:', title);

            const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        title: title || `StockMint_${new Date().toISOString().split('T')[0]}`,
                        locale: 'id_ID',
                        timeZone: 'Asia/Jakarta'
                    },
                    sheets: [
                        {
                            properties: {
                                title: 'Setup_Data',
                                gridProperties: {
                                    rowCount: 1000,
                                    columnCount: 20
                                }
                            }
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create spreadsheet');
            }

            const data = await response.json();
            this.spreadsheetId = data.spreadsheetId;
            
            // Save spreadsheet ID to localStorage
            localStorage.setItem('stockmint_google_sheet_id', this.spreadsheetId);
            localStorage.setItem('stockmint_google_sheet_url', data.spreadsheetUrl);
            
            console.log('✅ Spreadsheet created:', this.spreadsheetId);
            return this.spreadsheetId;
            
        } catch (error) {
            console.error('❌ Error creating spreadsheet:', error);
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
        const spreadsheetName = company.name 
            ? `StockMint - ${company.name}` 
            : `StockMint - ${user.name || user.email}`;
        
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

            // Save different data types to different sheets
            const sheetsToCreate = [
                { name: 'Company', data: [setupData.company] },
                { name: 'Warehouses', data: setupData.warehouses },
                { name: 'Suppliers', data: setupData.suppliers },
                { name: 'Customers', data: setupData.customers },
                { name: 'Categories', data: setupData.categories },
                { name: 'Products', data: setupData.products }
            ];

            // Process each sheet
            for (const sheetInfo of sheetsToCreate) {
                if (sheetInfo.data && sheetInfo.data.length > 0) {
                    await this.writeToSheet(spreadsheetId, sheetInfo.name, sheetInfo.data);
                }
            }

            // Create opening stocks sheet
            const openingStocks = this.createOpeningStockData(setupData);
            if (openingStocks.length > 0) {
                await this.writeToSheet(spreadsheetId, 'Opening_Stocks', openingStocks);
            }

            console.log('✅ All setup data saved to Google Sheets');
            return true;

        } catch (error) {
            console.error('❌ Error saving to Google Sheets:', error);
            throw error;
        }
    }

    // Helper method to write data to a sheet
    async writeToSheet(spreadsheetId, sheetName, data) {
        if (!data || data.length === 0) return;

        try {
            // Get headers from first object
            const headers = Object.keys(data[0]);
            
            // Prepare values array
            const values = [
                headers, // Header row
                ...data.map(item => headers.map(header => item[header]))
            ];

            // Create or get sheet
            await this.ensureSheetExists(spreadsheetId, sheetName);

            // Clear existing data (if any)
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
                throw new Error(`Failed to write to sheet: ${sheetName}`);
            }

            console.log(`✅ ${sheetName} saved: ${data.length} rows`);
            
        } catch (error) {
            console.error(`❌ Error writing to sheet ${sheetName}:`, error);
            throw error;
        }
    }

    // Ensure sheet exists
    async ensureSheetExists(spreadsheetId, sheetName) {
        try {
            // First, check if sheet exists by getting spreadsheet metadata
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
            warehouseId: primaryWarehouse.id,
            warehouseName: primaryWarehouse.name,
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
        
        if (!this.spreadsheetId) return null;
        
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
}

// Create global instance
window.GoogleSheetsService = new GoogleSheetsService();
