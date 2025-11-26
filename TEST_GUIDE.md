# Test Rehberi - Kampanya %100 Kontrolü

## 🧪 Hızlı Test Yöntemi

### Yöntem 1: Browser Console ile Test

1. Sayfayı açın (index.html)
2. Browser Developer Tools'u açın (F12 veya Cmd+Option+I)
3. Console sekmesine gidin
4. Şu komutu çalıştırın:

```javascript
// Progress bar'ı 100 yap
document.querySelector('.progress-bar').setAttribute('aria-valuenow', '100');
document.querySelector('.progress-bar .progress').style.width = '100%';

// Kampanya durumunu kontrol et
checkCampaignStatus();
```

### Yöntem 2: HTML Dosyasında Geçici Değişiklik

1. `index.html` dosyasını açın
2. Satır 402'deki değerleri değiştirin:

**ÖNCE:**
```html
<div class="progress-bar" role="progressbar" aria-valuenow="77" aria-valuemin="0" aria-valuemax="100">
  <div class="progress" style="width: 77%"></div>
</div>
```

**SONRA (Test için):**
```html
<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
  <div class="progress" style="width: 100%"></div>
</div>
```

3. Satır 410-411'deki yüzdeyi değiştirin:
```html
<div class="amount">2.899.907 USD</div>
<div class="percentage">%100</div>
```

4. Satır 415-416'daki kalan tutarı 0 yapın:
```html
<div class="amount">0 USD</div>
<div class="percentage">%0</div>
```

5. Sayfayı yenileyin (F5 veya Cmd+R)

## ✅ Kontrol Edilecekler

### %100 Olduğunda Görünmesi Gerekenler:
- ✅ **Başarı Hikayesi Bölümü** görünür olmalı
- ✅ **#furkankazandi** hashtag'i görünür olmalı
- ✅ **"Furkan'ın hayali gerçek oldu"** mesajı görünür olmalı
- ✅ İstatistikler (Toplanan Bağış, %100, Destekçi Sayısı) görünür olmalı
- ✅ Timeline (Kampanya Süreci) görünür olmalı
- ✅ Sosyal medya paylaşım butonları görünür olmalı

### %100 Olduğunda Gizlenmesi Gerekenler:
- ❌ **Header'daki bağış butonları** gizli olmalı
- ❌ **Donation Section** (Bağış Yap bölümü) gizli olmalı
- ❌ Tüm IBAN kutuları gizli olmalı
- ❌ Kredi kartı butonu gizli olmalı
- ❌ SMS bağış kutusu gizli olmalı

## 🔄 Geri Dönüş (Test Sonrası)

Test bittikten sonra değerleri eski haline döndürün:

```html
<!-- Progress bar -->
<div class="progress-bar" role="progressbar" aria-valuenow="77" aria-valuemin="0" aria-valuemax="100">
  <div class="progress" style="width: 77%"></div>
</div>

<!-- Toplanan Bağış -->
<div class="amount">2.232.928 USD</div>
<div class="percentage">%77</div>

<!-- İhtiyaç Duyulan Bağış -->
<div class="amount">666.979 USD</div>
<div class="percentage">%23</div>
```

## 🌍 Dil Testi

Her dilde test edin:
1. Türkçe (TR) - Varsayılan
2. İngilizce (EN) - Dil butonuna tıklayın
3. Almanca (DE) - Dil butonuna tıklayın

Her dilde başarı mesajları doğru görünmeli.

## 📱 Responsive Test

Farklı ekran boyutlarında test edin:
- **Mobil**: 375px (iPhone)
- **Tablet**: 768px (iPad)
- **Desktop**: 1920px

Her ekran boyutunda:
- Başarı hikayesi düzgün görünmeli
- Hashtag tıklanabilir olmalı
- Paylaşım butonları çalışmalı

## 🎯 Hashtag Testi

1. Hashtag'e tıklayın (#furkankazandi)
2. "✓ Kopyalandı!" mesajı görünmeli
3. Clipboard'a #furkankazandi kopyalanmış olmalı
4. 2 saniye sonra orijinal haline dönmeli

## 🐛 Sorun Giderme

Eğer başarı hikayesi görünmüyorsa:

1. Browser Console'u açın (F12)
2. Hata var mı kontrol edin
3. Şu komutu çalıştırın:
```javascript
console.log('Campaign Complete:', isCampaignComplete());
console.log('Progress Value:', document.querySelector('.progress-bar').getAttribute('aria-valuenow'));
```

4. Eğer `isCampaignComplete()` false dönerse, progress değerini kontrol edin.

