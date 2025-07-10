// admin/js/image-uploader.js - Görsel yükleme yöneticisi
class ImageUploader {
    constructor() {
        this.currentTourId = null;
        this.uploadInProgress = false;
    }

    // Tur için görsel yükleme modal'ını göster
    showUploadModal(tourId, tourTitle) {
        this.currentTourId = tourId;
        
        const modalHtml = `
            <div id="imageUploadModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">
                                🖼️ Görsel Yükle: ${tourTitle}
                            </h3>
                            <button onclick="imageUploader.closeUploadModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            <!-- Upload Area -->
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-admin-primary transition-colors">
                                <div id="dropZone" class="cursor-pointer">
                                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div class="mt-4">
                                        <button type="button" onclick="document.getElementById('imageFile').click()" 
                                                class="bg-admin-primary text-white px-6 py-3 rounded-lg hover:bg-admin-secondary transition-colors font-medium">
                                            📁 Bilgisayardan Görsel Seç
                                        </button>
                                        <input id="imageFile" name="image" type="file" class="hidden" accept="image/*">
                                        <p class="mt-3 text-sm text-gray-500">veya dosyayı sürükleyip bırakın</p>
                                        <p class="mt-1 text-xs text-gray-400">PNG, JPG, GIF - Maksimum 5MB</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div id="uploadProgress" class="hidden">
                                <div class="bg-gray-200 rounded-full h-2">
                                    <div id="progressBar" class="bg-admin-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                                <p id="progressText" class="text-sm text-gray-600 mt-2">Yükleniyor...</p>
                            </div>
                            
                            <!-- Preview Area -->
                            <div id="imagePreview" class="hidden">
                                <div class="text-center">
                                    <p class="text-sm text-gray-600 mb-2">Önizleme:</p>
                                    <img id="previewImage" class="max-w-full h-48 object-cover rounded-lg mx-auto border">
                                </div>
                            </div>
                            
                            <!-- Upload Button -->
                            <div class="flex justify-end gap-3 pt-4">
                                <button type="button" onclick="imageUploader.closeUploadModal()"
                                        class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                    İptal
                                </button>
                                <button id="uploadBtn" onclick="imageUploader.uploadImage()" disabled
                                        class="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    📤 Yükle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.bindUploadEvents();
    }

    bindUploadEvents() {
        const fileInput = document.getElementById('imageFile');
        const dropZone = document.getElementById('dropZone');
        
        // File selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-admin-primary', 'bg-admin-light');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-admin-primary', 'bg-admin-light');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-admin-primary', 'bg-admin-light');
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Prevent default drag behavior on whole modal
        const modal = document.getElementById('imageUploadModal');
        modal.addEventListener('dragover', (e) => e.preventDefault());
        modal.addEventListener('drop', (e) => e.preventDefault());
    }

    handleFileSelect(file) {
        console.log('📁 Dosya seçildi:', file.name, file.type, file.size);
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showError('Lütfen bir resim dosyası seçin (PNG, JPG, GIF)');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            const previewDiv = document.getElementById('imagePreview');
            const uploadBtn = document.getElementById('uploadBtn');
            
            previewImage.src = e.target.result;
            previewDiv.classList.remove('hidden');
            uploadBtn.disabled = false;
            uploadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            
            console.log('✅ Önizleme gösteriliyor');
        };
        reader.readAsDataURL(file);
        
        this.selectedFile = file;
    }

    async uploadImage() {
        if (!this.selectedFile || this.uploadInProgress) {
            console.log('❌ Upload koşulları sağlanmadı:', {
                selectedFile: !!this.selectedFile,
                uploadInProgress: this.uploadInProgress
            });
            return;
        }
        
        console.log('📤 Upload başlatılıyor...');
        this.uploadInProgress = true;
        
        const uploadBtn = document.getElementById('uploadBtn');
        const progressDiv = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        // Show progress
        progressDiv.classList.remove('hidden');
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Yükleniyor...';
        
        try {
            const formData = new FormData();
            formData.append('image', this.selectedFile);
            formData.append('tourId', this.currentTourId);
            
            console.log('🔗 API isteği gönderiliyor...', {
                tourId: this.currentTourId,
                fileName: this.selectedFile.name
            });
            
            progressBar.style.width = '25%';
            progressText.textContent = 'Sunucuya gönderiliyor...';
            
            const response = await fetch('/api/upload/tour-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authManager.token}`
                },
                body: formData
            });
            
            progressBar.style.width = '75%';
            progressText.textContent = 'İşleniyor...';
            
            const result = await response.json();
            console.log('📨 API yanıtı:', result);
            
            if (result.success) {
                progressBar.style.width = '100%';
                progressText.textContent = 'Başarıyla yüklendi!';
                
                setTimeout(() => {
                    this.closeUploadModal();
                    this.showSuccess('Görsel başarıyla yüklendi! ' + (result.data.isFeatured ? '(Ana görsel olarak ayarlandı)' : '(Galeriye eklendi)'));
                    
                    // Refresh tours list
                    if (window.toursManager) {
                        toursManager.loadTours();
                    }
                }, 1500);
            } else {
                throw new Error(result.message || 'Yükleme hatası');
            }
            
        } catch (error) {
            console.error('❌ Upload error:', error);
            this.showError('Yükleme hatası: ' + error.message);
            progressDiv.classList.add('hidden');
            uploadBtn.disabled = false;
            uploadBtn.textContent = '📤 Yükle';
        }
        
        this.uploadInProgress = false;
    }

    closeUploadModal() {
        const modal = document.getElementById('imageUploadModal');
        if (modal) {
            modal.remove();
        }
        this.currentTourId = null;
        this.selectedFile = null;
        this.uploadInProgress = false;
        console.log('❌ Modal kapatıldı');
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
                        ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'
                        : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
                    }
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white hover:opacity-75">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Global instance
window.imageUploader = new ImageUploader();
