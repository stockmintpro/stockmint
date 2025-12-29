// sidebar.js - Fixed version
class StockMintSidebar {
    constructor(config, menu) {
        this.config = config || {};
        this.menu = menu || { items: [] };
    }

    render() {
        const user = StockMintAuth.getUser() || { name: 'Demo User', email: 'demo@stockmint.app', picture: '' };
        const plan = localStorage.getItem('stockmint_plan') || 'basic';
        const planBadge = this.config.planBadges?.[plan] || { text: 'BASIC', color: '#6c757d' };

        return `
            <aside class="sidebar" id="sidebar">
                <div class="logo-section">
                    <div class="logo-circle">
                        <img src="https://i.ibb.co.com/XxvfRDyV/logo-stockmint-png.png" 
                             alt="StockMint Logo" 
                             class="logo-img"
                             onerror="this.src='https://via.placeholder.com/32/19BEBB/FFFFFF?text=SM'">
                    </div>
                    <div class="logo-text">
                        <div class="app-name">StockMint</div>
                        <div class="app-tagline">
                            <span class="tagline-line">Precision Inventory</span>
                            <span class="tagline-with-badge">
                                <span class="tagline-line">& Profit Tracking</span>
                                <span class="pro-badge" style="background-color: ${planBadge.color}">
                                    ${planBadge.text}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <nav class="nav-menu">
                    <ul>
                        ${this.renderMenuItems(this.menu.items)}
                    </ul>
                </nav>

                <div class="user-section">
                    <div class="user-avatar">
                        ${user.picture ? 
                            `<img src="${user.picture}" alt="${user.name}">` : 
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-role">${user.isDemo ? 'Demo User' : 'Administrator'}</div>
                    </div>
                    <button class="logout-btn" title="Logout">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </aside>
        `;
    }

    renderMenuItems(items) {
        return items.map(item => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isActive = window.location.hash === item.path || 
                           window.location.hash.startsWith(item.path + '/');
            
            return `
                <li class="menu-item ${isActive ? 'active' : ''} ${hasSubmenu ? 'has-submenu' : ''}">
                    <a href="${item.path}" class="menu-link" data-menu="${item.id}">
                        <span class="menu-icon">${item.icon || '📄'}</span>
                        <span class="menu-title">${item.title}</span>
                        ${hasSubmenu ? 
                            `<span class="menu-arrow"><i class="fas fa-chevron-down"></i></span>` : 
                            ''
                        }
                    </a>
                    ${hasSubmenu ? `
                        <div class="submenu">
                            <ul>
                                ${item.submenu.map(subItem => `
                                    <li>
                                        <a href="${subItem.path}" class="submenu-link" data-submenu="${subItem.id}">
                                            <span class="menu-icon">${subItem.icon || '↳'}</span>
                                            <span>${subItem.title}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </li>
            `;
        }).join('');
    }

    bindEvents() {
        // Toggle submenus
        document.querySelectorAll('.menu-item.has-submenu .menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
                    e.preventDefault();
                    const menuItem = link.closest('.menu-item');
                    menuItem.classList.toggle('active');
                }
            });
        });

        // Set active menu based on current hash
        this.updateActiveMenu();

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.updateActiveMenu();
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                mainContent.classList.toggle('menu-open');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar && mobileToggle && 
                !sidebar.contains(e.target) && 
                !mobileToggle.contains(e.target) &&
                window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                mainContent.classList.remove('menu-open');
            }
        });

        // Logout button
        const logoutBtn = document.querySelector('.user-section .logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
    }

    updateActiveMenu() {
        const currentHash = window.location.hash.substring(1) || 'dashboard';
        
        // Remove all active classes
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Find and activate current menu item
        const findAndActivate = (items, hash) => {
            for (const item of items) {
                // Check main menu
                if (item.path === `#${hash}` || hash.startsWith(item.id)) {
                    const menuItem = document.querySelector(`[data-menu="${item.id}"]`)?.closest('.menu-item');
                    if (menuItem) {
                        menuItem.classList.add('active');
                    }
                    return true;
                }

                // Check submenu
                if (item.submenu) {
                    for (const subItem of item.submenu) {
                        if (subItem.path === `#${hash}` || hash.startsWith(subItem.id)) {
                            const menuItem = document.querySelector(`[data-menu="${item.id}"]`)?.closest('.menu-item');
                            if (menuItem) {
                                menuItem.classList.add('active');
                            }
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        findAndActivate(this.menu.items, currentHash);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintSidebar;
}

// Global
window.StockMintSidebar = StockMintSidebar;
