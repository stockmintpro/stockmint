/**
 * StockMint Localization System
 * Multi-language support with dynamic translation
 */

class LocalizationSystem {
    constructor(config = {}) {
        this.config = {
            defaultLanguage: 'en',
            availableLanguages: ['en', 'id'],
            fallbackLanguage: 'en',
            storageKey: 'stockmint_language',
            autoDetect: true,
            loadOnInit: true,
            ...config
        };
        
        this.currentLanguage = this.config.defaultLanguage;
        this.translations = {};
        this.isInitialized = false;
        this.placeholders = new RegExp(/\{\{([^}]+)\}\}/g);
        this.htmlPlaceholders = new RegExp(/<(\d+)>(.*?)<\/\1>/g);
        
        this.init();
    }
    
    async init() {
        if (this.config.autoDetect) {
            await this.detectLanguage();
        }
        
        if (this.config.loadOnInit) {
            await this.loadLanguage(this.currentLanguage);
        }
        
        this.isInitialized = true;
        this.dispatchEvent('initialized');
    }
    
    async detectLanguage() {
        // Check stored preference
        const storedLang = localStorage.getItem(this.config.storageKey);
        if (storedLang && this.config.availableLanguages.includes(storedLang)) {
            this.currentLanguage = storedLang;
            return;
        }
        
        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.config.availableLanguages.includes(browserLang)) {
            this.currentLanguage = browserLang;
            return;
        }
        
        // Check browser languages
        const browserLangs = navigator.languages.map(lang => lang.split('-')[0]);
        for (const lang of browserLangs) {
            if (this.config.availableLanguages.includes(lang)) {
                this.currentLanguage = lang;
                return;
            }
        }
        
        // Use default
        this.currentLanguage = this.config.defaultLanguage;
    }
    
    async loadLanguage(lang) {
        if (!this.config.availableLanguages.includes(lang)) {
            console.warn(`Language "${lang}" is not available. Falling back to "${this.config.fallbackLanguage}"`);
            lang = this.config.fallbackLanguage;
        }
        
        try {
            // Load translation file
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language "${lang}"`);
            }
            
            this.translations[lang] = await response.json();
            this.currentLanguage = lang;
            
            // Store preference
            localStorage.setItem(this.config.storageKey, lang);
            
            // Update UI if already initialized
            if (this.isInitialized) {
                this.updatePage();
            }
            
            this.dispatchEvent('languageChanged', { language: lang });
            
            return true;
        } catch (error) {
            console.error('Failed to load language:', error);
            
            // Try fallback language
            if (lang !== this.config.fallbackLanguage) {
                return await this.loadLanguage(this.config.fallbackLanguage);
            }
            
            return false;
        }
    }
    
    t(key, params = {}) {
        if (!this.isInitialized || !this.translations[this.currentLanguage]) {
            return key; // Return key as fallback
        }
        
        // Navigate through nested keys
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && translation[k] !== undefined) {
                translation = translation[k];
            } else {
                // Try fallback language
                const fallbackTranslation = this.getFallbackTranslation(key);
                if (fallbackTranslation) {
                    translation = fallbackTranslation;
                    break;
                }
                return key; // Return key if not found
            }
        }
        
        // Handle string translation
        if (typeof translation === 'string') {
            // Replace placeholders
            translation = translation.replace(this.placeholders, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
            
            // Handle HTML placeholders (for links, etc.)
            translation = translation.replace(this.htmlPlaceholders, (match, index, content) => {
                if (params.htmlPlaceholders && params.htmlPlaceholders[index]) {
                    return params.htmlPlaceholders[index](content);
                }
                return content;
            });
        }
        
        return translation;
    }
    
    getFallbackTranslation(key) {
        if (!this.translations[this.config.fallbackLanguage]) {
            return null;
        }
        
        const keys = key.split('.');
        let translation = this.translations[this.config.fallbackLanguage];
        
        for (const k of keys) {
            if (translation && translation[k] !== undefined) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return translation;
    }
    
    updatePage() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = this.parseElementParams(element);
            
            if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = this.t(key, params);
            } else {
                element.textContent = this.t(key, params);
            }
        });
        
        // Update elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Update elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // Update elements with data-i18n-aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });
        
        // Update page title
        const pageTitle = document.querySelector('title[data-i18n]');
        if (pageTitle) {
            const key = pageTitle.getAttribute('data-i18n');
            document.title = this.t(key);
        }
        
        // Update direction for RTL languages
        this.updateTextDirection();
        
        // Dispatch update event
        this.dispatchEvent('pageUpdated');
    }
    
    parseElementParams(element) {
        const params = {};
        
        // Get params from data attributes
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-i18n-param-')) {
                const paramName = attr.name.replace('data-i18n-param-', '');
                params[paramName] = attr.value;
            }
        });
        
        // Get HTML placeholders
        const htmlMatches = element.innerHTML.match(this.htmlPlaceholders);
        if (htmlMatches) {
            params.htmlPlaceholders = {};
            htmlMatches.forEach((match, index) => {
                params.htmlPlaceholders[index] = (content) => content;
            });
        }
        
        return params;
    }
    
    updateTextDirection() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        const isRTL = rtlLanguages.includes(this.currentLanguage);
        
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
    }
    
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage;
        const defaultOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(number);
    }
    
    formatCurrency(amount, currency = 'USD', options = {}) {
        const locale = this.currentLanguage;
        const defaultOptions = {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(amount);
    }
    
    formatDate(date, options = {}) {
        const locale = this.currentLanguage;
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const dateObj = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    }
    
    formatTime(date, options = {}) {
        const locale = this.currentLanguage;
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const dateObj = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    }
    
    formatRelativeTime(date) {
        const now = new Date();
        const dateObj = date instanceof Date ? date : new Date(date);
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
        
        if (diffInSeconds < 60) {
            return rtf.format(-diffInSeconds, 'second');
        } else if (diffInSeconds < 3600) {
            return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
        } else if (diffInSeconds < 86400) {
            return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
        } else if (diffInSeconds < 2592000) {
            return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
        } else if (diffInSeconds < 31536000) {
            return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
        } else {
            return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
        }
    }
    
    getAvailableLanguages() {
        return this.config.availableLanguages.map(lang => ({
            code: lang,
            name: this.getLanguageName(lang),
            nativeName: this.getLanguageNativeName(lang)
        }));
    }
    
    getLanguageName(lang) {
        const names = {
            en: 'English',
            id: 'Indonesian',
            // Add more languages as needed
        };
        return names[lang] || lang;
    }
    
    getLanguageNativeName(lang) {
        const nativeNames = {
            en: 'English',
            id: 'Bahasa Indonesia',
            // Add more languages as needed
        };
        return nativeNames[lang] || this.getLanguageName(lang);
    }
    
    createLanguageSelector(container, options = {}) {
        const defaultOptions = {
            showFlags: true,
            showNames: true,
            showNativeNames: false,
            className: 'language-selector',
            onChange: (lang) => this.loadLanguage(lang)
        };
        
        const opts = { ...defaultOptions, ...options };
        const languages = this.getAvailableLanguages();
        
        const selector = document.createElement('div');
        selector.className = opts.className;
        
        const currentLang = languages.find(l => l.code === this.currentLanguage);
        
        selector.innerHTML = `
            <button class="language-selector-toggle">
                ${opts.showFlags ? `<span class="language-flag flag-${this.currentLanguage}"></span>` : ''}
                ${opts.showNames ? `<span class="language-name">${currentLang.name}</span>` : ''}
                ${opts.showNativeNames && currentLang.nativeName !== currentLang.name ? 
                  `<span class="language-native-name">(${currentLang.nativeName})</span>` : ''}
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="language-selector-dropdown">
                ${languages.map(lang => `
                    <button class="language-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                            data-lang="${lang.code}">
                        ${opts.showFlags ? `<span class="language-flag flag-${lang.code}"></span>` : ''}
                        <span class="language-info">
                            ${opts.showNames ? `<span class="language-name">${lang.name}</span>` : ''}
                            ${opts.showNativeNames ? `<span class="language-native-name">${lang.nativeName}</span>` : ''}
                        </span>
                    </button>
                `).join('')}
            </div>
        `;
        
        container.appendChild(selector);
        
        // Add event listeners
        const toggle = selector.querySelector('.language-selector-toggle');
        const dropdown = selector.querySelector('.language-selector-dropdown');
        
        toggle.addEventListener('click', () => {
            dropdown.classList.toggle('show');
        });
        
        selector.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                if (lang !== this.currentLanguage) {
                    opts.onChange(lang);
                }
                dropdown.classList.remove('show');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        return selector;
    }
    
    dispatchEvent(name, detail = {}) {
        const event = new CustomEvent(`i18n:${name}`, {
            detail: { ...detail, language: this.currentLanguage }
        });
        document.dispatchEvent(event);
    }
    
    // Static helper methods
    static async create(config) {
        const instance = new LocalizationSystem(config);
        await instance.init();
        return instance;
    }
}

// CSS for language selector
const languageSelectorStyles = `
.language-selector {
    position: relative;
    display: inline-block;
}

.language-selector-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.language-selector-toggle:hover {
    background: var(--bg-secondary);
    border-color: var(--border-medium);
}

.language-flag {
    display: inline-block;
    width: 20px;
    height: 15px;
    background-size: cover;
    border-radius: 2px;
}

.flag-en { background-image: url('https://flagcdn.com/w20/gb.png'); }
.flag-id { background-image: url('https://flagcdn.com/w20/id.png'); }

.language-name {
    font-weight: 500;
}

.language-native-name {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.language-selector-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    margin-top: 4px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
}

.language-selector-dropdown.show {
    display: block;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.language-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.language-option:hover {
    background-color: var(--bg-secondary);
}

.language-option.active {
    background-color: var(--mint-light);
    color: var(--mint-primary);
}

.language-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* RTL support */
[dir="rtl"] .language-selector-toggle {
    flex-direction: row-reverse;
}

[dir="rtl"] .language-selector-dropdown {
    left: auto;
    right: 0;
}

[dir="rtl"] .language-option {
    text-align: right;
    flex-direction: row-reverse;
}
`;

// Add styles to document
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = languageSelectorStyles;
    document.head.appendChild(style);
});

// Export
window.LocalizationSystem = LocalizationSystem;

// Create global instance
document.addEventListener('DOMContentLoaded', async () => {
    window.i18n = await LocalizationSystem.create({
        defaultLanguage: 'en',
        availableLanguages: ['en', 'id'],
        fallbackLanguage: 'en',
        storageKey: 'stockmint_language',
        autoDetect: true,
        loadOnInit: true
    });
    
    // Add t() shortcut to window
    window.t = (key, params) => window.i18n.t(key, params);
});