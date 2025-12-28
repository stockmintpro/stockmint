// Navbar Component untuk StockMint - Based on dashboard.html
class StockMintNavbar {
    constructor(config) {
        this.config = config || {};
        this.user = null;
        this.currentPage = 'Dashboard';
        this.currentSubtitle = 'Overview of your business performance';
    }

    // Initialize navbar
    init() {
        this.loadUserData();
        return this.render();
    }

    // Load user data from localStorage
    loadUserData() {
        try {
            const userData = localStorage.getItem('stockmint_user');
            if (userData) {
                this.user = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Render navbar (based on dashboard.html)
    render() {
    const user = this.user || { name: 'User', email: '', picture: '', isDemo: true };
    
    return `
        <header class="main-header">
            <div class="header-left">
                <h1>${this.currentPage}</h1>
                <p class="subtitle">${this.currentSubtitle}</p>
            </div>
            
            <div class="header-right">
                <div class="date-time">
                    <span class="time" id="currentTime">${this.getCurrentTime()}</span>
                    <span class="date" id="currentDate">${this.getCurrentDate()}</span>
                </div>
                
                <!-- User info for desktop -->
                <div class="user-info-desktop">
                    <div class="user-avatar-sm">
                        ${user.picture ? 
                            `<img src="${user.picture}" alt="${user.name}">` : 
                            `<i class="fas fa-user-circle"></i>`
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

    // Bind events
    bindEvents() {
        // Update time every second
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000); // Update every minute
        
        // Add CSS for user info desktop
        this.addNavbarStyles();
    }

    // Get current time
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // Get current date
    getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Update date and time
    updateDateTime() {
        const timeEl = document.getElementById('currentTime');
        const dateEl = document.getElementById('currentDate');
        
        if (timeEl) {
            timeEl.textContent = this.getCurrentTime();
        }
        
        if (dateEl) {
            dateEl.textContent = this.getCurrentDate();
        }
    }

    // Update page title
    updateTitle(title, subtitle = '') {
        this.currentPage = title;
        this.currentSubtitle = subtitle || this.currentSubtitle;
        
        const titleEl = document.querySelector('.main-header .header-left h1');
        const subtitleEl = document.querySelector('.main-header .subtitle');
        
        if (titleEl) {
            titleEl.textContent = title;
        }
        
        if (subtitleEl) {
            subtitleEl.textContent = subtitle || this.currentSubtitle;
        }
    }

    // Add navbar styles
    addNavbarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .user-info-desktop {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-left: 20px;
                padding-left: 20px;
                border-left: 1px solid #e0e0e0;
            }
            
            .user-avatar-sm {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #19BEBB 0%, #0fa8a6 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                overflow: hidden;
            }
            
            .user-avatar-sm img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .user-details {
                display: flex;
                flex-direction: column;
            }
            
            .user-name-sm {
                font-weight: 600;
                font-size: 14px;
                color: #333;
            }
            
            .user-role-sm {
                font-size: 12px;
                color: #666;
            }
            
            @media (max-width: 768px) {
                .user-info-desktop {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Logout
    logout() {
        localStorage.removeItem('stockmint_token');
        localStorage.removeItem('stockmint_user');
        localStorage.removeItem('stockmint_plan');
        window.location.href = 'index.html';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockMintNavbar;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.StockMintNavbar = StockMintNavbar;
}
