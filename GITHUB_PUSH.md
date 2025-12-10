# 🚀 GitHub Repository'ye Push Rehberi

## ✅ Durum
- ✅ Git repository başlatıldı
- ✅ Remote repository bağlandı: `dmdfurkanelmas.github.io`
- ✅ Maintenance sayfası aktif (`index.html`)
- ✅ Yeni site yedeklendi (`index-new-site.html`)

## 🎯 Hızlı Push İşlemi

### Yöntem 1: Otomatik Script (Önerilen)

```bash
./DEPLOY_NOW.sh
```

Script size adım adım yönlendirecek.

### Yöntem 2: Manuel Push

```bash
# 1. Tüm dosyaları ekle
git add .

# 2. Commit yap
git commit -m "⚠️ Maintenance mode aktif - Büyük duyuru yakında"

# 3. GitHub'a push et
git push -u origin main
```

## ⚠️ Önemli Notlar

### Eğer "unrelated histories" hatası alırsanız:

```bash
git pull origin main --allow-unrelated-histories
# Conflict olursa düzeltin
git add .
git commit -m "Merge remote and local"
git push origin main
```

### Eğer GitHub'da mevcut dosyalar varsa:

GitHub'daki mevcut `index.html` dosyası yerine maintenance sayfası gelecek. Bu normal, çünkü yeni siteyi yüklemek istiyorsunuz.

### Eğer force push gerekiyorsa (dikkatli!):

```bash
# ⚠️ Sadece gerekirse kullanın, mevcut içeriği siler
git push -f origin main
```

## 📋 Push Sonrası Kontroller

1. **GitHub Repository Kontrolü:**
   - https://github.com/dmdfurkanelmas/dmdfurkanelmas.github.io
   - Dosyaların yüklendiğini kontrol edin

2. **GitHub Pages Ayarları:**
   - Repository → Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `main` ve `/ (root)`

3. **Site Kontrolü:**
   - https://dmdfurkanelmas.github.io
   - Maintenance sayfası görünüyor olmalı
   - Hard refresh yapın (Ctrl+Shift+R)

## 🎉 Yarın: Yeni Siteyi Aktif Etme

```bash
# 1. Yeni siteyi aktif et
cp index-new-site.html index.html

# 2. Commit ve push
git add index.html
git commit -m "🎉 Kampanya %100 - Yeni site aktif"
git push origin main
```

---

**Hazırsanız:** `./DEPLOY_NOW.sh` çalıştırın! 🚀

