// Categories Page Module
class CategoriesPage {
    constructor() {
        this.categories = [];
        this.currentCategory = null;
        this.showForm = false;
    }

    async render() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading
        contentArea.innerHTML = this.getLoadingHTML();
        
        try {
            // Load data
            await this.loadCategories();
            
            // Render content
            if (this.showForm) {
                contentArea.innerHTML = this.getCategoryFormHTML();
                this.bindFormEvents();
            } else {
                contentArea.innerHTML = this.getCategoriesListHTML();
                this.bindListEvents();
            }
            
        } catch (error) {
            console.error('Categories load error:', error);
            contentArea.innerHTML = this.getErrorHTML();
        }
    }

    async loadCategories() {
        try {
            const response = await adminAPI.getCategories();
            if (response.success) {
                this.categories = response.data.categories;
            }
        } catch (error) {
            console.error('Load categories error:', error);
            this.categories = [];
        }
    }

    getCategoriesListHTML() {
        return `
            <div class="card">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-heading">Kategori Yönetimi</h3>
                            <p class="text-secondary mt-1">Tur kategorilerinizi buradan yönetebilirsiniz</p>
                        </div>
                        <button onclick="window.categoriesPage.showNewCategoryForm()" class="btn-primary">
                            <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                            </svg>
                            Yeni Kategori Ekle
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    ${this.categories.length === 0 ? this.getEmptyStateHTML() : this.getCategoriesTableHTML()}
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                </div>
                <h3 class="empty-state-title">Varsayılan kategoriler mevcut</h3>
                <p class="empty-state-text">Yeni kategori ekleyebilir veya mevcut olanları düzenleyebilirsiniz.</p>
                <button onclick="window.categoriesPage.showNewCategoryForm()" class="btn-primary">
                    Yeni Kategori Ekle
                </button>
            </div>
        `;
    }

    getCategoriesTableHTML() {
        return `
            <div class="overflow-x-auto">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Kategori Adı</th>
                            <th>Slug</th>
                            <th>Açıklama</th>
                            <th>Sıralama</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.categories.map(category => `
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-admin-primary rounded-lg mr-3 flex items-center justify-center">
                                            <span class="text-white text-sm font-bold">${category.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div class="font-semibold text-gray-900">${category.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="text-sm text-gray-600 font-mono">${category.slug}</span>
                                </td>
                                <td>
                                    <div class="text-sm text-gray-600 max-w-xs truncate">
                                        ${category.description || '-'}
                                    </div>
                                </td>
                                <td>
                                    <span class="text-sm font-medium text-gray-900">${category.sort_order}</span>
                                </td>
                                <td>
                                    <span class="status-${category.status}">${this.getStatusText(category.status)}</span>
                                </td>
                                <td>
                                    <div class="flex space-x-2">
                                        <button onclick="window.categoriesPage.editCategory(${category.id})" class="action-btn action-btn-edit">
                                            Düzenle
                                        </button>
                                        <button onclick="window.categoriesPage.deleteCategory(${category.id})" class="action-btn action-btn-delete">
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getCategoryFormHTML() {
        const isEdit = this.currentCategory !== null;
        const category = this.currentCategory || {};
        
        return `
            <div class="card">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-heading">
                                ${isEdit ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                            </h3>
                            <p class="text-secondary mt-1">${isEdit ? 'Kategori bilgilerini güncelleyin' : 'Yeni bir kategori oluşturun'}</p>
                        </div>
                        <button onclick="window.categoriesPage.showCategoriesList()" class="btn-secondary">
                            ← Geri Dön
                        </button>
                    </div>
                </div>
                
                <form id="categoryForm" class="p-6">
                    <div class="space-y-6">
                        <div class="form-row form-row-2">
                            <div>
                                <label class="form-label">Kategori Adı *</label>
                                <input type="text" name="name" value="${category.name || ''}" class="form-input" placeholder="Örn: Umre Turları" required>
                            </div>
                            
                            <div>
                                <label class="form-label">URL Slug *</label>
                                <input type="text" name="slug" value="${category.slug || ''}" class="form-input" placeholder="Örn: umre-turlari" required>
                                <p class="text-sm text-gray-500 mt-1">URL'de görünecek kısım (otomatik oluşur)</p>
                            </div>
                        </div>
                        
                        <div>
                            <label class="form-label">Açıklama</label>
                            <textarea name="description" rows="3" class="form-input" placeholder="Kategori hakkında kısa açıklama...">${category.description || ''}</textarea>
                        </div>
                        
                        <div class="form-row form-row-3">
                            <div>
                                <label class="form-label">Sıralama</label>
                                <input type="number" name="sort_order" value="${category.sort_order || '0'}" class="form-input" placeholder="0">
                                <p class="text-sm text-gray-500 mt-1">Küçük sayılar önce görünür</p>
                            </div>
                            
                            <div>
                                <label class="form-label">Durum</label>
                                <select name="status" class="form-input">
                                    <option value="active" ${category.status === 'active' ? 'selected' : ''}>Aktif</option>
                                    <option value="inactive" ${category.status === 'inactive' ? 'selected' : ''}>Pasif</option>
                                </select>
                            </div>
                            
                            <div class="flex items-end">
                                <label class="flex items-center">
                                    <input type="checkbox" name="show_in_menu" ${category.show_in_menu !== false ? 'checked' : ''} class="mr-3 rounded border-gray-300">
                                    <span class="form-label mb-0">Menüde Göster</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="border-t border-gray-200 pt-6">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">SEO Ayarları</h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="form-label">Meta Başlık</label>
                                    <input type="text" name="meta_title" value="${category.meta_title || ''}" class="form-input" placeholder="SEO için sayfa başlığı">
                                </div>
                                
                                <div>
                                    <label class="form-label">Meta Açıklama</label>
                                    <textarea name="meta_description" rows="2" class="form-input" placeholder="SEO için sayfa açıklaması (160 karakter)">${category.meta_description || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                        <div class="text-sm text-gray-500">
                            * işaretli alanlar zorunludur
                        </div>
                        <div class="flex space-x-4">
                            <button type="button" onclick="window.categoriesPage.showCategoriesList()" class="btn-secondary">
                                İptal
                            </button>
                            <button type="submit" class="btn-primary">
                                ${isEdit ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    bindListEvents() {
        // List events are bound via onclick attributes
    }

    bindFormEvents() {
        const form = document.getElementById('categoryForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Auto-generate slug from name
            const nameInput = form.querySelector('input[name="name"]');
            const slugInput = form.querySelector('input[name="slug"]');
            
            if (nameInput && slugInput) {
                nameInput.addEventListener('input', (e) => {
                    if (!this.currentCategory) { // Only auto-generate for new categories
                        slugInput.value = this.generateSlug(e.target.value);
                    }
                });
            }
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const categoryData = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            description: formData.get('description'),
            sort_order: parseInt(formData.get('sort_order')) || 0,
            status: formData.get('status'),
            show_in_menu: formData.get('show_in_menu') ? true : false,
            meta_title: formData.get('meta_title'),
            meta_description: formData.get('meta_description')
        };

        try {
            let response;
            if (this.currentCategory) {
                response = await adminAPI.updateCategory(this.currentCategory.id, categoryData);
            } else {
                response = await adminAPI.createCategory(categoryData);
            }

            if (response.success) {
                showToast(this.currentCategory ? 'Kategori güncellendi!' : 'Kategori eklendi!', 'success');
                this.showCategoriesList();
            }
        } catch (error) {
            showToast('Hata: ' + error.message, 'error');
        }
    }

    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Aktif',
            'inactive': 'Pasif'
        };
        return statusMap[status] || status;
    }

    showNewCategoryForm() {
        this.currentCategory = null;
        this.showForm = true;
        this.render();
    }

    showCategoriesList() {
        this.showForm = false;
        this.currentCategory = null;
        this.render();
    }

    async editCategory(categoryId) {
        try {
            this.currentCategory = this.categories.find(c => c.id === categoryId);
            if (!this.currentCategory) {
                showToast('Kategori bulunamadı!', 'error');
                return;
            }
            
            this.showForm = true;
            this.render();
        } catch (error) {
            showToast('Düzenleme hatası: ' + error.message, 'error');
        }
    }

    async deleteCategory(categoryId) {
        if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki tüm turlar etkilenebilir.')) {
            try {
                const response = await adminAPI.deleteCategory(categoryId);
                if (response.success) {
                    showToast('Kategori silindi!', 'success');
                    this.render();
                }
            } catch (error) {
                showToast('Silme hatası: ' + error.message, 'error');
            }
        }
    }

    getLoadingHTML() {
        return `
            <div class="text-center py-12">
                <div class="loading-spinner mb-4"></div>
                <p class="text-secondary">Kategoriler yükleniyor...</p>
            </div>
        `;
    }

    getErrorHTML() {
        return `
            <div class="card p-8 text-center">
                <div class="text-red-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.828 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Veriler Yüklenemedi</h3>
                <p class="text-secondary mb-4">Kategori verilerini yüklerken bir hata oluştu.</p>
                <button onclick="window.categoriesPage.render()" class="btn-primary">Tekrar Dene</button>
            </div>
        `;
    }
}

// Initialize categories page
window.categoriesPage = new CategoriesPage();
