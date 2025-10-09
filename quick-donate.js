/**
 * Hızlı Bağış Sistemi - Furkan Kampanya Sitesi
 * Instagram'dan gelen ziyaretçiler için optimize edilmiş IBAN kopyalama sistemi
 */

// Hızlı bağış modal'ını açma
function quickDonate() {
    const modal = document.getElementById('quickDonateModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Body scroll'u engelle
        document.body.style.overflow = 'hidden';
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quick_donate_modal_opened', {
                'event_category': 'donation',
                'event_label': 'sticky_button'
            });
        }
    }
}

// Modal'ı kapatma
function closeQuickDonate() {
    const modal = document.getElementById('quickDonateModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // Body scroll'u geri aç
        document.body.style.overflow = 'auto';
    }
}

// Hızlı IBAN kopyalama (TL IBAN)
async function copyQuickIban() {
    const ibanText = document.getElementById('quickIbanText');
    const copyBtn = document.querySelector('.copy-iban-btn');
    
    if (!ibanText || !copyBtn) return;
    
    try {
        // IBAN'ı kopyala
        await navigator.clipboard.writeText(ibanText.textContent);
        
        // Buton animasyonu
        copyBtn.classList.add('copied');
        const originalText = copyBtn.querySelector('span').textContent;
        copyBtn.querySelector('span').textContent = 'Kopyalandı! 💚';
        
        // 3 saniye sonra eski haline döndür
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('span').textContent = originalText;
        }, 3000);
        
        // Başarı mesajı göster
        showSuccessMessage();
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'iban_copied', {
                'event_category': 'donation',
                'event_label': 'tl_iban_quick_modal'
            });
        }
        
        // Modal'ı 2 saniye sonra kapat
        setTimeout(() => {
            closeQuickDonate();
        }, 2000);
        
    } catch (err) {
        console.error('IBAN kopyalama hatası:', err);
        showErrorMessage();
    }
}

// Başarı mesajı gösterme
function showSuccessMessage() {
    // Mevcut mesajı kaldır
    const existingMessage = document.querySelector('.donation-success-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Yeni başarı mesajı oluştur
    const successToast = document.createElement('div');
    successToast.className = 'donation-success-toast';
    successToast.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <div class="success-text">
                <strong>IBAN Kopyalandı! 💚</strong>
                <span>Bağışınız Furkan'ın hayatını değiştirecek</span>
            </div>
            <button class="share-success" onclick="shareDonation()">
                <i class="fas fa-share-alt"></i>
            </button>
        </div>
    `;
    
    // Toast stilleri
    Object.assign(successToast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #48bb78 0%, #68d391 100%)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(72, 187, 120, 0.3)',
        zIndex: '10001',
        transform: 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '350px',
        cursor: 'pointer'
    });
    
    document.body.appendChild(successToast);
    
    // Animasyon
    setTimeout(() => {
        successToast.style.transform = 'translateX(0)';
    }, 100);
    
    // Otomatik kaldırma
    setTimeout(() => {
        successToast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (successToast.parentNode) {
                successToast.parentNode.removeChild(successToast);
            }
        }, 400);
    }, 5000);
    
    // Tıklama ile kaldırma
    successToast.addEventListener('click', () => {
        successToast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (successToast.parentNode) {
                successToast.parentNode.removeChild(successToast);
            }
        }, 400);
    });
}

// Hata mesajı gösterme
function showErrorMessage() {
    const errorToast = document.createElement('div');
    errorToast.className = 'donation-error-toast';
    errorToast.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>IBAN kopyalanamadı. Lütfen manuel olarak kopyalayın.</span>
    `;
    
    Object.assign(errorToast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#f56565',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)',
        zIndex: '10001',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px'
    });
    
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
        errorToast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        errorToast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (errorToast.parentNode) {
                errorToast.parentNode.removeChild(errorToast);
            }
        }, 300);
    }, 4000);
}

// Diğer seçenekler - Tüm IBAN'ları göster
function showAllIbans() {
    closeQuickDonate();
    
    // IBAN bölümüne scroll yap
    const ibanSection = document.getElementById('bankInfo');
    if (ibanSection) {
        ibanSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Accordion'u aç (varsa)
        const accordion = ibanSection.closest('.donation-section');
        if (accordion) {
            // Accordion açma animasyonu
            setTimeout(() => {
                accordion.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    accordion.style.transform = 'scale(1)';
                }, 200);
            }, 500);
        }
    }
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_all_ibans', {
            'event_category': 'donation',
            'event_label': 'quick_modal'
        });
    }
}

