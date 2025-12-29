// StockMint App Configuration - Complete Plan Features

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
    
    // Plan Badges
    planBadges: {
        demo: { text: 'DEMO', color: '#ff6b35', bgColor: '#fff3cd', textColor: '#ff6b35' },
        basic: { text: 'BASIC', color: '#6c757d', bgColor: '#f8f9fa', textColor: '#6c757d' },
        pro: { text: 'PRO', color: '#19BEBB', bgColor: '#e0f7f7', textColor: '#19BEBB' },
        advance: { text: 'ADVANCE', color: '#8b5cf6', bgColor: '#f3f0ff', textColor: '#8b5cf6' }
    },
    
    // Plan Pricing
    planPricing: {
        demo: { price: 0, period: 'forever', trialDays: 0 },
        basic: { price: 9, period: 'month', trialDays: 7 },
        pro: { price: 29, period: 'month', trialDays: 7 },
        advance: { price: 99, period: 'month', trialDays: 7 }
    },
    
    // All Features Definitions (from your table)
    allFeatures: {
        // Available in all plans
        core: [
            'unlimited_products',
            'google_sheets_based',
            'web_ui_ux',
            'price_calculator',
            'retail_wholesale_price',
            'purchase_sales_pdf',
            'multi_scenario_marketplace_fees',
            'returned_products_management',
            'data_migration',
            'backup_reset_restore',
            'multi_language_support',
            'money_back_guarantee',
            'manual_refresh'
        ],
        
        // PRO & ADVANCE only
        pro: [
            'multi_user',
            'multi_warehouse',
            'repacking_unbundling',
            'batch_expiry_tracking',
            'fifo_costing',
            'barcode_qr_support',
            'advanced_reporting',
            'priority_support',
            'auto_refresh'
        ],
        
        // ADVANCE only
        advance: [
            'custom_reporting',
            'full_accounting_integration',
            'payroll_module',
            'advanced_analytics_dashboard',
            'asset_management',
            'multi_currency',
            'real_time_websocket'
        ]
    },
    
    // Menu Features Configuration (which menu items are enabled for each plan)
    menuFeatures: {
        // Menu item ID -> Required plan to enable
        'master/marketplace-fee': 'basic', // Disabled in demo
        'purchase-returns': 'basic',       // Disabled in demo
        'purchase-deposits': 'basic',      // Disabled in demo
        'sales-returns': 'basic',          // Disabled in demo
        'refunds': 'basic',                // Disabled in demo
        'stock-adjustments': 'basic',      // Disabled in demo
        'stock-opname': 'basic',           // Disabled in demo
        'receipts': 'basic',               // Disabled in demo
        'journals': 'basic',               // Disabled in demo
        'tools/reports': 'basic',          // Disabled in demo
        'tools/analytics': 'pro',          // Disabled in demo & basic
        'user-management': 'pro',          // Disabled in demo & basic
        'role-permissions': 'pro',         // Disabled in demo & basic
        'notification-settings': 'basic',  // Disabled in demo
        'api-integrations': 'basic'        // Disabled in demo
    },
    
    // Plan Comparison Matrix (for upgrade page)
    planComparison: {
        demo: {
            name: 'Demo',
            description: 'Try before you buy',
            features: {
                'unlimited_products': { enabled: true, tooltip: 'Limited to 50 products' },
                'google_sheets_based': { enabled: true },
                'web_ui_ux': { enabled: true },
                'price_calculator': { enabled: true },
                'retail_wholesale_price': { enabled: true },
                'purchase_sales_pdf': { enabled: true },
                'multi_scenario_marketplace_fees': { enabled: false },
                'returned_products_management': { enabled: false },
                'multi_user': { enabled: false },
                'multi_warehouse': { enabled: false },
                'repacking_unbundling': { enabled: false },
                'batch_expiry_tracking': { enabled: false },
                'fifo_costing': { enabled: false },
                'barcode_qr_support': { enabled: false },
                'data_migration': { enabled: false },
                'backup_reset_restore': { enabled: true },
                'multi_language_support': { enabled: true },
                'basic_reporting': { enabled: false },
                'advanced_reporting': { enabled: false },
                'custom_reporting': { enabled: false },
                'money_back_guarantee': { enabled: false },
                'basic_support': { enabled: true },
                'priority_support': { enabled: false },
                'full_accounting_integration': { enabled: false },
                'payroll_module': { enabled: false },
                'advanced_analytics_dashboard': { enabled: false },
                'asset_management': { enabled: false },
                'multi_currency': { enabled: false },
                'manual_refresh': { enabled: true },
                'auto_refresh': { enabled: false },
                'real_time_websocket': { enabled: false }
            },
            limitations: [
                'Max 50 products',
                'Max 20 customers',
                'Max 10 suppliers',
                'No data migration',
                'No returns/refunds',
                'Limited reports'
            ]
        },
        basic: {
            name: 'Basic',
            description: 'Perfect for small businesses',
            features: {
                'unlimited_products': { enabled: true },
                'google_sheets_based': { enabled: true },
                'web_ui_ux': { enabled: true },
                'price_calculator': { enabled: true },
                'retail_wholesale_price': { enabled: true },
                'purchase_sales_pdf': { enabled: true },
                'multi_scenario_marketplace_fees': { enabled: true },
                'returned_products_management': { enabled: true },
                'multi_user': { enabled: false },
                'multi_warehouse': { enabled: false },
                'repacking_unbundling': { enabled: false },
                'batch_expiry_tracking': { enabled: false },
                'fifo_costing': { enabled: false },
                'barcode_qr_support': { enabled: false },
                'data_migration': { enabled: true },
                'backup_reset_restore': { enabled: true },
                'multi_language_support': { enabled: true },
                'basic_reporting': { enabled: true },
                'advanced_reporting': { enabled: false },
                'custom_reporting': { enabled: false },
                'money_back_guarantee': { enabled: true },
                'basic_support': { enabled: true },
                'priority_support': { enabled: false },
                'full_accounting_integration': { enabled: false },
                'payroll_module': { enabled: false },
                'advanced_analytics_dashboard': { enabled: false },
                'asset_management': { enabled: false },
                'multi_currency': { enabled: false },
                'manual_refresh': { enabled: true },
                'auto_refresh': { enabled: false },
                'real_time_websocket': { enabled: false }
            },
            highlights: [
                'Full access to all menu features',
                'Data migration support',
                'Purchase & sales returns',
                'Marketplace fee calculator',
                'Basic reporting'
            ]
        },
        pro: {
            name: 'Pro',
            description: 'For growing businesses',
            features: {
                'unlimited_products': { enabled: true },
                'google_sheets_based': { enabled: true },
                'web_ui_ux': { enabled: true },
                'price_calculator': { enabled: true },
                'retail_wholesale_price': { enabled: true },
                'purchase_sales_pdf': { enabled: true },
                'multi_scenario_marketplace_fees': { enabled: true },
                'returned_products_management': { enabled: true },
                'multi_user': { enabled: true, tooltip: 'Up to 3 users' },
                'multi_warehouse': { enabled: true, tooltip: 'Up to 3 warehouses' },
                'repacking_unbundling': { enabled: true },
                'batch_expiry_tracking': { enabled: true },
                'fifo_costing': { enabled: true },
                'barcode_qr_support': { enabled: true },
                'data_migration': { enabled: true },
                'backup_reset_restore': { enabled: true },
                'multi_language_support': { enabled: true },
                'basic_reporting': { enabled: true },
                'advanced_reporting': { enabled: true },
                'custom_reporting': { enabled: false },
                'money_back_guarantee': { enabled: true },
                'basic_support': { enabled: false },
                'priority_support': { enabled: true },
                'full_accounting_integration': { enabled: false },
                'payroll_module': { enabled: false },
                'advanced_analytics_dashboard': { enabled: false },
                'asset_management': { enabled: false },
                'multi_currency': { enabled: false },
                'manual_refresh': { enabled: true },
                'auto_refresh': { enabled: true, tooltip: 'Every 5 minutes' },
                'real_time_websocket': { enabled: false }
            },
            highlights: [
                'Multi-user support (up to 3)',
                'Multi-warehouse (up to 3)',
                'Batch/Expiry tracking',
                'FIFO costing',
                'Barcode/QR support',
                'Advanced reporting',
                'Auto-refresh every 5 minutes'
            ]
        },
        advance: {
            name: 'Advance',
            description: 'Complete business solution',
            features: {
                'unlimited_products': { enabled: true },
                'google_sheets_based': { enabled: true },
                'web_ui_ux': { enabled: true },
                'price_calculator': { enabled: true },
                'retail_wholesale_price': { enabled: true },
                'purchase_sales_pdf': { enabled: true },
                'multi_scenario_marketplace_fees': { enabled: true },
                'returned_products_management': { enabled: true },
                'multi_user': { enabled: true, tooltip: 'Unlimited users' },
                'multi_warehouse': { enabled: true, tooltip: 'Unlimited warehouses' },
                'repacking_unbundling': { enabled: true },
                'batch_expiry_tracking': { enabled: true },
                'fifo_costing': { enabled: true },
                'barcode_qr_support': { enabled: true },
                'data_migration': { enabled: true },
                'backup_reset_restore': { enabled: true },
                'multi_language_support': { enabled: true },
                'basic_reporting': { enabled: true },
                'advanced_reporting': { enabled: true },
                'custom_reporting': { enabled: true },
                'money_back_guarantee': { enabled: true },
                'basic_support': { enabled: false },
                'priority_support': { enabled: true },
                'full_accounting_integration': { enabled: true },
                'payroll_module': { enabled: true },
                'advanced_analytics_dashboard': { enabled: true },
                'asset_management': { enabled: true },
                'multi_currency': { enabled: true },
                'manual_refresh': { enabled: true },
                'auto_refresh': { enabled: true },
                'real_time_websocket': { enabled: true, tooltip: 'Configurable interval' }
            },
            highlights: [
                'Full accounting integration',
                'Payroll & salary slips',
                'Advanced analytics dashboard',
                'Balance sheet & cashflow',
                'Asset management',
                'Multi-currency support',
                'Real-time WebSocket updates',
                'Custom reporting'
            ]
        }
    }
};

