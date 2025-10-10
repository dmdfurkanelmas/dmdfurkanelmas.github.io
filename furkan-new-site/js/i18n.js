/**
 * FURKAN İÇİN UMUT - ÇOK DİLLİ SİSTEM (i18n)
 * JSON tabanlı, performanslı, modern i18n çözümü
 */

'use strict';

// ===== I18N CONFIGURATION =====
const I18N_CONFIG = {
    // Supported languages
    languages: {
        tr: {
            code: 'tr',
            name: 'Türkçe',
            flag: '🇹🇷',
            locale: 'tr-TR',
            rtl: false
        },
        en: {
            code: 'en',
            name: 'English',
            flag: '🇬🇧',
            locale: 'en-US',
            rtl: false
        },
        de: {
            code: 'de',
            name: 'Deutsch',
            flag: '🇩🇪',
            locale: 'de-DE',
            rtl: false
        }
    },
    
    // Default language
    defaultLanguage: 'tr',
    
    // Translation file paths
    translationPaths: {
        tr: 'data/translations/tr.json',
        en: 'data/translations/en.json',
        de: 'data/translations/de.json'
    },
    
    // Cache settings
    cache: {
        enabled: true,
        maxAge: 86400000, // 24 hours
        key: 'furkan_translations_cache'
    },
    
    // Performance settings
    performance: {
        preloadTranslations: true,
        lazyLoadFallback: true,
        batchUpdates: true
    }
};

// ===== TRANSLATION MANAGER =====
class TranslationManager {
    constructor() {
        this.currentLanguage = I18N_CONFIG.defaultLanguage;
        this.translations = {};
        this.isInitialized = false;
        this.loadingPromises = new Map();
        this.updateQueue = [];
        this.cache = new Map();
        
        this.init();
    }

    async init() {
        try {
            // Detect browser language
            const detectedLang = this.detectBrowserLanguage();
            
            // Load saved language preference
            const savedLang = this.loadLanguagePreference();
            
            // Set initial language
            this.currentLanguage = savedLang || detectedLang;
            
            // Setup language buttons
            this.setupLanguageButtons();
            
            // Load initial translations
            await this.loadLanguage(this.currentLanguage);
            
            // Apply translations
            this.updatePageContent();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Setup intersection observer for lazy loading
            this.setupLazyLoading();
            
            console.log(`✅ i18n initialized with language: ${this.currentLanguage}`);
            
        } catch (error) {
            console.error('❌ i18n initialization failed:', error);
            this.fallbackToDefault();
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Extract language code (e.g., 'en-US' -> 'en')
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Check if language is supported
        if (I18N_CONFIG.languages[langCode]) {
            return langCode;
        }
        
        // Fallback to English for common languages
        if (langCode.startsWith('en')) return 'en';
        if (langCode.startsWith('de')) return 'de';
        
        return I18N_CONFIG.defaultLanguage;
    }

    loadLanguagePreference() {
        try {
            const saved = localStorage.getItem('furkan_preferred_language');
            if (saved && I18N_CONFIG.languages[saved]) {
                return saved;
            }
        } catch (e) {
            console.warn('LocalStorage not available for language preference');
        }
        return null;
    }

    saveLanguagePreference(lang) {
        try {
            localStorage.setItem('furkan_preferred_language', lang);
        } catch (e) {
            console.warn('LocalStorage not available for saving language preference');
        }
    }

    setupLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            
            if (!lang || !I18N_CONFIG.languages[lang]) {
                console.warn(`Invalid language button: ${lang}`);
                return;
            }
            
            // Set active state
            if (lang === this.currentLanguage) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            }
            
