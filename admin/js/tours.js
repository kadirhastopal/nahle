// admin/js/tours.js - Güncellenmiş Admin Tur Yönetimi
class ToursManager {
    constructor() {
        this.tours = [];
        this.categories = [];
        this.editingTour = null;
        this.filterStatus = 'all';
    }

    async loadTours() {
        try {
            console.log('🚌 Admin turlar yükleniyor...');
            
            const [toursResponse, categoriesResponse] = await Promise.all([
                fetch('/api/admin/tours?limit=50', {
                    headers: authManager.getAuthHeaders()
                }),
                fetch('/api/categories', {
                    headers: authManager.getAuthHeaders()
                })
            ]);

            if (toursResponse.ok && categoriesResponse.ok) {
                const toursData = await toursResponse.json();
                const categoriesData = await categoriesResponse.json();
                
                this.tours = toursData.data.tours;
                this.categories = categoriesData.data.categories;
                
                console.log('✅ Admin turlar yüklendi:', this.tours.length, 'tur');
                this.renderTours();
            } else {
                console.error('❌ Admin tours API hatası');
                this.showError('Turlar yüklenirken hata oluştu');
            }
        } catch (error) {
            console.error('❌ Admin tours yükleme hatası:', error);
            this.showError('Bağlantı hatası');
        }
    }

