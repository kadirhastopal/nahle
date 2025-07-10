// admin/js/categories.js - Admin kategori yönetimi (DÜZELTİLMİŞ)
class CategoriesManager {
    constructor() {
        this.categories = [];
        this.editingCategory = null;
    }

    async loadCategories() {
        try {
            console.log('📂 Admin kategoriler yükleniyor...');
            
            const response = await fetch('/api/admin/categories?limit=50', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.categories = data.data.categories;
                
                console.log('✅ Admin kategoriler yüklendi:', this.categories.length, 'kategori');
                this.renderCategories();
            } else {
                console.error('❌ Admin categories API hatası');
                this.showError('Kategoriler yüklenirken hata oluştu');
            }
        } catch (error) {
            console.error('❌ Admin categories yükleme hatası:', error);
            this.showError('Bağlantı hatası');
        }
    }

    renderCategories() {
        const container = document.getElementById('categoriesContent');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-800">Kategori Yönetimi</h3>
                        <button 
                            onclick="categoriesManager.showAddCategoryModal()"
                            class="bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-secondary transition-colors"
                        >
                            + Yeni Kategori Ekle
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tur Sayısı</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.categories.map(category => this.renderCategoryRow(category)).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${this.categories.length === 0 ? `
                    <div class="text-center py-8">
                        <p class="text-gray-500">Henüz kategori bulunmuyor.</p>
                    </div>
                ` : ''}
            </div>
            
            ${this.renderCategoryModal()}
        `;
    }

    renderCategoryRow(category) {
        const statusColor = category.status === 'active' ? 'green' : 'yellow';
        const statusText = category.status === 'active' ? 'Aktif' : 'Pasif';
        const tourCount = category.Tours ? category.Tours.length : 0;

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-lg bg-admin-light flex items-center justify-center">
                                <span class="text-admin-primary text-sm font-semibold">📂</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${category.name}</div>
                            <div class="text-sm text-gray-500">${category.slug}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-900">${category.description || 'Açıklama yok'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${tourCount} tur</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                        <button 
                            onclick="categoriesManager.editCategory(${category.id})"
                            class="text-blue-600 hover:text-blue-900 p-1"
                            title="Düzenle"
                        >
                            ✏️
                        </button>
                        <button 
                            onclick="categoriesManager.toggleCategoryStatus(${category.id})"
                            class="text-yellow-600 hover:text-yellow-900 p-1"
                            title="${category.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}"
                        >
                            ${category.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button 
                            onclick="categoriesManager.deleteCategory(${category.id})"
                            class="text-red-600 hover:text-red-900 p-1"
                            title="Sil"
                        >
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
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
                                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı *</label>
                                <input type="text" name="name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input type="text" name="slug" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                                       placeholder="Otomatik oluşturulacak">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea name="description" rows="3" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onclick="categoriesManager.closeCategoryModal()" 
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

    showAddCategoryModal() {
        this.editingCategory = null;
        document.getElementById('categoryModalTitle').textContent = 'Yeni Kategori Ekle';
        document.getElementById('categoryModal').classList.remove('hidden');
        
        // Form'u temizle
        const form = document.getElementById('categoryForm');
        form.reset();
        
        // Form submit event'ini ekle
        this.setupFormEventListener();
        
        // Name input'una slug oluşturma event'i ekle
        this.setupSlugGeneration();
    }

    async editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        this.editingCategory = category;
        document.getElementById('categoryModalTitle').textContent = 'Kategori Düzenle';
        document.getElementById('categoryModal').classList.remove('hidden');
        
        // Form'u doldur
        const form = document.getElementById('categoryForm');
        form.elements.name.value = category.name || '';
        form.elements.slug.value = category.slug || '';
        form.elements.description.value = category.description || '';
        
        // Form submit event'ini ekle
        this.setupFormEventListener();
        
        // Name input'una slug oluşturma event'i ekle
        this.setupSlugGeneration();
    }

    setupSlugGeneration() {
        const nameInput = document.querySelector('#categoryForm input[name="name"]');
        const slugInput = document.querySelector('#categoryForm input[name="slug"]');
        
        if (nameInput && slugInput) {
            nameInput.addEventListener('input', (e) => {
                if (!this.editingCategory) {
                    const slug = this.generateSlug(e.target.value);
                    slugInput.value = slug;
                }
            });
        }
    }

    generateSlug(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    setupFormEventListener() {
        const form = document.getElementById('categoryForm');
        
        // Önceki event listener'ları kaldır
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCategory(newForm);
        });
        
        // Slug generation'ı yeniden kur
        setTimeout(() => this.setupSlugGeneration(), 100);
    }

    async saveCategory(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const categoryData = Object.fromEntries(formData.entries());
            
            // Boş değerleri null yap
            Object.keys(categoryData).forEach(key => {
                if (categoryData[key] === '') {
                    categoryData[key] = null;
                }
            });

            const url = this.editingCategory 
                ? `/api/admin/categories/${this.editingCategory.id}`
                : '/api/admin/categories';
            
            const method = this.editingCategory ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                body: JSON.stringify(categoryData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message);
                this.loadCategories();
                this.closeCategoryModal();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Category save error:', error);
            this.showError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.add('hidden');
        this.editingCategory = null;
    }

    async toggleCategoryStatus(categoryId) {
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}/toggle-status`, {
                method: 'PATCH',
                headers: authManager.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message);
                this.loadCategories();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Category status toggle error:', error);
            this.showError('Durum değiştirilemedi');
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye bağlı turlar etkilenebilir.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: authManager.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message);
                this.loadCategories();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Category delete error:', error);
            this.showError('Kategori silinemedi');
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
    window.categoriesManager = new CategoriesManager();
    console.log('✅ Categories Manager hazır!');
}