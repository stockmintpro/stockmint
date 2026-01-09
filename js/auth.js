// Authentication Module - FIXED VERSION FOR GOOGLE OAUTH
const StockMintAuth = {
    // Validate Google token
    validateGoogleToken: async function() {
        const token = localStorage.getItem('stockmint_token');
        const user = localStorage.getItem('stockmint_user');

        if (!token || token.startsWith('demo_token_') || !user) {
            return false;
        }

        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        
            if (response.status === 401) {
                // Token expired
                console.log('🔑 Google token expired');
                this.clearAuth();
                return false;
            }
        
            return response.ok;
        } catch (error) {
            console.warn('Token validation failed:', error);
            return false;
        }
    },

    // Check if user is authenticated
    checkAuth: function() {
        const token = localStorage.getItem('stockmint_token');
        const user = localStorage.getItem('stockmint_user');
        
        if (!token || !user) {
            return false;
        }
        
        // For demo tokens, check if they're expired (24 hours)
        if (token.startsWith('demo_token_')) {
            const timestamp = parseInt(token.split('_')[2]);
            const hoursDiff = (Date.now() - timestamp) / (1000 * 60 * 60);
            
            // Demo tokens expire after 24 hours
            if (hoursDiff > 24) {
                this.clearAuth();
                return false;
            }
        }
        
        return true;
    },
    
    // Get current user
    getUser: function() {
        const userData = localStorage.getItem('stockmint_user');
        return userData ? JSON.parse(userData) : null;
    },
    
    // ===== LOGOUT FUNCTION =====
    logout: function() {
        // Simpan spreadsheet ID sebelum logout
        const spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        const spreadsheetUrl = localStorage.getItem('stockmint_google_sheet_url');
        
        // Clear semua data stockmint
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('stockmint_') && key !== 'stockmint_google_sheet_id' && key !== 'stockmint_google_sheet_url') {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear session storage
        sessionStorage.clear();
        
        // Kembalikan spreadsheet ID jika ada
        if (spreadsheetId) {
            localStorage.setItem('stockmint_google_sheet_id', spreadsheetId);
            localStorage.setItem('stockmint_google_sheet_url', spreadsheetUrl);
            console.log('💾 Preserved spreadsheet ID:', spreadsheetId);
        }
        
        // Redirect ke login page
        window.location.href = 'index.html';
    },
    
    // ===== GOOGLE LOGIN FUNCTIONS =====
    loginWithGoogle: function() {
        const googleAuthURL = 'https://accounts.google.com/o/oauth2/v2/auth';
        const clientId = '381159845906-0qpf642gg5uv4dhr8lapmr6dqgqepmnp.apps.googleusercontent.com';
        
        // Scope yang disetujui Google
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/spreadsheets'
        ].join(' ');
        
        // Redirect ke auth/callback.html untuk handle OAuth response
        const redirectURI = encodeURIComponent(window.location.origin + '/auth/callback.html');
        
        // State parameter untuk security
        const state = 'stockmint_' + Date.now();
        localStorage.setItem('stockmint_oauth_state', state);
        
        // Build OAuth URL
        const authURL = `${googleAuthURL}?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=token&scope=${encodeURIComponent(scopes)}&state=${state}&prompt=select_account`;
        
        console.log('🔗 Redirecting to Google OAuth...');
        console.log('Redirect URI:', redirectURI);
        window.location.href = authURL;
    },
    
    // ===== DEMO LOGIN FUNCTIONS =====
    loginAsDemo: function() {
        const demoToken = `demo_token_${Date.now()}`;
        const demoUser = {
            name: 'Demo User',
            email: 'demo@stockmint.app',
            isDemo: true,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('stockmint_token', demoToken);
        localStorage.setItem('stockmint_user', JSON.stringify(demoUser));
        localStorage.setItem('stockmint_plan', 'demo');
        
        console.log('👤 Demo user logged in');
        return true;
    },
    
    // Clear authentication
    clearAuth: function() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('stockmint_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        sessionStorage.clear();
        console.log('🚪 All authentication data cleared');
    },
    
    // ===== BARU: Cek apakah user sudah punya spreadsheet =====
    checkExistingUserSpreadsheet: async function() {
        try {
            const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            if (user.isDemo || !user.email) return false;
            
            const token = localStorage.getItem('stockmint_token');
            if (!token || token.startsWith('demo_token_')) return false;
            
            // Cari spreadsheet yang sudah ada
            const existingSheet = await this.findExistingSpreadsheet(token, user.email);
            
            if (existingSheet) {
                console.log('✅ User has existing spreadsheet');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking existing spreadsheet:', error);
            return false;
        }
    },
    
    // ===== BARU: Cari spreadsheet yang sudah ada =====
    findExistingSpreadsheet: async function(token, userEmail) {
        try {
            console.log('🔍 Searching for existing spreadsheets in Google Drive...');
            
            // Query sederhana untuk mencari spreadsheet StockMint
            const query = `name contains 'StockMint' and '${userEmail}' in owners and mimeType='application/vnd.google-apps.spreadsheet' and trashed = false`;
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&orderBy=modifiedTime desc`,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                console.warn('⚠️ Drive API response not OK:', response.status);
                return null;
            }
            
            const data = await response.json();
            console.log('📊 Found spreadsheets:', data.files?.length || 0);
            
            if (data.files && data.files.length > 0) {
                // Ambil spreadsheet terbaru
                const targetSheet = data.files[0];
                
                console.log('✅ Found existing spreadsheet:', targetSheet.name);
                
                // Simpan info spreadsheet
                localStorage.setItem('stockmint_google_sheet_id', targetSheet.id);
                localStorage.setItem('stockmint_google_sheet_url', 
                    targetSheet.webViewLink || `https://docs.google.com/spreadsheets/d/${targetSheet.id}/edit`);
                localStorage.setItem('stockmint_google_sheet_name', targetSheet.name);
                localStorage.setItem('stockmint_spreadsheet_found', 'true');
                
                return targetSheet;
            }
            
            console.log('📭 No existing spreadsheet found');
            localStorage.setItem('stockmint_spreadsheet_found', 'false');
            return null;
            
        } catch (error) {
            console.error('❌ Error searching for spreadsheets:', error);
            localStorage.setItem('stockmint_spreadsheet_found', 'error');
            return null;
        }
    }
};

// Export
window.StockMintAuth = StockMintAuth;
console.log('✅ StockMintAuth module loaded - FIXED FOR GOOGLE OAUTH');
