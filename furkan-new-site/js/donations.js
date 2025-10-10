/**
 * FURKAN İÇİN UMUT - HIZLI BAĞIŞ SİSTEMİ
 * Instagram kullanıcıları için optimize edilmiş IBAN kopyalama
 */

'use strict';

// ===== DONATION CONFIGURATION =====
const DONATION_CONFIG = {
    // IBAN Information
    ibans: {
        tl: {
            number: 'TR65 0020 5000 0913 3755 1000 01',
            bank: 'Türkiye İş Bankası',
            currency: 'TL',
            country: '🇹🇷',
            recipient: 'Furkan Elmas',
            isPrimary: true
        },
        usd: {
            number: 'TR65 0020 5000 0913 3755 1000 02',
            bank: 'Türkiye İş Bankası',
            currency: 'USD',
            country: '🇺🇸',
            recipient: 'Furkan Elmas',
            isPrimary: false
        }
    },
    
    // Analytics Events
    analytics: {
        copyIban: 'iban_copied',
        quickDonate: 'quick_donate_clicked',
        shareDonation: 'donation_shared',
        viewAllIbans: 'view_all_ibans'
    },
    
    // Toast Messages
    messages: {
        success: {
            copy: 'IBAN kopyalandı! 💚 Bağışınız Furkan\'ın hayatını değiştirecek',
            share: 'Paylaşım için teşekkürler! 🙏'
        },
        error: {
            copy: 'IBAN kopyalanamadı. Lütfen manuel olarak kopyalayın.',
            network: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        }
    }
};

// ===== DONATION MANAGER =====
class DonationManager {
    constructor() {
        this.toastManager = null;
        this.copyButtons = new Map();
        this.lastCopiedIban = null;
        this.copyCount = 0;
        
        this.init();
    }

    init() {
        // Wait for toast manager to be available
        this.waitForToastManager();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup IBAN cards
        this.setupIbanCards();
        
        // Setup quick donate buttons
        this.setupQuickDonateButtons();
        
        // Setup other options
        this.setupOtherOptions();
        
        // Load last copied IBAN from storage
        this.loadLastCopiedIban();
        
        console.log('✅ Donation Manager initialized');
    }

    waitForToastManager() {
        const checkToast = () => {
            if (window.FurkanApp && window.FurkanApp.toastManager) {
                this.toastManager = window.FurkanApp.toastManager();
                this.setupToastMessages();
            } else {
                setTimeout(checkToast, 100);
            }
        };
        checkToast();
    }

    setupToastMessages() {
        // Update toast messages with donation-specific content
        if (this.toastManager) {
            this.toastManager.success = (message, duration = 4000) => {
                return this.toastManager.show(message, 'success', duration);
            };
            
            this.toastManager.error = (message, duration = 6000) => {
                return this.toastManager.show(message, 'error', duration);
            };
        }
    }

