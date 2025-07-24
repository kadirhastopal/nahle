// public/js/dynamic-tours.js - DÜZELTİLMİŞ VERSİYON
class DynamicTours {
    constructor() {
        this.tours = [];
        this.categories = [];
        this.isLoading = false;
    }

    async init() {
        console.log('🚌 Dynamic Tours başlatılıyor...');
        
        // Sayfa yüklendiğinde turları yükle
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
            
            // ✅ DÜZELTME: Doğru API endpoint'leri
            const [toursResponse, categoriesResponse] = await Promise.all([
                fetch('/api/tours?limit=20&status=active'),
                fetch('/api/categories')
            ]);
            
            console.log('Tours Response:', toursResponse.status);
            console.log('Categories Response:', categoriesResponse.status);
            
            if (toursResponse.ok && categoriesResponse.ok) {
                const toursData = await toursResponse.json();
                const categoriesData = await categoriesResponse.json();
                
                console.log('Tours Data:', toursData);
                console.log('Categories Data:', categoriesData);
                
                if (toursData.success && categoriesData.success) {
                    this.tours = toursData.data.tours || [];
                    this.categories = categoriesData.data.categories || [];
                    
                    console.log(`✅ ${this.tours.length} tur yüklendi`);
                    console.log(`✅ ${this.categories.length} kategori yüklendi`);
                    
                    this.renderAllContainers();
                } else {
                    console.error('❌ API response başarısız');
                    this.showError();
                }
            } else {
                console.error('❌ API request başarısız');
                this.showError();
            }
        } catch (error) {
            console.error('❌ Tur yükleme hatası:', error);
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }

    renderAllContainers() {
        // Ana sayfa featured tours
        const mainContainer = document.getElementById('dynamic-tours-container');
        if (mainContainer) {
            console.log('🎯 Ana sayfa turları render ediliyor...');
            const featuredTours = this.tours.filter(tour => tour.featured).slice(0, 6);
            if (featuredTours.length === 0) {
                // Eğer featured tur yoksa, ilk 6 aktif turu göster
                this.renderToursContainer(mainContainer, this.tours.slice(0, 6));
            } else {
                this.renderToursContainer(mainContainer, featuredTours);
            }
        }
        
        // Umre turları container (eğer varsa)
        const umreContainer = document.getElementById('umre-tours-container');
        if (umreContainer) {
            console.log('🕌 Umre turları render ediliyor...');
            const umreTours = this.tours.filter(tour => {
                const category = this.categories.find(cat => cat.id === tour.category_id);
                return category && (category.slug === 'umre-turlari' || category.name.toLowerCase().includes('umre'));
            });
            this.renderToursContainer(umreContainer, umreTours.slice(0, 6));
        }

        // Hac turları container (eğer varsa)
        const hacContainer = document.getElementById('hac-tours-container');
        if (hacContainer) {
            console.log('🕋 Hac turları render ediliyor...');
            const hacTours = this.tours.filter(tour => {
                const category = this.categories.find(cat => cat.id === tour.category_id);
                return category && (category.slug === 'hac-turlari' || category.name.toLowerCase().includes('hac'));
            });
            this.renderToursContainer(hacContainer, hacTours.slice(0, 6));
        }
    }

    renderToursContainer(container, tours) {
        if (!container) return;

        if (!tours || tours.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600 text-lg">Henüz aktif tur bulunmuyor.</p>
                    <p class="text-gray-500 text-sm mt-2">Yakında yeni turlar eklenecek.</p>
                </div>
            `;
            return;
        }

        console.log(`🎨 ${tours.length} tur card'ı render ediliyor...`);
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
                                ${tour.included_services && tour.included_services.split('\n').length > 3 ? `
                                    <div class="text-xs text-indigo-600 font-medium">
                                        <a href="/tur/${tour.id}" class="hover:underline">
                                            +${tour.included_services.split('\n').length - 3} daha fazla...
                                        </a>
                                    </div>
                                ` : ''}
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
                                ${visitPlaces.length < (tour.visit_places ? tour.visit_places.split('\n').length : 0) ? `
                                    <a href="/tur/${tour.id}" class="inline-block px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full hover:bg-indigo-200">
                                        +Daha fazla
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Tour Details -->
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div class="flex items-center gap-4">
                            <span class="flex items-center gap-1">
                                👥 <span class="${quotaClass} font-medium">${quotaText}</span>
                            </span>
                        </div>
                    </div>
                    
                    <!-- Price and Actions -->
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <div class="text-2xl font-bold text-indigo-600">${formattedPrice}</div>
                            <div class="text-xs text-gray-500">Kişi başı</div>
                        </div>
                        <div class="flex gap-2">
                            <!-- ✅ Detay Görüntüle Butonu -->
                            <a href="/tur/${tour.id}" 
                               class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
                                Detay
                            </a>
                            <!-- İletişim Butonu -->
                            <button onclick="contactForTour('${tour.title}')" 
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
                                Bilgi Al
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

// ✅ Global contact function
function contactForTour(tourTitle) {
    // İletişim sayfasına yönlendir veya modal aç
    const message = `Merhaba, "${tourTitle}" turu hakkında bilgi almak istiyorum.`;
    const whatsappUrl = `https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(message)}`;
    
    // WhatsApp'ta aç veya iletişim formunu doldur
    if (confirm('WhatsApp ile iletişime geçmek ister misiniz?')) {
        window.open(whatsappUrl, '_blank');
    } else {
        // İletişim sayfasına yönlendir
        window.location.href = '/iletisim';
    }
}

// ✅ Global instance oluştur ve başlat
const dynamicTours = new DynamicTours();
dynamicTours.init();

console.log('✅ Dynamic Tours script yüklendi');