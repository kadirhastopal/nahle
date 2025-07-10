// admin/js/tours.js - Admin tur yönetimi (DÜZELTİLMİŞ)
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
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-800">Tur Yönetimi</h3>
                        <button 
                            onclick="toursManager.showAddTourModal()"
                            class="bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-secondary transition-colors"
                        >
                            + Yeni Tur Ekle
                        </button>
                    </div>
                    <div class="flex gap-2 mb-4">
                        ${this.renderFilterButtons()}
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tur</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${filteredTours.map(tour => this.renderTourRow(tour)).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${filteredTours.length === 0 ? `
                    <div class="text-center py-8">
                        <p class="text-gray-500">Henüz tur bulunmuyor.</p>
                    </div>
                ` : ''}
            </div>
            
            ${this.renderTourModal()}
        `;
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
                class="px-3 py-1 rounded text-sm ${
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

    renderTourRow(tour) {
        const categoryName = tour.Category ? tour.Category.name : 'Kategori Yok';
        const statusColor = tour.status === 'active' ? 'green' : tour.status === 'inactive' ? 'yellow' : 'red';
        const statusText = tour.status === 'active' ? 'Aktif' : tour.status === 'inactive' ? 'Pasif' : 'Dolu';

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
                            <div class="text-sm font-medium text-gray-900">${tour.title}</div>
                            <div class="text-sm text-gray-500">${tour.duration_days} gün</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${categoryName}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-900">
                        ${tour.price_try ? new Intl.NumberFormat('tr-TR').format(tour.price_try) + ' ₺' : 'Belirtilmemiş'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${tour.available_quota}/${tour.quota}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                        <button 
                            onclick="toursManager.editTour(${tour.id})"
                            class="text-blue-600 hover:text-blue-900 p-1"
                            title="Düzenle"
                        >
                            ✏️
                        </button>
                        <button 
                            onclick="toursManager.toggleTourStatus(${tour.id})"
                            class="text-yellow-600 hover:text-yellow-900 p-1"
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
        return `
            <div id="tourModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
                    <div class="mt-3">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900" id="tourModalTitle">Yeni Tur Ekle</h3>
                            <button onclick="toursManager.closeTourModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form id="tourForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Tur Adı *</label>
                                    <input type="text" name="title" required 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                                    <select name="category_id" required 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                        <option value="">Kategori Seçin</option>
                                        ${this.categories.map(cat => `
                                            <option value="${cat.id}">${cat.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea name="description" rows="3" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
                                <input type="text" name="short_description" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Süre (Gün) *</label>
                                    <input type="number" name="duration_days" required min="1" max="365" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                                    <input type="number" name="price_try" min="0" step="0.01" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Kota *</label>
                                    <input type="number" name="quota" required min="1" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                                    <input type="date" name="start_date" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                                    <input type="date" name="end_date" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Otel Bilgileri</label>
                                <textarea name="hotel_info" rows="2" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Dahil Olan Hizmetler</label>
                                <textarea name="included_services" rows="2" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Dahil Olmayan Hizmetler</label>
                                <textarea name="excluded_services" rows="2" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onclick="toursManager.closeTourModal()" 
                                        class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                                    İptal
                                </button>
                                <button type="submit" 
                                        class="px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors">
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    showAddTourModal() {
        this.editingTour = null;
        document.getElementById('tourModalTitle').textContent = 'Yeni Tur Ekle';
        document.getElementById('tourModal').classList.remove('hidden');
        
        // Form'u temizle
        const form = document.getElementById('tourForm');
        form.reset();
        
        // Form submit event'ini ekle
        this.setupFormEventListener();
    }

    async editTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        this.editingTour = tour;
        document.getElementById('tourModalTitle').textContent = 'Tur Düzenle';
        document.getElementById('tourModal').classList.remove('hidden');
        
        // Form'u doldur
        const form = document.getElementById('tourForm');
        form.elements.title.value = tour.title || '';
        form.elements.category_id.value = tour.category_id || '';
        form.elements.description.value = tour.description || '';
        form.elements.short_description.value = tour.short_description || '';
        form.elements.duration_days.value = tour.duration_days || '';
        form.elements.price_try.value = tour.price_try || '';
        form.elements.quota.value = tour.quota || '';
        form.elements.start_date.value = tour.start_date || '';
        form.elements.end_date.value = tour.end_date || '';
        form.elements.hotel_info.value = tour.hotel_info || '';
        form.elements.included_services.value = tour.included_services || '';
        form.elements.excluded_services.value = tour.excluded_services || '';
        
        // Form submit event'ini ekle
        this.setupFormEventListener();
    }

    setupFormEventListener() {
        const form = document.getElementById('tourForm');
        
        // Önceki event listener'ları kaldır
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveTour(newForm);
        });
    }

    async saveTour(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const tourData = Object.fromEntries(formData.entries());
            
            // Boş değerleri null yap
            Object.keys(tourData).forEach(key => {
                if (tourData[key] === '') {
                    tourData[key] = null;
                }
            });

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
                this.showSuccess(result.message);
                this.loadTours();
                this.closeTourModal();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Tour save error:', error);
            this.showError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    closeTourModal() {
        document.getElementById('tourModal').classList.add('hidden');
        this.editingTour = null;
    }

    async toggleTourStatus(tourId) {
        try {
            const response = await fetch(`/api/admin/tours/${tourId}/toggle-status`, {
                method: 'PATCH',
                headers: authManager.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message);
                this.loadTours();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Tour status toggle error:', error);
            this.showError('Durum değiştirilemedi');
        }
    }

    async deleteTour(tourId) {
        if (!confirm('Bu turu silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                method: 'DELETE',
                headers: authManager.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message);
                this.loadTours();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Tour delete error:', error);
            this.showError('Tur silinemedi');
        }
    }

    showImageUpload(tourId) {
        if (window.imageUploader) {
            imageUploader.showUploadModal(tourId);
        } else {
            this.showError('Resim yükleme özelliği henüz aktif değil');
        }
    }

    showSuccess(message) {
        this.showNotification('success', message);
    }

    showError(message) {
        this.showNotification('error', message);
    }

    showNotification(type, message) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    ${type === 'success' 
                        ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
                        : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
                    }
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium">${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global instance oluştur
if (typeof window !== 'undefined') {
    window.toursManager = new ToursManager();
    console.log('✅ Tours Manager hazır!');
}