// Helper function to check if a menu item is enabled for current plan
StockMintConfig.isMenuEnabled = function(menuId) {
    const currentPlan = localStorage.getItem('stockmint_plan') || 'demo';
    
    // If menu is not in the restricted list, it's enabled for all plans
    if (!this.menuFeatures.hasOwnProperty(menuId)) {
        return true;
    }
    
    // Get required plan for this menu
    const requiredPlan = this.menuFeatures[menuId];
    
    // Check if current plan meets the requirement
    const planOrder = { 'demo': 0, 'basic': 1, 'pro': 2, 'advance': 3 };
    
    return planOrder[currentPlan] >= planOrder[requiredPlan];
};

// Helper function to get disabled menus for current plan
StockMintConfig.getDisabledMenus = function(plan) {
    const disabledMenus = [];
    const currentPlan = plan || localStorage.getItem('stockmint_plan') || 'demo';
    const planOrder = { 'demo': 0, 'basic': 1, 'pro': 2, 'advance': 3 };
    
    Object.entries(this.menuFeatures).forEach(([menuId, requiredPlan]) => {
        if (planOrder[currentPlan] < planOrder[requiredPlan]) {
            disabledMenus.push(menuId);
        }
    });
    
    return disabledMenus;
};

// Helper function to get plan features for current user
StockMintConfig.getCurrentPlanFeatures = function() {
    const currentPlan = localStorage.getItem('stockmint_plan') || 'demo';
    return this.planComparison[currentPlan] || this.planComparison.demo;
};

