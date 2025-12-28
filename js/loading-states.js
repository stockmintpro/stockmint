/**
 * StockMint Loading States System
 * Handles loading indicators, progress bars, and skeleton screens
 */

class LoadingSystem {
    constructor(config = {}) {
        this.config = {
            minLoadingTime: 300, // Minimum time to show loading (ms)
            maxLoadingTime: 30000, // Maximum time before timeout (ms)
            showProgressBar: true,
            showPercentage: false,
            spinnerType: 'default', // 'default', 'dots', 'pulse', 'ring'
            skeletonShimmer: true,
            ...config
        };
        
        this.activeLoaders = new Map();
        this.loadingQueue = [];
        this.isGlobalLoading = false;
        
        this.init();
    }
    
    init() {
        this.createGlobalLoader();
        this.setupProgressBar();
        this.setupSkeletonTemplates();
        this.setupLoadingInterceptor();
    }
    
    createGlobalLoader() {
        // Create global loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'global-loader';
        overlay.className = 'global-loader hidden';
        overlay.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner ${this.config.spinnerType}"></div>
                <div class="loader-text">Loading...</div>
                <div class="loader-progress"></div>
                <div class="loader-percentage">0%</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.globalLoader = overlay;
    }
    
    setupProgressBar() {
        if (this.config.showProgressBar) {
            // Simulate progress for better UX
            this.progress = {
                current: 0,
                target: 0,
                interval: null,
                speed: 2
            };
        }
    }
    
