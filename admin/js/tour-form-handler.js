// admin/js/tour-form-handler.js - GÜNCEL VERSİYON
class TourFormHandler {
    constructor() {
        this.editingTour = null;
        this.tempImageUrl = null;
        this.tempHotelImages = {
            mekke: [],
            medine: []
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submit
        document.getElementById('tourForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Resim yükleme
        document.getElementById('tourImageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // Otel resimleri yükleme
        document.getElementById('mekkeHotelImages').addEventListener('change', (e) => {
            this.handleHotelImagesUpload('mekke', e.target.files);
        });

        document.getElementById('medineHotelImages').addEventListener('change', (e) => {
            this.handleHotelImagesUpload('medine', e.target.files);
        });
    }

    // Yeni tur ekle
    openAddTourForm() {
        this.editingTour = null;
        this.tempImageUrl = null;
        this.tempHotelImages = { mekke: [], medine: [] };
        
        document.getElementById('tourFormTitle').textContent = 'Yeni Tur Ekle';
        document.getElementById('tourSubmitText').textContent = 'Kaydet';
        
        // Formu temizle
        document.getElementById('tourForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('mekkeHotelPreview').innerHTML = '';
        document.getElementById('medineHotelPreview').innerHTML = '';
        
        // Günlük programı sıfırla
        dailySchedule = [];
        renderDailySchedule();
        
        // Kategorileri yükle
        this.loadCategories();
        
        // Modal'ı göster
        document.getElementById('tourFormModal').classList.remove('hidden');
    }

    // Tur düzenle
    openEditTourForm(tour) {
        this.editingTour = tour;
        this.tempImageUrl = tour.image_url;
        
        document.getElementById('tourFormTitle').textContent = 'Tur Düzenle';
        document.getElementById('tourSubmitText').textContent = 'Güncelle';
        
        // Form alanlarını doldur
        this.populateForm(tour);
        
        // Kategorileri yükle
        this.loadCategories();
        
        // Modal'ı göster
        document.getElementById('tourFormModal').classList.remove('hidden');
    }

    // Form alanlarını tur bilgileriyle doldur
    populateForm(tour) {
        // Temel bilgiler
        document.getElementById('tourTitle').value = tour.title || '';
        document.getElementById('tourCategory').value = tour.category_id || '';
        document.getElementById('tourShortDescription').value = tour.short_description || '';
        document.getElementById('tourDescription').value = tour.description || '';

        // Tarih ve süre
        if (tour.start_date) {
            document.getElementById('tourStartDate').value = tour.start_date.split('T')[0];
        }
        if (tour.end_date) {
            document.getElementById('tourEndDate').value = tour.end_date.split('T')[0];
        }
        document.getElementById('tourDurationDays').value = tour.duration_days || '';
        document.getElementById('tourDurationNights').value = tour.duration_nights || '';
        document.getElementById('tourMekkeNights').value = tour.mekke_nights || '';
        document.getElementById('tourMedineNights').value = tour.medine_nights || '';

        // Fiyat ve kota
        document.getElementById('tourPriceTry').value = tour.price_try || '';
        document.getElementById('tourQuota').value = tour.quota || '';

        // Otel bilgileri
        document.getElementById('tourMekkeHotel').value = tour.mekke_hotel || '';
        document.getElementById('tourMedineHotel').value = tour.medine_hotel || '';

        // Hizmetler
        document.getElementById('tourIncludedServices').value = tour.included_services || '';
        document.getElementById('tourExcludedServices').value = tour.excluded_services || '';

        // Ziyaret yerleri
        document.getElementById('tourVisitPlaces').value = tour.visit_places || '';

        // Uçuş bilgileri
        document.getElementById('tourDepartureInfo').value = tour.departure_info || '';
        document.getElementById('tourReturnInfo').value = tour.return_info || '';

        // Belgeler ve notlar
        document.getElementById('tourRequiredDocuments').value = tour.required_documents || '';
        document.getElementById('tourImportantNotes').value = tour.important_notes || '';
        document.getElementById('tourCancellationPolicy').value = tour.cancellation_policy || '';
        document.getElementById('tourPaymentTerms').value = tour.payment_terms || '';

        // Durum ve ayarlar
        document.getElementById('tourStatus').value = tour.status || 'active';
        document.getElementById('tourPriority').value = tour.priority || 0;
        document.getElementById('tourFeatured').checked = tour.featured || false;

        // Ana resim
        if (tour.image_url) {
            document.getElementById('previewImage').src = tour.image_url;
            document.getElementById('imagePreview').classList.remove('hidden');
        }

        // Günlük program
        if (tour.daily_schedule) {
            try {
                dailySchedule = JSON.parse(tour.daily_schedule);
                renderDailySchedule();
                updateDailyScheduleInput();
            } catch (e) {
                console.log('Daily schedule parse error:', e);
                dailySchedule = [];
            }
        }

        // Otel resimleri
        this.loadHotelImages(tour);
    }

    // Kategorileri yükle
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (data.success) {
                const select = document.getElementById('tourCategory');
                select.innerHTML = '<option value="">Kategori Seçin</option>';
                
                data.data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });

                // Düzenleme modunda kategoriyi seç
                if (this.editingTour && this.editingTour.category_id) {
                    select.value = this.editingTour.category_id;
                }
            }
        } catch (error) {
            console.error('❌ Kategori yükleme hatası:', error);
        }
    }

