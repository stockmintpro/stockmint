// Authentication Module - ULTIMATE FIXED VERSION
const StockMintAuth = {
    // Client ID - PASTIKAN INI SAMA DENGAN DI GOOGLE CLOUD CONSOLE
    clientId: '381159845906-0qpf642gg5uv4dhr8lapmr6dqgqepmnp.apps.googleusercontent.com',
    
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
        if (confirm('Are you sure you want to logout?')) {
            // Preserve spreadsheet data
            const spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
            const spreadsheetUrl = localStorage.getItem('stockmint_google_sheet_url');
            
            // Clear all stockmint data except spreadsheet info
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('stockmint_') && 
                    key !== 'stockmint_google_sheet_id' && 
                    key !== 'stockmint_google_sheet_url') {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            sessionStorage.clear();
            
            // Restore spreadsheet info
            if (spreadsheetId) {
                localStorage.setItem('stockmint_google_sheet_id', spreadsheetId);
                localStorage.setItem('stockmint_google_sheet_url', spreadsheetUrl);
            }
            
            // Redirect to login
            window.location.href = 'index.html';
        }
    },
    
    // ===== GOOGLE LOGIN FUNCTIONS =====
    loginWithGoogle: function() {
    try {
        const googleAuthURL = 'https://accounts.google.com/o/oauth2/v2/auth';
        
        // Scope yang minimal
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ].join(' ');
        
        // 🚨 FIX: Gunakan URL yang benar untuk GitHub Pages
        let redirectURI;
        
        if (window.location.hostname.includes('github.io')) {
            // Untuk GitHub Pages
            redirectURI = 'https://stockmintpro.github.io/stockmint/auth/callback.html';
        } else {
            // Untuk localhost
            redirectURI = window.location.origin + '/auth/callback.html';
        }
        
        console.log('🔗 OAuth Redirect URI:', redirectURI);
        
        // State parameter untuk security
        const state = 'stockmint_' + Date.now();
        localStorage.setItem('stockmint_oauth_state', state);
        
        // Build OAuth URL
        const authURL = `${googleAuthURL}?` +
            `client_id=${this.clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectURI)}&` +
            `response_type=token&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `state=${state}&` +
            `prompt=select_account`;
        
        console.log('🔗 Redirecting to Google OAuth...');
        
        // Redirect ke Google OAuth
        window.location.href = authURL;
        
    } catch (error) {
        console.error('❌ Error in loginWithGoogle:', error);
        alert('Failed to start Google login. Please check console for details.');
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
    
    // Clear authentication
    clearAuth: function() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('stockmint_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        sessionStorage.clear();
        console.log('🚪 All authentication data cleared');
    },
    
    // ===== BARU: Test Google OAuth Configuration =====
    testOAuthConfig: function() {
        const currentOrigin = window.location.origin;
        const redirectPath = '/auth/callback.html';
        const redirectURI = currentOrigin + redirectPath;
        
        console.log('🔧 Testing OAuth Configuration:');
        console.log('Client ID:', this.clientId);
        console.log('Current Origin:', currentOrigin);
        console.log('Redirect URI:', redirectURI);
        console.log('Full Redirect URI:', encodeURIComponent(redirectURI));
        
        return {
            clientId: this.clientId,
            redirectURI: redirectURI,
            encodedRedirectURI: encodeURIComponent(redirectURI)
        };
    }
};

// Export
window.StockMintAuth = StockMintAuth;
console.log('✅ StockMintAuth module loaded - ULTIMATE FIXED VERSION');
