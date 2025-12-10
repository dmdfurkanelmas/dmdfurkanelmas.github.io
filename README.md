# Furkan Elmas Kampanya Başarı Web Sitesi

DMD hastası Furkan Elmas'ın yardım kampanyasının başarıyla tamamlandığını (%100) duyuran, modern ve mobil uyumlu web sitesi projesi.

## Özellikler

- **Responsive Tasarım**: Mobil, tablet ve masaüstü cihazlarla tam uyumlu.
- **Çoklu Dil Desteği**: Türkçe (TR), İngilizce (EN) ve Almanca (DE) desteği. Kolayca JSON dosyaları düzenlenerek yönetilebilir.
- **Modern UI**: Temiz, umut verici mavi tonlar ve balon konsepti.
- **Animasyonlar**: Slider, progress bar dolum efekti ve balon animasyonları.

## Proje Yapısı

```
/ (root)
│── index.html          # Ana sayfa
│── /assets
│     ├── /css
│     │      └── styles.css  # Tüm stil dosyaları
│     ├── /js
│     │      └── main.js     # Slider, dil değişimi ve animasyon scriptleri
│     ├── /img               # Görseller (2.png, 3.png, balloons.png)
│     └── /video             # Videolar (1.mp4)
│── /lang
│     ├── tr.json            # Türkçe çeviri
│     ├── en.json            # İngilizce çeviri
│     ├── de.json            # Almanca çeviri
```

## Kurulum ve Düzenleme

### 1. Yerel Çalıştırma
Projeyi bilgisayarınızda görüntülemek için:
1.  Bu klasörü indirin.
2.  `index.html` dosyasını tarayıcınızda (Chrome, Safari, Firefox vb.) açın.
3.  **Not:** Bazı tarayıcılar yerel dosyalarda JSON yüklemesini (CORS) engelleyebilir. Bu durumda Visual Studio Code "Live Server" eklentisi veya basit bir HTTP sunucusu kullanmanız önerilir.

```bash
# Python ile basit sunucu başlatmak için terminalde proje klasöründeyken:
python3 -m http.server
# Ardından tarayıcıda http://localhost:8000 adresine gidin.
```

### 2. İçerik Düzenleme
- **Metinler**: `lang/` klasörü içindeki JSON dosyalarını düzenleyerek sitedeki tüm yazıları değiştirebilirsiniz.
- **Görseller**: `assets/img/` klasörüne kendi görsellerinizi `2.png` ve `3.png` adıyla atarak slider görsellerini güncelleyebilirsiniz.
- **Video**: `assets/video/` klasörüne `1.mp4` adında kampanya videonuzu ekleyin.

## GitHub Pages ile Yayınlama

Bu projeyi GitHub Pages üzerinde ücretsiz yayınlamak için:

1.  GitHub'da yeni bir repository oluşturun (Örn: `dmdfurkanelmas.github.io`).
2.  Bu proje dosyalarını repository'e yükleyin (push).
3.  Repository **Settings** (Ayarlar) sekmesine gidin.
4.  Sol menüden **Pages** seçeneğine tıklayın.
5.  **Source** kısmından `Deploy from a branch` seçin.
6.  **Branch** olarak `main` (veya `master`) seçin ve `/ (root)` klasörünü işaretleyip **Save** butonuna basın.
7.  Birkaç dakika içinde siteniz `https://kullaniciadi.github.io/repoadi` adresinde yayına girecektir.

---
*Tasarım ve Kodlama: AI Assistant*
