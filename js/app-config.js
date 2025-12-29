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
    
    // Features (will be updated based on subscription plan)
    features: {},
    
    // Plan Badges
    planBadges: {
        demo: { text: 'DEMO', color: '#ffffff', bgColor: '#6c757d', textColor: '#ffffff' },
        basic: { text: 'BASIC', color: '#f8f9fa', bgColor: '#6c757d', textColor: '#ffffff' },
        pro: { text: 'PRO', color: '#ffd700', bgColor: '#19BEBB', textColor: '#ffffff' },
        advance: { text: 'ADVANCE', color: '#e0b0ff', bgColor: '#800080', textColor: '#ffffff' }
    }
};

// Define features for each plan
const PlanFeatures = {
    demo: {
        unlimitedProducts: false, // limited in demo
        googleSheetsBased: true,
        webUI: true,
        priceCalculator: true,
        retailWholesalePrice: true,
        purchaseSalesPDF: true,
        multiScenarioMarketplaceFees: false, // disabled on demo
        returnedProductsManagement: false, // disabled on demo
        multiUser: false,
        multiWarehouse: false,
        repackingUnbundling: false,
        batchExpiryTracking: false,
        fifoCosting: false,
        barcodeQRSupport: false,
        dataMigration: false, // disabled on demo
        backupResetRestore: true,
        multiLanguageSupport: true,
        basicReporting: true,
        advancedReporting: false,
        customReporting: false,
        moneyBackGuarantee: false,
        basicSupport: true,
        prioritySupport: false,
        fullAccountingIntegration: false,
        payrollModule: false,
        advancedAnalyticsDashboard: false,
        assetManagementMultiCurrency: false,
        manualRefresh: true,
        autoRefresh: false,
        realTimeUpdates: false
    },
    basic: {
        unlimitedProducts: true,
        googleSheetsBased: true,
        webUI: true,
        priceCalculator: true,
        retailWholesalePrice: true,
        purchaseSalesPDF: true,
        multiScenarioMarketplaceFees: true,
        returnedProductsManagement: true,
        multiUser: false, // limited to 3 users? Actually false for basic
        multiWarehouse: false, // limited to 3 warehouses? Actually false for basic
        repackingUnbundling: false,
        batchExpiryTracking: false,
        fifoCosting: false,
        barcodeQRSupport: false,
        dataMigration: true,
        backupResetRestore: true,
        multiLanguageSupport: true,
        basicReporting: true,
        advancedReporting: false,
        customReporting: false,
        moneyBackGuarantee: true,
        basicSupport: true,
        prioritySupport: false,
        fullAccountingIntegration: false,
        payrollModule: false,
        advancedAnalyticsDashboard: false,
        assetManagementMultiCurrency: false,
        manualRefresh: true,
        autoRefresh: false,
        realTimeUpdates: false
    },
    pro: {
        unlimitedProducts: true,
        googleSheetsBased: true,
        webUI: true,
        priceCalculator: true,
        retailWholesalePrice: true,
        purchaseSalesPDF: true,
        multiScenarioMarketplaceFees: true,
        returnedProductsManagement: true,
        multiUser: true, // up to 3 users
        multiWarehouse: true, // up to 3 warehouses
        repackingUnbundling: true,
        batchExpiryTracking: true,
        fifoCosting: true,
        barcodeQRSupport: true,
        dataMigration: true,
        backupResetRestore: true,
        multiLanguageSupport: true,
        basicReporting: false, // replaced by advanced
        advancedReporting: true,
        customReporting: false,
        moneyBackGuarantee: true,
        basicSupport: false, // replaced by priority
        prioritySupport: true,
        fullAccountingIntegration: false,
        payrollModule: false,
        advancedAnalyticsDashboard: false,
        assetManagementMultiCurrency: false,
        manualRefresh: true,
        autoRefresh: true, // every 5 minutes
        realTimeUpdates: false
    },
    advance: {
        unlimitedProducts: true,
        googleSheetsBased: true,
        webUI: true,
        priceCalculator: true,
        retailWholesalePrice: true,
        purchaseSalesPDF: true,
        multiScenarioMarketplaceFees: true,
        returnedProductsManagement: true,
        multiUser: true, // unlimited
        multiWarehouse: true, // unlimited
        repackingUnbundling: true,
        batchExpiryTracking: true,
        fifoCosting: true,
        barcodeQRSupport: true,
        dataMigration: true,
        backupResetRestore: true,
        multiLanguageSupport: true,
        basicReporting: false,
        advancedReporting: true,
        customReporting: true,
        moneyBackGuarantee: true,
        basicSupport: false,
        prioritySupport: true,
        fullAccountingIntegration: true,
        payrollModule: true,
        advancedAnalyticsDashboard: true,
        assetManagementMultiCurrency: true,
        manualRefresh: true,
        autoRefresh: true,
        realTimeUpdates: true // with WebSocket
    }
};

// Update features based on user's plan
StockMintConfig.updateFeatures = function(plan) {
    this.features = PlanFeatures[plan] || PlanFeatures.basic;
    console.log(`📊 Features updated for plan: ${plan}`, this.features);
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintConfig;
}

// Pastikan tersedia secara global
window.StockMintConfig = StockMintConfig;
window.PlanFeatures = PlanFeatures;