    setupSkeletonTemplates() {
        // Define skeleton templates for different content types
        this.skeletonTemplates = {
            card: `
                <div class="skeleton-card">
                    <div class="skeleton-image shimmer"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line shimmer" style="width: 80%"></div>
                        <div class="skeleton-line shimmer" style="width: 60%"></div>
                        <div class="skeleton-line shimmer" style="width: 40%"></div>
                    </div>
                </div>
            `,
            
            table: `
                <div class="skeleton-table">
                    <div class="skeleton-header shimmer"></div>
                    ${Array(5).fill().map(() => `
                        <div class="skeleton-row">
                            ${Array(4).fill().map(() => `
                                <div class="skeleton-cell shimmer"></div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `,
            
            list: `
                <div class="skeleton-list">
                    ${Array(6).fill().map(() => `
                        <div class="skeleton-item">
                            <div class="skeleton-avatar shimmer"></div>
                            <div class="skeleton-text">
                                <div class="skeleton-line shimmer" style="width: 70%"></div>
                                <div class="skeleton-line shimmer" style="width: 40%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            
            form: `
                <div class="skeleton-form">
                    ${Array(4).fill().map(() => `
                        <div class="skeleton-field">
                            <div class="skeleton-label shimmer" style="width: 30%"></div>
                            <div class="skeleton-input shimmer"></div>
                        </div>
                    `).join('')}
                    <div class="skeleton-button shimmer" style="width: 40%"></div>
                </div>
            `
        };
    }
    
    setupLoadingInterceptor() {
        // Intercept fetch requests
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const loaderId = `fetch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            try {
                this.showLoader(loaderId, {
                    message: 'Loading data...',
                    type: 'fetch',
                    url: args[0]
                });
                
                const response = await originalFetch.apply(this, args);
                
                this.updateLoaderProgress(loaderId, 100);
                setTimeout(() => {
                    this.hideLoader(loaderId);
                }, this.config.minLoadingTime);
                
                return response;
            } catch (error) {
                this.hideLoader(loaderId);
                throw error;
            }
        };
    }
    
    // Public API Methods
    
    showLoader(id, options = {}) {
        const loader = {
            id,
            startTime: Date.now(),
            progress: 0,
            message: options.message || 'Loading...',
            type: options.type || 'default',
            element: null,
            ...options
        };
        
        this.activeLoaders.set(id, loader);
        this.updateGlobalLoaderState();
        
        // Create specific loader if needed
        if (options.element) {
            this.createElementLoader(loader, options.element);
        }
        
        // Start timeout monitor
        this.startTimeoutMonitor(loader);
        
        return id;
    }
    
    hideLoader(id) {
        const loader = this.activeLoaders.get(id);
        if (!loader) return;
        
        // Ensure minimum loading time
        const elapsed = Date.now() - loader.startTime;
        const remaining = Math.max(0, this.config.minLoadingTime - elapsed);
        
        setTimeout(() => {
            this.removeLoader(id);
        }, remaining);
    }
    
    updateLoaderProgress(id, progress) {
        const loader = this.activeLoaders.get(id);
        if (!loader) return;
        
        progress = Math.max(0, Math.min(100, progress));
        loader.progress = progress;
        
        // Update element if it exists
        if (loader.element) {
            const progressBar = loader.element.querySelector('.loader-progress-bar');
            const percentage = loader.element.querySelector('.loader-percentage');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (percentage && this.config.showPercentage) {
                percentage.textContent = `${Math.round(progress)}%`;
            }
        }
        
        // Update global loader
        this.updateGlobalLoaderProgress();
    }
    
    showSkeleton(target, type = 'card', count = 1) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;
        
        // Store original content
        const originalContent = element.innerHTML;
        element.setAttribute('data-original-content', originalContent);
        element.classList.add('skeleton-container');
        
        // Apply skeleton
        const template = this.skeletonTemplates[type] || this.skeletonTemplates.card;
        const skeletons = Array(count).fill(template).join('');
        
        element.innerHTML = skeletons;
        
        return {
            remove: () => this.hideSkeleton(element)
        };
    }
    
    hideSkeleton(element) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;
        
        const originalContent = target.getAttribute('data-original-content');
        if (originalContent) {
            target.innerHTML = originalContent;
            target.removeAttribute('data-original-content');
        }
        
        target.classList.remove('skeleton-container');
    }
    
    showGlobalLoader(message = 'Loading...') {
        this.isGlobalLoading = true;
        this.globalLoader.querySelector('.loader-text').textContent = message;
        this.globalLoader.classList.remove('hidden');
        
        // Start progress animation
        if (this.config.showProgressBar) {
            this.startProgressAnimation();
        }
        
        // Add to body
        document.body.classList.add('global-loading');
    }
    
    hideGlobalLoader() {
        this.isGlobalLoading = false;
        
        // Complete progress
        if (this.config.showProgressBar) {
            this.updateProgress(100);
            setTimeout(() => {
                this.globalLoader.classList.add('hidden');
                this.resetProgress();
                document.body.classList.remove('global-loading');
            }, 300);
        } else {
            this.globalLoader.classList.add('hidden');
            document.body.classList.remove('global-loading');
        }
    }
    
    wrapAsyncFunction(fn, options = {}) {
        return async (...args) => {
            const loaderId = this.showLoader(`async_${fn.name || 'function'}`, options);
            
            try {
                const result = await fn(...args);
                this.hideLoader(loaderId);
                return result;
            } catch (error) {
                this.hideLoader(loaderId);
                throw error;
            }
        };
    }
    
    // Private Methods
    
    removeLoader(id) {
        if (this.activeLoaders.has(id)) {
            const loader = this.activeLoaders.get(id);
            
            // Clean up element if it exists
            if (loader.element && loader.element.parentNode) {
                loader.element.remove();
            }
            
            this.activeLoaders.delete(id);
            this.updateGlobalLoaderState();
        }
    }
    
    updateGlobalLoaderState() {
        const hasLoaders = this.activeLoaders.size > 0;
        
        if (hasLoaders && !this.isGlobalLoading) {
            this.showGlobalLoader();
        } else if (!hasLoaders && this.isGlobalLoading) {
            this.hideGlobalLoader();
        }
        
        // Update message based on active loaders
        if (hasLoaders) {
            const firstLoader = Array.from(this.activeLoaders.values())[0];
            this.globalLoader.querySelector('.loader-text').textContent = firstLoader.message;
        }
    }
    
    updateGlobalLoaderProgress() {
        if (!this.config.showProgressBar || this.activeLoaders.size === 0) return;
        
        const loaders = Array.from(this.activeLoaders.values());
        const totalProgress = loaders.reduce((sum, loader) => sum + loader.progress, 0);
        const averageProgress = totalProgress / loaders.length;
        
        this.updateProgress(averageProgress);
    }
    
    updateProgress(progress) {
        if (!this.config.showProgressBar) return;
        
        this.progress.target = progress;
        
        if (!this.progress.interval) {
            this.progress.interval = setInterval(() => {
                if (this.progress.current < this.progress.target) {
                    this.progress.current += this.progress.speed;
                    if (this.progress.current > this.progress.target) {
                        this.progress.current = this.progress.target;
                    }
                    
                    const progressBar = this.globalLoader.querySelector('.loader-progress');
                    const percentage = this.globalLoader.querySelector('.loader-percentage');
                    
                    if (progressBar) {
                        progressBar.style.width = `${this.progress.current}%`;
                    }
                    
                    if (percentage && this.config.showPercentage) {
                        percentage.textContent = `${Math.round(this.progress.current)}%`;
                    }
                } else {
                    clearInterval(this.progress.interval);
                    this.progress.interval = null;
                }
            }, 16); // ~60fps
        }
    }
    
    resetProgress() {
        if (this.progress.interval) {
            clearInterval(this.progress.interval);
            this.progress.interval = null;
        }
        
        this.progress.current = 0;
        this.progress.target = 0;
        
        const progressBar = this.globalLoader.querySelector('.loader-progress');
        const percentage = this.globalLoader.querySelector('.loader-percentage');
        
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        
        if (percentage && this.config.showPercentage) {
            percentage.textContent = '0%';
        }
    }
    
    startProgressAnimation() {
        if (!this.config.showProgressBar) return;
        
        // Simulate progress for better UX
        this.updateProgress(30); // Start at 30%
        
        // Gradually increase to 80% over time
        setTimeout(() => {
            this.updateProgress(80);
        }, 500);
    }
    
    startTimeoutMonitor(loader) {
        setTimeout(() => {
            if (this.activeLoaders.has(loader.id)) {
                console.warn(`Loader ${loader.id} is taking too long`);
                
                // Update message
                loader.message = 'Still loading...';
                if (loader.element) {
                    const textElement = loader.element.querySelector('.loader-text');
                    if (textElement) {
                        textElement.textContent = loader.message;
                    }
                }
                
                // Dispatch timeout event
                document.dispatchEvent(new CustomEvent('loader:timeout', {
                    detail: loader
                }));
            }
        }, this.config.maxLoadingTime);
    }
    
    createElementLoader(loader, element) {
        const loaderElement = document.createElement('div');
        loaderElement.className = 'element-loader';
        loaderElement.innerHTML = `
            <div class="loader-overlay"></div>
            <div class="loader-content">
                <div class="loader-spinner ${this.config.spinnerType}"></div>
                <div class="loader-text">${loader.message}</div>
                ${this.config.showProgressBar ? '<div class="loader-progress-container"><div class="loader-progress-bar" style="width: 0%"></div></div>' : ''}
                ${this.config.showPercentage ? '<div class="loader-percentage">0%</div>' : ''}
            </div>
        `;
        
        element.style.position = 'relative';
        element.appendChild(loaderElement);
        loader.element = loaderElement;
    }
    
    // Utility Methods
    
    debounceLoader(id, delay = 300) {
        clearTimeout(this.loadingQueue[id]);
        this.loadingQueue[id] = setTimeout(() => {
            this.hideLoader(id);
            delete this.loadingQueue[id];
        }, delay);
    }
    
    getLoadingStats() {
        return {
            activeLoaders: this.activeLoaders.size,
            isGlobalLoading: this.isGlobalLoading,
            loaders: Array.from(this.activeLoaders.values()).map(l => ({
                id: l.id,
                type: l.type,
                progress: l.progress,
                duration: Date.now() - l.startTime
            }))
        };
    }
}

// CSS for loading states
const loadingStyles = `
/* Global Loader */
.global-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease;
}

.global-loader.hidden {
    opacity: 0;
    pointer-events: none;
}

.loader-content {
    text-align: center;
    max-width: 300px;
    padding: var(--space-xl);
}

/* Spinner Types */
.loader-spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-lg);
}

.loader-spinner.default {
    border: 3px solid var(--mint-light);
    border-top: 3px solid var(--mint-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loader-spinner.dots {
    display: flex;
    justify-content: center;
    gap: 6px;
}

.loader-spinner.dots::before,
.loader-spinner.dots::after {
    content: '';
    width: 12px;
    height: 12px;
    background: var(--mint-primary);
    border-radius: 50%;
    animation: pulse 1.4s infinite ease-in-out both;
}

.loader-spinner.dots::before {
    animation-delay: -0.32s;
}

.loader-spinner.dots::after {
    animation-delay: -0.16s;
}

.loader-spinner.pulse {
    background: var(--mint-primary);
    border-radius: 50%;
    animation: scale 1s infinite ease-in-out;
}

.loader-spinner.ring {
    border: 3px solid transparent;
    border-top: 3px solid var(--mint-primary);
    border-right: 3px solid var(--mint-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loader-text {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-md);
}

.loader-progress {
    height: 4px;
    background: var(--mint-light);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-bottom: var(--space-sm);
}

.loader-progress::after {
    content: '';
    display: block;
    height: 100%;
    width: 0%;
    background: var(--mint-primary);
    transition: width 0.3s ease;
}

.loader-percentage {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

/* Element Loader */
.element-loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: inherit;
}

.loader-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
}

.element-loader .loader-content {
    position: relative;
    z-index: 1;
}

.loader-progress-container {
    height: 2px;
    background: var(--mint-light);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-top: var(--space-md);
}

.loader-progress-bar {
    height: 100%;
    background: var(--mint-primary);
    transition: width 0.3s ease;
}

/* Skeleton Styles */
.skeleton-container {
    position: relative;
    overflow: hidden;
}

.skeleton-card,
.skeleton-table,
.skeleton-list,
.skeleton-form {
    animation: skeleton-loading 1.5s infinite ease-in-out;
}

.skeleton-image,
.skeleton-line,
.skeleton-cell,
.skeleton-avatar,
.skeleton-label,
.skeleton-input,
.skeleton-button,
.skeleton-header,
.skeleton-item,
.skeleton-field {
    background: linear-gradient(
        90deg,
        var(--bg-secondary) 25%,
        var(--border-light) 50%,
        var(--bg-secondary) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-sm);
}

.skeleton-image {
    height: 150px;
    margin-bottom: var(--space-md);
}

.skeleton-line {
    height: 12px;
    margin-bottom: var(--space-sm);
}

.skeleton-cell {
    height: 20px;
    margin: var(--space-xs);
}

.skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
}

.skeleton-label {
    height: 14px;
    margin-bottom: var(--space-xs);
}

.skeleton-input {
    height: 36px;
    margin-bottom: var(--space-md);
}

.skeleton-button {
    height: 36px;
    margin-top: var(--space-md);
}

.skeleton-header {
    height: 20px;
    margin-bottom: var(--space-md);
}

.skeleton-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    margin-bottom: var(--space-sm);
}

.skeleton-field {
    margin-bottom: var(--space-md);
}

/* Animations */
@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

@keyframes scale {
    0%, 100% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1); opacity: 1; }
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes skeleton-loading {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Body class for global loading */
body.global-loading {
    overflow: hidden;
}

body.global-loading * {
    cursor: wait !important;
}
`;

// Add styles to document
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = loadingStyles;
    document.head.appendChild(style);
});

// Export
window.LoadingSystem = LoadingSystem;

// Create global instance
document.addEventListener('DOMContentLoaded', () => {
    window.loadingSystem = new LoadingSystem({
        minLoadingTime: 300,
        maxLoadingTime: 30000,
        showProgressBar: true,
        showPercentage: true,
        spinnerType: 'default',
        skeletonShimmer: true
    });
});