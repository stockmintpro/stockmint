// navbar.js - Fixed version
class StockMintNavbar {
    constructor(config) {
        this.config = config || {};
    }

    render() {
        const user = StockMintAuth.getUser() || { name: 'Demo User', email: 'demo@stockmint.app' };
        const plan = localStorage.getItem('stockmint_plan') || 'basic';
        const planBadge = this.config.planBadges?.[plan] || { text: 'BASIC', color: '#6c757d' };

        return `
            <header class="main-header">
                <div class="header-left">
                    <h1 id="pageTitle">Dashboard</h1>
                    <p class="subtitle" id="pageSubtitle">Overview of your business performance</p>
                </div>
                
                <div class="header-right">
                    <div class="date-time">
                        <div class="time" id="currentTime">00:00:00</div>
                        <div class="date" id="currentDate">January 1, 2025</div>
                    </div>
                    
                    <div class="user-info-desktop">
                        <div class="user-avatar-sm">
                            ${user.picture ? 
                                `<img src="${user.picture}" alt="${user.name}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <div class="user-details">
                            <div class="user-name-sm">${user.name}</div>
                            <div class="user-role-sm">${user.isDemo ? 'Demo User' : 'Administrator'}</div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    bindEvents() {
        // Update time every second
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
    }

    updateDateTime() {
        const now = new Date();
        
        // Format time
        const time = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Format date
        const date = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeEl = document.getElementById('currentTime');
        const dateEl = document.getElementById('currentDate');
        
        if (timeEl) timeEl.textContent = time;
        if (dateEl) dateEl.textContent = date;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintNavbar;
}

// Global
window.StockMintNavbar = StockMintNavbar;
