/**
 * Main JavaScript for Furkan Elmas Campaign Site
 * Features: Language Switcher, Slider, Animations
 */

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
});

/* =========================================
   LANGUAGE SWITCHER
   ========================================= */
const supportedLangs = ['tr', 'en', 'de'];
let currentLang = 'tr';
let translations = {};

async function initLanguageSwitcher() {
    // Check local storage or browser default
    const savedLang = localStorage.getItem('site_lang');
    const browserLang = navigator.language.split('-')[0];
    
    if (savedLang && supportedLangs.includes(savedLang)) {
        currentLang = savedLang;
    } else if (supportedLangs.includes(browserLang)) {
        currentLang = browserLang;
    }

    await setLanguage(currentLang);
}

window.setLanguage = async (lang) => {
    if (!supportedLangs.includes(lang)) {
        console.warn('Unsupported language:', lang);
        return;
    }

    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Could not load ${lang}.json - Status: ${response.status}`);
        }
        
        translations = await response.json();
        currentLang = lang;
        localStorage.setItem('site_lang', lang);
        
        applyTranslations();
        updateActiveLangButton();
        document.documentElement.lang = lang;
        
        console.log('Language changed to:', lang);
    } catch (error) {
        console.error('Language load error:', error);
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
    slides = Array.from(document.querySelectorAll('.slide'));
    if (slides.length === 0) return;

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

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderContainer = document.querySelector('.slider-container');
    
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
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
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
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
            
            // Add animated class after animation completes
            setTimeout(() => {
                heroProgressBar.classList.add('animated');
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
                target.scrollIntoView({
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
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showCopyFeedback();
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyToClipboard(url);
        });
    } else {
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
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Fallback copy failed:', err);
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
function initLightbox() {
    // Lightbox container oluştur
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Kapat">&times;</button>
            <img src="" alt="" id="lightbox-image">
            <video id="lightbox-video" controls style="display: none;"></video>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxVideo = document.getElementById('lightbox-video');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    
    // Görsellere tıklama eventi ekle
    document.querySelectorAll('.slider-media').forEach(media => {
        if (media.tagName === 'IMG') {
            media.addEventListener('click', () => {
                const fullImage = media.getAttribute('data-fullscreen') || media.src;
                lightboxImage.src = fullImage;
                lightboxImage.alt = media.alt;
                lightboxImage.style.display = 'block';
                lightboxVideo.style.display = 'none';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        } else if (media.tagName === 'VIDEO') {
            media.addEventListener('click', () => {
                lightboxVideo.src = media.src;
                lightboxVideo.poster = media.poster;
                lightboxVideo.style.display = 'block';
                lightboxImage.style.display = 'none';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                lightboxVideo.play();
            });
        }
    });
    
    // Kapatma fonksiyonları
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxVideo.pause();
        lightboxVideo.src = '';
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
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    // Lightbox içeriğine tıklamada kapatma
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    lightboxContent.addEventListener('click', (e) => {
        if (e.target === lightboxContent) {
            closeLightbox();
        }
    });
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
