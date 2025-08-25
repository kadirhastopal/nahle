require('dotenv').config();
const { Tour, Blog, Testimonial, Settings } = require('../src/models');

async function addSampleData() {
    try {
        console.log('📝 Örnek veriler ekleniyor...');
        
        // Örnek Hac Turu
        await Tour.create({
            title: '2024 Hac Turu - VIP Paket',
            slug: '2024-hac-turu-vip-paket',
            type: 'hac',
            description: 'Mekke ve Medine\'de 5 yıldızlı otellerde konaklama, Türkçe rehberlik hizmeti, tam pansiyon, ulaşım dahil lüks Hac programı.',
            price: 85000,
            currency: 'TRY',
            duration: '40 Gün',
            departure_date: new Date('2024-06-10'),
            return_date: new Date('2024-07-20'),
            quota: 45,
            available_quota: 12,
            features: ['5 Yıldızlı Otel', 'Harem\'e 500m', 'Türkçe Rehber', 'Sağlık Sigortası'],
            includes: ['Uçak Bileti', 'Konaklama', '3 Öğün Yemek', 'Transferler', 'Rehberlik', 'Hac Vizesi'],
            excludes: ['Kurban Bedeli', 'Kişisel Harcamalar', 'İlave Turlar'],
            is_featured: true,
            is_active: true
        });

        // Örnek Umre Turu
        await Tour.create({
            title: 'Ramazan Umresi 2024',
            slug: 'ramazan-umresi-2024',
            type: 'umre',
            description: 'Ramazan ayında manevi atmosferde umre ibadeti. İftar programları dahil özel umre paketi.',
            price: 35000,
            currency: 'TRY',
            duration: '14 Gün',
            departure_date: new Date('2024-03-15'),
            return_date: new Date('2024-03-29'),
            quota: 30,
            available_quota: 8,
            features: ['4 Yıldızlı Otel', 'İftar Programı', 'Türkçe Rehber', 'WhatsApp Destek'],
            includes: ['Uçak Bileti', 'Konaklama', 'Kahvaltı ve İftar', 'Transferler', 'Umre Vizesi'],
            excludes: ['Öğle Yemeği', 'Kişisel Harcamalar'],
            is_featured: true,
            is_active: true
        });

        // Örnek Blog Yazısı
        await Blog.create({
            title: 'Umre İbadetinde Dikkat Edilmesi Gerekenler',
            slug: 'umre-ibadetinde-dikkat-edilmesi-gerekenler',
            content: 'Umre ibadeti, İslam\'ın önemli ibadetlerinden biridir. Bu yazımızda umre yaparken dikkat edilmesi gereken hususları ele alacağız...',
            excerpt: 'Umre ibadetini yerine getirirken bilinmesi gereken önemli bilgiler ve tavsiyeler.',
            category: 'Umre Rehberi',
            tags: ['umre', 'ibadet', 'rehber'],
            author: 'Nahletur Ekibi',
            is_featured: true,
            is_published: true
        });

        // Örnek Müşteri Yorumu
        await Testimonial.create({
            name: 'Ahmet Yılmaz',
            tour_type: 'umre',
            tour_date: '2023 Ramazan',
            comment: 'Nahletur ile gerçekleştirdiğimiz umre yolculuğu harikaydı. Organizasyon mükemmeldi, rehberlerimiz çok ilgiliydi.',
            rating: 5,
            is_featured: true,
            is_active: true
        });

        console.log('✅ Örnek veriler başarıyla eklendi!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

addSampleData();