    setupEventListeners() {
        // Copy button event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn')) {
                e.preventDefault();
                const button = e.target.closest('.copy-btn');
                const targetId = button.getAttribute('data-target');
                this.copyIban(targetId);
            }
        });

        // Quick donate button
        const quickDonateBtn = document.getElementById('quickDonateBtn');
        if (quickDonateBtn) {
            quickDonateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickDonate();
            });
        }

        // Sticky donate button
        const stickyBtn = document.getElementById('stickyBtn');
        if (stickyBtn) {
            stickyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickDonate();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + D for quick donate
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.handleQuickDonate();
            }
        });
    }

    setupIbanCards() {
        const ibanCards = document.querySelectorAll('.iban-card');
        
        ibanCards.forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
            
            // Add click to copy functionality
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.copy-btn')) {
                    const ibanNumber = card.querySelector('.iban-number');
                    if (ibanNumber) {
                        this.copyIban(ibanNumber.id);
                    }
                }
            });
        });
    }

    setupQuickDonateButtons() {
        const quickButtons = document.querySelectorAll('.quick-donate-btn, .sticky-btn');
        
        quickButtons.forEach(button => {
            // Add ripple effect
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });
        });
    }

    setupOtherOptions() {
        // Credit card option
        const creditCardBtn = document.querySelector('[data-action="creditCard"]');
        if (creditCardBtn) {
            creditCardBtn.addEventListener('click', () => {
                this.handleCreditCardDonation();
            });
        }

        // SMS donation option
        const smsBtn = document.querySelector('[data-action="sms"]');
        if (smsBtn) {
            smsBtn.addEventListener('click', () => {
                this.handleSmsDonation();
            });
        }

        // All IBANs option
        const allIbansBtn = document.querySelector('[data-action="allIbans"]');
        if (allIbansBtn) {
            allIbansBtn.addEventListener('click', () => {
                this.handleViewAllIbans();
            });
        }
    }

    // ===== IBAN COPY FUNCTIONALITY =====
    async copyIban(ibanId) {
        try {
            const ibanElement = document.getElementById(ibanId);
            if (!ibanElement) {
                throw new Error('IBAN element not found');
            }

            const ibanText = ibanElement.textContent.trim();
            
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(ibanText);
            } else {
                // Fallback for older browsers
                await this.fallbackCopyToClipboard(ibanText);
            }

            // Success feedback
            this.showCopySuccess(ibanId, ibanText);
            
            // Update last copied IBAN
            this.updateLastCopiedIban(ibanId, ibanText);
            
            // Analytics tracking
            this.trackCopyEvent(ibanId, ibanText);
            
            // Increment copy count
            this.copyCount++;
            
            // Show share prompt after 2nd copy
            if (this.copyCount === 2) {
                setTimeout(() => {
                    this.showSharePrompt();
                }, 2000);
            }

        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyError();
        }
    }

    async fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        return new Promise((resolve, reject) => {
            if (document.execCommand('copy')) {
                resolve();
            } else {
                reject(new Error('Copy command failed'));
            }
            document.body.removeChild(textArea);
        });
    }

    showCopySuccess(ibanId, ibanText) {
        // Update button state
        const copyBtn = document.querySelector(`[data-target="${ibanId}"]`);
        if (copyBtn) {
            const originalText = copyBtn.querySelector('.copy-text').textContent;
            const copyIcon = copyBtn.querySelector('.copy-icon');
            
            // Visual feedback
            copyBtn.classList.add('copied');
            copyIcon.textContent = '✅';
            copyBtn.querySelector('.copy-text').textContent = 'Kopyalandı!';
            
            // Reset after 3 seconds
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyIcon.textContent = '📋';
                copyBtn.querySelector('.copy-text').textContent = originalText;
            }, 3000);
        }

        // Show toast notification
        if (this.toastManager) {
            const ibanType = ibanId.includes('tl') ? 'TL' : 'USD';
            const message = `${ibanType} IBAN kopyalandı! 💚 Bağışınız Furkan'ın hayatını değiştirecek`;
            this.toastManager.success(message, 4000);
        }

        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    showCopyError() {
        if (this.toastManager) {
            this.toastManager.error(DONATION_CONFIG.messages.error.copy, 6000);
        }
    }

    // ===== QUICK DONATE HANDLER =====
    handleQuickDonate() {
        // Analytics tracking
        this.trackEvent(DONATION_CONFIG.analytics.quickDonate, {
            source: 'quick_donate_button'
        });

        // Show primary IBAN (TL) prominently
        this.showPrimaryIbanModal();
    }

    showPrimaryIbanModal() {
        // Create modal for primary IBAN
        const modal = this.createIbanModal(DONATION_CONFIG.ibans.tl);
        
        // Show modal
        document.body.appendChild(modal);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Auto close after 5 seconds
        setTimeout(() => {
            this.closeModal(modal);
        }, 5000);
    }

    createIbanModal(ibanInfo) {
        const modal = document.createElement('div');
        modal.className = 'iban-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💚 Furkan'a Umut Ol</h3>
                    <button class="close-modal" aria-label="Kapat">×</button>
                </div>
                <div class="modal-body">
                    <div class="urgency-message">
                        <span class="urgency-icon">⏰</span>
                        <span class="urgency-text">Her gün çok değerli, zaman Furkan'ın aleyhine işliyor</span>
                    </div>
                    <div class="iban-display">
                        <div class="iban-info">
                            <span class="iban-country">${ibanInfo.country}</span>
                            <span class="iban-currency">${ibanInfo.currency} IBAN</span>
                        </div>
                        <div class="iban-number" id="modalIban">${ibanInfo.number}</div>
                        <button class="copy-btn primary" data-target="modalIban">
                            <span class="copy-icon">📋</span>
                            <span class="copy-text">IBAN'ı Kopyala</span>
                        </button>
                        <p class="iban-note">Alıcı: <strong>${ibanInfo.recipient}</strong></p>
                    </div>
                    <div class="modal-actions">
                        <button class="action-btn share" onclick="donationManager.shareDonation()">
                            <span class="btn-icon">📤</span>
                            <span class="btn-text">Paylaş</span>
                        </button>
                        <button class="action-btn all-ibans" onclick="donationManager.handleViewAllIbans()">
                            <span class="btn-icon">🏦</span>
                            <span class="btn-text">Tüm IBAN'lar</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        backdrop.addEventListener('click', () => this.closeModal(modal));

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // ===== OTHER OPTION HANDLERS =====
    handleCreditCardDonation() {
        // Open credit card donation page
        window.open('https://www.shopier.com/dmdfurkanelmas', '_blank');
        
        this.trackEvent('credit_card_donation_clicked');
    }

    handleSmsDonation() {
        // Show SMS donation instructions
        this.showSmsInstructions();
        
        this.trackEvent('sms_donation_clicked');
    }

    showSmsInstructions() {
        const instructions = `
            SMS ile bağış yapmak için:
            
            1. Telefonunuzdan SMS gönder
            2. Mesaj: "FURKAN" 
            3. Numara: 4444
            
            Örnek: FURKAN 50
            (50 TL bağış yapar)
        `;
        
        if (this.toastManager) {
            this.toastManager.info(instructions, 8000);
        }
    }

    handleViewAllIbans() {
        // Scroll to IBAN section
        const ibanSection = document.querySelector('.iban-options');
        if (ibanSection) {
            ibanSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Highlight IBAN cards
            ibanSection.classList.add('highlight');
            setTimeout(() => {
                ibanSection.classList.remove('highlight');
            }, 2000);
        }
        
        this.trackEvent(DONATION_CONFIG.analytics.viewAllIbans);
    }

    // ===== SHARE FUNCTIONALITY =====
    async shareDonation() {
        const shareData = {
            title: 'Furkan İçin Umut',
            text: '3 yaşındaki Furkan\'ın DMD hastalığı için Elevidys gen tedavisi kampanyası. Sen de destek ol!',
            url: window.location.href
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                this.trackEvent(DONATION_CONFIG.analytics.shareDonation, {
                    method: 'native_share'
                });
            } else {
                // Fallback to custom share modal
                this.showShareModal();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                this.showShareModal();
            }
        }
    }

    showShareModal() {
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal';
        shareModal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📤 Paylaş</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="share-options">
                        <button class="share-btn whatsapp" onclick="donationManager.shareToWhatsApp()">
                            <span class="share-icon">💬</span>
                            <span class="share-text">WhatsApp</span>
                        </button>
                        <button class="share-btn twitter" onclick="donationManager.shareToTwitter()">
                            <span class="share-icon">🐦</span>
                            <span class="share-text">Twitter</span>
                        </button>
                        <button class="share-btn facebook" onclick="donationManager.shareToFacebook()">
                            <span class="share-icon">👥</span>
                            <span class="share-text">Facebook</span>
                        </button>
                        <button class="share-btn copy-link" onclick="donationManager.copyShareLink()">
                            <span class="share-icon">🔗</span>
                            <span class="share-text">Link Kopyala</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(shareModal);
        
        // Add event listeners
        const closeBtn = shareModal.querySelector('.close-modal');
        const backdrop = shareModal.querySelector('.modal-backdrop');
        
        closeBtn.addEventListener('click', () => this.closeModal(shareModal));
        backdrop.addEventListener('click', () => this.closeModal(shareModal));
        
        // Animate in
        requestAnimationFrame(() => {
            shareModal.classList.add('show');
        });
    }

    shareToWhatsApp() {
        const text = encodeURIComponent('Furkan İçin Umut - DMD hastası 3 yaşındaki Furkan\'ın Elevidys gen tedavisi kampanyası. Sen de destek ol!');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        
        this.trackEvent(DONATION_CONFIG.analytics.shareDonation, {
            method: 'whatsapp'
        });
        this.closeModal(document.querySelector('.share-modal'));
    }

    shareToTwitter() {
        const text = encodeURIComponent('Furkan İçin Umut - DMD hastası 3 yaşındaki Furkan\'ın Elevidys gen tedavisi kampanyası. Sen de destek ol!');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        
        this.trackEvent(DONATION_CONFIG.analytics.shareDonation, {
            method: 'twitter'
        });
        this.closeModal(document.querySelector('.share-modal'));
    }

    shareToFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        
        this.trackEvent(DONATION_CONFIG.analytics.shareDonation, {
            method: 'facebook'
        });
        this.closeModal(document.querySelector('.share-modal'));
    }

    async copyShareLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            if (this.toastManager) {
                this.toastManager.success('Link kopyalandı! 📋', 3000);
            }
            
            this.trackEvent(DONATION_CONFIG.analytics.shareDonation, {
                method: 'copy_link'
            });
            this.closeModal(document.querySelector('.share-modal'));
        } catch (error) {
            console.error('Copy link failed:', error);
            if (this.toastManager) {
                this.toastManager.error('Link kopyalanamadı', 3000);
            }
        }
    }

    showSharePrompt() {
        if (this.toastManager) {
            const message = 'Bağışınız için teşekkürler! 🙏 Furkan\'ın hikayesini paylaşmak ister misiniz?';
            this.toastManager.info(message, 6000);
            
            // Add share button to toast
            setTimeout(() => {
                const toast = document.querySelector('.toast.show');
                if (toast) {
                    const shareBtn = document.createElement('button');
                    shareBtn.textContent = 'Paylaş';
                    shareBtn.className = 'toast-share-btn';
                    shareBtn.onclick = () => this.shareDonation();
                    toast.appendChild(shareBtn);
                }
            }, 1000);
        }
    }

    // ===== UTILITY FUNCTIONS =====
    createRippleEffect(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    updateLastCopiedIban(ibanId, ibanText) {
        this.lastCopiedIban = { id: ibanId, text: ibanText, timestamp: Date.now() };
        
        // Save to localStorage
        if (window.FurkanApp && window.FurkanApp.Utils) {
            window.FurkanApp.Utils.storage.set('lastCopiedIban', this.lastCopiedIban);
        }
    }

    loadLastCopiedIban() {
        if (window.FurkanApp && window.FurkanApp.Utils) {
            const saved = window.FurkanApp.Utils.storage.get('lastCopiedIban');
            if (saved && Date.now() - saved.timestamp < 86400000) { // 24 hours
                this.lastCopiedIban = saved;
            }
        }
    }

    trackEvent(eventName, properties = {}) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'donation',
                event_label: properties.method || 'default',
                value: properties.value || 1,
                ...properties
            });
        }
        
        // Console logging for development
        console.log(`📊 Analytics: ${eventName}`, properties);
    }

    trackCopyEvent(ibanId, ibanText) {
        const ibanType = ibanId.includes('tl') ? 'TL' : 'USD';
        const isPrimary = DONATION_CONFIG.ibans[ibanType.toLowerCase()]?.isPrimary || false;
        
        this.trackEvent(DONATION_CONFIG.analytics.copyIban, {
            iban_type: ibanType,
            is_primary: isPrimary,
            copy_count: this.copyCount + 1
        });
    }
}

// ===== INITIALIZATION =====
let donationManager;

document.addEventListener('DOMContentLoaded', () => {
    try {
        donationManager = new DonationManager();
        
        // Make it globally accessible
        window.donationManager = donationManager;
        
        console.log('✅ Donation Manager initialized successfully');
        
    } catch (error) {
        console.error('❌ Donation Manager initialization failed:', error);
    }
});

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DonationManager;
}
