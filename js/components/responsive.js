// Responsive Design Component
class ResponsiveDesign {
    constructor() {
        this.breakpoints = {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.isMobile = this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm';
        this.isTablet = this.currentBreakpoint === 'md';
        this.isDesktop = this.currentBreakpoint === 'lg' || this.currentBreakpoint === 'xl' || this.currentBreakpoint === 'xxl';
        
        this.init();
    }
    
    init() {
        this.setupViewport();
        this.setupTouchEvents();
        this.setupResizeHandler();
        this.addBodyClasses();
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.xxl) return 'xxl';
        if (width >= this.breakpoints.xl) return 'xl';
        if (width >= this.breakpoints.lg) return 'lg';
        if (width >= this.breakpoints.md) return 'md';
        if (width >= this.breakpoints.sm) return 'sm';
        return 'xs';
    }
    
    setupViewport() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
            document.head.appendChild(meta);
        }
    }
    
    setupTouchEvents() {
        // Prevent double-tap zoom on iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // Add touch class to body for touch-specific styles
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('no-touch-device');
        }
    }
    
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    const oldBreakpoint = this.currentBreakpoint;
                    this.currentBreakpoint = newBreakpoint;
                    this.isMobile = newBreakpoint === 'xs' || newBreakpoint === 'sm';
                    this.isTablet = newBreakpoint === 'md';
                    this.isDesktop = newBreakpoint === 'lg' || newBreakpoint === 'xl' || newBreakpoint === 'xxl';
                    
                    this.updateBodyClasses(oldBreakpoint, newBreakpoint);
                    this.dispatchBreakpointChange(oldBreakpoint, newBreakpoint);
                }
            }, 100);
        });
    }
    
    addBodyClasses() {
        document.body.classList.add(`breakpoint-${this.currentBreakpoint}`);
        document.body.classList.add(this.isMobile ? 'mobile' : 'not-mobile');
        document.body.classList.add(this.isTablet ? 'tablet' : 'not-tablet');
        document.body.classList.add(this.isDesktop ? 'desktop' : 'not-desktop');
    }
    
    updateBodyClasses(oldBreakpoint, newBreakpoint) {
        document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
        document.body.classList.add(`breakpoint-${newBreakpoint}`);
        
        document.body.classList.remove('mobile', 'not-mobile', 'tablet', 'not-tablet', 'desktop', 'not-desktop');
        document.body.classList.add(this.isMobile ? 'mobile' : 'not-mobile');
        document.body.classList.add(this.isTablet ? 'tablet' : 'not-tablet');
        document.body.classList.add(this.isDesktop ? 'desktop' : 'not-desktop');
    }
    
    dispatchBreakpointChange(oldBreakpoint, newBreakpoint) {
        const event = new CustomEvent('breakpointChange', {
            detail: {
                oldBreakpoint,
                newBreakpoint,
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                isDesktop: this.isDesktop
            }
        });
        document.dispatchEvent(event);
    }
    
    // Utility methods
    isBreakpointOrAbove(breakpoint) {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
        const targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex >= targetIndex;
    }
    
    isBreakpointOrBelow(breakpoint) {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
        const targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex <= targetIndex;
    }
    
    // Responsive image handling
    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-srcset]');
        
        images.forEach(img => {
            const srcset = img.getAttribute('data-srcset');
            if (srcset) {
                img.srcset = srcset;
                img.removeAttribute('data-srcset');
                
                if (!img.complete) {
                    img.classList.add('loading');
                    img.addEventListener('load', () => {
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                    });
                    
                    img.addEventListener('error', () => {
                        img.classList.remove('loading');
                        img.classList.add('error');
                    });
                }
            }
        });
    }
    
    // Lazy loading
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            const lazyBackgrounds = document.querySelectorAll('[data-bg]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            const backgroundObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        element.style.backgroundImage = `url(${element.dataset.bg})`;
                        element.removeAttribute('data-bg');
                        backgroundObserver.unobserve(element);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
            lazyBackgrounds.forEach(bg => backgroundObserver.observe(bg));
        }
    }
    
    // Responsive table handling
    makeTableResponsive(table) {
        if (this.isMobile || this.isTablet) {
            const headers = [];
            const headerCells = table.querySelectorAll('thead th');
            
            headerCells.forEach((cell, index) => {
                headers[index] = cell.textContent;
            });
            
            const bodyRows = table.querySelectorAll('tbody tr');
            
            bodyRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (headers[index]) {
                        cell.setAttribute('data-label', headers[index]);
                    }
                });
            });
            
            table.classList.add('responsive-table');
        }
    }
}

// Export
window.ResponsiveDesign = ResponsiveDesign;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.responsive = new ResponsiveDesign();
    window.responsive.setupResponsiveImages();
    window.responsive.setupLazyLoading();
    
    // Make all tables responsive
    document.querySelectorAll('table').forEach(table => {
        window.responsive.makeTableResponsive(table);
    });
    
    // Update tables on breakpoint change
    document.addEventListener('breakpointChange', () => {
        document.querySelectorAll('table').forEach(table => {
            window.responsive.makeTableResponsive(table);
        });
    });
});