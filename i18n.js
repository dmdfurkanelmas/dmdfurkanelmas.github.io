/**
 * Modern Çok Dilli Sistem - Furkan Kampanya Sitesi
 * JSON tabanlı, hafif ve performanslı i18n çözümü
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'tr';
        this.translations = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Tarayıcı dilini tespit et
            const browserLang = navigator.language || navigator.userLanguage;
            const savedLang = localStorage.getItem('furkan-preferred-language');
            
            // Öncelik sırası: Kaydedilen dil > Tarayıcı dili > Türkçe
            if (savedLang && ['tr', 'en', 'de'].includes(savedLang)) {
                this.currentLanguage = savedLang;
            } else if (browserLang.startsWith('en')) {
                this.currentLanguage = 'en';
            } else if (browserLang.startsWith('de')) {
                this.currentLanguage = 'de';
            }

            // Dil seçeneklerini güncelle
            this.updateLanguageButtons();
            
            // İlk dili yükle
            await this.loadLanguage(this.currentLanguage);
            
            this.isInitialized = true;
            console.log(`🌍 I18n initialized with language: ${this.currentLanguage}`);
        } catch (error) {
            console.error('I18n initialization failed:', error);
            // Fallback: Türkçe ile devam et
            this.currentLanguage = 'tr';
        }
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`/translations/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            
            this.translations[lang] = await response.json();
            this.currentLanguage = lang;
            
            // Dil tercihini kaydet
            localStorage.setItem('furkan-preferred-language', lang);
            
            // Sayfayı güncelle
            this.updatePageContent();
            
            // Dil butonlarını güncelle
            this.updateLanguageButtons();
            
            console.log(`✅ Language loaded: ${lang}`);
        } catch (error) {
            console.error(`Failed to load language ${lang}:`, error);
            
            // Fallback: Türkçe yükle
            if (lang !== 'tr') {
                await this.loadLanguage('tr');
            }
        }
    }

    updatePageContent() {
        const t = this.translations[this.currentLanguage];
        if (!t) return;

        // Hero section
        this.updateElement('.main-title', t.hero.title);
        this.updateElement('[data-i18n="hero.subtitle"]', t.hero.subtitle);

        // Donation section
        this.updateElement('[data-i18n="donation.goal"]', t.donation.goal);
        this.updateElement('[data-i18n="donation.goalAmount"]', t.donation.goalAmount);
        this.updateElement('[data-i18n="donation.collected"]', t.donation.collected);
        this.updateElement('[data-i18n="donation.collectedAmount"]', t.donation.collectedAmount);
        this.updateElement('[data-i18n="donation.remaining"]', t.donation.remaining);
        this.updateElement('[data-i18n="donation.remainingAmount"]', t.donation.remainingAmount);
        this.updateElement('[data-i18n="donation.slogan"]', t.donation.slogan);

        // Buttons
        this.updateElement('[data-i18n="buttons.donate"]', t.buttons.donate);
        this.updateElement('[data-i18n="buttons.quickDonate"]', t.buttons.quickDonate);
        this.updateElement('[data-i18n="buttons.share"]', t.buttons.share);

        // Sections
        this.updateElement('[data-i18n="sections.dmdInfo"]', t.sections.dmdInfo);
        this.updateElement('[data-i18n="sections.furkanStory"]', t.sections.furkanStory);
        this.updateElement('[data-i18n="sections.treatment"]', t.sections.treatment);
        this.updateElement('[data-i18n="sections.howToHelp"]', t.sections.howToHelp);
        this.updateElement('[data-i18n="sections.donations"]', t.sections.donations);
        this.updateElement('[data-i18n="sections.socialMedia"]', t.sections.socialMedia);

        // Permission
        this.updateElement('[data-i18n="permission.text"]', t.permission.text);
        this.updateElement('[data-i18n="permission.edevletButton"]', t.permission.edevletButton);

        // Urgency
        this.updateElement('[data-i18n="urgency.message"]', t.urgency.message);
        this.updateElement('[data-i18n="urgency.cta"]', t.urgency.cta);

        // Social
        this.updateElement('[data-i18n="social.instagram"]', t.social.instagram);
        this.updateElement('[data-i18n="social.twitter"]', t.social.twitter);
        this.updateElement('[data-i18n="social.facebook"]', t.social.facebook);
        this.updateElement('[data-i18n="social.tiktok"]', t.social.tiktok);

        // Copyright
        this.updateElement('[data-i18n="copyright"]', t.copyright);

        // Progress bar güncelle
        this.updateProgressBar(t.donation.progress);

        // IBAN butonlarındaki metinleri güncelle
        this.updateIBANButtons(t.buttons);
    }

    updateElement(selector, text) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (text.includes('<strong>')) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        });
    }

    updateProgressBar(progress) {
        const progressBar = document.querySelector('.progress');
        const progressPercentage = document.querySelector('[data-i18n="donation.progress"]');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = `%${progress}`;
        }
    }

    updateLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-option');
        langButtons.forEach(btn => {
            const lang = btn.dataset.lang;
            if (lang === this.currentLanguage) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
    }

    updateIBANButtons(buttons) {
        // IBAN kopyalama butonları
        const ibanButtons = document.querySelectorAll('[onclick*="copyToClipboard"]');
        ibanButtons.forEach(btn => {
            if (btn.textContent.includes('Kopyala') || btn.textContent.includes('Copy') || btn.textContent.includes('kopieren')) {
                btn.textContent = buttons.copyIban;
            }
        });

        // Hızlı bağış butonları
        const quickButtons = document.querySelectorAll('.quick-iban-button');
        quickButtons.forEach(btn => {
            const buttonText = btn.querySelector('.button-content span:first-child');
            if (buttonText && buttonText.textContent.includes('Bağış')) {
                buttonText.textContent = buttons.quickDonate;
            }
        });
    }

    async changeLanguage(lang) {
        if (lang === this.currentLanguage || !this.isInitialized) return;
        
        // Yükleme animasyonu başlat
        this.showLoadingState();
        
        try {
            await this.loadLanguage(lang);
            
            // Başarı animasyonu
            this.showSuccessState();
            
        } catch (error) {
            console.error('Language change failed:', error);
            this.showErrorState();
        }
    }

    showLoadingState() {
        // Dil değişiminde küçük loading animasyonu
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0.7';
            container.style.transition = 'opacity 0.3s ease';
        }
    }

    showSuccessState() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
            
            // Başarı toast mesajı
            this.showToast('Dil değiştirildi!', 'success');
        }
    }

    showErrorState() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
        }
        this.showToast('Dil değiştirilemedi', 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Toast stilleri
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Renk kodlaması
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#3182ce'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Animasyon
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Otomatik kaldırma
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            translation = translation?.[k];
        }
        
        return translation || key;
    }
}

// Global instance
window.i18n = new I18nManager();

// Dil değiştirme event listeners
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-option');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.dataset.lang;
            window.i18n.changeLanguage(lang);
        });
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
