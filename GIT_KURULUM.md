# 📦 Git Repository Kurulumu ve Maintenance Deployment

## 🔧 Adım 1: Git Repository Başlatma

Eğer henüz git repository yoksa:

```bash
cd /Users/bilalelmas/Desktop/dmdfurkanelmas.github.io

# Git initialize et
git init

# GitHub repository'nizi ekleyin (eğer varsa)
git remote add origin https://github.com/dmdfurkanelmas/dmdfurkanelmas.github.io.git

# VEYA yeni repository oluşturduysanız:
# git remote add origin https://github.com/KULLANICIADI/dmdfurkanelmas.github.io.git
```

## 🚀 Adım 2: Maintenance'ı GitHub'a Push Etme

Şu anda maintenance sayfası aktif. GitHub'a yüklemek için:

```bash
# Tüm dosyaları ekle (plan dosyaları otomatik ignore edilecek)
git add .

# Commit yap
git commit -m "⚠️ Maintenance mode aktif - Büyük duyuru yakında"

# GitHub'a push et
git branch -M main
git push -u origin main
```

## ✅ Kontrol

1. GitHub.com'da repository'nize gidin
2. Settings → Pages bölümünde branch'in `main` olduğundan emin olun
3. `https://dmdfurkanelmas.github.io` adresini açın
4. Maintenance sayfası görünüyor olmalı

## 🎉 Sonraki Adım: Yeni Siteyi Aktif Etme

Yarın duyuru zamanı geldiğinde:

```bash
# Yeni siteyi aktif et
cp index-new-site.html index.html

# Commit ve push
git add index.html
git commit -m "🎉 Kampanya %100 tamamlandı - Yeni başarı sitesi aktif"
git push origin main
```

---

**Not**: Eğer GitHub repository henüz yoksa, önce GitHub.com'da oluşturun.

