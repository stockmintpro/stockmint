// StockMint Menu Structure - UPDATED VERSION
// MAX 2 LEVELS ONLY - All menus visible in DEMO but some disabled

const StockMintMenu = {
  items: [
    // ========== DASHBOARD ==========
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'fas fa-chart-line',
      url: '#dashboard'
    },

    // Tambahkan menu baru setelah Dashboard
    {
      id: 'googlesheets',
      title: 'Google Sheets',
      icon: 'fab fa-google-drive',
      url: '#googlesheets',
      roles: ['admin', 'owner'],
      showIf: () => {
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        return !user.isDemo && localStorage.getItem('stockmint_google_sheet_id');
      }
    },
    
    // ========== MASTER DATA ==========
    {
      id: 'master-data',
      title: 'Master Data',
      icon: 'fas fa-database',
      url: '#master-data',  // TAMBAHKAN INI - sangat penting!
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
        { id: 'marketplace-fee', title: 'Marketplace Fee', url: '#master/marketplace-fee' },
        { id: 'data-migration', title: 'Data Migration', url: '#master/data-migration' }
      ]
    },
    
    // ========== PURCHASES ==========
    {
      id: 'purchases',
      title: 'Purchases',
      icon: 'fas fa-shopping-cart',
      children: [
        { id: 'purchase-orders', title: 'Purchase Orders', url: '#purchases/orders' },
        { id: 'purchase-returns', title: 'Purchase Returns', url: '#purchases/returns' },
        { id: 'purchase-deposits', title: 'Purchase Deposits', url: '#purchases/deposits' }
      ]
    },
    
    // ========== SALES ==========
    {
      id: 'sales',
      title: 'Sales',
      icon: 'fas fa-cash-register',
      children: [
        { id: 'sales-orders', title: 'Sales Orders', url: '#sales/orders' },
        { id: 'sales-returns', title: 'Sales Returns', url: '#sales/returns' },
        { id: 'refunds', title: 'Refunds', url: '#sales/refunds' }
      ]
    },
    
    // ========== INVENTORY ==========
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'fas fa-boxes',
      children: [
        { id: 'stock-transfers', title: 'Stock Transfers', url: '#inventory/transfers' },
        { id: 'stock-adjustments', title: 'Stock Adjustments', url: '#inventory/adjustments' },
        { id: 'stock-opname', title: 'Stock Opname', url: '#inventory/opname' }
      ]
    },
    
    // ========== TRANSACTIONS ==========
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'fas fa-exchange-alt',
      children: [
        { id: 'payments', title: 'Payments', url: '#transactions/payments' },
        { id: 'receipts', title: 'Receipts', url: '#transactions/receipts' },
        { id: 'journals', title: 'Journals', url: '#transactions/journals' }
      ]
    },
    
    // ========== TOOLS ==========
    {
      id: 'tools',
      title: 'Tools',
      icon: 'fas fa-tools',
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
  console.log('✅ StockMintMenu loaded with', StockMintMenu.items.length, 'main menu items');
  
  // Log total menu items (including children)
  let totalItems = 0;
  StockMintMenu.items.forEach(item => {
    if (item.children) {
      totalItems += item.children.length + 1;
    } else {
      totalItems += 1;
    }
  });
  console.log('📊 Total menu items (including submenus):', totalItems);
}