    // Ana tur resmi yükle
    async handleImageUpload(file) {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);

            // Temporary ID kullan (henüz kaydedilmemiş tur için)
            const tourId = this.editingTour ? this.editingTour.id : 'temp';
            
            console.log('📸 Resim yükleniyor...');
            
            const response = await fetch(`/api/upload/tour-image/${tourId}`, {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: formData
            });

            const data = await response.json();
            console.log('📸 Upload response:', data);

            if (data.success) {
                // Önizleme göster
                document.getElementById('previewImage').src = data.data.imageUrl;
                document.getElementById('imagePreview').classList.remove('hidden');
                
                this.tempImageUrl = data.data.imageUrl;
                
                showNotification('✅ Resim başarıyla yüklendi', 'success');
            } else {
                showNotification('❌ Resim yükleme hatası: ' + data.message, 'error');
            }

        } catch (error) {
            console.error('❌ Resim yükleme hatası:', error);
            showNotification('❌ Resim yükleme hatası', 'error');
        }
    }

    // Otel resimleri yükle
    async handleHotelImagesUpload(hotelType, files) {
        if (!files || files.length === 0) return;

        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('images', file);
            });

            // Temporary ID kullan
            const tourId = this.editingTour ? this.editingTour.id : 'temp';
            
            console.log(`🏨 ${hotelType} otel resimleri yükleniyor...`);
            
            const response = await fetch(`/api/upload/hotel-images/${hotelType}/${tourId}`, {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: formData
            });

            const data = await response.json();
            console.log(`🏨 ${hotelType} upload response:`, data);

            if (data.success) {
                // Önizleme göster
                this.displayHotelImagePreviews(hotelType, data.data.files);
                
                // Temp images array'i güncelle
                this.tempHotelImages[hotelType] = [
                    ...this.tempHotelImages[hotelType],
                    ...data.data.imageUrls
                ];
                
                showNotification(`✅ ${hotelType} otel resimleri başarıyla yüklendi`, 'success');
            } else {
                showNotification(`❌ ${hotelType} otel resmi yükleme hatası: ` + data.message, 'error');
            }

        } catch (error) {
            console.error(`❌ ${hotelType} otel resmi yükleme hatası:`, error);
            showNotification(`❌ ${hotelType} otel resmi yükleme hatası`, 'error');
        }
    }

    // Otel resim önizlemelerini göster
    displayHotelImagePreviews(hotelType, files) {
        const previewContainer = document.getElementById(`${hotelType}HotelPreview`);
        
        files.forEach(file => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'relative group';
            imageDiv.innerHTML = `
                <img src="${file.url}" class="w-full h-20 object-cover rounded border">
                <button type="button" onclick="tourFormHandler.removeHotelImage('${hotelType}', '${file.url}')" 
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                </button>
                <span class="text-xs text-gray-500 block mt-1 truncate">${file.originalName}</span>
            `;
            previewContainer.appendChild(imageDiv);
        });
    }

    // Otel resmini sil
    async removeHotelImage(hotelType, imageUrl) {
        try {
            if (this.editingTour) {
                const response = await fetch(`/api/upload/hotel-image/${hotelType}/${this.editingTour.id}`, {
                    method: 'DELETE',
                    headers: {
                        ...authManager.getAuthHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageUrl })
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message);
                }
            }

            // Temp array'den kaldır
            this.tempHotelImages[hotelType] = this.tempHotelImages[hotelType].filter(url => url !== imageUrl);
            
            // Önizlemeden kaldır
            const previewContainer = document.getElementById(`${hotelType}HotelPreview`);
            const imageElements = previewContainer.querySelectorAll('img');
            imageElements.forEach(img => {
                if (img.src.includes(imageUrl.split('/').pop())) {
                    img.parentElement.remove();
                }
            });

            showNotification('✅ Resim silindi', 'success');

        } catch (error) {
            console.error('❌ Resim silme hatası:', error);
            showNotification('❌ Resim silinirken hata oluştu', 'error');
        }
    }

    // Mevcut otel resimlerini yükle
    async loadHotelImages(tour) {
        try {
            // Mekke otel resimleri
            if (tour.mekke_hotel_images) {
                const mekkeImages = JSON.parse(tour.mekke_hotel_images);
                this.displayExistingHotelImages('mekke', mekkeImages);
                this.tempHotelImages.mekke = [...mekkeImages];
            }

            // Medine otel resimleri
            if (tour.medine_hotel_images) {
                const medineImages = JSON.parse(tour.medine_hotel_images);
                this.displayExistingHotelImages('medine', medineImages);
                this.tempHotelImages.medine = [...medineImages];
            }

        } catch (error) {
            console.error('❌ Otel resimleri yükleme hatası:', error);
        }
    }

    // Mevcut otel resimlerini göster
    displayExistingHotelImages(hotelType, imageUrls) {
        const previewContainer = document.getElementById(`${hotelType}HotelPreview`);
        
        imageUrls.forEach(imageUrl => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'relative group';
            imageDiv.innerHTML = `
                <img src="${imageUrl}" class="w-full h-20 object-cover rounded border">
                <button type="button" onclick="tourFormHandler.removeHotelImage('${hotelType}', '${imageUrl}')" 
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                </button>
            `;
            previewContainer.appendChild(imageDiv);
        });
    }

    // Form submit
    async handleFormSubmit() {
        try {
            const formData = new FormData(document.getElementById('tourForm'));
            
            // Günlük programı ekle
            formData.set('daily_schedule', document.getElementById('dailyScheduleData').value);
            
            // Otel resimlerini ekle
            formData.set('mekke_hotel_images', JSON.stringify(this.tempHotelImages.mekke));
            formData.set('medine_hotel_images', JSON.stringify(this.tempHotelImages.medine));
            
            // Ana resmi ekle
            if (this.tempImageUrl) {
                formData.set('image_url', this.tempImageUrl);
            }

            const url = this.editingTour 
                ? `/api/admin/tours/${this.editingTour.id}`
                : '/api/admin/tours';
            
            const method = this.editingTour ? 'PUT' : 'POST';

            console.log(`${method} ${url} - Form data:`, Object.fromEntries(formData));

            const response = await fetch(url, {
                method,
                headers: authManager.getAuthHeaders(),
                body: formData
            });

            const data = await response.json();
            console.log('Form response:', data);

            if (data.success) {
                showNotification(
                    this.editingTour ? '✅ Tur başarıyla güncellendi' : '✅ Tur başarıyla eklendi', 
                    'success'
                );
                
                this.closeForm();
                
                // Tur listesini yenile
                if (window.toursManager) {
                    window.toursManager.loadTours();
                }
                
                // Ana sayfadaki turları yenile
                if (window.dynamicTours) {
                    window.dynamicTours.loadTours();
                }
                
            } else {
                showNotification('❌ Hata: ' + data.message, 'error');
            }

        } catch (error) {
            console.error('❌ Form submit hatası:', error);
            showNotification('❌ Form gönderilirken hata oluştu', 'error');
        }
    }

    // Formu kapat
    closeForm() {
        document.getElementById('tourFormModal').classList.add('hidden');
        document.getElementById('tourForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('mekkeHotelPreview').innerHTML = '';
        document.getElementById('medineHotelPreview').innerHTML = '';
        
        this.editingTour = null;
        this.tempImageUrl = null;
        this.tempHotelImages = { mekke: [], medine: [] };
        
        dailySchedule = [];
        renderDailySchedule();
    }
}

// Global instance oluştur
const tourFormHandler = new TourFormHandler();
window.tourFormHandler = tourFormHandler;

// Global functions
function openAddTourForm() {
    tourFormHandler.openAddTourForm();
}

function openEditTourForm(tour) {
    tourFormHandler.openEditTourForm(tour);
}

function closeTourForm() {
    tourFormHandler.closeForm();
}

console.log('✅ Tour Form Handler yüklendi');