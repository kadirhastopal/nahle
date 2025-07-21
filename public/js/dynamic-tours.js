// public/js/dynamic-tours.js - Ana sayfa dinamik turlar (TEMİZ VERSİYON)
class DynamicTours {
    constructor() {
        this.tours = [];
        this.categories = [];
    }

    async loadTours() {
        try {
            // Turları ve kategorileri paralel olarak çek
            const [toursResponse, categoriesResponse] = await Promise.all([
                fetch('/api/tours?limit=20&status=active'),
                fetch('/api/categories')
            ]);
            
            if (toursResponse.ok && categoriesResponse.ok) {
                const toursData = await toursResponse.json();
                const categoriesData = await categoriesResponse.json();
                
                this.tours = toursData.data.tours;
                this.categories = categoriesData.data.categories;
                
                this.renderTours();
            } else {
                this.showError();
            }
        } catch (error) {
            this.showError();
        }
    }

    renderTours() {
        // Ana sayfa için featured tours
        const toursContainer = document.getElementById('dynamic-tours-container');
        if (toursContainer) {
            this.renderToursContainer(toursContainer, this.tours.slice(0, 6));
        }
        
        // Umre turları için ayrı container varsa
        const umreContainer = document.getElementById('umre-tours-container');
        if (umreContainer) {
            const umreTours = this.tours.filter(tour => {
                const category = this.categories.find(cat => cat.id === tour.category_id);
                return category && category.slug === 'umre-turlari';
            });
            this.renderToursContainer(umreContainer, umreTours.slice(0, 6));
        }
    }

    renderToursContainer(container, tours) {
        if (!container) return;

        if (!tours || tours.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-600">Henüz aktif tur bulunmuyor.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tours.map(tour => this.renderTourCard(tour)).join('');
    }

    renderTourCard(tour) {
        const category = this.categories.find(cat => cat.id === tour.category_id);
        const categoryName = category ? category.name : 'Kategori';
        
        // Badge rengini kategori ismine göre belirle
        const badgeClass = tour.category_id === 1 
            ? 'bg-nahletur-primary text-white' 
            : 'bg-nahletur-accent text-white';
        
        // Kota durumu
        const quotaStatus = tour.available_quota > 0 
            ? `${tour.available_quota} kişilik kontenjan`
            : 'Kontenjan doldu';
        
        const quotaClass = tour.available_quota > 0 
            ? 'text-green-600' 
            : 'text-red-600';

        // Görsel render et
        const imageHtml = this.renderTourImage(tour);

        return `
            <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift overflow-hidden">
                ${imageHtml}
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-semibold text-gray-800 line-clamp-2">${tour.title}</h3>
                        <span class="px-3 py-1 rounded-full text-sm ${badgeClass} whitespace-nowrap ml-2">
                            ${categoryName}
                        </span>
                    </div>
                    
                    <p class="text-gray-600 mb-4 line-clamp-2">
                        ${tour.short_description || tour.description || 'Detaylı bilgi için iletişime geçin.'}
                    </p>
                    
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Süre:</span>
                            <span class="font-medium">${tour.duration_days} gün</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Kontenjan:</span>
                            <span class="font-medium ${quotaClass}">${quotaStatus}</span>
                        </div>
                        ${tour.start_date ? `
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Başlangıç:</span>
                                <span class="font-medium">${new Date(tour.start_date).toLocaleDateString('tr-TR')}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="text-2xl font-bold text-nahletur-primary">
                            ${tour.price_try ? '₺' + Number(tour.price_try).toLocaleString('tr-TR') : 'Fiyat Sorulur'}
                        </div>
                        <button 
                            onclick="dynamicTours.showTourDetail('${tour.slug}')"
                            class="bg-nahletur-primary text-white px-6 py-2 rounded-lg hover:bg-nahletur-secondary transition-colors ${tour.available_quota === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${tour.available_quota === 0 ? 'disabled' : ''}
                        >
                            ${tour.available_quota > 0 ? 'Detaylar' : 'Dolu'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTourImage(tour) {
        let imageUrl = null;

        // Featured image'ı kontrol et
        if (tour.featured_image) {
            try {
                // JSON string ise parse et
                if (typeof tour.featured_image === 'string' && tour.featured_image.startsWith('{')) {
                    const featuredImageData = JSON.parse(tour.featured_image);
                    imageUrl = `/uploads/tours/${featuredImageData.medium || featuredImageData.original}`;
                } else if (typeof tour.featured_image === 'object') {
                    // Object ise direkt kullan
                    imageUrl = `/uploads/tours/${tour.featured_image.medium || tour.featured_image.original}`;
                } else {
                    // String ise direkt kullan
                    imageUrl = tour.featured_image.startsWith('/') ? tour.featured_image : `/uploads/tours/${tour.featured_image}`;
                }
            } catch (e) {
                // Parse hatası varsa gallery'e geç
            }
        }

        // Gallery'den al
        if (!imageUrl && tour.gallery && tour.gallery.length > 0) {
            try {
                const firstGalleryImage = tour.gallery[0];
                if (typeof firstGalleryImage === 'object') {
                    imageUrl = `/uploads/tours/${firstGalleryImage.medium || firstGalleryImage.original}`;
                }
            } catch (e) {
                // Gallery hatası
            }
        }

        // Görsel varsa göster, yoksa placeholder
        if (imageUrl) {
            // HTML escape the placeholder for onerror
            const placeholderEscaped = this.getPlaceholderHtml(tour.title).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            
            return `
                <div class="h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img src="${imageUrl}" alt="${tour.title}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                         onerror="this.parentElement.innerHTML='${placeholderEscaped}';">
                </div>
            `;
        } else {
            return this.getPlaceholderHtml(tour.title);
        }
    }

    getPlaceholderHtml(title) {
        return `
            <div class="h-48 bg-gradient-to-br from-nahletur-primary to-nahletur-secondary rounded-t-xl flex items-center justify-center">
                <div class="text-center text-white">
                    <svg class="w-16 h-16 mx-auto mb-2 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm opacity-75 font-medium">
                        ${title.length > 20 ? title.substring(0, 20) + '...' : title}
                    </p>
                </div>
            </div>
        `;
    }

    showTourDetail(slug) {
        // Contact form'a scroll yap
        document.getElementById('iletisim').scrollIntoView({ behavior: 'smooth' });
        
        // Contact form'a tur bilgisini ön-doldur
        const tour = this.tours.find(t => t.slug === slug);
        if (tour) {
            const messageField = document.querySelector('textarea[name="message"]');
            if (messageField) {
                messageField.value = `${tour.title} hakkında bilgi almak istiyorum.`;
            }
        }
    }

    showError() {
        const containers = ['dynamic-tours-container', 'umre-tours-container'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <div class="text-red-500 mb-4">
                            <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <p class="text-gray-600">Turlar yüklenirken hata oluştu.</p>
                        <button onclick="dynamicTours.loadTours()" class="mt-2 text-nahletur-primary hover:underline">
                            Tekrar Dene
                        </button>
                    </div>
                `;
            }
        });
    }
}

// Global instance
window.dynamicTours = new DynamicTours();

// Sayfa yüklendiğinde turları çek
document.addEventListener('DOMContentLoaded', () => {
    window.dynamicTours.loadTours();
});