// Helper function to get plan badge HTML
StockMintConfig.getPlanBadgeHTML = function(plan) {
    const currentPlan = plan || localStorage.getItem('stockmint_plan') || 'demo';
    const badge = this.planBadges[currentPlan] || this.planBadges.demo;
    
    return `
        <span class="plan-badge" style="
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background-color: ${badge.bgColor};
            color: ${badge.textColor};
            border: 1px solid ${badge.color};
        ">
            ${badge.text}
        </span>
    `;
};

// Helper function to get menu icon with lock for disabled items
StockMintConfig.getMenuIconWithLock = function(menuId, icon) {
    const isEnabled = this.isMenuEnabled(menuId);
    
    if (isEnabled) {
        return icon;
    } else {
        // Return icon with lock emoji
        return `${icon} 🔒`;
    }
};

// Helper function to upgrade user plan
StockMintConfig.upgradePlan = function(newPlan) {
    const currentPlan = localStorage.getItem('stockmint_plan') || 'demo';
    const planOrder = { 'demo': 0, 'basic': 1, 'pro': 2, 'advance': 3 };
    
    // Check if it's a valid upgrade
    if (planOrder[newPlan] <= planOrder[currentPlan]) {
        console.warn(`Cannot downgrade from ${currentPlan} to ${newPlan}`);
        return false;
    }
    
    // Update user data
    try {
        const userData = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        userData.plan = newPlan;
        userData.isDemo = false;
        userData.upgradedAt = new Date().toISOString();
        
        localStorage.setItem('stockmint_user', JSON.stringify(userData));
        localStorage.setItem('stockmint_plan', newPlan);
        
        // Trigger plan update event
        const event = new CustomEvent('stockmint:plan-updated', {
            detail: { oldPlan: currentPlan, newPlan },
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
        
        console.log(`✅ Plan upgraded from ${currentPlan} to ${newPlan}`);
        return true;
        
    } catch (error) {
        console.error('Error upgrading plan:', error);
        return false;
    }
};

// Initialize features based on user's plan
StockMintConfig.initPlanFeatures = function() {
    const currentPlan = localStorage.getItem('stockmint_plan') || 'demo';
    const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
    
    // Set default plan for OAuth users (if not set)
    if (!user.isDemo && (!user.plan || user.plan === 'demo')) {
        user.plan = 'basic';
        localStorage.setItem('stockmint_user', JSON.stringify(user));
        localStorage.setItem('stockmint_plan', 'basic');
    }
    
    console.log('📊 Current plan:', currentPlan);
    console.log('🔒 Disabled menus:', this.getDisabledMenus(currentPlan));
    
    return this.getCurrentPlanFeatures();
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintConfig;
}

// Make available globally
window.StockMintConfig = StockMintConfig;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    if (window.StockMintConfig) {
        window.StockMintConfig.initPlanFeatures();
    }
});
