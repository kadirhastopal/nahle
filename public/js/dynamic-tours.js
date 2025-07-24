// public/js/dynamic-tours.js - GÜNCEL VERSİYON (Featured sorununu düzelten)

class DynamicTours {
    constructor() {
        this.tours = [];
        this.categories = [];
        this.isLoading = false;
    }

    async init() {
        console.log('🚌 Dynamic Tours başlatılıyor...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadTours();
            });
        } else {
            this.loadTours();
        }
    }

    async loadTours() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            console.log('📡 Turlar API\'den yükleniyor...');
            
            const [toursResponse, categoriesResponse] = await Promise.all([
                fetch('/api/tours?limit=50&debug=true'),
                fetch('/api/categories')
            ]);
            
            console.log('Tours Response Status:', toursResponse.status);
            console.log('Categories Response Status:', categoriesResponse.status);
            
            if (toursResponse.ok && categoriesResponse.ok) {
                const toursData = await toursResponse.json();
                const categoriesData = await categoriesResponse.json();
                
                console.log('🔍 Tours Data Detail:', toursData);
                console.log('🔍 Categories Data Detail:', categoriesData);
                
                if (toursData.success && categoriesData.success) {
                    this.tours = toursData.data.tours || [];
                    this.categories = categoriesData.data.categories || [];
                    
                    console.log(`✅ ${this.tours.length} tur yüklendi`);
                    console.log(`✅ ${this.categories.length} kategori yüklendi`);
                    
                    // Debug: Tüm turları listele
                    this.tours.forEach(tour => {
                        console.log(`🚌 Tur: ${tour.title} - Status: ${tour.status} - Category: ${tour.category_id} - Featured: ${tour.featured}`);
                    });
                    
                    this.renderAllContainers();
                } else {
                    console.error('❌ API response başarısız:', toursData, categoriesData);
                    this.showError('API yanıtı başarısız');
                }
            } else {
                console.error('❌ API request başarısız:', {
                    toursStatus: toursResponse.status,
                    categoriesStatus: categoriesResponse.status
                });
                this.showError('API isteği başarısız');
            }
        } catch (error) {
            console.error('❌ Tur yükleme hatası:', error);
            this.showError('Tur yükleme hatası: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    renderAllContainers() {
        console.log('🎨 Rendering containers...');
        
        // Ana sayfa featured tours
        const mainContainer = document.getElementById('dynamic-tours-container');
        if (mainContainer) {
            console.log('🎯 Ana sayfa turları render ediliyor...');
            
            // ✅ DÜZELTME: Önce featured, sonra aktif, sonra TÜM turlar (hiç tur yoksa göster)
            let toursToShow = this.tours.filter(tour => tour.featured && tour.status === 'active').slice(0, 6);
            console.log(`🌟 Featured + Active turlar: ${toursToShow.length}`);
            
            if (toursToShow.length === 0) {
                toursToShow = this.tours.filter(tour => tour.status === 'active').slice(0, 6);
                console.log(`✅ Active turlar: ${toursToShow.length}`);
            }
            
            if (toursToShow.length === 0) {
                // ✅ YENİ: Hiç aktif tur yoksa TÜM turları göster
                toursToShow = this.tours.slice(0, 6);
                console.log(`⚠️ Hiç aktif tur yok, tüm turlar gösteriliyor: ${toursToShow.length}`);
            }
            
            console.log(`📊 Ana sayfada gösterilecek tur sayısı: ${toursToShow.length}`);
            this.renderToursContainer(mainContainer, toursToShow);
        }
        
        // Umre turları container (eğer varsa)
        const umreContainer = document.getElementById('umre-tours-container');
        if (umreContainer) {
            console.log('🕌 Umre turları render ediliyor...');
            const umreTours = this.tours.filter(tour => {
                const category = this.categories.find(cat => cat.id === tour.category_id);
                const isUmre = category && (
                    category.slug === 'umre-turlari' || 
                    category.name.toLowerCase().includes('umre') ||
                    tour.title.toLowerCase().includes('umre')
                );
                console.log(`🔍 Tur "${tour.title}" umre mi? ${isUmre} (Category: ${category ? category.name : 'yok'})`);
                return isUmre;
            });
            console.log(`📊 Umre turları sayısı: ${umreTours.length}`);
            this.renderToursContainer(umreContainer, umreTours.slice(0, 6));
        }

        // Hac turları container (eğer varsa)
        const hacContainer = document.getElementById('hac-tours-container');
        if (hacContainer) {
            console.log('🕋 Hac turları render ediliyor...');
            const hacTours = this.tours.filter(tour => {
                const category = this.categories.find(cat => cat.id === tour.category_id);
                const isHac = category && (
                    category.slug === 'hac-turlari' || 
                    category.name.toLowerCase().includes('hac') ||
                    tour.title.toLowerCase().includes('hac')
                );
                return isHac;
            });
            console.log(`📊 Hac turları sayısı: ${hacTours.length}`);
            this.renderToursContainer(hacContainer, hacTours.slice(0, 6));
        }
    }

    renderToursContainer(container, tours) {
        if (!container) {
            console.log('❌ Container bulunamadı');
            return;
        }

        console.log(`🎨 ${tours.length} tur card'ı render ediliyor...`);

        if (!tours || tours.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600 text-lg">Henüz tur bulunmuyor.</p>
                    <p class="text-gray-500 text-sm mt-2">Yakında yeni turlar eklenecek.</p>
                    <button onclick="window.dynamicTours.loadTours()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        🔄 Tekrar Yükle
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = tours.map(tour => this.renderTourCard(tour)).join('');
    }

    renderTourCard(tour) {
        const category = this.categories.find(cat => cat.id === tour.category_id);
        const categoryName = category ? category.name : 'Kategori';
        
        // ✅ Tarih formatla
        const startDate = tour.start_date ? new Date(tour.start_date).toLocaleDateString('tr-TR') : 'Tarih belirtilmemiş';
        
        // ✅ Fiyat formatla
        const formattedPrice = tour.formatted_price || 
            new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(tour.price_try || 0);
        
        // ✅ Kategori badge rengi
        const badgeClass = categoryName.toLowerCase().includes('hac') 
            ? 'bg-green-500 text-white' 
            : 'bg-blue-500 text-white';
        
        // ✅ Kota durumu
        const quota = tour.quota || tour.available_quota || 0;
        const quotaText = quota > 0 ? `${quota} kişi` : 'Dolu';
        const quotaClass = quota > 0 ? 'text-green-600' : 'text-red-600';

        // ✅ Dahil hizmetleri parse et (ilk 3 özellik)
        let includedServices = [];
        try {
            if (tour.included_services) {
                if (typeof tour.included_services === 'string') {
                    includedServices = tour.included_services.split('\n')
                        .map(s => s.trim().replace(/^[•\-\*]\s*/, ''))
                        .filter(s => s.length > 0)
                        .slice(0, 3);
                } else if (Array.isArray(tour.included_services)) {
                    includedServices = tour.included_services.slice(0, 3);
                }
            }
        } catch (e) {
            console.log('Included services parse error:', e);
        }

        // ✅ Ziyaret yerleri parse et (ilk 2 yer)
        let visitPlaces = [];
        try {
            if (tour.visit_places) {
                if (typeof tour.visit_places === 'string') {
                    visitPlaces = tour.visit_places.split('\n')
                        .map(s => s.trim().replace(/^[•\-\*]\s*/, ''))
                        .filter(s => s.length > 0)
                        .slice(0, 2);
                } else if (Array.isArray(tour.visit_places)) {
                    visitPlaces = tour.visit_places.slice(0, 2);
                }
            }
        } catch (e) {
            console.log('Visit places parse error:', e);
        }
        
        return `
            <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">
                <!-- Tour Image -->
                <div class="relative h-56 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 ${tour.image_url ? '' : ''}" 
                     ${tour.image_url ? `style="background-image: url('${tour.image_url}'); background-size: cover; background-position: center;"` : ''}>
                    <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    
                    <!-- Badges -->
                    <div class="absolute top-4 left-4 flex flex-col gap-2">
                        <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}">
                            ${categoryName}
                        </span>
                        ${tour.featured ? `
                            <span class="inline-block px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-full">
                                ⭐ Öne Çıkan
                            </span>
                        ` : ''}
                        ${tour.status !== 'active' ? `
                            <span class="inline-block px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                                🚫 ${tour.status}
                            </span>
                        ` : ''}
                    </div>
                    
                    <!-- Tour Info Overlay -->
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-3">
                                <span class="flex items-center gap-1">
                                    📅 ${startDate}
                                </span>
                                <span class="flex items-center gap-1">
                                    ⏰ ${tour.duration_days || 0} Gün
                                </span>
                                ${tour.duration_nights ? `
                                    <span class="flex items-center gap-1">
                                        🌙 ${tour.duration_nights} Gece
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tour Content -->
                <div class="p-6">
                    <!-- ✅ Başlık detay sayfasına link -->
                    <h3 class="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                        <a href="/tur/${tour.id}" class="hover:underline">
                            ${tour.title || 'Tur Başlığı'}
                        </a>
                    </h3>
                    
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                        ${tour.short_description || tour.description || 'Detaylı açıklama bulunmuyor.'}
                    </p>
                    
                    <!-- ✅ Dahil Hizmetler (varsa) -->
                    ${includedServices.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">✅ Dahil Hizmetler:</h4>
                            <div class="space-y-1">
                                ${includedServices.map(service => `
                                    <div class="flex items-start gap-2 text-xs text-gray-600">
                                        <span class="text-green-500 mt-0.5">•</span>
                                        <span class="line-clamp-1">${service}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- ✅ Ziyaret Yerleri (varsa) -->
                    ${visitPlaces.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">🕌 Ziyaret Yerleri:</h4>
                            <div class="flex flex-wrap gap-1">
                                ${visitPlaces.map(place => `
                                    <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        ${place.length > 20 ? place.substring(0, 20) + '...' : place}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Pricing & Action -->
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-nahletur-primary mb-1">
                                ${formattedPrice}
                            </div>
                            <div class="text-sm ${quotaClass} font-medium">
                                👥 ${quotaText} kaldı
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <a href="/tur/${tour.id}" 
                               class="bg-nahletur-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-nahletur-secondary transition-colors text-center">
                                📖 Detaylar
                            </a>
                            <button onclick="reserveTour(${tour.id})" 
                                    class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-600 transition-colors">
                                📞 Rezerve Et
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message = 'Bir hata oluştu') {
        const containers = [
            'dynamic-tours-container',
            'umre-tours-container', 
            'hac-tours-container'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="text-red-400 mb-4">
                            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Yükleme Hatası</h3>
                        <p class="text-gray-600 mb-4">${message}</p>
                        <button onclick="window.dynamicTours.loadTours()" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                            🔄 Tekrar Dene
                        </button>
                    </div>
                `;
            }
        });
    }
}

// ✅ Rezervasyon fonksiyonu
function reserveTour(tourId) {
    const phoneNumber = '905551234567'; // Gerçek WhatsApp numaranız
    const message = `Merhaba, ${tourId} ID'li tur hakkında bilgi almak istiyorum.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    if (window.innerWidth > 768) {
        window.open(whatsappUrl, '_blank');
    } else {
        window.location.href = whatsappUrl;
    }
}

// ✅ Hızlı featured yapma fonksiyonu (debug için)
function makeTourFeatured(tourId) {
    console.log(`🌟 ${tourId} ID'li tur featured yapılıyor...`);
    
    // Bu fonksiyonu admin panelde çağırabilirsiniz
    fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: JSON.stringify({
            featured: true
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Tur featured yapıldı:', data);
            // Sayfayı yenile
            window.dynamicTours.loadTours();
        } else {
            console.error('❌ Featured yapma hatası:', data);
        }
    })
    .catch(error => {
        console.error('❌ Featured yapma hatası:', error);
    });
}

// ✅ Global instance oluştur ve başlat
const dynamicTours = new DynamicTours();
window.dynamicTours = dynamicTours; // Debug için global erişim
window.makeTourFeatured = makeTourFeatured; // Debug fonksiyonu
dynamicTours.init();

console.log('✅ Dynamic Tours script yüklendi (GÜNCEL VERSİYON)');