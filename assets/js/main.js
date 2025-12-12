/**
 * Main JavaScript for Furkan Elmas Campaign Site
 * Features: Language Switcher, Slider, Animations
 */

// Production mode detection
const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Feature Detection
const features = {
    localStorage: typeof Storage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    IntersectionObserver: typeof IntersectionObserver !== 'undefined',
    clipboard: navigator.clipboard && navigator.clipboard.writeText
};

// Global Error Handler
function handleGlobalError(event) {
    if (!IS_PRODUCTION) {
        console.error('Global error:', event.error);
    }
    // In production, could send to error logging service
}

// Promise Rejection Handler
function handlePromiseRejection(event) {
    if (!IS_PRODUCTION) {
        console.error('Unhandled promise rejection:', event.reason);
    }
    // In production, could send to error logging service
}

// Initialize error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handlePromiseRejection);

// IntersectionObserver Polyfill (basic fallback)
if (!features.IntersectionObserver) {
    window.IntersectionObserver = class {
        constructor() {
            // Fallback: trigger immediately
            this.observe = () => {};
            this.unobserve = () => {};
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher(); 
    initSlider();
    initProgressBar();
    initSmoothScroll();
    initMobileMenu();
    initScrollAnimations();
    initBackToTop();
    initStatsCounter();
    initBalloons();
    initLightbox();
    initFAQ();
    initHeaderScroll();
    initScrollSpy();
    initLogoClick();
    initEventCountdown();
});

/* =========================================
   LANGUAGE SWITCHER
   ========================================= */
const supportedLangs = ['tr', 'en', 'de'];
let currentLang = 'tr';
let translations = {};

// Lazy load language files - cache for loaded translations
const translationCache = {};

async function initLanguageSwitcher() {
    try {
        // Check local storage or browser default
        let savedLang = null;
        if (features.localStorage) {
            savedLang = localStorage.getItem('site_lang');
        }
        
        const browserLang = navigator.language ? navigator.language.split('-')[0] : 'tr';
        
        if (savedLang && supportedLangs.includes(savedLang)) {
            currentLang = savedLang;
        } else if (supportedLangs.includes(browserLang)) {
            currentLang = browserLang;
        }

        // Lazy load initial language - only load when needed
        await setLanguage(currentLang);
    } catch (error) {
        if (!IS_PRODUCTION) {
            console.error('Language switcher init error:', error);
        }
        // Fallback: continue with default language
        currentLang = 'tr';
    }
}

// Lazy load language file (only fetch if not cached)
async function loadLanguageFile(lang) {
    // Check cache first
    if (translationCache[lang]) {
        return translationCache[lang];
    }
    
    // Lazy load from server
    if (!features.fetch) {
        throw new Error('Fetch API not supported');
    }
    
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) {
        throw new Error(`Could not load ${lang}.json - Status: ${response.status}`);
    }
    
    const translations = await response.json();
    // Cache translations for future use
    translationCache[lang] = translations;
    return translations;
}

window.setLanguage = async (lang) => {
    if (!supportedLangs.includes(lang)) {
        if (!IS_PRODUCTION) {
            console.warn('Unsupported language:', lang);
        }
        return;
    }

    try {
        // Lazy load language file (with caching)
        translations = await loadLanguageFile(lang);
        currentLang = lang;
        
        if (features.localStorage) {
            try {
                localStorage.setItem('site_lang', lang);
            } catch (e) {
                // localStorage may be disabled
                if (!IS_PRODUCTION) {
                    console.warn('localStorage not available:', e);
                }
            }
        }
        
        applyTranslations();
        updateActiveLangButton();
        document.documentElement.lang = lang;
        
        if (!IS_PRODUCTION) {
            console.log('Language changed to:', lang);
        }
    } catch (error) {
        if (!IS_PRODUCTION) {
            console.error('Language load error:', error);
        }
        // Silent fallback - don't show alert in production
        if (IS_PRODUCTION) {
            // Try to continue with existing translations if available
            return;
        }
        alert('Dil dosyası yüklenemedi. Lütfen sayfayı yenileyin.');
    }
};

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            // Check if element has child span (like share buttons with SVG)
            const span = el.querySelector('span');
            if (span && (el.classList.contains('share-btn') || el.classList.contains('lang-btn'))) {
                // For buttons with icons, only update the span text
                span.textContent = translations[key];
            } else if (el.classList.contains('thanks-msg') || el.classList.contains('faq-answer')) {
                // For elements with HTML content, use innerHTML
                el.innerHTML = translations[key];
            } else {
                // For regular elements, check if content contains HTML tags
                if (translations[key].includes('<')) {
                    el.innerHTML = translations[key];
                } else {
                    el.textContent = translations[key];
                }
            }
        }
    });

    // Handle specific attributes if needed (e.g., placeholders, alts)
    // Example: document.querySelector('img').alt = translations['img_alt'];
}

