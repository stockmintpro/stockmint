// Authentication Module - UPDATED VERSION WITH GOOGLE SHEETS SEARCH
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
    
    // ===== UPDATED LOGOUT FUNCTION =====
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
    
            // 🔴 FIX: Gunakan scope yang minimal dan valid
            const scopes = [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/spreadsheets'
            ].join(' ');
    
            // 🔴 FIX: Redirect ke index.html untuk handle callback
            const redirectURI = encodeURIComponent(window.location.origin + '/index.html');
        
            // 🔴 FIX: Tambahkan state parameter untuk security
            const state = 'stockmint_' + Date.now();
            localStorage.setItem('stockmint_oauth_state', state);
    
            const authURL = `${googleAuthURL}?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=token&scope=${encodeURIComponent(scopes)}&prompt=select_account&state=${state}`;
    
            console.log('🔗 Google OAuth URL:', authURL);
            window.location.href = authURL;
     },
    
// ===== UPDATED: Handle OAuth Callback =====
handleOAuthCallback: function() {
    console.log('🔄 Handling OAuth callback...');
    
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    // Validasi state untuk mencegah CSRF
    const state = params.get('state');
    const savedState = localStorage.getItem('stockmint_oauth_state');
    
    if (state !== savedState) {
        console.error('❌ State mismatch, possible CSRF attack');
        return;
    }
    
    localStorage.removeItem('stockmint_oauth_state');
    
    const accessToken = params.get('access_token');
    const error = params.get('error');
    
    if (error) {
        console.error('❌ OAuth error:', error);
        alert(`Google login failed: ${error}`);
        return;
    }
    
    if (!accessToken) {
        console.log('ℹ️ No access token in hash');
        return;
    }
    
    console.log('🔑 Google OAuth token received');
    localStorage.setItem('stockmint_token', accessToken);
    
    // Get user info from Google
    this.fetchGoogleUserInfo(accessToken);
},

        // NEW: Fetch user info secara terpisah
        fetchGoogleUserInfo: async function(accessToken) {
            try {
                console.log('👤 Fetching Google user info...');
        
                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        
            const userInfo = await response.json();
            console.log('✅ Google user info:', userInfo);
        
            // Save user data
            const userData = {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                googleId: userInfo.id,
                isDemo: false,
                loginTime: new Date().toISOString()
            };
        
            localStorage.setItem('stockmint_user', JSON.stringify(userData));
            localStorage.setItem('stockmint_plan', 'basic');
        
            console.log('✅ User data saved');
        
            // Cari spreadsheet yang sudah ada di Google Drive user
            await this.findExistingSpreadsheet(accessToken, userInfo.email);
        
            // Redirect ke app
            console.log('➡️ Redirecting to app.html...');
            window.location.href = 'app.html';
        
        } catch (error) {
            console.error('❌ Error fetching user info:', error);
            alert('Failed to get user information. Please try again.');
            window.location.href = 'index.html';
            }
        },    
  
        // ===== BARU: Cari spreadsheet yang sudah ada =====
        findExistingSpreadsheet: async function(token, userEmail) {
        try {
            console.log('🔍 Searching for existing spreadsheets in Google Drive...');
        
            // Query yang lebih sederhana
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
    
    // Clear authentication (maintained from original)
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
    }
};

// Handle OAuth callback on page load
if (window.location.hash.includes('access_token')) {
    console.log('🔄 Detected OAuth callback, handling...');
    StockMintAuth.handleOAuthCallback();
}

// Export
window.StockMintAuth = StockMintAuth;
console.log('✅ StockMintAuth module loaded - WITH GOOGLE SHEETS SEARCH');
