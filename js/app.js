// StockMint Main Application - COMPLETE VERSION WITH PRESERVED SETUP DATA

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

     // PENTING: Tampilkan app container dulu, sembunyikan loading screen nanti
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (loadingScreen && appContainer) {
        loadingScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }
    
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
      console.log('🔗 Hash changed to:', window.location.hash);
      this.handleRouteChange();
    });
    
    // Juga listen untuk popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      console.log('⏪ Popstate triggered');
      setTimeout(() => this.handleRouteChange(), 100);
    });
    
    // Initial route handling - beri delay untuk memastikan DOM siap
    setTimeout(() => {
      console.log('🚀 Initial route handling...');
      this.handleRouteChange();
    }, 300);
  }
  
  // Handle route changes
  handleRouteChange() {
    try {
      const hash = window.location.hash.substring(1) || 'dashboard';
      console.log('➡️ Navigating to:', hash, 'Current page:', this.currentPage);
      
      // Jika sudah di halaman yang sama, skip
      if (hash === this.currentPage) {
        console.log('⏭️ Already on this page, skipping...');
        return;
      }
      
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
      
      console.log('✅ Page navigation completed');
      
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
        'inventory/transfers',
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
    
    console.log('📄 Loading page:', page);
    
    // Show loading
    contentArea.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading ${this.getPageTitle(page)}...</p>
      </div>
    `;
    
    // Update navbar title
    this.updateNavbarTitle(page);
    
    // Load actual content
    setTimeout(() => {
      try {
        // TANGANI HALAMAN MASTER-DATA KHUSUS
        if (page === 'master-data') {
          if (window.MasterDataPage) {
            const masterDataPage = new MasterDataPage();
            contentArea.innerHTML = masterDataPage.render();
            setTimeout(() => masterDataPage.bindEvents(), 100);
          } else {
            contentArea.innerHTML = this.getDefaultPageContent(page);
          }
        } 
        // TANGANI SETUP PAGES
        else if (page.startsWith('setup/')) {
          if (typeof SetupWizardMulti === 'undefined') {
            console.error('❌ SetupWizardMulti not loaded!');
            contentArea.innerHTML = '<div class="error">Setup wizard failed to load. Please refresh the page.</div>';
          } else {
            try {
              const wizard = new SetupWizardMulti();
              window.currentWizard = wizard;
              
              const hash = window.location.hash.substring(1);
              const route = hash.split('/')[1];
              
              let html;
              if (route === 'migrate') {
                html = wizard.renderMigratePage();
              } else {
                wizard.currentStep = route || wizard.currentStep;
                html = wizard.render();
              }
              
              contentArea.innerHTML = html;
              
              // Bind events setelah DOM dirender
              setTimeout(() => {
                if (window.currentWizard && window.currentWizard.bindEvents) {
                  window.currentWizard.bindEvents();
                }
              }, 100);
            } catch (error) {
              console.error('❌ Error rendering setup wizard:', error);
              contentArea.innerHTML = `<div class="error">Failed to load setup wizard: ${error.message}</div>`;
            }
          }
        } 
        // HALAMAN LAINNYA
        else {
          const html = this.getPageContent(page);
          contentArea.innerHTML = html;
          this.initPageScripts(page);
        }
        
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
      'setup/company': 'Company Setup',
      'setup/warehouse': 'Warehouse Setup',
      'setup/supplier': 'Supplier Setup',
      'setup/customer': 'Customer Setup',
      'setup/category': 'Category Setup',
      'setup/product': 'Product Setup',
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
  
  // Get page content
  getPageContent(page) {
    // Feature locked page for demo users
    if (page === 'feature-locked') {
      return this.getFeatureLockedContent();
    }
    
    // Dashboard content
    if (page === 'dashboard') {
      return this.getDashboardContent();
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
    }
    // Note: MasterDataPage meng-handle event-nya sendiri
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
  
  // LOGOUT FUNCTION - PRESERVE SETUP DATA
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      console.log('🚪 Logging out...');
      
      // Data setup yang harus dipertahankan
      const preservedData = {
        // Data setup inti
        'stockmint_company': localStorage.getItem('stockmint_company'),
        'stockmint_warehouses': localStorage.getItem('stockmint_warehouses'),
        'stockmint_suppliers': localStorage.getItem('stockmint_suppliers'),
        'stockmint_customers': localStorage.getItem('stockmint_customers'),
        'stockmint_categories': localStorage.getItem('stockmint_categories'),
        'stockmint_products': localStorage.getItem('stockmint_products'),
        'stockmint_opening_stocks': localStorage.getItem('stockmint_opening_stocks'),
        
        // Status setup
        'stockmint_setup_completed': localStorage.getItem('stockmint_setup_completed'),
        'stockmint_setup_date': localStorage.getItem('stockmint_setup_date'),
        
        // Plan
        'stockmint_plan': localStorage.getItem('stockmint_plan'),
        
        // Migration data (jika ada)
        'stockmint_migration_completed': localStorage.getItem('stockmint_migration_completed'),
        'stockmint_migration_file': localStorage.getItem('stockmint_migration_file'),
        'stockmint_migration_date': localStorage.getItem('stockmint_migration_date'),
        
        // Transaction data (jika ingin dipertahankan)
        'stockmint_transactions': localStorage.getItem('stockmint_transactions'),
        'stockmint_purchases': localStorage.getItem('stockmint_purchases'),
        'stockmint_sales': localStorage.getItem('stockmint_sales')
      };
      
      // Hapus SEMUA data stockmint terlebih dahulu
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('stockmint_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Kembalikan data setup yang harus dipertahankan
      Object.entries(preservedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'null' && value !== 'undefined') {
          localStorage.setItem(key, value);
        }
      });
      
      // Hapus session data
      sessionStorage.clear();
      
      console.log('✅ Logout successful, setup data preserved');
      
      // Redirect ke login page
      window.location.href = 'index.html';
    }
  }
}

// Create global instance
window.StockMintApp = new StockMintApp();
console.log('✅ StockMintApp instance created - WITH PRESERVED SETUP DATA');

// ===== TEMPORARY PATCH FOR SETUP WIZARD =====
// Ini akan memastikan setup wizard berfungsi meskipun routing bermasalah
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Applying setup wizard patch...');
  
  // Listen untuk semua klik di halaman
  document.addEventListener('click', function(e) {
    // Cek jika klik pada tombol submit form company
    const submitBtn = e.target.closest('button[type="submit"]');
    if (submitBtn) {
      const form = submitBtn.closest('form');
      if (form && form.id === 'companyForm') {
        console.log('🏢 Manual detection: Company form submit clicked');
        e.preventDefault();
        
        // Coba simpan data
        if (window.currentWizard && window.currentWizard.saveCompanyData) {
          try {
            window.currentWizard.saveCompanyData();
            window.location.hash = '#setup/warehouse';
          } catch (error) {
            alert('Error: ' + error.message);
          }
        }
      }
    }
    
    // Cek jika klik pada tombol next (non-submit)
    if (e.target.closest('#nextToSupplier') || 
        e.target.closest('#nextToCustomer') ||
        e.target.closest('#nextToCategory') ||
        e.target.closest('#nextToProduct') ||
        e.target.closest('#completeSetup')) {
      console.log('➡️ Manual detection: Next button clicked');
      // Biarkan event handler asli yang menangani
    }
  });
  
  // Juga handle hash changes secara manual
  window.addEventListener('hashchange', function() {
    console.log('🔗 Manual hash change detected:', window.location.hash);
    
    // Jika di halaman setup, coba render ulang
    if (window.location.hash.includes('#setup/')) {
      setTimeout(function() {
        if (window.StockMintApp && window.StockMintApp.loadPage) {
          const page = window.location.hash.substring(1);
          window.StockMintApp.loadPage(page);
        }
      }, 100);
    }
  });
});