            // Add click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeLanguage(lang);
            });
        });
    }

    async loadLanguage(lang) {
        // Return cached translations if available
        if (this.cache.has(lang)) {
            const cached = this.cache.get(lang);
            if (Date.now() - cached.timestamp < I18N_CONFIG.cache.maxAge) {
                this.translations[lang] = cached.data;
                return cached.data;
            }
        }
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(lang)) {
            return this.loadingPromises.get(lang);
        }
        
        // Create loading promise
        const loadPromise = this.fetchTranslations(lang);
        this.loadingPromises.set(lang, loadPromise);
        
        try {
            const translations = await loadPromise;
            
            // Cache translations
            this.cache.set(lang, {
                data: translations,
                timestamp: Date.now()
            });
            
            // Store in memory
            this.translations[lang] = translations;
            
            return translations;
            
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
            
            // Fallback to default language
            if (lang !== I18N_CONFIG.defaultLanguage) {
                return this.loadLanguage(I18N_CONFIG.defaultLanguage);
            }
            
            throw error;
            
        } finally {
            this.loadingPromises.delete(lang);
        }
    }

    async fetchTranslations(lang) {
        const path = I18N_CONFIG.translationPaths[lang];
        
        try {
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const translations = await response.json();
            
            // Validate translation structure
            this.validateTranslations(translations, lang);
            
            return translations;
            
        } catch (error) {
            console.error(`Failed to fetch translations from ${path}:`, error);
            throw error;
        }
    }

    validateTranslations(translations, lang) {
        // Basic validation - check if it's an object
        if (typeof translations !== 'object' || translations === null) {
            throw new Error(`Invalid translation format for ${lang}`);
        }
        
        // Check for required sections
        const requiredSections = ['hero', 'donation', 'buttons', 'contact'];
        const missingSections = requiredSections.filter(section => !translations[section]);
        
        if (missingSections.length > 0) {
            console.warn(`Missing translation sections for ${lang}:`, missingSections);
        }
    }

    async changeLanguage(lang) {
        if (lang === this.currentLanguage || !I18N_CONFIG.languages[lang]) {
            return;
        }
        
        try {
            // Show loading state
            this.showLanguageLoading();
            
            // Load translations
            await this.loadLanguage(lang);
            
            // Update current language
            this.currentLanguage = lang;
            
            // Save preference
            this.saveLanguagePreference(lang);
            
            // Update language buttons
            this.updateLanguageButtons();
            
            // Update page content
            this.updatePageContent();
            
            // Update HTML lang attribute
            document.documentElement.lang = I18N_CONFIG.languages[lang].locale;
            
            // Update meta tags
            this.updateMetaTags();
            
            // Analytics tracking
            this.trackLanguageChange(lang);
            
            // Hide loading state
            this.hideLanguageLoading();
            
            console.log(`🌍 Language changed to: ${lang}`);
            
        } catch (error) {
            console.error('Failed to change language:', error);
            this.hideLanguageLoading();
            
            // Show error message
            if (window.FurkanApp && window.FurkanApp.toastManager) {
                window.FurkanApp.toastManager().error('Dil değiştirilemedi', 3000);
            }
        }
    }

    updateLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            
            if (lang === this.currentLanguage) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        });
    }

    updatePageContent() {
        if (!this.translations[this.currentLanguage]) {
            console.warn('No translations available for current language');
            return;
        }
        
        const t = this.translations[this.currentLanguage];
        
        // Batch DOM updates for better performance
        if (I18N_CONFIG.performance.batchUpdates) {
            this.batchUpdateElements(t);
        } else {
            this.updateElementsIndividually(t);
        }
    }

    batchUpdateElements(translations) {
        const updates = [];
        
        // Collect all elements that need updating
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(translations, key);
            
            if (translation) {
                updates.push({ element, translation });
            }
        });
        
        // Apply all updates in a single batch
        requestAnimationFrame(() => {
            updates.forEach(({ element, translation }) => {
                this.updateElement(element, translation);
            });
        });
    }

    updateElementsIndividually(translations) {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(translations, key);
            
            if (translation) {
                this.updateElement(element, translation);
            }
        });
    }

    getNestedTranslation(translations, key) {
        return key.split('.').reduce((obj, keyPart) => {
            return obj && obj[keyPart];
        }, translations);
    }

    updateElement(element, translation) {
        const tagName = element.tagName.toLowerCase();
        
        // Handle different element types
        switch (tagName) {
            case 'input':
            case 'textarea':
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
                break;
                
            case 'img':
                element.alt = translation;
                break;
                
            case 'title':
                element.textContent = translation;
                break;
                
            default:
                // Check if translation contains HTML
                if (translation.includes('<')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
                break;
        }
        
        // Update ARIA attributes if needed
        this.updateAriaAttributes(element, translation);
    }

    updateAriaAttributes(element, translation) {
        // Update aria-label if it exists
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.startsWith('data-i18n:')) {
            const labelKey = ariaLabel.replace('data-i18n:', '');
            const labelTranslation = this.getNestedTranslation(
                this.translations[this.currentLanguage], 
                labelKey
            );
            if (labelTranslation) {
                element.setAttribute('aria-label', labelTranslation);
            }
        }
    }

    updateMetaTags() {
        const lang = I18N_CONFIG.languages[this.currentLanguage];
        const t = this.translations[this.currentLanguage];
        
        // Update page title
        if (t.hero && t.hero.title) {
            document.title = t.hero.title;
        }
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && t.hero && t.hero.description) {
            metaDescription.setAttribute('content', t.hero.description);
        }
        
        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && t.hero && t.hero.title) {
            ogTitle.setAttribute('content', t.hero.title);
        }
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription && t.hero && t.hero.description) {
            ogDescription.setAttribute('content', t.hero.description);
        }
    }

    showLanguageLoading() {
        // Add loading class to language buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            button.classList.add('loading');
        });
        
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'language-loading';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Dil yükleniyor...</span>
        `;
        document.body.appendChild(loadingIndicator);
    }

    hideLanguageLoading() {
        // Remove loading class from language buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            button.classList.remove('loading');
        });
        
        // Remove loading indicator
        const loadingIndicator = document.querySelector('.language-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const key = element.getAttribute('data-i18n');
                    
                    if (key && this.translations[this.currentLanguage]) {
                        const translation = this.getNestedTranslation(
                            this.translations[this.currentLanguage], 
                            key
                        );
                        
                        if (translation) {
                            this.updateElement(element, translation);
                        }
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        // Observe elements that come into view
        const lazyElements = document.querySelectorAll('[data-i18n-lazy]');
        lazyElements.forEach(element => {
            observer.observe(element);
        });
    }

    fallbackToDefault() {
        console.warn('Falling back to default language');
        this.currentLanguage = I18N_CONFIG.defaultLanguage;
        this.updateLanguageButtons();
    }

    trackLanguageChange(lang) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'language_change', {
                event_category: 'i18n',
                event_label: lang,
                value: 1
            });
        }
        
        // Console logging for development
        console.log(`📊 Analytics: language_change - ${lang}`);
    }

    // ===== PUBLIC API =====
    
    // Get translation by key
    t(key, params = {}) {
        const translation = this.getNestedTranslation(
            this.translations[this.currentLanguage], 
            key
        );
        
        if (!translation) {
            console.warn(`Translation missing for key: ${key}`);
            return key; // Return key as fallback
        }
        
        // Replace parameters
        return this.interpolate(translation, params);
    }

    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] || match;
        });
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get available languages
    getAvailableLanguages() {
        return Object.keys(I18N_CONFIG.languages);
    }

    // Preload translations
    async preloadTranslations(languages = null) {
        const langsToLoad = languages || Object.keys(I18N_CONFIG.languages);
        
        const loadPromises = langsToLoad.map(lang => {
            if (lang !== this.currentLanguage) {
                return this.loadLanguage(lang);
            }
        }).filter(Boolean);
        
        try {
            await Promise.all(loadPromises);
            console.log(`✅ Preloaded translations for: ${langsToLoad.join(', ')}`);
        } catch (error) {
            console.warn('Failed to preload some translations:', error);
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Translation cache cleared');
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            languages: Array.from(this.cache.keys()),
            memoryUsage: this.cache.size * 1024 // Rough estimate
        };
    }
}

// ===== GLOBAL INSTANCE =====
let translationManager;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        translationManager = new TranslationManager();
        
        // Make it globally accessible
        window.FurkanApp = window.FurkanApp || {};
        window.FurkanApp.translationManager = () => translationManager;
        
        // Global translation function
        window.t = (key, params) => translationManager.t(key, params);
        
        console.log('✅ Translation Manager initialized successfully');
        
    } catch (error) {
        console.error('❌ Translation Manager initialization failed:', error);
    }
});

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
}
