/**
 * FURKAN İÇİN UMUT - ANA JAVASCRIPT MODÜLÜ
 * Modern ES6+, Performance Optimized, Mobile-First
 */

'use strict';

// ===== GLOBAL CONFIGURATION =====
const CONFIG = {
    // Donation Data
    donation: {
        goal: 2899907, // USD
        currentPercentage: 60, // Admin panel'den güncellenecek
        currency: 'USD'
    },
    
    // Animation Settings
    animations: {
        duration: 2000, // 2 seconds
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        stagger: 100 // ms between elements
    },
    
    // Performance Settings
    performance: {
        lazyLoadOffset: 100, // pixels
        debounceDelay: 250, // ms
        throttleDelay: 16 // ms (60fps)
    },
    
    // API Endpoints (Future)
    api: {
        baseUrl: '/api',
        endpoints: {
            donations: '/donations',
            supporters: '/supporters',
            translations: '/translations'
        }
    }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format number with separators
    formatNumber(number) {
        return new Intl.NumberFormat('tr-TR').format(number);
    },

    // Check if element is in viewport
    isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(`furkan_${key}`, JSON.stringify(value));
            } catch (e) {
                console.warn('LocalStorage not available:', e);
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`furkan_${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('LocalStorage not available:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(`furkan_${key}`);
            } catch (e) {
                console.warn('LocalStorage not available:', e);
            }
        }
    }
};

// ===== PROGRESS BAR MANAGER =====
class ProgressManager {
    constructor() {
        this.progressBar = null;
        this.progressFill = null;
        this.progressText = null;
        this.currentPercentage = CONFIG.donation.currentPercentage;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressText = document.querySelector('.progress-text');
        
        if (!this.progressBar || !this.progressFill) {
            console.warn('Progress bar elements not found');
            return;
        }

        this.setupProgressBar();
        this.animateProgress();
        this.setupIntersectionObserver();
    }

    setupProgressBar() {
        // Set initial state
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '0%';
        
        // Update ARIA attributes
        this.progressBar.setAttribute('aria-valuenow', '0');
        this.progressBar.setAttribute('aria-label', `Bağış ilerlemesi: %0`);
    }

    animateProgress() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Animate progress fill
        this.animateProgressFill();
        
        // Animate progress text
        this.animateProgressText();
        
        // Update stats with delay
        setTimeout(() => {
            this.updateStats();
        }, CONFIG.animations.duration / 2);
    }

    animateProgressFill() {
        const startTime = performance.now();
        const startWidth = 0;
        const targetWidth = this.currentPercentage;
        const duration = CONFIG.animations.duration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentWidth = startWidth + (targetWidth - startWidth) * easeOut;
            
            this.progressFill.style.width = `${currentWidth}%`;
            this.progressBar.setAttribute('aria-valuenow', Math.round(currentWidth));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    animateProgressText() {
        const startTime = performance.now();
        const startValue = 0;
        const targetValue = this.currentPercentage;
        const duration = CONFIG.animations.duration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            this.progressText.textContent = `${currentValue}%`;
            
            // Update ARIA label
            this.progressBar.setAttribute('aria-label', `Bağış ilerlemesi: %${currentValue}`);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateStats() {
        const collected = (CONFIG.donation.goal * this.currentPercentage) / 100;
        const remaining = CONFIG.donation.goal - collected;
        
        // Update collected amount
        const collectedElement = document.querySelector('.stat-card.collected .stat-value');
        if (collectedElement) {
            collectedElement.textContent = Utils.formatCurrency(collected);
        }
        
        // Update remaining amount
        const remainingElement = document.querySelector('.stat-card.remaining .stat-value');
        if (remainingElement) {
            remainingElement.textContent = Utils.formatCurrency(remaining);
        }
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isAnimating) {
                    // Trigger animation when progress section comes into view
                    setTimeout(() => {
                        this.animateProgress();
                    }, 500); // Small delay for better UX
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '50px'
        });

        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            observer.observe(progressSection);
        }
    }

    // Public method to update percentage (for admin panel)
    updatePercentage(newPercentage) {
        this.currentPercentage = Math.min(Math.max(newPercentage, 0), 100);
        this.animateProgress();
    }
}

// ===== LOADING MANAGER =====
class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.isLoaded = false;
        
        this.init();
    }

    init() {
        // Hide loading screen after page load
        window.addEventListener('load', () => {
            this.hideLoading();
        });

        // Fallback: hide loading after 3 seconds
        setTimeout(() => {
            if (!this.isLoaded) {
                this.hideLoading();
            }
        }, 3000);
    }

    hideLoading() {
        if (this.isLoaded) return;
        
        this.isLoaded = true;
        
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            
            // Remove from DOM after animation
            setTimeout(() => {
                this.loadingScreen.remove();
            }, 500);
        }
    }
}

// ===== SCROLL MANAGER =====
class ScrollManager {
    constructor() {
        this.stickyDonate = document.getElementById('stickyDonate');
        this.lastScrollY = 0;
        this.isScrollingDown = false;
        
        this.init();
    }

    init() {
        if (!this.stickyDonate) return;
        
        // Throttled scroll handler
        const scrollHandler = Utils.throttle(() => {
            this.handleScroll();
        }, CONFIG.performance.throttleDelay);
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Show sticky button after initial scroll
        setTimeout(() => {
            this.showStickyButton();
        }, 2000);
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        this.isScrollingDown = currentScrollY > this.lastScrollY;
        
        // Show/hide sticky button based on scroll direction
        if (currentScrollY > 300) {
            if (this.isScrollingDown) {
                this.hideStickyButton();
            } else {
                this.showStickyButton();
            }
        } else {
            this.hideStickyButton();
        }
        
        this.lastScrollY = currentScrollY;
    }

    showStickyButton() {
        this.stickyDonate.classList.add('visible');
    }

    hideStickyButton() {
        this.stickyDonate.classList.remove('visible');
    }
}

// ===== ANIMATION MANAGER =====
class AnimationManager {
    constructor() {
        this.animatedElements = new Set();
        this.observer = null;
        
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) return;
        
        this.setupIntersectionObserver();
        this.observeElements();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
    }

    observeElements() {
        // Elements to animate
        const selectors = [
            '.hero-content',
            '.progress-card',
            '.iban-card',
            '.stat-card',
            '.section-title'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('animate-on-scroll');
                this.observer.observe(element);
            });
        });
    }

    animateElement(element) {
        if (this.animatedElements.has(element)) return;
        
        this.animatedElements.add(element);
        
        // Add animation class
        element.classList.add('animate-in');
        
        // Add stagger delay for multiple elements
        const siblings = Array.from(element.parentElement.children);
        const index = siblings.indexOf(element);
        const delay = index * CONFIG.animations.stagger;
        
        setTimeout(() => {
            element.style.animationDelay = `${delay}ms`;
        }, 0);
    }
}

// ===== TOAST NOTIFICATION MANAGER =====
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.toasts = new Map();
        
        if (!this.container) {
            console.warn('Toast container not found');
            return;
        }
    }

    show(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        const toastId = Utils.generateId();
        
        this.toasts.set(toastId, toast);
        this.container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto remove
        setTimeout(() => {
            this.hide(toastId);
        }, duration);
        
        return toastId;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        return toast;
    }

    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (!toast) return;
        
        toast.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// ===== GLOBAL INSTANCES =====
let progressManager;
let loadingManager;
let scrollManager;
let animationManager;
let toastManager;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize managers
        progressManager = new ProgressManager();
        loadingManager = new LoadingManager();
        scrollManager = new ScrollManager();
        animationManager = new AnimationManager();
        toastManager = new ToastManager();
        
        // Setup global event listeners
        setupGlobalEventListeners();
        
        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            });
        }
        
        console.log('✅ Furkan İçin Umut - Main JS initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// ===== GLOBAL EVENT LISTENERS =====
function setupGlobalEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // ESC key to close modals/toasts
        if (e.key === 'Escape') {
            // Close any open modals or toasts
            const activeToasts = document.querySelectorAll('.toast.show');
            activeToasts.forEach(toast => {
                toast.classList.remove('show');
            });
        }
    });
    
    // Handle focus management for accessibility
    document.addEventListener('focusin', (e) => {
        // Ensure focused elements are visible
        if (e.target && typeof e.target.scrollIntoView === 'function') {
            const rect = e.target.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', Utils.debounce(() => {
        // Recalculate animations or layouts if needed
        if (progressManager) {
            // Re-trigger progress animation if needed
        }
    }, 250));
}

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        Utils,
        ProgressManager,
        LoadingManager,
        ScrollManager,
        AnimationManager,
        ToastManager
    };
}

// ===== GLOBAL ACCESS =====
window.FurkanApp = {
    CONFIG,
    Utils,
    progressManager: () => progressManager,
    toastManager: () => toastManager,
    animationManager: () => animationManager
};