function updateActiveLangButton() {
    const buttons = document.querySelectorAll('.lang-switcher button, .lang-btn');
    if (buttons.length === 0) {
        console.warn('No language buttons found');
        return;
    }
    
    buttons.forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/* =========================================
   MEDIA SLIDER
   ========================================= */
let sliderInterval = null;
let currentSlideIndex = 0;
let slides = [];

function initSlider() {
    try {
        slides = Array.from(document.querySelectorAll('.slide'));
        if (slides.length === 0) return;
    } catch (error) {
        if (!IS_PRODUCTION) {
            console.error('Slider init error:', error);
        }
        return;
    }

    // Create dots
    const dotsContainer = document.querySelector('.slider-dots');
    if (dotsContainer) {
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${index + 1} göster`);
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    // Arrow buttons
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    // Enhanced Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    const sliderContainer = document.querySelector('.slider-container');
    
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        sliderContainer.addEventListener('touchmove', (e) => {
            // Prevent default to allow smooth scrolling
            if (Math.abs(e.changedTouches[0].screenX - touchStartX) > Math.abs(e.changedTouches[0].screenY - touchStartY)) {
                e.preventDefault();
            }
        }, { passive: false });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
    }

    // Auto-play
    startSlider();

    // Pause on hover
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopSlider);
        sliderContainer.addEventListener('mouseleave', startSlider);
    }
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    
    // Only handle horizontal swipes (ignore vertical scrolls)
    if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
        if (diffX > 0) {
            changeSlide(1); // Swipe left - next
        } else {
            changeSlide(-1); // Swipe right - prev
        }
    }
}

function changeSlide(direction) {
    stopSlider();
    const newIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    goToSlide(newIndex);
    startSlider();
}

function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;

    slides[currentSlideIndex].classList.remove('active');
    
    // Handle video playback
    const prevMedia = slides[currentSlideIndex].querySelector('video');
    if (prevMedia) {
        prevMedia.pause();
        prevMedia.currentTime = 0;
    }

    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');

    // Play video if active
    const nextMedia = slides[currentSlideIndex].querySelector('video');
    if (nextMedia) {
        nextMedia.load();
        nextMedia.play().catch(e => console.log('Autoplay prevented:', e));
    }

    // Update dots
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlideIndex);
    });
}

function startSlider() {
    stopSlider();
    const intervalTime = 5000;
    sliderInterval = setInterval(() => {
        changeSlide(1);
    }, intervalTime);
}

function stopSlider() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
    }
}

/* =========================================
   PROGRESS BAR ANIMATION
   ========================================= */
function initProgressBar() {
    // Hero progress bar
    const heroProgressBar = document.querySelector('.hero-progress-wrapper .progress-bar');
    const heroProgressPercentage = document.querySelector('.hero-progress-percentage');
    
    if (heroProgressBar) {
        // Start at 0%
        heroProgressBar.style.width = '0%';
        if (heroProgressPercentage) {
            heroProgressPercentage.textContent = '%0';
        }
        
        // Animate to 100% after a short delay
        setTimeout(() => {
            heroProgressBar.style.width = '100%';
            
            // Animate percentage text
            if (heroProgressPercentage) {
                animateProgressPercentage(heroProgressPercentage, 0, 100);
            }
            
            // Add animated class after animation completes and remove will-change for performance
            setTimeout(() => {
                heroProgressBar.classList.add('animated');
                heroProgressBar.style.willChange = 'auto';
            }, 2500);
        }, 300);
    }
    
    // Stats section progress bar (if exists)
    const progressSection = document.querySelector('#stats .progress-container');
    const progressBar = document.querySelector('#stats .progress-bar');
    
    if (progressSection && progressBar) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressBar.style.width = '100%';
                    setTimeout(() => {
                        progressBar.classList.add('animated');
                        progressBar.style.willChange = 'auto';
                    }, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(progressSection);
    }
}

function animateProgressPercentage(element, start, end) {
    const duration = 2500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(start + (end - start) * easeOutCubic);
        
        element.textContent = '%' + currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = '%' + end;
        }
    }
    
    requestAnimationFrame(update);
}

/* =========================================
   SMOOTH SCROLL (Polyfill/Helper)
   ========================================= */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip empty anchors
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Get header height for offset
                const header = document.querySelector('#main-header');
                const headerHeight = header ? header.offsetHeight : 80;
                
                // Calculate target position with header offset
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // Smooth scroll to target with offset
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const menuToggle = document.querySelector('.mobile-menu-toggle');
                const navbar = document.querySelector('#navbar');
                if (menuToggle && navbar && navbar.classList.contains('mobile-open')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}

/* =========================================
   MOBILE MENU
   ========================================= */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    if (!menuToggle) return;

    menuToggle.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', () => {
            const navbar = document.querySelector('#navbar');
            if (navbar && navbar.classList.contains('mobile-open')) {
                toggleMobileMenu();
            }
        });
    }

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const navbar = document.querySelector('#navbar');
            if (navbar && navbar.classList.contains('mobile-open')) {
                toggleMobileMenu();
            }
        }
    });

    // Close menu when clicking nav links (mobile)
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navbar = document.querySelector('#navbar');
            if (window.innerWidth <= 768 && navbar && navbar.classList.contains('mobile-open')) {
                toggleMobileMenu();
            }
        });
    });

    // Swipe-to-close gesture for mobile menu
    const navLinksElement = document.querySelector('.nav-links');
    if (navLinksElement) {
        let swipeStartX = 0;
        let swipeStartY = 0;
        let swipeEndX = 0;
        let swipeEndY = 0;

        navLinksElement.addEventListener('touchstart', (e) => {
            swipeStartX = e.changedTouches[0].screenX;
            swipeStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        navLinksElement.addEventListener('touchmove', (e) => {
            // Allow menu content scrolling
        }, { passive: true });

        navLinksElement.addEventListener('touchend', (e) => {
            swipeEndX = e.changedTouches[0].screenX;
            swipeEndY = e.changedTouches[0].screenY;
            
            const diffX = swipeEndX - swipeStartX;
            const diffY = Math.abs(swipeEndY - swipeStartY);
            const swipeThreshold = 100;
            
            // Swipe right to close (only if horizontal swipe, not vertical scroll)
            if (diffX > swipeThreshold && diffX > diffY * 1.5) {
                const navbar = document.querySelector('#navbar');
                if (navbar && navbar.classList.contains('mobile-open')) {
                    toggleMobileMenu();
                }
            }
        }, { passive: true });
    }
}

function toggleMobileMenu() {
    const navbar = document.querySelector('#navbar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;
    
    if (!navbar || !menuToggle) return;

    const isOpen = navbar.classList.contains('mobile-open');
    
    if (isOpen) {
        navbar.classList.remove('mobile-open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('mobile-menu-open');
        if (overlay) {
            // Remove inline styles to allow CSS transitions to work on next open
            overlay.style.opacity = '';
            overlay.style.visibility = '';
            // Use setTimeout to allow transition to complete before hiding
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300); // Match CSS transition duration
        }
    } else {
        navbar.classList.add('mobile-open');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        body.classList.add('mobile-menu-open');
        if (overlay) {
            overlay.style.display = 'block';
            // Trigger reflow for animation
            overlay.offsetHeight;
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }
    }
}

/* =========================================
   SCROLL ANIMATIONS
   ========================================= */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.fade-in-section');
    
    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

/* =========================================
   BACK TO TOP BUTTON
   ========================================= */
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Yukarı git');
    backToTopBtn.innerHTML = '<span>↑</span>';
    document.body.appendChild(backToTopBtn);

    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleBackToTop);
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* =========================================
   STATS COUNTER ANIMATION
   ========================================= */
function initStatsCounter() {
    // Hero stats counter
    const heroStatValue = document.querySelector('.hero-stat-value[data-target]');
    if (heroStatValue) {
        const targetValue = parseFloat(heroStatValue.getAttribute('data-target'));
        if (!isNaN(targetValue)) {
            animateCounter(heroStatValue, targetValue);
        }
    }
    
    // Main stats counter
    const statValues = document.querySelectorAll('.stat-value[data-target]');
    
    statValues.forEach(stat => {
        const targetValue = parseFloat(stat.getAttribute('data-target'));
        
        if (isNaN(targetValue)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateCounter(entry.target, targetValue);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(stat);
    });
}

function animateCounter(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (target - startValue) * easeOutCubic;
        
        // Format with dots as thousand separators
        const formattedValue = Math.floor(currentValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        element.textContent = '$' + formattedValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            const finalFormatted = target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            element.textContent = '$' + finalFormatted;
        }
    }

    requestAnimationFrame(update);
}

/* =========================================
   COPY TO CLIPBOARD
   ========================================= */
window.copyToClipboard = function() {
    const url = window.location.href;
    
    try {
        if (features.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showCopyFeedback();
            }).catch(err => {
                if (!IS_PRODUCTION) {
                    console.error('Failed to copy:', err);
                }
                fallbackCopyToClipboard(url);
            });
        } else {
            fallbackCopyToClipboard(url);
        }
    } catch (error) {
        if (!IS_PRODUCTION) {
            console.error('Copy to clipboard error:', error);
        }
        fallbackCopyToClipboard(url);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback();
        } else {
            throw new Error('execCommand copy failed');
        }
    } catch (err) {
        if (!IS_PRODUCTION) {
            console.error('Fallback copy failed:', err);
        }
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    const copyBtn = document.querySelector('.share-copy');
    if (!copyBtn) return;
    
    const span = copyBtn.querySelector('span');
    if (!span) return;
    
    const originalText = span.textContent;
    const copiedText = translations['share_copied'] || 'Link kopyalandı!';
    
    span.textContent = copiedText;
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
        span.textContent = originalText;
        copyBtn.classList.remove('copied');
    }, 2000);
}

/* =========================================
   FLOATING BALLOONS
   ========================================= */
function initBalloons() {
    const balloonsContainer = document.querySelector('.floating-balloons');
    if (!balloonsContainer) return;
    
    // 6-8 balon oluştur
    const balloonCount = 8;
    const positions = [5, 15, 25, 40, 55, 70, 85, 95]; // Yüzde pozisyonları
    const delays = [0, 2, 4, 1.5, 3.5, 2.5, 5, 1];
    const durations = [14, 16, 13, 15, 17, 14.5, 15.5, 13.5];
    const sizes = [50, 60, 45, 55, 65, 50, 58, 48];
    
    for (let i = 0; i < balloonCount; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = `${positions[i]}%`;
        balloon.style.width = `${sizes[i]}px`;
        balloon.style.height = `${sizes[i] * 1.4}px`;
        balloon.style.setProperty('--balloon-delay', `${delays[i]}s`);
        balloon.style.setProperty('--balloon-duration', `${durations[i]}s`);
        balloon.style.animationDelay = `${delays[i]}s`;
        balloon.style.animationDuration = `${durations[i]}s`;
        
        balloonsContainer.appendChild(balloon);
    }
}

/* =========================================
   LIGHTBOX (Fullscreen Image Viewer)
   ========================================= */
let lightboxCurrentIndex = 0;
let lightboxMediaItems = [];

function initLightbox() {
    // Tüm slider medya öğelerini topla (sadece slider-container içindeki slide'lar)
    lightboxMediaItems = Array.from(document.querySelectorAll('.slider-container .slide')).map(slide => {
        const img = slide.querySelector('img.slider-media, picture img.slider-media');
        const video = slide.querySelector('video.slider-media');
        if (img && img.classList.contains('slider-media')) {
            const picture = img.closest('picture');
            const source = picture ? picture.querySelector('source') : null;
            return {
                type: 'image',
                src: img.getAttribute('data-fullscreen') || img.src,
                webp: source ? source.getAttribute('data-fullscreen') || source.srcset : null,
                alt: img.alt || ''
            };
        } else if (video) {
            return {
                type: 'video',
                src: video.src,
                poster: video.poster || ''
            };
        }
        return null;
    }).filter(item => item !== null);
    
    // Lightbox container oluştur
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Kapat">&times;</button>
            <button class="lightbox-prev" aria-label="Önceki" style="display: none;">‹</button>
            <button class="lightbox-next" aria-label="Sonraki" style="display: none;">›</button>
            <picture id="lightbox-picture">
                <source id="lightbox-webp" srcset="" type="image/webp">
                <img src="" alt="" id="lightbox-image">
            </picture>
            <video id="lightbox-video" controls style="display: none;"></video>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxVideo = document.getElementById('lightbox-video');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    
    // Lightbox'ta medya göster
    function showLightboxMedia(index) {
        if (index < 0 || index >= lightboxMediaItems.length) return;
        
        lightboxCurrentIndex = index;
        const item = lightboxMediaItems[index];
        
        const lightboxPicture = document.getElementById('lightbox-picture');
        const lightboxWebp = document.getElementById('lightbox-webp');
        
        if (item.type === 'image') {
            if (lightboxWebp && item.webp) {
                lightboxWebp.srcset = item.webp;
            }
            lightboxImage.src = item.src;
            lightboxImage.alt = item.alt;
            lightboxPicture.style.display = 'block';
            lightboxVideo.style.display = 'none';
        } else if (item.type === 'video') {
            lightboxVideo.src = item.src;
            lightboxVideo.poster = item.poster;
            lightboxVideo.style.display = 'block';
            lightboxPicture.style.display = 'none';
            lightboxVideo.load();
            lightboxVideo.play().catch(e => {
                if (!IS_PRODUCTION) {
                    console.log('Video autoplay prevented:', e);
                }
            });
        }
        
        // Navigasyon butonlarını göster/gizle (birden fazla medya varsa)
        if (lightboxMediaItems.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
        
        // Butonları başlangıçta gizle (ekrana tıklayınca gösterilecek)
        lightbox.classList.remove('show-controls');
    }
    
    // Lightbox'ta önceki/sonraki medya
    function lightboxPrev() {
        const newIndex = (lightboxCurrentIndex - 1 + lightboxMediaItems.length) % lightboxMediaItems.length;
        showLightboxMedia(newIndex);
    }
    
    function lightboxNext() {
        const newIndex = (lightboxCurrentIndex + 1) % lightboxMediaItems.length;
        showLightboxMedia(newIndex);
    }
    
    // Lightbox'ta medya göster fonksiyonunu buraya taşıdık (yukarıda tanımlı)
    
    // Görsellere tıklama eventi ekle (sadece slider-container içindeki slide'lar)
    document.querySelectorAll('.slider-container .slide').forEach((slide, index) => {
        // Sadece slider-media class'ına sahip medyayı bul
        const media = slide.querySelector('.slider-media');
        if (!media) return;
        
        // Media'ya direkt tıklama eventi ekle
        media.addEventListener('click', (e) => {
            // Dil bayraklarına tıklamada lightbox açılmasın (ekstra kontrol)
            if (e.target.closest('.lang-btn') || e.target.closest('.flag-icon') || 
                e.target.closest('.lang-switcher')) {
                return;
            }
            
            lightboxCurrentIndex = index;
            showLightboxMedia(lightboxCurrentIndex);
            lightbox.classList.add('active');
            lightbox.classList.remove('show-controls'); // Başlangıçta butonları gizle
            document.body.style.overflow = 'hidden';
        });
        
        // Picture elementine tıklama (sadece slider-media içindeki)
        const picture = slide.querySelector('picture');
        if (picture && picture.querySelector('.slider-media')) {
            picture.addEventListener('click', (e) => {
                // Butonlara veya flag-icon'a tıklamada açılmasın
                if (e.target.closest('.lang-btn') || e.target.closest('.flag-icon')) {
                    return;
                }
                
                lightboxCurrentIndex = index;
                showLightboxMedia(lightboxCurrentIndex);
                lightbox.classList.add('active');
                lightbox.classList.remove('show-controls'); // Başlangıçta butonları gizle
                document.body.style.overflow = 'hidden';
            });
        }
    });
    
    // Navigasyon butonları
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        lightboxPrev();
        // Butonlar görünür kalsın
        lightbox.classList.add('show-controls');
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        lightboxNext();
        // Butonlar görünür kalsın
        lightbox.classList.add('show-controls');
    });
    
    // Kapatma fonksiyonları
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.classList.remove('show-controls');
        document.body.style.overflow = '';
        lightboxVideo.pause();
        lightboxVideo.src = '';
        const lightboxPicture = document.getElementById('lightbox-picture');
        if (lightboxPicture) {
            lightboxPicture.style.display = '';
        }
    }
    
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation (ESC, Arrow keys)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            lightboxPrev();
        } else if (e.key === 'ArrowRight') {
            lightboxNext();
        }
    });
    
    // Touch swipe navigation (hem lightbox hem lightbox-content üzerinde)
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isSwiping = false;
    
    function handleTouchStart(e) {
        if (!lightbox.classList.contains('active')) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = false;
    }
    
    function handleTouchMove(e) {
        if (!lightbox.classList.contains('active')) return;
        // Prevent default scroll when swiping horizontally
        const diffX = Math.abs(e.changedTouches[0].screenX - touchStartX);
        const diffY = Math.abs(e.changedTouches[0].screenY - touchStartY);
        if (diffX > diffY && diffX > 10) {
            isSwiping = true;
            e.preventDefault();
        }
    }
    
    function handleTouchEnd(e) {
        if (!lightbox.classList.contains('active')) return;
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = Math.abs(touchEndY - touchStartY);
        const swipeThreshold = 30; // Daha düşük threshold mobil için
        
        // Only handle horizontal swipes
        if (isSwiping && Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
            e.preventDefault();
            if (diffX > 0) {
                // Swipe right - previous
                lightboxPrev();
            } else {
                // Swipe left - next
                lightboxNext();
            }
        }
        isSwiping = false;
    }
    
    // Lightbox ve lightbox-content üzerinde touch event'ler
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchmove', handleTouchMove, { passive: false });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    lightboxContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightboxContent.addEventListener('touchmove', handleTouchMove, { passive: false });
    lightboxContent.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Lightbox içeriğine tıklamada butonları göster/gizle toggle
    // Touch event'leri engellememesi için sadece click event'ini kullan
    lightboxContent.addEventListener('click', (e) => {
        // Butonlara tıklamada işlem yapma (butonlar kendi event'lerini yönetiyor)
        if (e.target.closest('.lightbox-prev') || 
            e.target.closest('.lightbox-next') ||
            e.target.closest('.lightbox-close')) {
            return;
        }
        
        // Görsel/video'ya tıklamada butonları göster/gizle toggle
        if (e.target === lightboxImage || e.target === lightboxVideo || 
            e.target.closest('#lightbox-picture') === lightboxPicture ||
            (e.target === lightboxContent && !e.target.closest('button'))) {
            
            // Butonları göster/gizle toggle
            lightbox.classList.toggle('show-controls');
        }
    }, { passive: true });
}

/* =========================================
   FAQ ACCORDION
   ========================================= */
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => toggleFAQ(btn));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(btn);
            }
        });
    });

    function toggleFAQ(button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const parentItem = button.closest('.faq-item');
        const answer = parentItem.querySelector('.faq-answer');
        const icon = button.querySelector('.faq-icon');

        // Tümünü kapat
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('open');
            item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            item.querySelector('.faq-icon').textContent = '+';
            item.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Seçileni aç
        if (!isExpanded) {
            parentItem.classList.add('open');
            button.setAttribute('aria-expanded', 'true');
            icon.textContent = '−';
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    }
}

/* =========================================
   HEADER SCROLL BEHAVIOR
   ========================================= */
function initHeaderScroll() {
    const header = document.querySelector('#main-header');
    if (!header) return;

    let lastScrollTop = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
}

/* =========================================
   SCROLL SPY (Active Nav Link)
   ========================================= */
function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    if (navLinks.length === 0 || sections.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to corresponding link
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Also check on scroll for hero section
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < 100) {
            // At top, remove all active classes
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
        }
    }, { passive: true });
}

/* =========================================
   LOGO CLICK HANDLER
   ========================================= */
function initLogoClick() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    logo.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Close mobile menu if open
        const navbar = document.querySelector('#navbar');
        if (navbar && navbar.classList.contains('mobile-open')) {
            toggleMobileMenu();
        }
    });
}

/* =========================================
   EVENT COUNTDOWN TIMER
   ========================================= */
function initEventCountdown() {
    // Event date: December 20, 2025, 14:00 (Turkey time - UTC+3)
    // Create date in local time (assuming server is in Turkey timezone, or adjust as needed)
    const eventDate = new Date('2025-12-20T14:00:00');
    // If server is in UTC, add 3 hours for Turkey time
    const eventTimestamp = eventDate.getTime() + (3 * 60 * 60 * 1000);
    
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    
    if (!daysEl || !hoursEl || !minutesEl) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        // Get current time in Turkey timezone (UTC+3)
        const nowTurkey = now + (3 * 60 * 60 * 1000);
        const distance = eventTimestamp - nowTurkey;
        
        if (distance < 0) {
            // Event has passed
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every minute
    setInterval(updateCountdown, 60000);
}

/* =========================================
   EVENT SHARE FUNCTION
   ========================================= */
window.shareEvent = function() {
    const eventText = translations['event_share_text'] || 
        'Balonlarımızı Uçuruyoruzzz! 20 Aralık 2025, Cumartesi saat 14:00\'te Tokat Belediyesi Hıdırlık Sosyal Tesislerinde hep birlikte olalım! 🎈';
    const eventUrl = window.location.href;
    const shareText = `${eventText}\n\n${eventUrl}`;
    
    // Check if Web Share API is available (mobile)
    if (navigator.share) {
        navigator.share({
            title: translations['event_title'] || 'Balonlarımızı Uçuruyoruzzz!',
            text: eventText,
            url: eventUrl
        }).catch((error) => {
            if (!IS_PRODUCTION) {
                console.log('Share cancelled or failed:', error);
            }
            // Fallback to copy
            fallbackShare(shareText);
        });
    } else {
        // Fallback: copy to clipboard
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    try {
        if (features.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showEventShareFeedback();
            }).catch(() => {
                // Fallback to execCommand
                fallbackCopyToClipboard(text);
                showEventShareFeedback();
            });
        } else {
            fallbackCopyToClipboard(text);
            showEventShareFeedback();
        }
    } catch (error) {
        if (!IS_PRODUCTION) {
            console.error('Share error:', error);
        }
    }
}

function showEventShareFeedback() {
    const shareBtn = document.querySelector('.event-share-btn');
    if (!shareBtn) return;
    
    const span = shareBtn.querySelector('span');
    if (!span) return;
    
    const originalText = span.textContent;
    const sharedText = translations['event_shared'] || 'Link kopyalandı!';
    
    span.textContent = sharedText;
    shareBtn.classList.add('shared');
    
    setTimeout(() => {
        span.textContent = originalText;
        shareBtn.classList.remove('shared');
    }, 2000);
}