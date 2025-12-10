#!/bin/bash

# 🚀 Hızlı Deployment Script
# Maintenance sayfasını GitHub'a push eder

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Maintenance sayfasını GitHub'a yüklüyor...${NC}\n"

# Git durumu kontrol
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository bulunamadı!${NC}"
    exit 1
fi

# Mevcut durumu göster
echo -e "${YELLOW}📋 Durum:${NC}"
git status --short

echo -e "\n${YELLOW}⚠️  Devam etmek istiyor musunuz? (y/n)${NC}"
read -p "> " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${RED}❌ İptal edildi.${NC}"
    exit 0
fi

# Dosyaları ekle
echo -e "\n${YELLOW}📦 Dosyalar ekleniyor...${NC}"
git add .

# Commit
echo -e "${YELLOW}💾 Commit yapılıyor...${NC}"
git commit -m "⚠️ Maintenance mode aktif - Büyük duyuru yakında

- Maintenance sayfası aktif
- Yeni başarı sitesi hazır (index-new-site.html)
- Çoklu dil desteği
- Modern responsive tasarım"

# Push
echo -e "\n${YELLOW}🚀 GitHub'a push ediliyor...${NC}"
echo -e "${YELLOW}💡 İlk push için: git push -u origin main${NC}"
echo -e "${YELLOW}💡 Sonraki push için: git push origin main${NC}\n"

# Push seçeneği sun
read -p "Şimdi push yapmak istiyor musunuz? (y/n): " push_confirm

if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
    git push -u origin main 2>&1 || git push origin main 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Başarılı!${NC}"
        echo -e "${GREEN}🔗 Site: https://dmdfurkanelmas.github.io${NC}"
        echo -e "${GREEN}⏳ 1-2 dakika içinde güncellenecek.${NC}"
    else
        echo -e "\n${RED}❌ Push hatası!${NC}"
        echo -e "${YELLOW}Manuel olarak deneyin:${NC}"
        echo "  git push -u origin main"
    fi
else
    echo -e "\n${YELLOW}📝 Commit yapıldı ama push edilmedi.${NC}"
    echo -e "${YELLOW}İstediğiniz zaman: git push -u origin main${NC}"
fi

echo -e "\n${GREEN}✨ Tamamlandı!${NC}"

