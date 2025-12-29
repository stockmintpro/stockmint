// StockMint Main Application - COMPLETE WORKING VERSION

class StockMintApp {
  constructor() {
    this.config = window.StockMintConfig || {};
    this.menu = window.StockMintMenu || { items: [] };
    this.currentPage = 'dashboard';
    this.user = null;
    this.initialized = false;
    this.currentPlan = 'basic'; // default
  }
  
  // Initialize application
  init() {
    console.log('🚀 StockMintApp initializing...');
    
    try {
      // Step 1: Load user data
      this.loadUserData();
      
      // Step 2: Setup configuration
      this.setupConfig();
      
      // Step 3: Load UI components
      this.loadComponents();
      
      // Step 4: Setup routing
      this.setupRouting();
      
      // Step 5: Load initial page
      this.setupInitialPage();
      
      // Step 6: Mark as initialized
      this.initialized = true;
      
      console.log('✅ StockMintApp initialized successfully');
      
      // Hide loading screen
      setTimeout(() => {
        if (document.getElementById('loadingScreen')) {
          document.getElementById('loadingScreen').classList.add('hidden');
        }
        if (document.getElementById('appContainer')) {
          document.getElementById('appContainer').classList.remove('hidden');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.showCriticalError(error);
    }
  }
  
  // Load user data from localStorage
  loadUserData() {
    try {
      const userData = localStorage.getItem('stockmint_user');
      if (userData) {
        this.user = JSON.parse(userData);
        console.log('👤 User loaded:', this.user.name);
      } else {
        console.warn('⚠️ No user data found');
        this.user = { name: 'Guest', isDemo: true };
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.user = { name: 'Guest', isDemo: true };
    }
  }
  
  // Setup configuration based on user plan
  setupConfig() {
    this.currentPlan = localStorage.getItem('stockmint_plan') || 'basic';
    
    // If user is demo, force demo plan
    if (this.user && this.user.isDemo) {
      this.currentPlan = 'demo';
      localStorage.setItem('stockmint_plan', 'demo');
    }
    
    console.log('📊 User plan:', this.currentPlan);
    
    // Set features based on plan
    if (this.config.updateFeatures) {
      this.config.updateFeatures(this.currentPlan);
    }
    
    // Set current plan in config
    this.config.currentPlan = this.currentPlan;
    this.config.currentPlanBadge = this.config.planBadges[this.currentPlan] || this.config.planBadges.basic;
  }
  
  // Load UI components (sidebar, navbar)
  loadComponents() {
    console.log('🛠️ Loading components...');
    
    // Load sidebar
    if (window.StockMintSidebar) {
      try {
        const sidebar = new StockMintSidebar(this.config, this.menu);
        const sidebarContainer = document.getElementById('sidebarContainer');
        if (sidebarContainer) {
          sidebarContainer.innerHTML = sidebar.render();
          console.log('✅ Sidebar rendered');
          
          // Bind sidebar events
          setTimeout(() => {
            if (sidebar.bindEvents) {
              sidebar.bindEvents();
              console.log('✅ Sidebar events bound');
            }
          }, 100);
        }
      } catch (error) {
        console.error('❌ Error loading sidebar:', error);
      }
    } else {
      console.error('❌ StockMintSidebar not available');
    }
    
    // Load navbar
    if (window.StockMintNavbar) {
      try {
        const navbar = new StockMintNavbar(this.config);
        const navbarContainer = document.getElementById('navbarContainer');
        if (navbarContainer) {
          navbarContainer.innerHTML = navbar.render();
          console.log('✅ Navbar rendered');
          
          if (navbar.bindEvents) {
            navbar.bindEvents();
            console.log('✅ Navbar events bound');
          }
        }
      } catch (error) {
        console.error('❌ Error loading navbar:', error);
      }
    } else {
      console.error('❌ StockMintNavbar not available');
    }
  }
  
  // Setup routing and navigation
  setupRouting() {
    console.log('📍 Setting up routing...');
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });
    
    // Initial route handling
    setTimeout(() => {
      this.handleRouteChange();
    }, 200);
  }
  
  // Handle route changes
  handleRouteChange() {
    try {
      const hash = window.location.hash.substring(1) || 'dashboard';
      console.log('➡️ Navigating to:', hash);
      
      // Check if feature is allowed for current plan
      if (!this.isPageAllowedForPlan(hash)) {
        this.showNotification('This feature is not available in your current plan', 'warning');
        // Redirect to dashboard if not allowed
        if (hash !== 'dashboard') {
          window.location.hash = '#dashboard';
          return;
        }
      }
      
      this.currentPage = hash;
      this.loadPage(hash);
      
      // Update document title
      document.title = `StockMint - ${this.getPageTitle(hash)}`;
      
    } catch (error) {
      console.error('❌ Error handling route change:', error);
      this.showNotification('Failed to load page', 'error');
    }
  }
  
  // Check if page is allowed for current plan
  isPageAllowedForPlan(page) {
    // Demo restrictions
    if (this.currentPlan === 'demo') {
      const demoRestrictedPages = [
        'master/data-migration',
        'master/marketplace-fee',
        'purchases/returns',
        'purchases/deposits',
        'sales/returns',
        'sales/refunds',
        'inventory/adjustments',
        'inventory/opname',
        'transactions/receipts',
        'transactions/journals',
        'tools/reports',
        'tools/analytics',
        'settings/user-management',
        'settings/role-permissions',
        'settings/notification-settings',
        'settings/api-integrations'
      ];
      
      // Check if any restricted page matches
      for (const restrictedPage of demoRestrictedPages) {
        if (page.startsWith(restrictedPage) || page === restrictedPage) {
          return false;
        }
      }
    }
    
    // Basic restrictions (can't access pro/advance features)
    if (this.currentPlan === 'basic') {
      const basicRestrictedPages = [
        'tools/reports', // basic has basic reporting, but not advanced
        'tools/analytics'
      ];
      
      for (const restrictedPage of basicRestrictedPages) {
        if (page.startsWith(restrictedPage) || page === restrictedPage) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Load page content
  loadPage(page) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) {
      console.error('❌ Content area not found');
      return;
    }
    
    // Show loading
    contentArea.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading ${this.getPageTitle(page)}...</p>
      </div>
    `;
    
    // Update navbar title
    this.updateNavbarTitle(page);
    
    // Load actual content after delay
    setTimeout(() => {
      try {
        contentArea.innerHTML = this.getPageContent(page);
        this.initPageScripts(page);
        console.log(`✅ Page "${page}" loaded`);
      } catch (error) {
        console.error(`❌ Error loading page "${page}":`, error);
        contentArea.innerHTML = this.getErrorPage(page, error);
      }
    }, 300);
  }
  
  // Update navbar title
  updateNavbarTitle(page) {
    const title = this.getPageTitle(page);
    const subtitle = this.getPageSubtitle(page);
    
    // Update title elements
    const titleEl = document.querySelector('.main-header .header-left h1');
    const subtitleEl = document.querySelector('.main-header .subtitle');
    
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  }
  
  // Get page title
  getPageTitle(page) {
    const titles = {
      'dashboard': 'Dashboard',
      'master-data': 'Master Data',
      'master/company': 'Company',
      'master/warehouses': 'Warehouses',
      'master/suppliers': 'Suppliers',
      'master/customers': 'Customers',
      'master/products': 'Products',
      'master/categories': 'Categories',
      'master/units': 'Units',
      'master/tax-rates': 'Tax Rates',
      'master/currency': 'Currency',
      'master/marketplace-fee': 'Marketplace Fee',
      'purchases': 'Purchases',
      'purchases/orders': 'Purchase Orders',
      'purchases/returns': 'Purchase Returns',
      'purchases/deposits': 'Purchase Deposits',
      'sales': 'Sales',
      'sales/orders': 'Sales Orders',
      'sales/returns': 'Sales Returns',
      'sales/refunds': 'Refunds',
     'inventory': 'Inventory',
     'inventory/transfers': 'Stock Transfers',
      'inventory/adjustments': 'Stock Adjustments',
      'inventory/opname': 'Stock Opname',
      'transactions': 'Transactions',
      'transactions/payments': 'Payments',
      'transactions/receipts': 'Receipts', 
      'transactions/journals': 'Journals',
      'tools': 'Tools',
      'tools/price-calculator': 'Price Calculator',
      'tools/reports': 'Reports',
      'tools/analytics': 'Analytics',
      'tools/label-generator': 'Label Generator',
      'settings': 'Settings',
      'settings/user-management': 'User Management',
      'settings/role-permissions': 'Role & Permissions',
      'settings/company-settings': 'Company Settings',
      'settings/notification-settings': 'Notification Settings',
      'settings/api-integrations': 'API Integrations',
      'settings/backup-restore': 'Backup & Restore',
      'settings/regional-settings': 'Regional Settings',
      'contacts': 'Contacts',
      'help': 'Help & Guide'
    };
    
    return titles[page] || this.formatPageName(page);
  }
  
  // Format page name (kebab-case to Title Case)
  formatPageName(page) {
    return page.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Get page subtitle
  getPageSubtitle(page) {
    const subtitles = {
      'dashboard': 'Overview of your business performance',
      'master-data': 'Manage your core business data',
      'purchases': 'Purchase orders and supplier management',
      'sales': 'Sales operations and customer orders',
      'inventory': 'Stock and warehouse management',
      'tools': 'Business tools and utilities',
      'settings': 'System configuration and preferences',
      'help': 'Documentation and support'
    };
    
    return subtitles[page] || 'Manage your business operations';
  }
  
  // Get page content
  getPageContent(page) {
    // Dashboard content
    if (page === 'dashboard') {
      return this.getDashboardContent();
    }
    
    // Master Data content
    if (page === 'master-data') {
      return this.getMasterDataContent();
    }
    
    // Other pages
    return this.getDefaultPageContent(page);
  }
  
  // Dashboard content (original)
  getDashboardContent() {
    const userName = this.user?.name || 'User';
    const plan = this.currentPlan.toUpperCase();
    
    return `
      <div class="dashboard-content">
        <!-- Welcome Section -->
        <div class="dashboard-welcome">
          <h2>Welcome back, ${userName}!</h2>
          <p>You are currently on the <strong>${plan}</strong> plan. Monitor your business performance with real-time analytics and powerful insights.</p>
          ${this.currentPlan === 'demo' ? 
            `<div class="demo-warning">
              <i class="fas fa-info-circle"></i>
              <span>Demo mode has limited features. Upgrade to unlock all features.</span>
            </div>` : ''}
          <button class="btn-refresh" id="refreshBtn">
            <i class="fas fa-sync-alt"></i> Refresh Data
          </button>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon" style="background: #19BEBB;">
                <i class="fas fa-boxes"></i>
              </div>
              <div class="stat-title">Total Products</div>
            </div>
            <div class="stat-value">142</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              <span>12% from last month</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon" style="background: #ef4444;">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="stat-title">Low Stock Alert</div>
            </div>
            <div class="stat-value">8 Items</div>
            <div class="stat-action">
              <button class="btn-action">
                <i class="fas fa-shopping-cart"></i> Need Restock
              </button>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon" style="background: #10b981;">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stat-title">Today's Sales</div>
            </div>
            <div class="stat-value">$3,250.00</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              <span>8% from yesterday</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon" style="background: #f59e0b;">
                <i class="fas fa-coins"></i>
              </div>
              <div class="stat-title">Monthly Profit</div>
            </div>
            <div class="stat-value">$48,500.00</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              <span>15% from last month</span>
            </div>
          </div>
        </div>
        
        <!-- Plan Upgrade Banner for Demo -->
        ${this.currentPlan === 'demo' ? `
          <div class="upgrade-banner">
            <div class="upgrade-content">
              <i class="fas fa-crown" style="color: #ffd700;"></i>
              <div>
                <h3>Unlock All Features</h3>
                <p>Upgrade to BASIC, PRO, or ADVANCE plan to access advanced features like multi-user, multi-warehouse, and advanced reporting.</p>
              </div>
              <button class="btn-upgrade" onclick="StockMintApp.showUpgradeModal()">
                <i class="fas fa-rocket"></i> Upgrade Now
              </button>
            </div>
          </div>
        ` : ''}
        
        <!-- Recent Activity -->
        <div class="recent-activity">
          <div class="activity-header">
            <h3>Recent Activity</h3>
            ${this.currentPlan !== 'demo' ? `<a href="#tools/reports" class="view-all">View All</a>` : ''}
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon" style="background: #19BEBB;">
                <i class="fas fa-box"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">New product added - "Premium Widget Pro"</div>
                <div class="activity-time">Just now • By ${userName}</div>
              </div>
            </div>
            
            <div class="activity-item">
              <div class="activity-icon" style="background: #667eea;">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Purchase Order #PO-2025-00123 completed</div>
                <div class="activity-time">2 hours ago • From Supplier ABC</div>
              </div>
            </div>
            
            <div class="activity-item">
              <div class="activity-icon" style="background: #10b981;">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Monthly sales target achieved 120%</div>
                <div class="activity-time">Today, 10:30 AM • Sales Department</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .demo-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 10px 15px;
          margin: 15px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #856404;
        }
        
        .upgrade-banner {
          background: linear-gradient(135deg, #19BEBB 0%, #0fa8a6 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          color: white;
        }
        
        .upgrade-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .upgrade-content i {
          font-size: 36px;
        }
        
        .upgrade-content div {
          flex: 1;
        }
        
        .upgrade-content h3 {
          margin: 0 0 5px 0;
          font-size: 20px;
        }
        
        .upgrade-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
        
        .btn-upgrade {
          background: white;
          color: #19BEBB;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s;
        }
        
        .btn-upgrade:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
      </style>
    `;
  }
  
  // Master Data content with plan restrictions
  getMasterDataContent() {
    const isDemo = this.currentPlan === 'demo';
    
    return `
      <div class="page-content">
        <h1>Master Data</h1>
        <p class="page-subtitle">Manage your core business data and settings</p>
        
        ${isDemo ? `
          <div class="demo-alert">
            <i class="fas fa-info-circle"></i>
            <span>Demo mode: Some features are disabled. Upgrade to BASIC or higher to unlock all features.</span>
          </div>
        ` : ''}
        
        <div class="cards-grid">
          <div class="feature-card" onclick="window.location.hash='#master/company'">
            <div class="feature-icon" style="background: #19BEBB;">
              <i class="fas fa-building"></i>
            </div>
            <h3>Company</h3>
            <p>Company profile and information</p>
          </div>
          
          <div class="feature-card ${!this.config.features.multiWarehouse && this.currentPlan !== 'demo' ? 'disabled-feature' : ''}" 
               onclick="${this.config.features.multiWarehouse || this.currentPlan === 'demo' ? 'window.location.hash=\'#master/warehouses\'' : 'StockMintApp.showFeatureLocked(\'Multi-Warehouse\')'}">
            <div class="feature-icon" style="background: #667eea;">
              <i class="fas fa-warehouse"></i>
            </div>
            <h3>Warehouses</h3>
            <p>Manage storage locations</p>
            ${!this.config.features.multiWarehouse && this.currentPlan !== 'demo' ? '<div class="feature-locked"><i class="fas fa-lock"></i> PRO</div>' : ''}
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/suppliers'">
            <div class="feature-icon" style="background: #10b981;">
              <i class="fas fa-truck"></i>
            </div>
            <h3>Suppliers</h3>
            <p>Supplier information and contacts</p>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/customers'">
            <div class="feature-icon" style="background: #f59e0b;">
              <i class="fas fa-users"></i>
            </div>
            <h3>Customers</h3>
            <p>Customer database</p>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/products'">
            <div class="feature-icon" style="background: #ef4444;">
              <i class="fas fa-boxes"></i>
            </div>
            <h3>Products</h3>
            <p>Product catalog and inventory</p>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/categories'">
            <div class="feature-icon" style="background: #8b5cf6;">
              <i class="fas fa-tags"></i>
            </div>
            <h3>Categories</h3>
            <p>Product categories and grouping</p>
          </div>
          
          <div class="feature-card ${isDemo ? 'disabled-feature' : ''}" 
               onclick="${!isDemo ? 'window.location.hash=\'#master/data-migration\'' : 'StockMintApp.showFeatureLocked(\'Data Migration\')'}">
            <div class="feature-icon" style="background: #3b82f6;">
              <i class="fas fa-database"></i>
            </div>
            <h3>Data Migration</h3>
            <p>Import data from old systems</p>
            ${isDemo ? '<div class="feature-locked"><i class="fas fa-lock"></i> DEMO</div>' : ''}
          </div>
          
          <div class="feature-card ${isDemo ? 'disabled-feature' : ''}" 
               onclick="${!isDemo ? 'window.location.hash=\'#master/marketplace-fee\'' : 'StockMintApp.showFeatureLocked(\'Marketplace Fee\')'}">
            <div class="feature-icon" style="background: #f97316;">
              <i class="fas fa-percentage"></i>
            </div>
            <h3>Marketplace Fee</h3>
            <p>Configure marketplace fees</p>
            ${isDemo ? '<div class="feature-locked"><i class="fas fa-lock"></i> DEMO</div>' : ''}
          </div>
        </div>
        
        <style>
          .demo-alert {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #856404;
          }
          
          .disabled-feature {
            opacity: 0.6;
            cursor: not-allowed;
            position: relative;
          }
          
          .feature-locked {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        </style>
      </div>
    `;
  }
  
  // Default page content (for other pages) - NO DUPLICATE TITLE
  getDefaultPageContent(page) {
    const title = this.getPageTitle(page);
    const isDemo = this.currentPlan === 'demo';
    const demoRestricted = isDemo && [
      'Data Migration',
      'Marketplace Fee',
      'Purchase Returns',
      'Purchase Deposits',
      'Sales Returns',
      'Refunds',
      'Stock Adjustments',
      'Stock Opname',
      'Receipts',
      'Journals',
      'Reports',
      'Analytics',
      'User Management',
      'Role & Permissions',
      'Notification Settings',
      'API Integrations'
    ].some(restrictedTitle => title.includes(restrictedTitle));
    
    if (demoRestricted) {
      return `
        <div class="page-content">
          <div class="feature-locked-page">
            <i class="fas fa-lock" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;"></i>
            <h2>Feature Locked</h2>
            <p>The <strong>${title}</strong> feature is not available in DEMO mode.</p>
            <p>Upgrade to BASIC, PRO, or ADVANCE plan to access this feature and many more.</p>
            <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center;">
              <button onclick="window.location.hash='dashboard'" class="btn-secondary">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
              </button>
              <button onclick="StockMintApp.showUpgradeModal()" class="btn-primary">
                <i class="fas fa-rocket"></i> Upgrade Plan
              </button>
            </div>
          </div>
        </div>
        
        <style>
          .feature-locked-page {
            text-align: center;
            padding: 50px 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .feature-locked-page h2 {
            color: #ef4444;
            margin-bottom: 15px;
          }
          
          .feature-locked-page p {
            color: #666;
            margin-bottom: 10px;
            line-height: 1.6;
          }
        </style>
      `;
    }
    
    return `
      <div class="page-content">
        <!-- HAPUS <h1> dan <p class="page-subtitle"> di sini -->
        <!-- Judul sudah ada di Navbar, jadi tidak perlu diulang di konten -->
      
        <div class="card" style="margin-top: 20px;">
          <div class="card-header">
            <h3><i class="fas fa-tools"></i> ${title} - Coming Soon</h3>
          </div>
          <div class="card-body">
            <p>The <strong>${title}</strong> feature is currently under development.</p>
            <p>We're working hard to bring you this functionality. Please check back later for updates.</p>
          
            <div style="margin-top: 20px; display: flex; gap: 10px;">
              <button onclick="window.location.hash='dashboard'" class="btn-primary">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
              </button>
              <button onclick="window.location.hash='help'" class="btn-secondary">
                <i class="fas fa-question-circle"></i> Get Help
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Error page
  getErrorPage(page, error) {
    return `
      <div class="error-container">
        <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 48px; margin-bottom: 20px;"></i>
        <h3>Error Loading Page</h3>
        <p>Failed to load: ${this.getPageTitle(page)}</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">Error: ${error.message}</p>
        <button onclick="window.location.hash='dashboard'" class="btn-primary" style="margin-top: 20px;">
          <i class="fas fa-arrow-left"></i> Go to Dashboard
        </button>
      </div>
    `;
  }
  
  // Initialize page-specific scripts
  initPageScripts(page) {
    if (page === 'dashboard') {
      this.initDashboard();
    }
  }
  
  // Initialize dashboard
  initDashboard() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.showNotification('Dashboard refreshed!', 'success');
      });
    }
  }
  
  // Setup initial page (check for first-time setup)
  setupInitialPage() {
    const setupCompleted = localStorage.getItem('stockmint_setup_completed');
    
    if (!setupCompleted && !this.user?.isDemo) {
      console.log('First-time setup required');
      // You can redirect to setup page here if needed
    }
  }
  
  // Show notification
  showNotification(message, type = 'info') {
    // Check if notification system exists
    if (window.StockMintCommon && window.StockMintCommon.showNotification) {
      window.StockMintCommon.showNotification(message, type);
      return;
    }
    
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }
  
  // Show critical error
  showCriticalError(error) {
    console.error('Critical error:', error);
    
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 48px; margin-bottom: 20px;"></i>
          <h3>Failed to Load Application</h3>
          <p>${error.message}</p>
          <button onclick="window.location.reload()" class="btn-primary" style="margin-top: 15px;">
            <i class="fas fa-redo"></i> Reload Application
          </button>
        </div>
      `;
    }
  }
  
  // Show feature locked message
  static showFeatureLocked(featureName) {
    alert(`"${featureName}" is only available in BASIC, PRO, or ADVANCE plans. Please upgrade to unlock this feature.`);
  }
  
  // Show upgrade modal
  static showUpgradeModal() {
    // In real implementation, this would show a modal
    // For now, we'll show an alert with options
    const plans = [
      { name: 'BASIC', price: '$19/month', features: ['All demo features', 'Multi-scenario marketplace fees', 'Returned products management', 'Data migration'] },
      { name: 'PRO', price: '$49/month', features: ['All BASIC features', 'Multi-user (up to 3)', 'Multi-warehouse (up to 3)', 'Advanced reporting', 'Auto-refresh every 5 minutes'] },
      { name: 'ADVANCE', price: '$99/month', features: ['All PRO features', 'Full accounting integration', 'Real-time updates', 'Custom reporting', 'Advanced analytics'] }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Upgrade Your Plan</h3>
          <button class="modal-close" onclick="this.closest('.upgrade-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="plans-grid">
            ${plans.map(plan => `
              <div class="plan-card ${plan.name === 'PRO' ? 'recommended' : ''}">
                ${plan.name === 'PRO' ? '<div class="plan-badge">RECOMMENDED</div>' : ''}
                <h4>${plan.name}</h4>
                <div class="plan-price">${plan.price}</div>
                <ul class="plan-features">
                  ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
                <button class="btn-select-plan" onclick="StockMintApp.selectPlan('${plan.name.toLowerCase()}')">
                  Select ${plan.name}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .upgrade-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
      }
      
      .modal-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
      }
      
      .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 1000px;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .modal-header h3 {
        margin: 0;
        font-size: 24px;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #666;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .plan-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        position: relative;
      }
      
      .plan-card.recommended {
        border-color: #19BEBB;
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(25, 190, 187, 0.2);
      }
      
      .plan-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: #19BEBB;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .plan-card h4 {
        margin: 0 0 10px 0;
        font-size: 20px;
      }
      
      .plan-price {
        font-size: 28px;
        font-weight: bold;
        color: #19BEBB;
        margin-bottom: 20px;
      }
      
      .plan-features {
        list-style: none;
        padding: 0;
        margin: 0 0 20px 0;
      }
      
      .plan-features li {
        padding: 5px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .plan-features li i {
        color: #10b981;
      }
      
      .btn-select-plan {
        width: 100%;
        padding: 12px;
        background: #19BEBB;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }
      
      .btn-select-plan:hover {
        background: #0fa8a6;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
  }
  
  // Select plan (for demo purposes)
  static selectPlan(plan) {
    localStorage.setItem('stockmint_plan', plan);
    alert(`Plan upgraded to ${plan.toUpperCase()}! Page will reload to apply changes.`);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  
  // Logout
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      window.location.href = 'index.html';
    }
  }
}

// Create global instance
window.StockMintApp = new StockMintApp();
console.log('✅ StockMintApp instance created');
