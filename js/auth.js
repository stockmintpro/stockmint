// Authentication Module
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
    
    // Clear authentication
    clearAuth: function() {
        localStorage.removeItem('stockmint_token');
        localStorage.removeItem('stockmint_user');
        localStorage.removeItem('stockmint_plan');
    }
};

// Export
window.StockMintAuth = StockMintAuth;
