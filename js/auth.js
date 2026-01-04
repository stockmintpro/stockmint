// StockMint Authentication System - FIXED VERSION
class StockMintAuth {
    constructor() {
        this.CLIENT_ID = '381159845906-0qpf642gg5uv4dhr8lapmr6dqgqepmnp.apps.googleusercontent.com';
        this.REDIRECT_URI = window.location.origin + '/auth/callback.html';
        this.SCOPES = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/spreadsheets'
        ].join(' ');
        
        this.init();
    }

    init() {
        console.log('🔐 StockMintAuth initialized');
    }

    // Check authentication status
    checkAuth() {
        const token = this.getToken();
        const user = this.getUser();
        
        if (!token || !user) {
            console.log('🔐 No valid authentication found');
            return false;
        }
        
        // Check if token is expired
        if (this.isTokenExpired()) {
            console.log('⚠️ Token expired, attempting refresh...');
            this.refreshToken();
            return false; // Will redirect to refresh
        }
        
        // Check if user has Google Sheets access
        const hasSheetsAccess = localStorage.getItem('stockmint_has_sheets_access') === 'true';
        const hasSpreadsheet = localStorage.getItem('stockmint_spreadsheet_id');
        
        if (!hasSheetsAccess || !hasSpreadsheet) {
            console.log('⚠️ Google Sheets not fully configured');
            // Don't block login, but flag for setup
        }
        
        return true;
    }

    // Get current user
    getUser() {
        try {
            const userData = localStorage.getItem('stockmint_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Get access token
    getToken() {
        return localStorage.getItem('stockmint_access_token');
    }

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem('stockmint_refresh_token');
    }

    // Check if token is expired
    isTokenExpired() {
        const expiryTime = localStorage.getItem('stockmint_token_expiry');
        if (!expiryTime) return true;
        
        const now = Date.now();
        const expiry = parseInt(expiryTime);
        
        // Add 5 minute buffer
        return now >= (expiry - 300000);
    }

    // Generate OAuth URL dengan PKCE (lebih aman)
    generateAuthUrl() {
        const state = this.generateRandomString(16);
        const codeVerifier = this.generateRandomString(128);
        const codeChallenge = this.base64URLEncode(await this.sha256(codeVerifier));
        
        // Save code verifier for later
        sessionStorage.setItem('stockmint_code_verifier', codeVerifier);
        sessionStorage.setItem('stockmint_auth_state', state);
        
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'code',
            scope: this.SCOPES,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            access_type: 'offline',
            prompt: 'consent'
        });
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    // Handle OAuth callback
    async handleCallback() {
        console.log('🔐 Handling OAuth callback...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        // Check for errors
        if (error) {
            console.error('OAuth error:', error);
            this.showError(`Authentication failed: ${error}`);
            return;
        }
        
        // Verify state
        const savedState = sessionStorage.getItem('stockmint_auth_state');
        if (state !== savedState) {
            console.error('State mismatch');
            this.showError('Security validation failed');
            return;
        }
        
        // Exchange code for tokens
        try {
            const tokens = await this.exchangeCodeForTokens(code);
            
            // Save tokens
            this.saveTokens(tokens);
            
            // Get user info
            const userInfo = await this.getUserInfo(tokens.access_token);
            
            // Save user data
            this.saveUserData(userInfo);
            
            // Initialize Google Sheets
            await this.initializeGoogleSheets(tokens.access_token);
            
            // Redirect to app
            setTimeout(() => {
                window.location.href = '../app.html';
            }, 1000);
            
        } catch (error) {
            console.error('OAuth callback failed:', error);
            this.showError(`Authentication failed: ${error.message}`);
        }
    }

    // Exchange authorization code for tokens
    async exchangeCodeForTokens(code) {
        const codeVerifier = sessionStorage.getItem('stockmint_code_verifier');
        
        if (!codeVerifier) {
            throw new Error('No code verifier found');
        }
        
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.CLIENT_ID,
                code: code,
                code_verifier: codeVerifier,
                redirect_uri: this.REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || 'Token exchange failed');
        }
        
        return await response.json();
    }

    // Refresh access token
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            console.log('No refresh token available, redirecting to login');
            window.location.href = 'index.html';
            return;
        }
        
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: this.CLIENT_ID,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }
            
            const tokens = await response.json();
            this.saveTokens(tokens);
            
            console.log('✅ Token refreshed successfully');
            return tokens.access_token;
            
        } catch (error) {
            console.error('Token refresh failed:', error);
            // Redirect to login
            window.location.href = 'index.html';
        }
    }

    // Get user info from Google
    async getUserInfo(accessToken) {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get user info');
        }
        
        return await response.json();
    }

    // Save tokens to localStorage
    saveTokens(tokens) {
        const expiryTime = Date.now() + (tokens.expires_in * 1000);
        
        localStorage.setItem('stockmint_access_token', tokens.access_token);
        localStorage.setItem('stockmint_token_expiry', expiryTime.toString());
        
        if (tokens.refresh_token) {
            localStorage.setItem('stockmint_refresh_token', tokens.refresh_token);
        }
        
        console.log('✅ Tokens saved');
    }

    // Save user data
    saveUserData(userInfo) {
        const userData = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            isDemo: false,
            googleAccount: true,
            authenticatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('stockmint_user', JSON.stringify(userData));
        localStorage.setItem('stockmint_plan', 'basic'); // Auto-set to BASIC
        
        console.log('✅ User data saved:', userInfo.name);
    }

    // Initialize Google Sheets connection
    async initializeGoogleSheets(accessToken) {
        try {
            console.log('📊 Initializing Google Sheets...');
            
            // Check if we already have a spreadsheet
            let spreadsheetId = localStorage.getItem('stockmint_spreadsheet_id');
            
            if (!spreadsheetId) {
                // Create new spreadsheet
                spreadsheetId = await this.createSpreadsheet(accessToken);
                
                if (spreadsheetId) {
                    localStorage.setItem('stockmint_spreadsheet_id', spreadsheetId);
                    localStorage.setItem('stockmint_has_sheets_access', 'true');
                    console.log('✅ New spreadsheet created:', spreadsheetId);
                }
            } else {
                // Verify existing spreadsheet access
                const hasAccess = await this.verifySheetsAccess(accessToken, spreadsheetId);
                localStorage.setItem('stockmint_has_sheets_access', hasAccess ? 'true' : 'false');
                
                if (!hasAccess) {
                    console.log('⚠️ No access to existing spreadsheet, creating new one');
                    const newSpreadsheetId = await this.createSpreadsheet(accessToken);
                    if (newSpreadsheetId) {
                        localStorage.setItem('stockmint_spreadsheet_id', newSpreadsheetId);
                        localStorage.setItem('stockmint_has_sheets_access', 'true');
                    }
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Google Sheets initialization failed:', error);
            localStorage.setItem('stockmint_has_sheets_access', 'false');
            return false;
        }
    }

    // Create a new Google Spreadsheet
    async createSpreadsheet(accessToken) {
        try {
            const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        title: `StockMint - ${new Date().toLocaleDateString('id-ID')}`,
                        locale: 'id_ID',
                        timeZone: 'Asia/Jakarta'
                    },
                    sheets: [
                        { properties: { title: 'dim_Company', sheetId: 0 } },
                        { properties: { title: 'dim_Warehouses', sheetId: 1 } },
                        { properties: { title: 'dim_Suppliers', sheetId: 2 } },
                        { properties: { title: 'dim_Customers', sheetId: 3 } },
                        { properties: { title: 'dim_Categories', sheetId: 4 } },
                        { properties: { title: 'dim_Products', sheetId: 5 } },
                        { properties: { title: 'trx_Purchases', sheetId: 6 } },
                        { properties: { title: 'trx_Sales', sheetId: 7 } },
                        { properties: { title: 'trx_Inventory', sheetId: 8 } }
                    ]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to create spreadsheet');
            }
            
            const data = await response.json();
            
            // Save spreadsheet URL
            localStorage.setItem('stockmint_spreadsheet_url', data.spreadsheetUrl);
            
            return data.spreadsheetId;
            
        } catch (error) {
            console.error('Create spreadsheet failed:', error);
            throw error;
        }
    }

    // Verify access to spreadsheet
    async verifySheetsAccess(accessToken, spreadsheetId) {
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            return response.ok;
        } catch (error) {
            console.error('Verify access failed:', error);
            return false;
        }
    }

    // Utility functions
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    base64URLEncode(str) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    async sha256(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Show error message
    showError(message) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px 20px;">
                <div style="color: #ef4444; font-size: 48px; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #333;">Authentication Error</h2>
                <p style="color: #666; max-width: 400px; margin: 20px auto;">${message}</p>
                <button onclick="window.location.href='../index.html'" style="
                    background: #19BEBB;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                ">
                    <i class="fas fa-arrow-left"></i> Back to Login
                </button>
            </div>
        `;
    }

    // Logout function
    logout() {
        // Clear all auth data
        localStorage.removeItem('stockmint_access_token');
        localStorage.removeItem('stockmint_refresh_token');
        localStorage.removeItem('stockmint_token_expiry');
        localStorage.removeItem('stockmint_user');
        localStorage.removeItem('stockmint_plan');
        
        // Keep spreadsheet data (don't delete the file)
        const spreadsheetId = localStorage.getItem('stockmint_spreadsheet_id');
        const spreadsheetUrl = localStorage.getItem('stockmint_spreadsheet_url');
        
        // Clear session storage
        sessionStorage.clear();
        
        // Redirect to Google logout
        const logoutUrl = 'https://accounts.google.com/Logout?' +
            'continue=' + encodeURIComponent(window.location.origin + '/index.html');
        
        window.location.href = logoutUrl;
    }

    // Check if user has Google Sheets configured
    hasGoogleSheets() {
        return localStorage.getItem('stockmint_has_sheets_access') === 'true' &&
               localStorage.getItem('stockmint_spreadsheet_id');
    }

    // Get spreadsheet info
    getSpreadsheetInfo() {
        return {
            id: localStorage.getItem('stockmint_spreadsheet_id'),
            url: localStorage.getItem('stockmint_spreadsheet_url'),
            hasAccess: localStorage.getItem('stockmint_has_sheets_access') === 'true'
        };
    }
}

// Create global instance
window.StockMintAuth = new StockMintAuth();

// Auto-handle callback if we're on callback page
if (window.location.pathname.includes('callback.html')) {
    window.StockMintAuth.handleCallback();
}
