// admin/js/categories.js - Kategori yönetimi
class CategoriesManager {
    constructor() {
        this.categories = [];
        this.editingCategory = null;
    }

    async loadCategories() {
        try {
            console.log('📂 Kategoriler yükleniyor...');
            
            const response = await fetch('/api/categories', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.categories = data.data.categories;
                console.log('✅ Kategoriler yüklendi:', this.categories.length);
                this.renderCategories();
            } else {
                console.error('❌ Categories API hatası');
                this.showError('Kategoriler yüklenirken hata oluştu');
            }
        } catch (error) {
            console.error('❌ Categories yükleme hatası:', error);
            this.showError('Bağlantı hatası');
        }
    }

    renderCategories() {
        const container = document.getElementById('categoriesContent');
        if (!container) return;

        if (!this.categories || this.categories.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <div class="text-center py-8">
                        <div class="text-gray-400 mb-4">
                            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13V12a1 1 0 011-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <p class="text-gray-500 mb-4">Henüz kategori bulunmuyor</p>
                        <button 
                            onclick="categoriesManager.showAddCategoryModal()"
                            class="bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-secondary transition-colors">
                            + İlk Kategoriyi Ekle
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-800">Kategori Yönetimi</h3>
                        <button 
                            onclick="categoriesManager.showAddCategoryModal()"
                            class="bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-secondary transition-colors">
                            + Yeni Kategori Ekle
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    ${this.categories.map(category => this.renderCategoryCard(category)).join('')}
                </div>
            </div>
            
            ${this.renderCategoryModal()}
        `;
    }

    renderCategoryCard(category) {
        const statusColor = category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const statusText = category.status === 'active' ? 'Aktif' : 'Pasif';

        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-lg font-semibold text-gray-800">${category.name}</h4>
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">
                        ${statusText}
                    </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                    ${category.description || 'Açıklama bulunmuyor'}
                </p>
                
                <div class="text-xs text-gray-500 mb-4">
                    <strong>Slug:</strong> ${category.slug}
                </div>
                
                <div class="flex justify-between items-center">
                    <div class="flex gap-2">
                        <button 
                            onclick="categoriesManager.editCategory(${category.id})"
                            class="text-blue-600 hover:text-blue-900 text-sm"
                            title="Düzenle">
                            ✏️ Düzenle
                        </button>
                        <button 
                            onclick="categoriesManager.toggleCategoryStatus(${category.id})"
                            class="text-yellow-600 hover:text-yellow-900 text-sm"
                            title="${category.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}">
                            ${category.status === 'active' ? '⏸️ Pasif Yap' : '▶️ Aktif Yap'}
                        </button>
                    </div>
                    <button 
                        onclick="categoriesManager.deleteCategory(${category.id})"
                        class="text-red-600 hover:text-red-900 text-sm"
                        title="Sil">
                        🗑️ Sil
                    </button>
                </div>
            </div>
        `;
    }

    renderCategoryModal() {
        return `
            <div id="categoryModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900" id="categoryModalTitle">Yeni Kategori Ekle</h3>
                            <button onclick="categoriesManager.closeCategoryModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form id="categoryForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                                <input type="text" name="name" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                                       placeholder="Örn: Hac Turları">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL için)</label>
                                <input type="text" name="slug" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                                       placeholder="Örn: hac-turlari">
                                <p class="text-xs text-gray-500 mt-1">Küçük harf ve tire kullanın</p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea name="description" rows="3"
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                                          placeholder="Kategori açıklaması..."></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4">
                                <button type="button" onclick="categoriesManager.closeCategoryModal()"
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

    showAddCategoryModal() {
        this.editingCategory = null;
        document.getElementById('categoryModalTitle').textContent = 'Yeni Kategori Ekle';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryModal').classList.remove('hidden');
    }

    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        this.editingCategory = category;
        document.getElementById('categoryModalTitle').textContent = 'Kategori Düzenle';
        
        const form = document.getElementById('categoryForm');
        form.name.value = category.name;
        form.slug.value = category.slug;
        form.description.value = category.description || '';
        
        document.getElementById('categoryModal').classList.remove('hidden');
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.add('hidden');
        this.editingCategory = null;
    }

    async toggleCategoryStatus(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        const newStatus = category.status === 'active' ? 'inactive' : 'active';
        
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}/status`, {
                method: 'PUT',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                category.status = newStatus;
                this.renderCategories();
                this.showSuccess(`Kategori durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı`);
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            this.showError('Kategori durumu güncellenirken hata oluştu');
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: authManager.getAuthHeaders()
            });
            
            if (response.ok) {
                this.categories = this.categories.filter(c => c.id !== categoryId);
                this.renderCategories();
                this.showSuccess('Kategori silindi');
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            this.showError('Kategori silinirken hata oluştu');
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

// Global categories manager instance
window.categoriesManager = new CategoriesManager();
