/**
 * FURKAN İÇİN UMUT - ANİMASYONLAR
 * Modern CSS animasyonları ve mikro-etkileşimler
 */

'use strict';

// ===== ANIMATION MANAGER =====
class AnimationManager {
    constructor() {
        this.animatedElements = new Set();
        this.observer = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, animations disabled');
            return;
        }
        
        this.setupIntersectionObserver();
        this.observeElements();
        this.setupScrollAnimations();
        this.isInitialized = true;
        
        console.log('✅ Animation Manager initialized');
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
            '.section-title',
            '.story-content',
            '.faq-item'
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
        const delay = index * 100; // 100ms stagger
        
        element.style.animationDelay = `${delay}ms`;
    }

    setupScrollAnimations() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroImage = document.querySelector('.furkan-photo');
            
            if (heroImage) {
                const rate = scrolled * -0.5;
                heroImage.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Public methods
    animateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
            setTimeout(() => {
                progressFill.style.width = '60%';
            }, 500);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            // Animate in
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
            
            // Auto remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 4000);
        }
    }
}

// ===== GLOBAL INSTANCE =====
let animationManager;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        animationManager = new AnimationManager();
        
        // Make it globally accessible
        window.FurkanApp = window.FurkanApp || {};
        window.FurkanApp.animationManager = () => animationManager;
        
        console.log('✅ Animation Manager initialized successfully');
        
    } catch (error) {
        console.error('❌ Animation Manager initialization failed:', error);
    }
});

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}
