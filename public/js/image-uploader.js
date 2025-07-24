// admin/js/image-uploader.js - Resim Yükleme Sistemi
class ImageUploader {
    constructor() {
        this.currentTourId = null;
        this.uploadedImages = {
            tour: null,
            hotels: {
                mekke: [],
                medine: []
            }
        };
    }

    // Ana tur görseli yükleme
    async uploadTourImage(tourId, fileInput) {
        const file = fileInput.files[0];
        if (!file) {
            this.showToast('Lütfen bir resim seçin', 'error');
            return;
        }

        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Resim boyutu 5MB\'dan küçük olmalıdır', 'error');
            return;
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
            this.showToast('Sadece resim dosyaları yüklenebilir', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            this.showUploadProgress(true);
            
            const response = await fetch(`/api/admin/upload/tour-image/${tourId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.uploadedImages.tour = result.data.imageUrl;
                this.updateTourImagePreview(result.data.imageUrl);
                this.showToast('Tur görseli başarıyla yüklendi', 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Tour image upload error:', error);
            this.showToast('Resim yüklenirken hata oluştu: ' + error.message, 'error');
        } finally {
            this.showUploadProgress(false);
        }
    }

    // Otel görselleri yükleme
    async uploadHotelImages(tourId, hotelType, fileInput) {
        const files = Array.from(fileInput.files);
        if (files.length === 0) {
            this.showToast('Lütfen en az bir resim seçin', 'error');
            return;
        }

        // Maksimum 5 dosya kontrolü
        if (files.length > 5) {
            this.showToast('En fazla 5 resim yükleyebilirsiniz', 'error');
            return;
        }

        // Dosya kontrolleri
        for (let file of files) {
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('Her resim 5MB\'dan küçük olmalıdır', 'error');
                return;
            }
            if (!file.type.startsWith('image/')) {
                this.showToast('Sadece resim dosyaları yüklenebilir', 'error');
                return;
            }
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        formData.append('hotel_type', hotelType);

        try {
            this.showUploadProgress(true, `${hotelType} otel görselleri yükleniyor...`);
            
            const response = await fetch(`/api/admin/upload/hotel-images/${tourId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.authManager.getToken()}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.uploadedImages.hotels[hotelType].push(...result.data.imageUrls);
                this.updateHotelImagesPreview(hotelType, result.data.imageUrls);
                this.showToast(`${hotelType} otel görselleri başarıyla yüklendi`, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Hotel images upload error:', error);
            this.showToast('Otel görselleri yüklenirken hata oluştu: ' + error.message, 'error');
        } finally {
            this.showUploadProgress(false);
        }
    }

    // Resim yükleme modal'ını göster
    showImageUploadModal(tourId) {
        this.currentTourId = tourId;
        
        const modalHtml = `
            <div id="imageUploadModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                    <!-- Modal Header -->
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-semibold text-gray-900">📸 Resim Yükleme</h3>
                        <button onclick="imageUploader.closeImageUploadModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Upload Progress -->
                    <div id="uploadProgress" class="hidden mb-4">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center gap-3">
                                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span id="uploadProgressText" class="text-blue-700">Yükleniyor...</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tour Image Upload -->
                    <div class="mb-8">
                        <h4 class="text-lg font-medium text-gray-800 mb-4">🖼️ Ana Tur Görseli</h4>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div class="text-center">
                                <input type="file" id="tourImageInput" accept="image/*" class="hidden" 
                                       onchange="imageUploader.uploadTourImage(${tourId}, this)">
                                <div id="tourImagePreview" class="mb-4 hidden">
                                    <img id="tourImagePreviewImg" src="" alt="Tur Görseli" class="max-w-xs max-h-48 mx-auto rounded-lg shadow-md">
                                </div>
                                <button onclick="document.getElementById('tourImageInput').click()" 
                                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                                    Tur Görseli Seç
                                </button>
                                <p class="text-gray-500 text-sm mt-2">PNG, JPG, JPEG (Max 5MB)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Hotel Images Upload -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Mekke Hotel Images -->
                        <div>
                            <h4 class="text-lg font-medium text-gray-800 mb-4">🕋 Mekke Otel Görselleri</h4>
                            <div class="border-2 border-dashed border-green-300 rounded-lg p-4">
                                <div class="text-center">
                                    <input type="file" id="mekkeHotelInput" accept="image/*" multiple class="hidden" 
                                           onchange="imageUploader.uploadHotelImages(${tourId}, 'mekke', this)">
                                    <div id="mekkeHotelPreview" class="mb-4 grid grid-cols-2 gap-2 hidden">
                                        <!-- Dinamik olarak doldurulacak -->
                                    </div>
                                    <button onclick="document.getElementById('mekkeHotelInput').click()" 
                                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                                        Mekke Otel Resimleri
                                    </button>
                                    <p class="text-gray-500 text-xs mt-1">En fazla 5 resim</p>
                                </div>
                            </div>
                        </div>

                        <!-- Medine Hotel Images -->
                        <div>
                            <h4 class="text-lg font-medium text-gray-800 mb-4">🕌 Medine Otel Görselleri</h4>
                            <div class="border-2 border-dashed border-blue-300 rounded-lg p-4">
                                <div class="text-center">
                                    <input type="file" id="medineHotelInput" accept="image/*" multiple class="hidden" 
                                           onchange="imageUploader.uploadHotelImages(${tourId}, 'medine', this)">
                                    <div id="medineHotelPreview" class="mb-4 grid grid-cols-2 gap-2 hidden">
                                        <!-- Dinamik olarak doldurulacak -->
                                    </div>
                                    <button onclick="document.getElementById('medineHotelInput').click()" 
                                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                                        Medine Otel Resimleri
                                    </button>
                                    <p class="text-gray-500 text-xs mt-1">En fazla 5 resim</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex justify-end mt-6 pt-4 border-t">
                        <button onclick="imageUploader.closeImageUploadModal()" 
                                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Modal'ı DOM'a ekle
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mevcut görselleri yükle
        this.loadExistingImages(tourId);
    }

    // Mevcut görselleri yükle
    async loadExistingImages(tourId) {
        try {
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                headers: window.authManager.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success && result.data.tour) {
                const tour = result.data.tour;
                
                // Ana tur görseli
                if (tour.image_url) {
                    this.updateTourImagePreview(tour.image_url);
                }
                
                // Otel görselleri
                if (tour.hotel_images) {
                    let hotelImages = tour.hotel_images;
                    if (typeof hotelImages === 'string') {
                        hotelImages = JSON.parse(hotelImages);
                    }
                    
                    if (hotelImages.mekke && hotelImages.mekke.length > 0) {
                        this.updateHotelImagesPreview('mekke', hotelImages.mekke);
                    }
                    
                    if (hotelImages.medine && hotelImages.medine.length > 0) {
                        this.updateHotelImagesPreview('medine', hotelImages.medine);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Existing images load error:', error);
        }
    }

    // Ana tur görseli önizlemesini güncelle
    updateTourImagePreview(imageUrl) {
        const preview = document.getElementById('tourImagePreview');
        const img = document.getElementById('tourImagePreviewImg');
        
        if (preview && img) {
            img.src = imageUrl;
            preview.classList.remove('hidden');
        }
    }

    // Otel görselleri önizlemesini güncelle
    updateHotelImagesPreview(hotelType, imageUrls) {
        const preview = document.getElementById(`${hotelType}HotelPreview`);
        
        if (preview) {
            preview.classList.remove('hidden');
            
            imageUrls.forEach(imageUrl => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'relative';
                imgDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${hotelType} Otel" class="w-full h-16 object-cover rounded">
                    <button onclick="imageUploader.removeHotelImage('${hotelType}', '${imageUrl}')" 
                            class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600">
                        ×
                    </button>
                `;
                preview.appendChild(imgDiv);
            });
        }
    }

    // Otel resmini kaldır
    async removeHotelImage(hotelType, imageUrl) {
        if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            // Resmi listeden kaldır
            const index = this.uploadedImages.hotels[hotelType].indexOf(imageUrl);
            if (index > -1) {
                this.uploadedImages.hotels[hotelType].splice(index, 1);
            }

            // DOM'dan kaldır
            const preview = document.getElementById(`${hotelType}HotelPreview`);
            const imgElement = preview.querySelector(`img[src="${imageUrl}"]`);
            if (imgElement) {
                imgElement.closest('.relative').remove();
            }

            this.showToast('Resim kaldırıldı', 'success');
        } catch (error) {
            console.error('❌ Remove image error:', error);
            this.showToast('Resim kaldırılırken hata oluştu', 'error');
        }
    }

    // Upload progress göster/gizle
    showUploadProgress(show, text = 'Yükleniyor...') {
        const progress = document.getElementById('uploadProgress');
        const progressText = document.getElementById('uploadProgressText');
        
        if (progress) {
            if (show) {
                progress.classList.remove('hidden');
                if (progressText) progressText.textContent = text;
            } else {
                progress.classList.add('hidden');
            }
        }
    }

    // Modal'ı kapat
    closeImageUploadModal() {
        const modal = document.getElementById('imageUploadModal');
        if (modal) {
            modal.remove();
        }
    }

    // Toast bildirimi göster
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500 text-white' : 
            type === 'success' ? 'bg-green-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global instance oluştur
const imageUploader = new ImageUploader();

// ToursManager'a resim yükleme fonksiyonu ekle
if (typeof window.toursManager !== 'undefined') {
    window.toursManager.showImageUpload = function(tourId) {
        imageUploader.showImageUploadModal(tourId);
    };
} else {
    // ToursManager henüz yüklenmemişse, yüklendiğinde ekle
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof window.toursManager !== 'undefined') {
                window.toursManager.showImageUpload = function(tourId) {
                    imageUploader.showImageUploadModal(tourId);
                };
            }
        }, 1000);
    });
}

console.log('✅ Image Uploader yüklendi');