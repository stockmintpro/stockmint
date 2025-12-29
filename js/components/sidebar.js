// StockMint Sidebar Component - WORKING VERSION

class StockMintSidebar {
  constructor(config, menu) {
    this.config = config || {};
    this.menu = menu || { items: [] };
    this.user = null;
  }

  // Render sidebar
  render() {
    console.log('Rendering sidebar with menu items:', this.menu.items?.length || 0);
    
    const logoUrl = 'https://i.ibb.co.com/XxvfRDyV/logo-stockmint-png.png';
    const user = this.getUserData();
    const plan = localStorage.getItem('stockmint_plan') || 'basic';
    
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
                <span class="pro-badge">${plan.toUpperCase()}</span>
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
            <div class="user-role">${user.isDemo ? 'Demo User' : 'Administrator'}</div>
          </div>
          <button class="logout-btn" id="logoutBtn" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>
    `;
  }

  // Render menu items (2 levels max)
  // Di sidebar.js, ubah renderMenuItems:
renderMenuItems(items) {
    const currentPlan = localStorage.getItem('stockmint_plan') || 'demo';
    const disabledMenus = window.StockMintConfig?.getDisabledMenus(currentPlan) || [];
    
    return items.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        const isActive = window.location.hash === item.path || 
                       window.location.hash.startsWith(item.id);
        
        // Check if main menu is disabled
        const isMainDisabled = disabledMenus.includes(item.id);
        
        return `
            <li class="menu-item ${isActive ? 'active' : ''} ${hasChildren ? 'has-submenu' : ''}">
                <a href="${isMainDisabled ? 'javascript:void(0)' : item.path}" 
                   class="menu-link ${isMainDisabled ? 'disabled' : ''}" 
                   data-menu="${item.id}"
                   ${isMainDisabled ? 'onclick="showUpgradeModal(\'' + item.title + '\')"' : ''}>
                    <span class="menu-icon">${isMainDisabled ? 
                        window.StockMintConfig?.getMenuIconWithLock(item.id, item.icon) : 
                        item.icon
                    }</span>
                    <span class="menu-title">${item.title}</span>
                    ${isMainDisabled ? '<span class="menu-lock"><i class="fas fa-lock"></i></span>' : ''}
                    ${hasChildren ? '<span class="menu-arrow"><i class="fas fa-chevron-down"></i></span>' : ''}
                </a>
                ${hasChildren ? this.renderSubMenu(item.children, disabledMenus) : ''}
            </li>
        `;
    }).join('');
}

renderSubMenu(children, disabledMenus) {
    return `
        <div class="submenu">
            <ul>
                ${children.map(child => {
                    const isChildDisabled = disabledMenus.includes(child.id);
                    return `
                        <li>
                            <a href="${isChildDisabled ? 'javascript:void(0)' : child.path}" 
                               class="submenu-link ${isChildDisabled ? 'disabled' : ''}" 
                               data-submenu="${child.id}"
                               ${isChildDisabled ? 'onclick="showUpgradeModal(\'' + child.title + '\')"' : ''}>
                                <span class="menu-icon">${isChildDisabled ? '🔒' : '↳'}</span>
                                <span>${child.title}</span>
                                ${isChildDisabled ? '<span class="menu-lock"><i class="fas fa-lock"></i></span>' : ''}
                            </a>
                        </li>
                    `;
                }).join('')}
            </ul>
        </div>
    `;
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
    
    // Submenu toggle
    document.querySelectorAll('.menu-item.has-submenu > .menu-link').forEach(link => {
      link.addEventListener('click', function(e) {
        if (this.getAttribute('data-has-children') === 'true') {
          e.preventDefault();
          const parent = this.closest('.menu-item');
          parent.classList.toggle('active');
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
