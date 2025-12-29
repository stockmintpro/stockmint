// StockMint Sidebar Component - UPDATED (Show all menus but disable some)

class StockMintSidebar {
  constructor(config, menu) {
    this.config = config || {};
    this.menu = menu || { items: [] };
    this.user = null;
    this.plan = config.currentPlan || 'basic';
  }

  // Render sidebar
  render() {
    console.log('Rendering sidebar with menu items:', this.menu.items?.length || 0);
    
    const logoUrl = 'https://i.ibb.co.com/XxvfRDyV/logo-stockmint-png.png';
    const user = this.getUserData();
    const plan = this.plan;
    const planBadge = this.config.planBadges[plan] || this.config.planBadges.basic;
    
    return `
      <aside class="sidebar" id="sidebar">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-circle">
            <img src="${logoUrl}" alt="StockMint Logo" class="logo-img">
          </div>
          <div class="logo-text">
            <div class="app-name">StockMint</div>
            <div class="app-tagline">
              <span class="tagline-line">Precision Inventory</span>
              <span class="tagline-with-badge">
                <span class="tagline-line">& Profit Tracking</span>
                <span class="pro-badge" style="background: ${planBadge.bgColor}; color: ${planBadge.textColor}; border: 1px solid ${planBadge.color}">
                  ${planBadge.text}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="nav-menu">
          <ul id="mainMenu">
            ${this.renderMenuItems(this.menu.items)}
          </ul>
        </nav>

        <!-- Upgrade Banner for Demo Users -->
        ${plan === 'demo' ? `
          <div class="demo-upgrade-banner">
            <i class="fas fa-crown"></i>
            <div>
              <strong>Upgrade to unlock all features</strong>
              <small>Try BASIC, PRO, or ADVANCE plans</small>
            </div>
            <button class="btn-upgrade-small" onclick="StockMintApp.showUpgradeModal()">
              <i class="fas fa-arrow-up"></i>
            </button>
          </div>
        ` : ''}

        <!-- User Section -->
        <div class="user-section">
          <div class="user-avatar">
            ${user.picture ? 
              `<img src="${user.picture}" alt="${user.name}">` : 
              `<i class="fas fa-user-circle"></i>`
            }
          </div>
          <div class="user-info">
            <div class="user-name">${user.name}</div>
            <div class="user-role">${user.isDemo ? 'Demo User' : plan.toUpperCase() + ' User'}</div>
          </div>
          <button class="logout-btn" id="logoutBtn" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>
      
      <style>
        .pro-badge {
          background: ${planBadge.bgColor};
          color: ${planBadge.textColor};
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-left: 8px;
          border: 1px solid ${planBadge.color};
        }
        
        .tagline-with-badge {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .user-role {
          font-size: 12px;
          color: #19BEBB;
          font-weight: 600;
        }
        
        .demo-upgrade-banner {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: white;
          padding: 10px 15px;
          margin: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }
        
        .demo-upgrade-banner i.fa-crown {
          font-size: 16px;
          color: #ffd700;
        }
        
        .demo-upgrade-banner div {
          flex: 1;
        }
        
        .demo-upgrade-banner strong {
          display: block;
          font-size: 11px;
        }
        
        .demo-upgrade-banner small {
          opacity: 0.9;
          font-size: 10px;
        }
        
        .btn-upgrade-small {
          background: white;
          color: #f59e0b;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        
        /* Lock icon for disabled menus */
        .menu-lock {
          margin-left: auto;
          color: #ef4444;
          font-size: 12px;
          opacity: 0.7;
        }
        
        .menu-item.disabled .menu-link,
        .menu-item.disabled .submenu-link {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .menu-item.disabled .menu-lock {
          opacity: 1;
        }
      </style>
    `;
  }

