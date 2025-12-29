// StockMint App Configuration
// Easily change paths, URLs, and settings here

const StockMintConfig = {
    // Base URLs
    baseUrl: window.location.origin + '/stockmint',
    apiBaseUrl: 'https://api.stockmint.app',
    
    // Paths
    pagesPath: 'pages/',
    assetsPath: 'assets/',
    dataPath: 'data/',
    
    // Google OAuth
    googleClientId: '381159845906-0qpf642gg5uv4dhr8lapmr6dqgqepmnp.apps.googleusercontent.com',
    googleScopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/spreadsheets'
    ],
    
    // App Settings
    brandColor: '#19BEBB',
    brandDark: '#0fa8a6',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    
    // Features (based on subscription plan)
    features: {
        multiUser: false,
        multiWarehouse: false,
        advancedReporting: false,
        realTimeUpdates: false
    },
    
     // Plan Badges (urut dari rendah ke tinggi)
    planBadges: {
        demo: { text: 'DEMO', color: '#ff6b35', order: 0 },
        basic: { text: 'BASIC', color: '#6c757d', order: 1 },
        pro: { text: 'PRO', color: '#19BEBB', order: 2 },
        advance: { text: 'ADVANCE', color: '#8b5cf6', order: 3 }
    }
};

// Update features based on user's plan
StockMintConfig.updateFeatures = function(plan) {
    const features = {
        basic: {
            multiUser: false,
            multiWarehouse: false,
            advancedReporting: false,
            realTimeUpdates: false
        },
        pro: {
            multiUser: true,
            multiWarehouse: true,
            advancedReporting: true,
            realTimeUpdates: false
        },
        advance: {
            multiUser: true,
            multiWarehouse: true,
            advancedReporting: true,
            realTimeUpdates: true
        }
    };
    
    this.features = features[plan] || features.basic;
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintConfig;
}

// Pastikan tersedia secara global
window.StockMintConfig = StockMintConfig;