    renderTours() {
        const container = document.getElementById('toursContent');
        if (!container) return;

        // Filtrelenmiş turlar
        const filteredTours = this.filterStatus === 'all' 
            ? this.tours 
            : this.tours.filter(tour => tour.status === this.filterStatus);

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800">Tur Yönetimi</h3>
                            <p class="text-gray-600 text-sm mt-1">${filteredTours.length} tur görüntüleniyor</p>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                onclick="toursManager.showAddTourModal()"
                                class="bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-secondary transition-colors flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Yeni Tur Ekle
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filter Buttons -->
                    <div class="flex flex-wrap gap-2">
                        ${this.renderFilterButtons()}
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tur Bilgileri</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${filteredTours.length > 0 
                                ? filteredTours.map(tour => this.renderTourRow(tour)).join('')
                                : this.renderEmptyState()
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
            ${this.renderTourModal()}
        `;

        // Form kurulumu için callback
        setTimeout(() => {
            this.setupExtendedForm();
        }, 100);
    }

    renderFilterButtons() {
        const filters = [
            { key: 'all', label: 'Tümü', count: this.tours.length },
            { key: 'active', label: 'Aktif', count: this.tours.filter(t => t.status === 'active').length },
            { key: 'inactive', label: 'Pasif', count: this.tours.filter(t => t.status === 'inactive').length },
            { key: 'full', label: 'Dolu', count: this.tours.filter(t => t.status === 'full').length }
        ];

        return filters.map(filter => `
            <button 
                onclick="toursManager.setFilter('${filter.key}')"
                class="px-3 py-1 text-sm rounded-lg transition-colors ${
                    this.filterStatus === filter.key 
                        ? 'bg-admin-primary text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }"
            >
                ${filter.label} (${filter.count})
            </button>
        `).join('');
    }

    setFilter(status) {
        this.filterStatus = status;
        this.renderTours();
    }

    renderEmptyState() {
        return `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <p class="text-lg font-medium">Henüz tur bulunmuyor</p>
                        <p class="text-sm text-gray-400 mt-1">İlk turunuzu eklemek için "Yeni Tur Ekle" butonunu kullanın</p>
                    </div>
                </td>
            </tr>
        `;
    }

    renderTourRow(tour) {
        const categoryName = tour.Category ? tour.Category.name : 'Kategori Yok';
        const statusColor = tour.status === 'active' ? 'green' : tour.status === 'inactive' ? 'yellow' : 'red';
        const statusText = tour.status === 'active' ? 'Aktif' : tour.status === 'inactive' ? 'Pasif' : 'Dolu';
        const featuredBadge = tour.featured ? '<span class="text-yellow-500 text-xs">⭐</span>' : '';

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-lg bg-admin-light flex items-center justify-center">
                                <span class="text-admin-primary text-sm font-semibold">🚌</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 flex items-center gap-1">
                                ${tour.title} ${featuredBadge}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${tour.duration_days} gün
                                ${tour.duration_nights ? `/ ${tour.duration_nights} gece` : ''}
                                ${tour.mekke_nights ? `• Mekke: ${tour.mekke_nights}` : ''}
                                ${tour.medine_nights ? `• Medine: ${tour.medine_nights}` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${categoryName}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-900">
                        ${tour.price_try ? new Intl.NumberFormat('tr-TR', { 
                            style: 'currency', 
                            currency: 'TRY',
                            minimumFractionDigits: 0 
                        }).format(tour.price_try) : 'Belirtilmemiş'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${tour.quota || '-'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColor === 'green' ? 'bg-green-100 text-green-800' :
                        statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            onclick="toursManager.editTour(${tour.id})"
                            class="text-admin-primary hover:text-admin-secondary p-1"
                            title="Düzenle"
                        >
                            ✏️
                        </button>
                        <button 
                            onclick="toursManager.toggleTourStatus(${tour.id})"
                            class="text-blue-600 hover:text-blue-900 p-1"
                            title="${tour.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}"
                        >
                            ${tour.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button 
                            onclick="toursManager.deleteTour(${tour.id})"
                            class="text-red-600 hover:text-red-900 p-1"
                            title="Sil"
                        >
                            🗑️
                        </button>
                        <button 
                            onclick="toursManager.showImageUpload(${tour.id})"
                            class="text-green-600 hover:text-green-900 p-1"
                            title="Resim Yükle"
                        >
                            📸
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderTourModal() {
        // Genişletilmiş form HTML'ini kullan
        return extendedTourForm.renderExtendedTourModal();
    }

    setupExtendedForm() {
        // Form submit event'ini kur
        const form = document.getElementById('tourForm');
        if (form) {
            // Önceki event listener'ları kaldır
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveTour(newForm);
            });

            // Kategorileri yükle
            extendedTourForm.loadCategories();
        }
    }

    showAddTourModal() {
        this.editingTour = null;
        document.getElementById('tourModalTitle').textContent = 'Yeni Tur Ekle';
        document.getElementById('tourModal').classList.remove('hidden');
        
        // Extended form'u sıfırla
        extendedTourForm.resetForm();
        
        // Form'u temizle
        const form = document.getElementById('tourForm');
        if (form) {
            form.reset();
        }
        
        // Kategorileri yükle
        setTimeout(() => {
            extendedTourForm.loadCategories();
        }, 100);
    }

    async editTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        this.editingTour = tour;
        document.getElementById('tourModalTitle').textContent = 'Tur Düzenle';
        document.getElementById('tourModal').classList.remove('hidden');
        
        // Extended form'u sıfırla
        extendedTourForm.resetForm();
        
        // Kategorileri yükle ve sonra form'u doldur
        setTimeout(() => {
            extendedTourForm.loadCategories().then(() => {
                extendedTourForm.populateForm(tour);
            });
        }, 100);
    }

    async saveTour(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            // Extended form'dan verileri al
            const tourData = extendedTourForm.collectFormData();
            
            console.log('💾 Kaydedilecek tur verileri:', tourData);

            const url = this.editingTour 
                ? `/api/admin/tours/${this.editingTour.id}`
                : '/api/admin/tours';
            
            const method = this.editingTour ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                body: JSON.stringify(tourData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message || 'Tur başarıyla kaydedildi');
                await this.loadTours();
                this.closeTourModal();
            } else {
                this.showError(result.message || 'Kaydetme işlemi başarısız');
            }
        } catch (error) {
            console.error('❌ Tour save error:', error);
            this.showError('Bir hata oluştu: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    closeTourModal() {
        document.getElementById('tourModal').classList.add('hidden');
        this.editingTour = null;
        extendedTourForm.resetForm();
    }

    async toggleTourStatus(tourId) {
        try {
            const tour = this.tours.find(t => t.id === tourId);
            if (!tour) return;

            const newStatus = tour.status === 'active' ? 'inactive' : 'active';
            
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(`Tur durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi`);
                await this.loadTours();
            } else {
                this.showError(result.message || 'Durum güncellenirken hata oluştu');
            }
        } catch (error) {
            console.error('❌ Status toggle error:', error);
            this.showError('Bağlantı hatası');
        }
    }

    async deleteTour(tourId) {
        if (!confirm('Bu turu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                method: 'DELETE',
                headers: authManager.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess('Tur başarıyla silindi');
                await this.loadTours();
            } else {
                this.showError(result.message || 'Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('❌ Delete tour error:', error);
            this.showError('Bağlantı hatası');
        }
    }

    showImageUpload(tourId) {
        // Resim yükleme modalını göster
        console.log('🖼️ Resim yükleme:', tourId);
        this.showInfo('Resim yükleme özelliği yakında eklenecek');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Mevcut bildirimleri kaldır
        const existingNotifications = document.querySelectorAll('.tour-notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `tour-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${
                    type === 'success' ? '✅' :
                    type === 'error' ? '❌' :
                    'ℹ️'
                }</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 5 saniye sonra otomatik kaldır
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
} // ✅ ToursManager class'ının kapanış parantezi

// ✅ Global instance oluştur
if (typeof window !== 'undefined') {
    window.toursManager = new ToursManager();
    console.log('✅ ToursManager global olarak hazır!');
}