// StockMint Main Application - COMPLETE WORKING VERSION

class StockMintApp {
  constructor() {
    this.config = window.StockMintConfig || {};
    this.menu = window.StockMintMenu || { items: [] };
    this.currentPage = 'dashboard';
    this.user = null;
    this.initialized = false;
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
        this.user = { name: 'User', isDemo: true };
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.user = { name: 'User', isDemo: false };
    }
  }
  
  // Setup configuration based on user plan
  setupConfig() {
    const plan = localStorage.getItem('stockmint_plan') || 'basic';
    console.log('📊 User plan:', plan);
    
    // Set features based on plan
    this.config.features = {
      multiUser: plan === 'pro' || plan === 'advance',
      multiWarehouse: plan === 'pro' || plan === 'advance',
      advancedReporting: plan === 'pro' || plan === 'advance',
      realTimeUpdates: plan === 'advance'
    };
    
    // Set plan badge
    this.config.planBadges = {
      basic: { text: 'BASIC', color: '#6c757d' },
      pro: { text: 'PRO', color: '#19BEBB' },
      advance: { text: 'ADVANCE', color: '#ff6b35' }
    };
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
      
      this.currentPage = hash;
      this.loadPage(hash);
      
      // Update document title
      document.title = `StockMint - ${this.getPageTitle(hash)}`;
      
    } catch (error) {
      console.error('❌ Error handling route change:', error);
      this.showNotification('Failed to load page', 'error');
    }
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
      'sales': 'Sales',
      'inventory': 'Inventory',
      'transactions': 'Transactions',
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
    
    return `
      <div class="dashboard-content">
        <!-- Welcome Section -->
        <div class="dashboard-welcome">
          <h2>Welcome back, ${userName}!</h2>
          <p>Monitor your business performance with real-time analytics and powerful insights. All you need to manage inventory and profit in one dashboard.</p>
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
        
        <!-- Recent Activity -->
        <div class="recent-activity">
          <div class="activity-header">
            <h3>Recent Activity</h3>
            <a href="#tools/reports" class="view-all">View All</a>
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
    `;
  }
  
  // Master Data content
  getMasterDataContent() {
    return `
      <div class="page-content">
        <h1>Master Data</h1>
        <p class="page-subtitle">Manage your core business data and settings</p>
        
        <div class="cards-grid">
          <div class="feature-card" onclick="window.location.hash='#master/company'">
            <div class="feature-icon" style="background: #19BEBB;">
              <i class="fas fa-building"></i>
            </div>
            <h3>Company</h3>
            <p>Company profile and information</p>
          </div>
          
          <div class="feature-card" onclick="window.location.hash='#master/warehouses'">
            <div class="feature-icon" style="background: #667eea;">
              <i class="fas fa-warehouse"></i>
            </div>
            <h3>Warehouses</h3>
            <p>Manage storage locations</p>
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
        </div>
      </div>
    `;
  }
  
  // Default page content (for other pages) - NO DUPLICATE TITLE
	getDefaultPageContent(page) {
	const title = this.getPageTitle(page);
  
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
