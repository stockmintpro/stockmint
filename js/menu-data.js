// menu-data.js - Updated with 2-level structure
const StockMintMenu = {
    items: [
        {
            id: 'dashboard',
            title: '📊 Dashboard',
            icon: 'fas fa-tachometer-alt',
            path: '#dashboard'
        },
        {
            id: 'master-data',
            title: '📁 Master Data',
            icon: 'fas fa-database',
            path: '#master-data',
            submenu: [
                { id: 'company', title: 'Company', path: '#master/company' },
                { id: 'warehouses', title: 'Warehouses', path: '#master/warehouses' },
                { id: 'suppliers', title: 'Suppliers', path: '#master/suppliers' },
                { id: 'customers', title: 'Customers', path: '#master/customers' },
                { id: 'categories', title: 'Categories', path: '#master/categories' },
                { id: 'products', title: 'Products', path: '#master/products' },
                { id: 'units', title: 'Units', path: '#master/units' },
                { id: 'tax-rates', title: 'Tax Rates', path: '#master/tax-rates' },
                { id: 'currency', title: 'Currency', path: '#master/currency' },
                { id: 'marketplace-fee', title: 'Marketplace Fee', path: '#master/marketplace-fee' }
            ]
        },
        {
            id: 'purchases',
            title: '🛒 Purchases',
            icon: 'fas fa-shopping-cart',
            path: '#purchases',
            submenu: [
                { id: 'purchase-orders', title: 'Purchase Orders', path: '#purchases/orders' },
                { id: 'purchase-returns', title: 'Purchase Returns', path: '#purchases/returns' },
                { id: 'purchase-deposits', title: 'Purchase Deposits', path: '#purchases/deposits' }
            ]
        },
        {
            id: 'sales',
            title: '💰 Sales',
            icon: 'fas fa-cash-register',
            path: '#sales',
            submenu: [
                { id: 'sales-orders', title: 'Sales Orders', path: '#sales/orders' },
                { id: 'sales-returns', title: 'Sales Returns', path: '#sales/returns' },
                { id: 'refunds', title: 'Refunds', path: '#sales/refunds' }
            ]
        },
        {
            id: 'inventory',
            title: '📦 Inventory',
            icon: 'fas fa-boxes',
            path: '#inventory',
            submenu: [
                { id: 'stock-transfers', title: 'Stock Transfers', path: '#inventory/transfers' },
                { id: 'stock-adjustments', title: 'Stock Adjustments', path: '#inventory/adjustments' },
                { id: 'stock-opname', title: 'Stock Opname', path: '#inventory/opname' }
            ]
        },
        {
            id: 'transactions',
            title: '🔄 Transactions',
            icon: 'fas fa-exchange-alt',
            path: '#transactions',
            submenu: [
                { id: 'payments', title: 'Payments', path: '#transactions/payments' },
                { id: 'receipts', title: 'Receipts', path: '#transactions/receipts' },
                { id: 'journals', title: 'Journals', path: '#transactions/journals' }
            ]
        },
        {
            id: 'tools',
            title: '🛠️ Tools',
            icon: 'fas fa-tools',
            path: '#tools',
            submenu: [
                { id: 'price-calculator', title: '🧮 Price Calculator', path: '#tools/price-calculator' },
                { id: 'reports', title: '📊 Reports', path: '#tools/reports' },
                { id: 'analytics', title: '📈 Analytics', path: '#tools/analytics' },
                { id: 'label-generator', title: '🏷️ Label Generator', path: '#tools/label-generator' }
            ]
        },
        {
            id: 'settings',
            title: '⚙️ Settings',
            icon: 'fas fa-cog',
            path: '#settings',
            submenu: [
                { id: 'user-management', title: '👥 User Management', path: '#settings/user-management' },
                { id: 'role-permissions', title: '🔐 Role & Permissions', path: '#settings/role-permissions' },
                { id: 'company-settings', title: '🏢 Company Settings', path: '#settings/company-settings' },
                { id: 'notification-settings', title: '🔔 Notification Settings', path: '#settings/notification-settings' },
                { id: 'api-integrations', title: '🔌 API Integrations', path: '#settings/api-integrations' },
                { id: 'backup-restore', title: '💾 Backup & Restore', path: '#settings/backup-restore' },
                { id: 'regional-settings', title: '🌐 Regional Settings', path: '#settings/regional-settings' }
            ]
        },
        {
            id: 'contacts',
            title: '📞 Contacts',
            icon: 'fas fa-address-book',
            path: '#contacts'
        },
        {
            id: 'help',
            title: '❓ Help & Guide',
            icon: 'fas fa-question-circle',
            path: '#help'
        }
    ]
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintMenu;
}

// Global
window.StockMintMenu = StockMintMenu;
