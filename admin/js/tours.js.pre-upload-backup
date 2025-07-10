// admin/js/tours.js - Admin tur yönetimi
class ToursManager {
    constructor() {
        this.tours = [];
        this.categories = [];
        this.editingTour = null;
    }

    async loadTours() {
        try {
            console.log('🚌 Admin turlar yükleniyor...');
            
            const [toursResponse, categoriesResponse] = await Promise.all([
                fetch('/api/tours?limit=50', {
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
                
                console.log('✅ Admin turlar yüklendi:', this.tours.length);
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
                            ${this.tours.map(tour => this.renderTourRow(tour)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            ${this.renderTourModal()}
        `;
    }

    renderTourRow(tour) {
        const category = this.categories.find(cat => cat.id === tour.category_id);
        const statusColors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-red-100 text-red-800',
            'full': 'bg-yellow-100 text-yellow-800'
        };

        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="font-medium text-gray-900">${tour.title}</div>
                        <div class="text-sm text-gray-500">${tour.duration_days} gün</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        ${category ? category.name : 'Kategori yok'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${tour.formatted_price_try || '₺' + (tour.price_try || 0).toLocaleString('tr-TR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${tour.available_quota} / ${tour.quota}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColors[tour.status]}">
                        ${tour.status === 'active' ? 'Aktif' : tour.status === 'inactive' ? 'Pasif' : 'Dolu'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                        <button 
                            onclick="toursManager.editTour(${tour.id})"
                            class="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                        >
                            ✏️
                        </button>
                        <button 
                            onclick="toursManager.toggleTourStatus(${tour.id})"
                            class="text-yellow-600 hover:text-yellow-900"
                            title="${tour.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}"
                        >
                            ${tour.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button 
                            onclick="toursManager.deleteTour(${tour.id})"
                            class="text-red-600 hover:text-red-900"
                            title="Sil"
                        >
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderTourModal() {
        return `
            <div id="tourModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
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
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Tur Adı</label>
                                    <input type="text" name="title" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select name="category_id" required 
                                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent">
                                        <option value="">Kategori Seçin</option>
                                        ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
                                <input type="text" name="short_description" 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                                       placeholder="Örn: 15 günlük program, 3-4 kişilik odalar">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Detaylı Açıklama</label>
                                <textarea name="description" rows="3"
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"></textarea>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Süre (Gün)</label>
                                    <input type="number" name="duration_days" required min="1" max="365"
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                                    <input type="number" name="price_try" required min="0" step="0.01"
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Toplam Kota</label>
                                    <input type="number" name="quota" required min="1"
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent">
                                </div>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4">
                                <button type="button" onclick="toursManager.closeTourModal()"
                                        class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                    İptal
                                </button>
                                <button type="submit"
                                        class="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-secondary transition-colors">
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
        document.getElementById('tourForm').reset();
        document.getElementById('tourModal').classList.remove('hidden');
    }

    editTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        this.editingTour = tour;
        document.getElementById('tourModalTitle').textContent = 'Tur Düzenle';
        
        const form = document.getElementById('tourForm');
        form.title.value = tour.title;
        form.category_id.value = tour.category_id;
        form.short_description.value = tour.short_description || '';
        form.description.value = tour.description || '';
        form.duration_days.value = tour.duration_days;
        form.price_try.value = tour.price_try;
        form.quota.value = tour.quota;
        
        document.getElementById('tourModal').classList.remove('hidden');
    }

    closeTourModal() {
        document.getElementById('tourModal').classList.add('hidden');
        this.editingTour = null;
    }

    async toggleTourStatus(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        const newStatus = tour.status === 'active' ? 'inactive' : 'active';
        
        try {
            const response = await fetch(`/api/admin/tours/${tourId}/status`, {
                method: 'PUT',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                tour.status = newStatus;
                this.renderTours();
                this.showSuccess(`Tur durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı`);
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            this.showError('Tur durumu güncellenirken hata oluştu');
        }
    }

    async deleteTour(tourId) {
        if (!confirm('Bu turu silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                method: 'DELETE',
                headers: authManager.getAuthHeaders()
            });
            
            if (response.ok) {
                this.tours = this.tours.filter(t => t.id !== tourId);
                this.renderTours();
                this.showSuccess('Tur silindi');
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            this.showError('Tur silinirken hata oluştu');
        }
    }

    showSuccess(message) {
        this.showNotification('success', message);
    }

    showError(message) {
        this.showNotification('error', message);
    }

    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Global tours manager instance
window.toursManager = new ToursManager();
