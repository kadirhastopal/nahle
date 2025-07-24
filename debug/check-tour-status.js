// debug/check-tour-status.js - Tur durumunu kontrol etme scripti

// Bu scripti browser console'da çalıştırın:

// 1. Tüm turları kontrol et
fetch('/api/tours?limit=50&debug=true')
    .then(response => response.json())
    .then(data => {
        console.log('🔍 TÜM TURLAR:', data);
        
        if (data.success && data.data.tours) {
            console.log(`📊 Toplam ${data.data.tours.length} tur bulundu`);
            
            data.data.tours.forEach((tour, index) => {
                console.log(`${index + 1}. 🚌 ${tour.title}`);
                console.log(`   📋 ID: ${tour.id}`);
                console.log(`   📊 Status: ${tour.status}`);
                console.log(`   📂 Category ID: ${tour.category_id}`);
                console.log(`   ⭐ Featured: ${tour.featured}`);
                console.log(`   💰 Fiyat: ${tour.price_try} TL`);
                console.log(`   📅 Başlangıç: ${tour.start_date}`);
                console.log(`   👥 Kota: ${tour.quota}`);
                console.log('   -------------------');
            });
            
            // Umre turlarını filtrele
            const umreTours = data.data.tours.filter(tour => 
                tour.title.toLowerCase().includes('umre')
            );
            
            console.log(`🕌 UMRE TURLARI SAYISI: ${umreTours.length}`);
            umreTours.forEach(tour => {
                console.log(`✅ ${tour.title} - Status: ${tour.status} - Featured: ${tour.featured}`);
            });
            
        } else {
            console.error('❌ API başarısız:', data);
        }
    })
    .catch(error => {
        console.error('❌ API hatası:', error);
    });

// 2. Kategorileri kontrol et
fetch('/api/categories')
    .then(response => response.json())
    .then(data => {
        console.log('📂 KATEGORİLER:', data);
        
        if (data.success && data.data.categories) {
            data.data.categories.forEach(category => {
                console.log(`📂 ${category.name} (${category.slug}) - ID: ${category.id}`);
            });
        }
    })
    .catch(error => {
        console.error('❌ Kategori hatası:', error);
    });

// 3. Admin panelden kontrol
fetch('/api/admin/tours?limit=50', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
        'Content-Type': 'application/json'
    }
})
    .then(response => response.json())
    .then(data => {
        console.log('🔐 ADMİN PANEL TURLARI:', data);
        
        if (data.success && data.data.tours) {
            console.log(`👨‍💼 Admin panelde ${data.data.tours.length} tur görünüyor`);
            
            data.data.tours.forEach(tour => {
                if (tour.title.toLowerCase().includes('umre')) {
                    console.log(`🕌 UMRE TUR BULUNDU:`);
                    console.log(`   📋 ${tour.title}`);
                    console.log(`   🔄 Status: ${tour.status}`);
                    console.log(`   📂 Category: ${tour.category_id}`);
                    console.log(`   ⭐ Featured: ${tour.featured}`);
                }
            });
        }
    })
    .catch(error => {
        console.error('❌ Admin API hatası:', error);
    });