// Kredi kartı seçeneği
function openCreditCard() {
    closeQuickDonate();
    
    // Kredi kartı bölümüne scroll yap
    const creditCardSection = document.querySelector('.credit-card-box');
    if (creditCardSection) {
        creditCardSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Shopier linkine tıkla
        setTimeout(() => {
            const shopierLink = document.querySelector('.credit-card-button');
            if (shopierLink) {
                shopierLink.click();
            }
        }, 800);
    }
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'credit_card_donation', {
            'event_category': 'donation',
            'event_label': 'quick_modal'
        });
    }
}

// Bağış paylaşımı
function shareDonation() {
    const shareText = "Furkan'a umut oldum! Sen de destek olmak ister misin? 💙";
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        // Web Share API (mobil)
        navigator.share({
            title: "Furkan İçin Umut",
            text: shareText,
            url: shareUrl
        }).then(() => {
            console.log('Paylaşım başarılı');
        }).catch((error) => {
            console.log('Paylaşım hatası:', error);
            fallbackShare(shareText, shareUrl);
        });
    } else {
        // Fallback paylaşım
        fallbackShare(shareText, shareUrl);
    }
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'donation_shared', {
            'event_category': 'social',
            'event_label': 'success_toast'
        });
    }
}

// Fallback paylaşım seçenekleri
function fallbackShare(text, url) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-modal-content">
            <h4>Paylaş</h4>
            <div class="share-options">
                <button onclick="shareToWhatsApp('${text}', '${url}')" class="share-btn whatsapp">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
                <button onclick="shareToTwitter('${text}', '${url}')" class="share-btn twitter">
                    <i class="fab fa-twitter"></i>
                    Twitter
                </button>
                <button onclick="shareToFacebook('${url}')" class="share-btn facebook">
                    <i class="fab fa-facebook"></i>
                    Facebook
                </button>
                <button onclick="copyShareLink('${text}', '${url}')" class="share-btn copy">
                    <i class="fas fa-link"></i>
                    Link Kopyala
                </button>
            </div>
            <button onclick="closeShareModal()" class="close-share">Kapat</button>
        </div>
    `;
    
    // Modal stilleri
    Object.assign(shareModal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10002',
        padding: '20px'
    });
    
    document.body.appendChild(shareModal);
    
    // Global kapatma fonksiyonu
    window.closeShareModal = () => {
        shareModal.remove();
    };
}

// WhatsApp paylaşımı
function shareToWhatsApp(text, url) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
    closeShareModal();
}

// Twitter paylaşımı
function shareToTwitter(text, url) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    closeShareModal();
}

// Facebook paylaşımı
function shareToFacebook(url) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
    closeShareModal();
}

// Link kopyalama
async function copyShareLink(text, url) {
    try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        
        // Başarı mesajı
        const successMsg = document.createElement('div');
        successMsg.textContent = 'Link kopyalandı!';
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #48bb78;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10003;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
            closeShareModal();
        }, 2000);
        
    } catch (err) {
        console.error('Link kopyalama hatası:', err);
        closeShareModal();
    }
}

// Modal dışına tıklayınca kapatma
document.addEventListener('click', function(e) {
    const modal = document.getElementById('quickDonateModal');
    if (modal && e.target === modal) {
        closeQuickDonate();
    }
});

// ESC tuşu ile kapatma
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeQuickDonate();
    }
});

// Sayfa yüklendiğinde sticky buton görünürlüğünü kontrol et
document.addEventListener('DOMContentLoaded', function() {
    // İlk 3 saniye sonra sticky buton göster
    setTimeout(() => {
        const stickyBtn = document.querySelector('.quick-donate-sticky');
        if (stickyBtn) {
            stickyBtn.style.opacity = '1';
            stickyBtn.style.transform = 'translateY(-50%) translateX(0)';
        }
    }, 3000);
    
    // Scroll ile sticky buton animasyonu
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const stickyBtn = document.querySelector('.quick-donate-sticky');
        if (!stickyBtn) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Aşağı scroll - butonu gizle
            stickyBtn.style.transform = 'translateY(-50%) translateX(-100px)';
        } else {
            // Yukarı scroll - butonu göster
            stickyBtn.style.transform = 'translateY(-50%) translateX(0)';
        }
        
        lastScrollTop = scrollTop;
    });
});

// Performance optimizasyonu: Intersection Observer ile lazy loading
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element görünür olduğunda animasyonu başlat
                entry.target.style.animationPlayState = 'running';
            }
        });
    });
    
    // Gözlemlenecek elementleri ekle
    document.addEventListener('DOMContentLoaded', () => {
        const animatedElements = document.querySelectorAll('.quick-donate-btn, .modal-content');
        animatedElements.forEach(el => observer.observe(el));
    });
}
