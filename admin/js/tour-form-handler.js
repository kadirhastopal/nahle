// admin/js/tour-form-handler.js - Tur form işleyicisi
class TourFormHandler {
    static init() {
        console.log('🔧 Tour Form Handler başlatıldı');
        document.addEventListener('DOMContentLoaded', () => {
            // ToursManager hazır olana kadar bekle
            const checkTourManager = () => {
                if (window.toursManager) {
                    TourFormHandler.bindFormEvents();
                } else {
                    setTimeout(checkTourManager, 100);
                }
            };
            checkTourManager();
        });
    }

    static bindFormEvents() {
        // Modal açıldığında form handler'ı kur
        const originalShowAddTourModal = window.toursManager.showAddTourModal;
        window.toursManager.showAddTourModal = function() {
            originalShowAddTourModal.call(this);
            setTimeout(() => TourFormHandler.setupFormHandler(), 300);
        };

        const originalEditTour = window.toursManager.editTour;
        window.toursManager.editTour = function(tourId) {
            originalEditTour.call(this, tourId);
            setTimeout(() => TourFormHandler.setupFormHandler(), 300);
        };
    }

    static setupFormHandler() {
        const form = document.getElementById('tourForm');
        if (!form) {
            console.log('❌ Tour form bulunamadı');
            return;
        }

        // Önceki event listener'ı kaldır
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        console.log('✅ Tour form handler kuruldu');

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📝 Tur formu gönderiliyor...');

            const submitBtn = newForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(newForm);
                const tourData = Object.fromEntries(formData.entries());

                console.log('📊 Form verileri:', tourData);

                const url = window.toursManager.editingTour 
                    ? `/api/admin/tours/${window.toursManager.editingTour.id}`
                    : '/api/admin/tours';

                const method = window.toursManager.editingTour ? 'PUT' : 'POST';

                console.log('🔗 API çağrısı:', method, url);

                const response = await fetch(url, {
                    method,
                    headers: window.authManager.getAuthHeaders(),
                    body: JSON.stringify(tourData)
                });

                const result = await response.json();
                console.log('📨 API yanıtı:', result);

                if (result.success) {
                    window.toursManager.showSuccess(result.message);
                    await window.toursManager.loadTours();
                    window.toursManager.closeTourModal();
                } else {
                    window.toursManager.showError(result.message || 'Bir hata oluştu');
                }
            } catch (error) {
                console.error('❌ Form submit error:', error);
                window.toursManager.showError('Bağlantı hatası: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Form handler'ı başlat
TourFormHandler.init();
