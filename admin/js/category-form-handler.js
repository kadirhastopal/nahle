// admin/js/category-form-handler.js - Kategori form işleyicisi
class CategoryFormHandler {
    static init() {
        console.log('🔧 Category Form Handler başlatıldı');
        document.addEventListener('DOMContentLoaded', () => {
            CategoryFormHandler.bindFormEvents();
        });
    }

    static bindFormEvents() {
        // Modal açıldığında form handler'ı kur
        const originalShowAddCategoryModal = window.categoriesManager?.showAddCategoryModal;
        if (originalShowAddCategoryModal) {
            window.categoriesManager.showAddCategoryModal = function() {
                originalShowAddCategoryModal.call(this);
                setTimeout(() => CategoryFormHandler.setupFormHandler(), 300);
            };
        }

        const originalEditCategory = window.categoriesManager?.editCategory;
        if (originalEditCategory) {
            window.categoriesManager.editCategory = function(categoryId) {
                originalEditCategory.call(this, categoryId);
                setTimeout(() => CategoryFormHandler.setupFormHandler(), 300);
            };
        }
    }

    static setupFormHandler() {
        const form = document.getElementById('categoryForm');
        if (!form) {
            console.log('❌ Category form bulunamadı');
            return;
        }

        // Önceki event listener'ı kaldır
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        console.log('✅ Category form handler kuruldu');

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📝 Kategori formu gönderiliyor...');

            const submitBtn = newForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(newForm);
                const categoryData = Object.fromEntries(formData.entries());

                console.log('📊 Form verileri:', categoryData);

                const url = window.categoriesManager.editingCategory 
                    ? `/api/admin/categories/${window.categoriesManager.editingCategory.id}`
                    : '/api/admin/categories';

                const method = window.categoriesManager.editingCategory ? 'PUT' : 'POST';

                console.log('🔗 API çağrısı:', method, url);

                const response = await fetch(url, {
                    method,
                    headers: window.authManager.getAuthHeaders(),
                    body: JSON.stringify(categoryData)
                });

                const result = await response.json();
                console.log('📨 API yanıtı:', result);

                if (result.success) {
                    window.categoriesManager.showSuccess(result.message);
                    await window.categoriesManager.loadCategories();
                    window.categoriesManager.closeCategoryModal();
                } else {
                    window.categoriesManager.showError(result.message || 'Bir hata oluştu');
                }
            } catch (error) {
                console.error('❌ Form submit error:', error);
                window.categoriesManager.showError('Bağlantı hatası: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Form handler'ı başlat
CategoryFormHandler.init();
