// public/js/dynamic-tours.js - Ana sayfa dinamik turlar
class DynamicTours {
    constructor() {
        this.tours = [];
        this.categories = [];
    }

    async loadTours() {
        try {
            console.log('🚌 Turlar yükleniyor...');
            
            // Turları ve kategorileri paralel olarak çek
            const [toursResponse, categoriesResponse] = await Promise.all([
                fetch('/api/tours?limit=6&status=active'),
                fetch('/api/categories')
            ]);
            
            if (toursResponse.ok && categoriesResponse.ok) {
                const toursData = await toursResponse.json();
                const categoriesData = await categoriesResponse.json();
                
                this.tours = toursData.data.tours;
                this.categories = categoriesData.data.categories;
                
                console.log('✅ Turlar yüklendi:', this.tours.length);
                console.log('✅ Kategoriler yüklendi:', this.categories.length);
                
                this.renderTours();
            } else {
                console.error('❌ API hatası');
                this.showError();
            }
        } catch (error) {
            console.error('❌ Tur yükleme hatası:', error);
            this.showError();
        }
    }

    renderTours() {
        const toursContainer = document.getElementById('dynamic-tours-container');
        if (!toursContainer) {
            console.error('❌ Tours container bulunamadı');
            return;
        }

        if (!this.tours || this.tours.length === 0) {
            toursContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-600">Henüz aktif tur bulunmuyor.</p>
                </div>
            `;
            return;
        }

        toursContainer.innerHTML = this.tours.map(tour => this.renderTourCard(tour)).join('');
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

        return `
            <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-semibold text-gray-800">${tour.title}</h3>
                        <span class="px-3 py-1 rounded-full text-sm ${badgeClass}">
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
                            ${tour.formatted_price_try || '₺' + (tour.price_try || 0).toLocaleString('tr-TR')}
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

    showTourDetail(slug) {
        // Şimdilik contact form'a scroll yapalım, ileride detay sayfasına yönlendireceğiz
        console.log('🔗 Tur detayı:', slug);
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
        const toursContainer = document.getElementById('dynamic-tours-container');
        if (toursContainer) {
            toursContainer.innerHTML = `
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
    }
}

// Global instance
window.dynamicTours = new DynamicTours();

// Sayfa yüklendiğinde turları çek
document.addEventListener('DOMContentLoaded', () => {
    window.dynamicTours.loadTours();
});
