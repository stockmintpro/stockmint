// StockMint Main Application - COMPLETE VERSION WITH FIRST-TIME SETUP

class StockMintApp {
  constructor() {
    this.config = window.StockMintConfig || {};
    this.menu = window.StockMintMenu || { items: [] };
    this.currentPage = 'dashboard';
    this.user = null;
    this.initialized = false;
    this.currentPlan = 'basic'; // default
    this.attemptedPage = null; // Untuk menyimpan halaman yang dicoba diakses
    this.inSetupMode = false; // Flag untuk mode setup
  }
  
  // Initialize application
  init() {
    console.log('🚀 StockMintApp initializing...');
    
    try {
      // Step 1: Load user data
      this.loadUserData();
      
      // Step 2: Setup configuration
      this.setupConfig();
      
      // Step 3: Check if first-time setup is needed
      const shouldSetup = this.checkFirstTimeSetup();
      
      if (shouldSetup) {
        console.log('🔄 First-time setup required, showing welcome modal');
        // Skip loading components for now, go directly to setup
        this.showWelcomeModal();
        return; // Keluar dari init sementara
      }
      
      // Step 4: Load UI components (jika sudah setup)
      this.loadComponents();
      
      // Step 5: Setup routing
      this.setupRouting();
      
      // Step 6: Load initial page
      this.loadInitialPage();
      
      // Step 7: Mark as initialized
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
  
  // Check if first-time setup is needed
  checkFirstTimeSetup() {
    const setupCompleted = localStorage.getItem('stockmint_setup_completed');
    const user = this.user;
    
    // Jika user adalah demo, langsung lanjut tanpa setup
    if (user?.isDemo) {
      console.log('👤 Demo user detected, skipping setup');
      return false;
    }
    
    // Jika belum setup, tampilkan wizard
    if (!setupCompleted) {
      console.log('🔄 First-time setup required');
      return true;
    }
    
    return false;
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
        // For DEMO users, show feature locked page
        if (this.currentPlan === 'demo') {
          this.attemptedPage = hash;
          this.currentPage = 'feature-locked';
          this.loadPage('feature-locked');
          document.title = `StockMint - Feature Locked`;
          return;
        }
        
        // For BASIC users trying to access PRO features
        this.showNotification('This feature requires PRO or ADVANCE plan', 'warning');
        
        // Redirect to dashboard if trying to access restricted page
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
  
  // Load initial page
  loadInitialPage() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    this.currentPage = hash;
    this.loadPage(hash);
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
      'master/data-migration': 'Data Migration',
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
      'help': 'Help & Guide',
      'setup/start-new': 'Start New Setup',
      'setup/migrate': 'Data Migration',
      'feature-locked': 'Feature Locked'
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
      'help': 'Documentation and support',
      'setup/start-new': 'Set up your business information',
      'setup/migrate': 'Import your existing data',
      'feature-locked': 'Upgrade your plan to unlock this feature'
    };
    
    return subtitles[page] || 'Manage your business operations';
  }
  
  // Get page content - UPDATE untuk handle multi-step setup
  getPageContent(page) {
    // Feature locked page for demo users
    if (page === 'feature-locked') {
        return this.getFeatureLockedContent();
    }
    
    // Dashboard content
    if (page === 'dashboard') {
        return this.getDashboardContent();
    }
    
    // Master Data content
    if (page === 'master-data') {
        return this.getMasterDataContent();
    }
    
    // Setup pages
    if (page.startsWith('setup/')) {
      // Gunakan SetupWizardMulti untuk semua halaman setup
      const wizard = new SetupWizardMulti();
      const hash = window.location.hash.substring(1); // Contoh: 'setup/start-new'
      const route = hash.split('/')[1]; // Contoh: 'start-new'
      
      // Render berdasarkan route
      let html;
      if (route === 'migrate') {
          html = wizard.renderMigratePage();
      } else {
          // Set current step berdasarkan route
          wizard.currentStep = route || wizard.currentStep;
          html = wizard.render();
      }
      
      // Bind events setelah konten dimuat
      setTimeout(() => {
          wizard.bindEvents();
      }, 100);
      
      return html;
    }
    
    // Other pages
    return this.getDefaultPageContent(page);
  }
  
  // Dashboard content
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
  
  // Master Data content with plan restrictions DAN RESET FUNCTIONALITY
  getMasterDataContent() {
    const isDemo = this.currentPlan === 'demo';
    const isBasic = this.currentPlan === 'basic';
    
    return `
      <div class="page-content">
        <h1>Master Data</h1>
        <p class="page-subtitle">Manage your core business data and settings</p>
        
        ${isDemo ? `
          <div class="demo-alert">
            <i class="fas fa-info-circle"></i>
            <span>Demo mode: Most features are enabled! Only Data Migration and Marketplace Fee are disabled.</span>
          </div>
        ` : ''}
        
        <div class="cards-grid">
          <div class="feature-card" onclick="window.location.hash='#master/company'">
            <div class="feature-icon" style="background: #19BEBB;">
              <i class="fas fa-building"></i>
            </div>
            <h3>Company</h3>
            <p>Company profile and information</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/warehouses'">
            <div class="feature-icon" style="background: #667eea;">
              <i class="fas fa-warehouse"></i>
            </div>
            <h3>Warehouses</h3>
            <p>Manage storage locations</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/suppliers'">
            <div class="feature-icon" style="background: #10b981;">
              <i class="fas fa-truck"></i>
            </div>
            <h3>Suppliers</h3>
            <p>Supplier information and contacts</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/customers'">
            <div class="feature-icon" style="background: #f59e0b;">
              <i class="fas fa-users"></i>
            </div>
            <h3>Customers</h3>
            <p>Customer database</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/products'">
            <div class="feature-icon" style="background: #ef4444;">
              <i class="fas fa-boxes"></i>
            </div>
            <h3>Products</h3>
            <p>Product catalog and inventory</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/categories'">
            <div class="feature-icon" style="background: #8b5cf6;">
              <i class="fas fa-tags"></i>
            </div>
            <h3>Categories</h3>
            <p>Product categories and grouping</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/units'">
            <div class="feature-icon" style="background: #3b82f6;">
              <i class="fas fa-balance-scale"></i>
            </div>
            <h3>Units</h3>
            <p>Measurement units and conversions</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/tax-rates'">
            <div class="feature-icon" style="background: #10b981;">
              <i class="fas fa-percent"></i>
            </div>
            <h3>Tax Rates</h3>
            <p>Tax configurations and rates</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/currency'">
            <div class="feature-icon" style="background: #f59e0b;">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <h3>Currency</h3>
            <p>Currency exchange rates</p>
            <span class="feature-access">✅ Available in Demo</span>
          </div>
          
          <div class="feature-card ${isDemo ? 'disabled-feature' : ''}" 
               onclick="${!isDemo ? 'window.location.hash=\'#master/marketplace-fee\'' : 'window.location.hash=\'#feature-locked\''}">
            <div class="feature-icon" style="background: #f97316;">
              <i class="fas fa-percentage"></i>
            </div>
            <h3>Marketplace Fee</h3>
            <p>Configure marketplace fees</p>
            ${isDemo ? 
              '<span class="feature-access locked">🔒 DEMO Restricted</span>' : 
              '<span class="feature-access">✅ Available</span>'}
          </div>
          
          <div class="feature-card ${isDemo ? 'disabled-feature' : ''}" 
               onclick="${!isDemo ? 'window.location.hash=\'#master/data-migration\'' : 'window.location.hash=\'#feature-locked\''}">
            <div class="feature-icon" style="background: #6b7280;">
              <i class="fas fa-database"></i>
            </div>
            <h3>Data Migration</h3>
            <p>Import data from old systems</p>
            ${isDemo ? 
              '<span class="feature-access locked">🔒 DEMO Restricted</span>' : 
              '<span class="feature-access">✅ Available</span>'}
          </div>
        </div>
        
        <!-- RESET DATA SECTION -->
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h4><i class="fas fa-redo"></i> Reset Data</h4>
            <p>Reset your setup data or perform a full reset to demo mode.</p>
            
            <div style="display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap;">
                <button class="btn-warning" id="resetSetupBtn" style="background: #f59e0b; color: white;">
                    <i class="fas fa-undo"></i> Reset Setup Only
                </button>
                <button class="btn-danger" id="fullResetBtn" style="background: #ef4444; color: white;">
                    <i class="fas fa-trash"></i> Full Reset (Back to Demo)
                </button>
            </div>
            
            <div id="resetStatus" style="margin-top: 10px;"></div>
        </div>
      </div>
      
      <style>
        .feature-access {
          display: block;
          margin-top: 10px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          text-align: center;
        }
        
        .feature-access.locked {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }
        
        .feature-card .feature-access:not(.locked) {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .disabled-feature {
          opacity: 0.7;
          cursor: not-allowed !important;
        }
        
        .demo-alert {
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
        
        .btn-warning, .btn-danger {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        
        .btn-warning:hover {
            background: #d97706 !important;
            transform: translateY(-2px);
        }
        
        .btn-danger:hover {
            background: #dc2626 !important;
            transform: translateY(-2px);
        }
      </style>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Reset Setup Only (data setup saja)
            const resetSetupBtn = document.getElementById('resetSetupBtn');
            if (resetSetupBtn) {
                resetSetupBtn.addEventListener('click', function() {
                    if (confirm('Reset setup data? This will remove company, warehouse, supplier, customer, category, and product data, but keep your user account.')) {
                        const resetStatus = document.getElementById('resetStatus');
                        resetStatus.innerHTML = '<div style="color: #f59e0b;"><i class="fas fa-spinner fa-spin"></i> Resetting setup data...</div>';
                        
                        setTimeout(() => {
                            // Hapus semua data setup
                            localStorage.removeItem('stockmint_setup_completed');
                            localStorage.removeItem('stockmint_company');
                            localStorage.removeItem('stockmint_warehouses');
                            localStorage.removeItem('stockmint_suppliers');
                            localStorage.removeItem('stockmint_customers');
                            localStorage.removeItem('stockmint_categories');
                            localStorage.removeItem('stockmint_products');
                            localStorage.removeItem('stockmint_opening_stocks');
                            localStorage.removeItem('stockmint_setup_current_step');
                            
                            resetStatus.innerHTML = '<div style="color: #10b981;">✅ Setup data reset successfully! Redirecting to setup page...</div>';
                            
                            setTimeout(() => {
                                window.location.hash = '#setup/start-new';
                                window.location.reload();
                            }, 1500);
                        }, 1000);
                    }
                });
            }
            
            // Full Reset (kembali ke demo)
            const fullResetBtn = document.getElementById('fullResetBtn');
            if (fullResetBtn) {
                fullResetBtn.addEventListener('click', function() {
                    if (confirm('FULL RESET: This will delete ALL data and return to demo mode. Are you absolutely sure?')) {
                        const resetStatus = document.getElementById('resetStatus');
                        resetStatus.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-spinner fa-spin"></i> Performing full reset...</div>';
                        
                        setTimeout(() => {
                            // Hapus SEMUA data
                            localStorage.clear();
                            
                            // Set plan ke demo
                            localStorage.setItem('stockmint_plan', 'demo');
                            
                            resetStatus.innerHTML = '<div style="color: #10b981;">✅ Full reset completed! Redirecting to login...</div>';
                            
                            setTimeout(() => {
                                window.location.href = 'index.html';
                            }, 1500);
                        }, 1000);
                    }
                });
            }
        });
      </script>
    `;
  }
  
  // Get setup wizard content (tidak digunakan lagi, diganti dengan SetupWizardMulti)
  getSetupWizardContent(type) {
    if (type === 'start-new') {
        return `
            <div class="page-content">
                <h1>🚀 Start New Setup</h1>
                <p class="page-subtitle">Fill in your basic business information</p>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-building"></i> Company Information</h3>
                    </div>
                    <div class="card-body">
                        <form id="companyForm">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div>
                                    <label>Company Name *</label>
                                    <input type="text" id="companyName" class="form-control" required placeholder="Enter company name">
                                </div>
                                <div>
                                    <label>Tax ID</label>
                                    <input type="text" id="companyTaxId" class="form-control" placeholder="Enter tax ID (optional)">
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Address</label>
                                <textarea id="companyAddress" class="form-control" rows="3" placeholder="Enter company address"></textarea>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Phone Number</label>
                                <input type="tel" id="companyPhone" class="form-control" placeholder="Enter phone number">
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Email</label>
                                <input type="email" id="companyEmail" class="form-control" placeholder="Enter email address">
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Save & Continue
                            </button>
                            
                            <button type="button" class="btn-secondary" onclick="window.location.hash='#dashboard'" style="margin-left: 10px;">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const form = document.getElementById('companyForm');
                    if (form) {
                        form.addEventListener('submit', function(e) {
                            e.preventDefault();
                            
                            const companyName = document.getElementById('companyName').value;
                            const companyTaxId = document.getElementById('companyTaxId').value;
                            const companyAddress = document.getElementById('companyAddress').value;
                            const companyPhone = document.getElementById('companyPhone').value;
                            const companyEmail = document.getElementById('companyEmail').value;
                            
                            if (!companyName) {
                                alert('Company name is required');
                                return;
                            }
                            
                            // Save company data
                            const companyData = {
                                name: companyName,
                                taxId: companyTaxId,
                                address: companyAddress,
                                phone: companyPhone,
                                email: companyEmail,
                                setupDate: new Date().toISOString()
                            };
                            
                            localStorage.setItem('stockmint_company', JSON.stringify(companyData));
                            localStorage.setItem('stockmint_setup_completed', 'true');
                            
                            // Show success message
                            alert('✅ Company information saved! Setup completed.');
                            
                            // Redirect to dashboard
                            window.location.hash = '#dashboard';
                            window.location.reload();
                        });
                    }
                });
            </script>
        `;
    } else {
        // Migration content
        return `
            <div class="page-content">
                <h1>📤 Data Migration</h1>
                <p class="page-subtitle">Import your existing data</p>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-import"></i> Upload Your Data</h3>
                    </div>
                    <div class="card-body">
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 60px; color: #19BEBB; margin-bottom: 20px;">
                                📊
                            </div>
                            <h3>Download Template First</h3>
                            <p style="color: #666; margin-bottom: 30px;">
                                Download our Excel template, fill in your data, then upload it here.
                            </p>
                            
                            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;">
                                <button class="btn-primary" onclick="window.open('template.html', '_blank')">
                                    <i class="fas fa-download"></i> Download Template
                                </button>
                                <button class="btn-secondary" id="uploadMigrationFile">
                                    <i class="fas fa-upload"></i> Upload Filled Template
                                </button>
                            </div>
                            
                            <input type="file" id="migrationFile" accept=".xlsx,.xls,.csv" style="display: none;">
                            
                            <div id="uploadStatus" style="margin-top: 20px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const uploadBtn = document.getElementById('uploadMigrationFile');
                    const fileInput = document.getElementById('migrationFile');
                    const uploadStatus = document.getElementById('uploadStatus');
                    
                    if (uploadBtn && fileInput) {
                        uploadBtn.addEventListener('click', function() {
                            fileInput.click();
                        });
                        
                        fileInput.addEventListener('change', function(e) {
                            const file = e.target.files[0];
                            if (file) {
                                // Validate file type
                                const validTypes = ['.xlsx', '.xls', '.csv'];
                                const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                                
                                if (!validTypes.includes(fileExt)) {
                                    uploadStatus.innerHTML = '<div style="color: #ef4444; background: #fee2e2; padding: 10px; border-radius: 5px;">❌ Please upload Excel or CSV files only</div>';
                                    return;
                                }
                                
                                uploadStatus.innerHTML = '<div style="color: #f59e0b; background: #fef3c7; padding: 10px; border-radius: 5px;"><i class="fas fa-spinner fa-spin"></i> Processing file...</div>';
                                
                                // Simulate file processing
                                setTimeout(function() {
                                    // Mark migration as completed
                                    localStorage.setItem('stockmint_setup_completed', 'true');
                                    localStorage.setItem('stockmint_data_migrated', 'true');
                                    
                                    uploadStatus.innerHTML = '<div style="color: #10b981; background: #d1fae5; padding: 10px; border-radius: 5px;">✅ Data migration completed successfully!</div>';
                                    
                                    // Redirect after 2 seconds
                                    setTimeout(function() {
                                        window.location.hash = '#dashboard';
                                        window.location.reload();
                                    }, 2000);
                                }, 2000);
                            }
                        });
                    }
                });
            </script>
        `;
    }
  }
  
  // Feature locked content (for demo users)
  getFeatureLockedContent() {
    const attemptedPage = this.attemptedPage || 'dashboard';
    const attemptedPageTitle = this.getPageTitle(attemptedPage);
    
    return `
      <div class="page-content">
        <div class="feature-locked-container">
          <div class="feature-locked-icon">
            <i class="fas fa-lock"></i>
          </div>
          <h2>Feature Locked</h2>
          <p class="feature-name">${attemptedPageTitle}</p>
          <p class="feature-description">
            This feature is not available in <strong>DEMO</strong> mode.
            Upgrade to BASIC, PRO, or ADVANCE plan to unlock all features.
          </p>
          
          <div class="upgrade-options">
            <div class="upgrade-card">
              <div class="upgrade-card-header basic">
                <h3>BASIC</h3>
                <div class="price">$19<span>/month</span></div>
              </div>
              <ul class="upgrade-features">
                <li><i class="fas fa-check"></i> All demo features enabled</li>
                <li><i class="fas fa-check"></i> Multi-scenario marketplace fees</li>
                <li><i class="fas fa-check"></i> Returned products management</li>
                <li><i class="fas fa-check"></i> Data migration tools</li>
              </ul>
              <button class="upgrade-btn basic" onclick="StockMintApp.selectPlan('basic')">
                Upgrade to BASIC
              </button>
            </div>
            
            <div class="upgrade-card recommended">
              <div class="upgrade-card-badge">RECOMMENDED</div>
              <div class="upgrade-card-header pro">
                <h3>PRO</h3>
                <div class="price">$49<span>/month</span></div>
              </div>
              <ul class="upgrade-features">
                <li><i class="fas fa-check"></i> Everything in BASIC</li>
                <li><i class="fas fa-check"></i> Multi-user (up to 3)</li>
                <li><i class="fas fa-check"></i> Multi-warehouse (up to 3)</li>
                <li><i class="fas fa-check"></i> Advanced reporting</li>
                <li><i class="fas fa-check"></i> Auto-refresh every 5 minutes</li>
              </ul>
              <button class="upgrade-btn pro" onclick="StockMintApp.selectPlan('pro')">
                Upgrade to PRO
              </button>
            </div>
            
            <div class="upgrade-card">
              <div class="upgrade-card-header advance">
                <h3>ADVANCE</h3>
                <div class="price">$99<span>/month</span></div>
              </div>
              <ul class="upgrade-features">
                <li><i class="fas fa-check"></i> Everything in PRO</li>
                <li><i class="fas fa-check"></i> Full accounting integration</li>
                <li><i class="fas fa-check"></i> Real-time updates</li>
                <li><i class="fas fa-check"></i> Custom reporting</li>
                <li><i class="fas fa-check"></i> Advanced analytics dashboard</li>
              </ul>
              <button class="upgrade-btn advance" onclick="StockMintApp.selectPlan('advance')">
                Upgrade to ADVANCE
              </button>
            </div>
          </div>
          
          <div class="back-to-dashboard">
            <button onclick="window.location.hash='#dashboard'" class="btn-secondary">
              <i class="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <style>
        .feature-locked-container {
          text-align: center;
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .feature-locked-icon {
          font-size: 64px;
          color: #ef4444;
          margin-bottom: 20px;
        }
        
        .feature-locked-container h2 {
          color: #ef4444;
          margin-bottom: 10px;
        }
        
        .feature-name {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }
        
        .feature-description {
          color: #666;
          max-width: 600px;
          margin: 0 auto 40px auto;
          line-height: 1.6;
        }
        
        .upgrade-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .upgrade-card {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 25px;
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .upgrade-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .upgrade-card.recommended {
          border-color: #19BEBB;
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(25, 190, 187, 0.2);
        }
        
        .upgrade-card-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #19BEBB;
          color: white;
          padding: 6px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        
        .upgrade-card-header {
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .upgrade-card-header h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        
        .upgrade-card-header.basic h3 { color: #6c757d; }
        .upgrade-card-header.pro h3 { color: #19BEBB; }
        .upgrade-card-header.advance h3 { color: #800080; }
        
        .price {
          font-size: 36px;
          font-weight: 800;
        }
        
        .price span {
          font-size: 16px;
          font-weight: normal;
          color: #666;
        }
        
        .upgrade-features {
          list-style: none;
          padding: 0;
          margin: 0 0 25px 0;
          text-align: left;
        }
        
        .upgrade-features li {
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .upgrade-features li i {
          color: #10b981;
        }
        
        .upgrade-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .upgrade-btn.basic {
          background: #6c757d;
          color: white;
        }
        
        .upgrade-btn.basic:hover {
          background: #5a6268;
        }
        
        .upgrade-btn.pro {
          background: #19BEBB;
          color: white;
        }
        
        .upgrade-btn.pro:hover {
          background: #0fa8a6;
        }
        
        .upgrade-btn.advance {
          background: #800080;
          color: white;
        }
        
        .upgrade-btn.advance:hover {
          background: #660066;
        }
        
        .back-to-dashboard {
          margin-top: 30px;
        }
      </style>
    `;
  }
  
  // Default page content (for other pages)
  getDefaultPageContent(page) {
    const title = this.getPageTitle(page);
    
    return `
      <div class="page-content">
        <div class="card" style="margin-top: 20px;">
          <div class="card-header">
            <h3><i class="fas fa-tools"></i> ${title} - Coming Soon</h3>
          </div>
          <div class="card-body">
            <p>The <strong>${title}</strong> feature is currently under development.</p>
            <p>We're working hard to bring you this functionality. Please check back later for updates.</p>
          
            <div style="margin-top: 20px; display: flex; gap: 10px;">
              <button onclick="window.location.hash='#dashboard'" class="btn-primary">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
              </button>
              <button onclick="window.location.hash='#help'" class="btn-secondary">
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
        <button onclick="window.location.hash='#dashboard'" class="btn-primary" style="margin-top: 20px;">
          <i class="fas fa-arrow-left"></i> Go to Dashboard
        </button>
      </div>
    `;
  }
  
  // Initialize page-specific scripts
  initPageScripts(page) {
    if (page === 'dashboard') {
      this.initDashboard();
    } else if (page === 'master-data') {
      this.initMasterData();
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
  
  // Initialize master data page
  initMasterData() {
    // Reset Setup Only (data setup saja)
    const resetSetupBtn = document.getElementById('resetSetupBtn');
    if (resetSetupBtn) {
      resetSetupBtn.addEventListener('click', () => {
        if (confirm('Reset setup data? This will remove company, warehouse, supplier, customer, category, and product data, but keep your user account.')) {
          const resetStatus = document.getElementById('resetStatus');
          resetStatus.innerHTML = '<div style="color: #f59e0b;"><i class="fas fa-spinner fa-spin"></i> Resetting setup data...</div>';
          
          setTimeout(() => {
            // Hapus semua data setup
            localStorage.removeItem('stockmint_setup_completed');
            localStorage.removeItem('stockmint_company');
            localStorage.removeItem('stockmint_warehouses');
            localStorage.removeItem('stockmint_suppliers');
            localStorage.removeItem('stockmint_customers');
            localStorage.removeItem('stockmint_categories');
            localStorage.removeItem('stockmint_products');
            localStorage.removeItem('stockmint_opening_stocks');
            localStorage.removeItem('stockmint_setup_current_step');
            
            resetStatus.innerHTML = '<div style="color: #10b981;">✅ Setup data reset successfully! Redirecting to setup page...</div>';
            
            setTimeout(() => {
              window.location.hash = '#setup/start-new';
              window.location.reload();
            }, 1500);
          }, 1000);
        }
      });
    }
    
    // Full Reset (kembali ke demo)
    const fullResetBtn = document.getElementById('fullResetBtn');
    if (fullResetBtn) {
      fullResetBtn.addEventListener('click', () => {
        if (confirm('FULL RESET: This will delete ALL data and return to demo mode. Are you absolutely sure?')) {
          const resetStatus = document.getElementById('resetStatus');
          resetStatus.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-spinner fa-spin"></i> Performing full reset...</div>';
          
          setTimeout(() => {
            // Hapus SEMUA data
            localStorage.clear();
            
            // Set plan ke demo
            localStorage.setItem('stockmint_plan', 'demo');
            
            resetStatus.innerHTML = '<div style="color: #10b981;">✅ Full reset completed! Redirecting to login...</div>';
            
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1500);
          }, 1000);
        }
      });
    }
  }
  
  // Show welcome modal for first-time users
  showWelcomeModal() {
    // Sembunyikan loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
    
    // Tampilkan modal welcome
    const modalHTML = `
      <div class="modal-overlay" id="welcomeModal" style="
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 9999; padding: 20px;
      ">
        <div class="modal-content" style="
          background: white; border-radius: 15px; padding: 30px;
          max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 48px; color: #19BEBB; margin-bottom: 15px;">
              🎉
            </div>
            <h2 style="color: #333; margin-bottom: 10px;">Welcome to StockMint!</h2>
            <p style="color: #666;">Let's set up your inventory system</p>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
            <button id="startNewBtn" 
                    style="background: #19BEBB; color: white; border: none; 
                           padding: 15px; border-radius: 10px; font-size: 16px;
                           font-weight: 600; cursor: pointer; display: flex;
                           align-items: center; justify-content: center; gap: 10px;">
              <i class="fas fa-rocket"></i> Start New Setup
            </button>
            
            <button id="migrateBtn"
                    style="background: white; color: #19BEBB; border: 2px solid #19BEBB;
                           padding: 15px; border-radius: 10px; font-size: 16px;
                           font-weight: 600; cursor: pointer; display: flex;
                           align-items: center; justify-content: center; gap: 10px;">
              <i class="fas fa-file-import"></i> Migrate Existing Data
            </button>
          </div>
          
          <div style="text-align: center;">
            <button id="skipSetupBtn"
                    style="background: none; border: none; color: #666;
                           cursor: pointer; font-size: 14px;">
              <i class="fas fa-times"></i> Skip for now
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Bind events
    setTimeout(() => {
      document.getElementById('startNewBtn').addEventListener('click', () => {
        this.startSetup('start-new');
      });
      
      document.getElementById('migrateBtn').addEventListener('click', () => {
        this.startSetup('migrate');
      });
      
      document.getElementById('skipSetupBtn').addEventListener('click', () => {
        this.skipSetup();
      });
    }, 100);
  }
  
  // Start setup process
  startSetup(type) {
    // Hapus modal welcome
    const welcomeModal = document.getElementById('welcomeModal');
    if (welcomeModal) {
      welcomeModal.remove();
    }
    
    // Tandai sedang dalam mode setup
    this.inSetupMode = true;
    
    // Load components minimal
    this.loadMinimalComponents();
    
    // Setup routing
    this.setupRouting();
    
    // Navigate to setup page
    if (type === 'start-new') {
      window.location.hash = '#setup/start-new';
    } else {
      window.location.hash = '#setup/migrate';
    }
    
    // Tampilkan app container
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
      appContainer.classList.remove('hidden');
    }
  }
  
  // Load minimal components for setup mode
  loadMinimalComponents() {
    console.log('🛠️ Loading minimal components for setup...');
    
    // Load sidebar minimal
    if (window.StockMintSidebar) {
      try {
        const sidebar = new StockMintSidebar(this.config, this.menu);
        const sidebarContainer = document.getElementById('sidebarContainer');
        if (sidebarContainer) {
          sidebarContainer.innerHTML = sidebar.render();
          
          // Bind sidebar events
          setTimeout(() => {
            if (sidebar.bindEvents) {
              sidebar.bindEvents();
            }
          }, 100);
        }
      } catch (error) {
        console.error('❌ Error loading sidebar:', error);
      }
    }
    
    // Load navbar minimal
    if (window.StockMintNavbar) {
      try {
        const navbar = new StockMintNavbar(this.config);
        const navbarContainer = document.getElementById('navbarContainer');
        if (navbarContainer) {
          navbarContainer.innerHTML = navbar.render();
          
          if (navbar.bindEvents) {
            navbar.bindEvents();
          }
        }
      } catch (error) {
        console.error('❌ Error loading navbar:', error);
      }
    }
  }
  
  // Skip setup
  skipSetup() {
    // Tandai setup sebagai selesai
    localStorage.setItem('stockmint_setup_completed', 'true');
    
    // Hapus modal
    const welcomeModal = document.getElementById('welcomeModal');
    if (welcomeModal) {
      welcomeModal.remove();
    }
    
    // Lanjutkan inisialisasi normal
    this.loadComponents();
    this.setupRouting();
    this.initialized = true;
    
    // Tampilkan app container
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
      appContainer.classList.remove('hidden');
    }
    
    // Navigate to dashboard
    window.location.hash = '#dashboard';
    
    console.log('✅ Setup skipped, continuing to dashboard');
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
