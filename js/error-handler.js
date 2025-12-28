/**
 * StockMint Error Handling System
 * Centralized error handling and reporting
 */

class StockMintError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'StockMintError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.stack = new Error().stack;
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

class ErrorHandler {
    constructor(config = {}) {
        this.config = {
            logToConsole: true,
            showUserNotifications: true,
            reportToServer: false,
            serverEndpoint: '/api/errors',
            ignoredErrors: [],
            ...config
        };
        
        this.errorCount = 0;
        this.maxErrorsPerMinute = 10;
        this.errorTimestamps = [];
        
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Window error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: 'Unhandled Promise Rejection',
                reason: event.reason,
                promise: event.promise
            });
        });
        
        // AJAX/Fetch error handler
        this.interceptFetch();
        
        // Console error interception
        if (this.config.logToConsole) {
            this.interceptConsole();
        }
    }
    
    handleError(error, context = {}) {
        // Rate limiting
        if (this.isRateLimited()) {
            return;
        }
        
        this.errorCount++;
        this.errorTimestamps.push(Date.now());
        
        // Clean up old timestamps
        const oneMinuteAgo = Date.now() - 60000;
        this.errorTimestamps = this.errorTimestamps.filter(t => t > oneMinuteAgo);
        
        // Create error object
        const errorObj = this.normalizeError(error, context);
        
        // Log to console
        if (this.config.logToConsole && !this.shouldIgnoreError(errorObj)) {
            console.error('📛 StockMint Error:', errorObj);
        }
        
        // Show user notification
        if (this.config.showUserNotifications && this.shouldShowUserError(errorObj)) {
            this.showUserError(errorObj);
        }
        
        // Report to server
        if (this.config.reportToServer && !this.shouldIgnoreError(errorObj)) {
            this.reportToServer(errorObj);
        }
        
        // Dispatch custom event
        this.dispatchErrorEvent(errorObj);
        
        return errorObj;
    }
    
    normalizeError(error, context) {
        let normalized = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            context: context,
            user: this.getUserInfo(),
            environment: this.getEnvironmentInfo(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        if (error instanceof StockMintError) {
            Object.assign(normalized, error.toJSON());
        } else if (error instanceof Error) {
            normalized.message = error.message;
            normalized.name = error.name;
            normalized.stack = error.stack;
            normalized.code = error.code || 'UNKNOWN';
        } else if (typeof error === 'string') {
            normalized.message = error;
            normalized.name = 'StringError';
            normalized.code = 'STRING_ERROR';
        } else if (error && typeof error === 'object') {
            Object.assign(normalized, error);
        }
        
        // Ensure required fields
        normalized.message = normalized.message || 'Unknown error occurred';
        normalized.code = normalized.code || 'UNKNOWN';
        normalized.name = normalized.name || 'Error';
        
        return normalized;
    }
    
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getUserInfo() {
        try {
            const userData = localStorage.getItem('stockmint_user');
            if (userData) {
                const user = JSON.parse(userData);
                return {
                    id: user.email || 'unknown',
                    name: user.name || 'Unknown',
                    isDemo: user.isDemo || false
                };
            }
        } catch (e) {
            // Ignore errors in error handling
        }
        return { id: 'unknown', name: 'Unknown', isDemo: false };
    }
    
    getEnvironmentInfo() {
        return {
            appVersion: '1.0.0',
            plan: localStorage.getItem('stockmint_plan') || 'unknown',
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            online: navigator.onLine
        };
    }
    
    isRateLimited() {
        return this.errorTimestamps.length >= this.maxErrorsPerMinute;
    }
    
    shouldIgnoreError(error) {
        return this.config.ignoredErrors.some(pattern => {
            if (typeof pattern === 'string') {
                return error.message.includes(pattern) || error.code === pattern;
            }
            if (pattern instanceof RegExp) {
                return pattern.test(error.message);
            }
            return false;
        });
    }
    
    shouldShowUserError(error) {
        // Don't show user errors for network issues or minor errors
        const ignorePatterns = [
            'NetworkError',
            'Failed to fetch',
            'timeout',
            'aborted',
            'cancelled'
        ];
        
        return !ignorePatterns.some(pattern => 
            error.message.includes(pattern) || error.code.includes(pattern)
        );
    }
    
    showUserError(error) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>${this.getUserFriendlyMessage(error)}</strong>
                <p>Error code: ${error.code}</p>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    getUserFriendlyMessage(error) {
        const messages = {
            'AUTH_FAILED': 'Authentication failed. Please login again.',
            'NETWORK_ERROR': 'Network error. Please check your connection.',
            'PERMISSION_DENIED': 'You don\'t have permission to perform this action.',
            'NOT_FOUND': 'The requested resource was not found.',
            'VALIDATION_ERROR': 'Please check your input and try again.',
            'SERVER_ERROR': 'Server error. Please try again later.',
            'TIMEOUT': 'Request timed out. Please try again.',
            'QUOTA_EXCEEDED': 'Storage quota exceeded. Please free up some space.'
        };
        
        return messages[error.code] || 
               'An error occurred. Please try again or contact support.';
    }
    
    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch.apply(this, args);
                
                if (!response.ok) {
                    const errorData = await this.parseErrorResponse(response);
                    this.handleError(errorData, {
                        url: args[0],
                        method: args[1]?.method || 'GET',
                        status: response.status,
                        statusText: response.statusText
                    });
                }
                
                return response;
            } catch (error) {
                this.handleError(error, {
                    url: args[0],
                    method: args[1]?.method || 'GET'
                });
                throw error;
            }
        };
    }
    
    async parseErrorResponse(response) {
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return {
                    message: data.message || response.statusText,
                    code: data.code || `HTTP_${response.status}`,
                    details: data
                };
            }
            
            return {
                message: response.statusText,
                code: `HTTP_${response.status}`,
                status: response.status
            };
        } catch (e) {
            return {
                message: response.statusText,
                code: `HTTP_${response.status}`,
                status: response.status
            };
        }
    }
    
    interceptConsole() {
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = (...args) => {
            this.handleError({
                message: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' '),
                code: 'CONSOLE_ERROR',
                source: 'console.error'
            });
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.handleError({
                message: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' '),
                code: 'CONSOLE_WARNING',
                source: 'console.warn',
                level: 'warning'
            });
            originalWarn.apply(console, args);
        };
    }
    
    async reportToServer(error) {
        if (!this.config.serverEndpoint) return;
        
        try {
            await fetch(this.config.serverEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(error)
            });
        } catch (e) {
            // Silently fail - we don't want error reporting to cause more errors
        }
    }
    
    dispatchErrorEvent(error) {
        const event = new CustomEvent('stockmint:error', {
            detail: error,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }
    
    // Public API
    createError(message, code, details) {
        return new StockMintError(message, code, details);
    }
    
    wrapAsync(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }
    
    wrapSync(fn, context = {}) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }
    
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            errorsLastMinute: this.errorTimestamps.length,
            isRateLimited: this.isRateLimited()
        };
    }
    
    clearErrorStats() {
        this.errorCount = 0;
        this.errorTimestamps = [];
    }
}

// Export
window.StockMintError = StockMintError;
window.ErrorHandler = ErrorHandler;

// Create global error handler instance
document.addEventListener('DOMContentLoaded', () => {
    window.errorHandler = new ErrorHandler({
        logToConsole: true,
        showUserNotifications: true,
        reportToServer: false,
        serverEndpoint: '/api/errors',
        ignoredErrors: [
            'ResizeObserver loop limit exceeded',
            /^Script error\.?$/,
            /^Uncaught \(in promise\)/
        ]
    });
});