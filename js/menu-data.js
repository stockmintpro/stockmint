// StockMint Menu Structure - FIXED VERSION
// MAX 2 LEVELS ONLY

const StockMintMenu = {
  items: [
    // ========== DASHBOARD ==========
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      url: '#dashboard'
    },
    
    // ========== MASTER DATA ==========
    {
      id: 'master-data',
      title: 'Master Data',
      icon: 'fas fa-database',
      children: [
        { id: 'company', title: 'Company', url: '#master/company' },
        { id: 'warehouses', title: 'Warehouses', url: '#master/warehouses' },
        { id: 'suppliers', title: 'Suppliers', url: '#master/suppliers' },
        { id: 'customers', title: 'Customers', url: '#master/customers' },
        { id: 'products', title: 'Products', url: '#master/products' },
        { id: 'categories', title: 'Categories', url: '#master/categories' },
        { id: 'units', title: 'Units', url: '#master/units' },
        { id: 'tax-rates', title: 'Tax Rates', url: '#master/tax-rates' },
        { id: 'currency', title: 'Currency', url: '#master/currency' },
        { id: 'marketplace-fee', title: 'Marketplace Fee', url: '#master/marketplace-fee' }
      ]
    },
    
    // ========== PURCHASES ==========
    {
      id: 'purchases',
      title: 'Purchases',
      icon: 'fas fa-shopping-cart',
      url: '#purchases',
      children: [
                { id: 'purchase-orders', title: 'Purchase Orders', path: '#purchases/orders' },
                { id: 'purchase-returns', title: 'Purchase Returns', path: '#purchases/returns' },
                { id: 'purchase-deposits', title: 'Purchase Deposits', path: '#purchases/deposits' }
      ]
    },
    
    // ========== SALES ==========
    {
      id: 'sales',
      title: 'Sales',
      icon: 'fas fa-money-bill-wave',
      url: '#sales',
      children: [
                { id: 'sales-orders', title: 'Sales Orders', path: '#sales/orders' },
                { id: 'sales-returns', title: 'Sales Returns', path: '#sales/returns' },
                { id: 'refunds', title: 'Refunds', path: '#sales/refunds' }
      ]
    },
    
    // ========== INVENTORY ==========
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'fas fa-warehouse',
      url: '#inventory',
      children: [
                { id: 'stock-transfers', title: 'Stock Transfers', path: '#inventory/transfers' },
                { id: 'stock-adjustments', title: 'Stock Adjustments', path: '#inventory/adjustments' },
                { id: 'stock-opname', title: 'Stock Opname', path: '#inventory/opname' }
      ]
    },
    
    // ========== TRANSACTIONS ==========
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'fas fa-exchange-alt',
      url: '#transactions',
      children: [
                { id: 'payments', title: 'Payments', path: '#transactions/payments' },
                { id: 'receipts', title: 'Receipts', path: '#transactions/receipts' },
                { id: 'journals', title: 'Journals', path: '#transactions/journals' }
      ]
    },
    
    // ========== TOOLS ==========
    {
      id: 'tools',
      title: 'Tools',
      icon: 'fas fa-wrench',
      children: [
        { id: 'price-calculator', title: 'Price Calculator', url: '#tools/price-calculator' },
        { id: 'reports', title: 'Reports', url: '#tools/reports' },
        { id: 'analytics', title: 'Analytics', url: '#tools/analytics' },
        { id: 'label-generator', title: 'Label Generator', url: '#tools/label-generator' }
      ]
    },
    
    // ========== SETTINGS ==========
    {
      id: 'settings',
      title: 'Settings',
      icon: 'fas fa-cog',
      children: [
        { id: 'user-management', title: 'User Management', url: '#settings/user-management' },
        { id: 'role-permissions', title: 'Role & Permissions', url: '#settings/role-permissions' },
        { id: 'company-settings', title: 'Company Settings', url: '#settings/company-settings' },
        { id: 'notification-settings', title: 'Notification Settings', url: '#settings/notification-settings' },
        { id: 'api-integrations', title: 'API Integrations', url: '#settings/api-integrations' },
        { id: 'backup-restore', title: 'Backup & Restore', url: '#settings/backup-restore' },
        { id: 'regional-settings', title: 'Regional Settings', url: '#settings/regional-settings' }
      ]
    },
    
    // ========== CONTACTS ==========
    {
      id: 'contacts',
      title: 'Contacts',
      icon: 'fas fa-address-book',
      url: '#contacts'
    },
    
    // ========== HELP ==========
    {
      id: 'help',
      title: 'Help & Guide',
      icon: 'fas fa-question-circle',
      url: '#help'
    }
  ]
};

// Pastikan tersedia secara global
if (typeof window !== 'undefined') {
  window.StockMintMenu = StockMintMenu;
  console.log('StockMintMenu loaded with', StockMintMenu.items.length, 'items');
}