  // Render menu items (2 levels max) - SEMUA menu ditampilkan
  renderMenuItems(items, level = 0) {
    if (!items || !Array.isArray(items)) {
      console.error('Invalid menu items:', items);
      return '';
    }
    
    return items.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      const isActive = this.isItemActive(item);
      const isEnabled = this.isMenuItemEnabled(item);
      const isRestricted = !isEnabled;
      
      if (level > 1) {
        console.warn('Menu depth > 2 levels, skipping:', item.id);
        return '';
      }
      
      return `
        <li class="menu-item ${hasChildren && level === 0 ? 'has-submenu' : ''} ${isActive ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}">
          <a href="${isEnabled ? (item.url || '#') : '#'}" 
             class="${level === 0 ? 'menu-link' : 'submenu-link'} ${isActive ? 'active' : ''}"
             data-id="${item.id}"
             data-enabled="${isEnabled}"
             ${isRestricted ? 'data-restricted="true" data-feature-name="' + item.title + '"' : ''}
             ${hasChildren && level === 0 ? 'data-has-children="true"' : ''}
             ${!isEnabled ? 'style="cursor: not-allowed;"' : ''}>
            
            <span class="menu-icon">
              <i class="${item.icon || 'fas fa-circle'}"></i>
            </span>
            
            <span class="menu-title">${item.title}</span>
            
            ${hasChildren && level === 0 ? `
              <span class="menu-arrow">
                <i class="fas fa-chevron-down"></i>
              </span>
            ` : ''}
            
            ${isRestricted ? `
              <span class="menu-lock" title="Upgrade to unlock">
                <i class="fas fa-lock"></i>
              </span>
            ` : ''}
          </a>
          
          ${hasChildren && level === 0 ? `
            <div class="submenu">
              <ul>
                ${this.renderMenuItems(item.children, level + 1)}
              </ul>
            </div>
          ` : ''}
        </li>
      `;
    }).join('');
  }

  // Check if menu item is enabled for current plan
  isMenuItemEnabled(item) {
    const plan = this.plan;
    
    // For DEMO: Some menus are disabled but still visible
    if (plan === 'demo') {
      const demoRestrictedMenus = [
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
      ];
      
      // Check if this item or any parent is restricted
      const isRestricted = demoRestrictedMenus.includes(item.title);
      
      // Also check children recursively
      if (item.children) {
        const hasRestrictedChild = item.children.some(child => 
          demoRestrictedMenus.includes(child.title)
        );
        return !isRestricted && !hasRestrictedChild;
      }
      
      return !isRestricted;
    }
    
    // For BASIC: Some PRO features are disabled
    if (plan === 'basic') {
      const basicRestrictedMenus = [
        'Reports', // advanced reports
        'Analytics'
      ];
      
      const isRestricted = basicRestrictedMenus.includes(item.title);
      
      if (item.children) {
        const hasRestrictedChild = item.children.some(child => 
          basicRestrictedMenus.includes(child.title)
        );
        return !isRestricted && !hasRestrictedChild;
      }
      
      return !isRestricted;
    }
    
    // PRO and ADVANCE have all menus enabled
    return true;
  }

  // Check if item is active
  isItemActive(item) {
    const currentHash = window.location.hash.substring(1) || 'dashboard';
    
    // Direct match
    if (item.url && item.url.substring(1) === currentHash) {
      return true;
    }
    
    // Check children
    if (item.children) {
      return item.children.some(child => 
        child.url && child.url.substring(1) === currentHash
      );
    }
    
    return false;
  }

  // Get user data
  getUserData() {
    try {
      const userData = localStorage.getItem('stockmint_user');
      return userData ? JSON.parse(userData) : { 
        name: 'User', 
        email: '', 
        picture: '', 
        isDemo: false 
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      return { name: 'User', email: '', picture: '', isDemo: false };
    }
  }

  // Bind events
  bindEvents() {
    console.log('Binding sidebar events...');
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('menu-open');
      });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          sidebar && 
          sidebar.classList.contains('active') &&
          !sidebar.contains(e.target) &&
          e.target !== mobileToggle) {
        sidebar.classList.remove('active');
        mainContent.classList.remove('menu-open');
      }
    });
    
    // Submenu toggle (only for enabled items)
    document.querySelectorAll('.menu-item.has-submenu:not(.disabled) > .menu-link').forEach(link => {
      link.addEventListener('click', function(e) {
        if (this.getAttribute('data-has-children') === 'true') {
          e.preventDefault();
          const parent = this.closest('.menu-item');
          parent.classList.toggle('active');
        }
      });
    });
    
    // Handle clicks on disabled/restricted menu items
    document.querySelectorAll('[data-restricted="true"]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const featureName = this.getAttribute('data-feature-name') || this.querySelector('.menu-title').textContent;
        const plan = localStorage.getItem('stockmint_plan') || 'demo';
        
        let message = `"${featureName}" is not available in your current plan.`;
        
        if (plan === 'demo') {
          message += '\n\nUpgrade to BASIC, PRO, or ADVANCE plan to unlock this feature.';
        } else if (plan === 'basic') {
          message += '\n\nUpgrade to PRO or ADVANCE plan to unlock this feature.';
        }
        
        // Show upgrade modal instead of alert
        if (window.StockMintApp && window.StockMintApp.showUpgradeModal) {
          window.StockMintApp.showUpgradeModal();
        } else {
          alert(message);
        }
      });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          localStorage.clear();
          window.location.href = 'index.html';
        }
      });
    }
    
    // Update active state on hash change
    window.addEventListener('hashchange', () => {
      this.updateActiveState();
    });
    
    // Initial active state
    this.updateActiveState();
  }
  
  // Update active menu state
  updateActiveState() {
    const currentHash = window.location.hash.substring(1) || 'dashboard';
    console.log('Updating active state for hash:', currentHash);
    
    // Remove all active classes
    document.querySelectorAll('.menu-item, .menu-link, .submenu-link').forEach(el => {
      el.classList.remove('active');
    });
    
    // Find and activate current item
    const findAndActivate = (items) => {
      for (const item of items) {
        // Check if this item matches
        if (item.url && item.url.substring(1) === currentHash) {
          const link = document.querySelector(`[data-id="${item.id}"]`);
          if (link) {
            link.classList.add('active');
            const parentLi = link.closest('.menu-item');
            if (parentLi) {
              parentLi.classList.add('active');
            }
          }
          return true;
        }
        
        // Check children
        if (item.children) {
          if (findAndActivate(item.children)) {
            // Activate parent if child is active
            const parentLink = document.querySelector(`[data-id="${item.id}"]`);
            if (parentLink) {
              parentLink.classList.add('active');
              const parentLi = parentLink.closest('.menu-item');
              if (parentLi) {
                parentLi.classList.add('active');
              }
            }
            return true;
          }
        }
      }
      return false;
    };
    
    findAndActivate(this.menu.items);
  }
}

// Export
window.StockMintSidebar = StockMintSidebar;
console.log('StockMintSidebar class loaded');
