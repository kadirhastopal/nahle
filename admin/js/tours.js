// admin/js/tours.js - GELİŞMİŞ TUR YÖNETİMİ
class ToursManager {
    constructor() {
        this.tours = [];
        this.filteredTours = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editingTour = null;
        this.tempImageUrl = null;
        this.tempHotelImages = { mekke: [], medine: [] };
        this.init();
    }

    init() {
        console.log('🚌 Tours Manager başlatıldı');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Resim yükleme event'leri
        const tourImageUpload = document.getElementById('tourImageUpload');
        if (tourImageUpload) {
            tourImageUpload.addEventListener('change', (e) => {
                this.handleMainImageUpload(e.target.files[0]);
            });
        }

        const mekkeHotelImages = document.getElementById('mekkeHotelImages');
        if (mekkeHotelImages) {
            mekkeHotelImages.addEventListener('change', (e) => {
                this.handleHotelImagesUpload('mekke', e.target.files);
            });
        }

        const medineHotelImages = document.getElementById('medineHotelImages');
        if (medineHotelImages) {
            medineHotelImages.addEventListener('change', (e) => {
                this.handleHotelImagesUpload('medine', e.target.files);
            });
        }

        // Form submit
        const tourForm = document.getElementById('tourForm');
        if (tourForm) {
            tourForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }

    async loadTours() {
        try {
            console.log('🔄 Turlar yükleniyor...');
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.showError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                return;
            }

            const response = await fetch('/api/admin/tours?limit=50', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    this.tours = data.data.tours;
                    this.filteredTours = [...this.tours];
                    console.log('✅ Turlar yüklendi:', this.tours.length);
                    this.renderToursContent();
                } else {
                    this.showError(data.message || 'Turlar yüklenemedi');
                }
            } else if (response.status === 401) {
                localStorage.removeItem('authToken');
                location.reload();
            } else {
                this.showError('Sunucu hatası. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('❌ Turlar yükleme hatası:', error);
            this.showError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
        }
    }

    renderToursContent() {
        const toursContainer = document.getElementById('toursContent');
        
        if (!toursContainer) {
            console.error('❌ Tours container bulunamadı');
            return;
        }

        toursContainer.innerHTML = `
            <!-- ✅ HEADER VE CONTROLS -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">Tur Yönetimi</h3>
                    <button onclick="toursManager.openAddTourForm()" 
                            class="bg-admin-primary text-white px-4 py-2 rounded-md hover:bg-admin-secondary transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                        </svg>
                        Yeni Tur Ekle
                    </button>
                </div>
                
                <!-- ✅ FILTERS -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input type="text" id="tourSearchInput" placeholder="Tur ara..." 
                               onkeyup="toursManager.handleSearch(this.value)"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                    </div>
                    <div>
                        <select id="categoryFilter" onchange="toursManager.handleCategoryFilter(this.value)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                            <option value="">Tüm Kategoriler</option>
                        </select>
                    </div>
                    <div>
                        <select id="statusFilter" onchange="toursManager.handleStatusFilter(this.value)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                            <option value="">Tüm Durumlar</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Pasif</option>
                            <option value="full">Dolu</option>
                            <option value="completed">Tamamlandı</option>
                        </select>
                    </div>
                    <div>
                        <button onclick="toursManager.resetFilters()" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Filtreleri Temizle
                        </button>
                    </div>
                </div>
            </div>

            <!-- ✅ STATISTICS -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Toplam Tur</p>
                            <p class="text-lg font-semibold text-gray-900">${this.tours.length}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Aktif Turlar</p>
                            <p class="text-lg font-semibold text-gray-900">${this.tours.filter(t => t.status === 'active').length}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Öne Çıkan</p>
                            <p class="text-lg font-semibold text-gray-900">${this.tours.filter(t => t.featured).length}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Dolu Turlar</p>
                            <p class="text-lg font-semibold text-gray-900">${this.tours.filter(t => t.status === 'full').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ✅ TOURS TABLE -->
            <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tur</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="toursTableBody">
                            ${this.renderToursTableBody()}
                        </tbody>
                    </table>
                </div>

                <!-- ✅ PAGINATION -->
                <div class="bg-gray-50 px-6 py-3 flex items-center justify-between">
                    <div class="text-sm text-gray-700">
                        ${this.filteredTours.length} turdan ${Math.min(this.currentPage * this.itemsPerPage, this.filteredTours.length)} tanesi gösteriliyor
                    </div>
                    <div class="flex space-x-1">
                        ${this.renderPagination()}
                    </div>
                </div>
            </div>
        `;

        // Kategori filterini yükle
        this.loadCategoryFilter();
    }

    renderToursTableBody() {
        if (this.filteredTours.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        Henüz tur bulunmuyor. 
                        <button onclick="toursManager.openAddTourForm()" class="text-admin-primary hover:text-admin-secondary">
                            İlk turu ekleyin
                        </button>
                    </td>
                </tr>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const toursToShow = this.filteredTours.slice(startIndex, endIndex);

        return toursToShow.map(tour => this.renderTourRow(tour)).join('');
    }

    renderTourRow(tour) {
        const startDate = tour.start_date ? new Date(tour.start_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş';
        const price = tour.price_try ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tour.price_try) : 'Belirtilmemiş';
        
        const statusInfo = this.getStatusInfo(tour.status);
        const quotaInfo = this.getQuotaInfo(tour);

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        ${tour.image_url ? 
                            `<img src="${tour.image_url}" alt="${tour.title}" class="w-12 h-12 rounded-lg object-cover mr-3">` :
                            `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                                </svg>
                            </div>`
                        }
                        <div>
                            <div class="text-sm font-medium text-gray-900">${tour.title}</div>
                            <div class="text-sm text-gray-500">${tour.duration_days} Gün ${tour.duration_nights ? tour.duration_nights + ' Gece' : ''}</div>
                            ${tour.featured ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">⭐ Öne Çıkan</span>' : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${tour.Category ? tour.Category.name : 'Kategori Yok'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${startDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${price}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex flex-col">
                        <span class="${quotaInfo.color}">${quotaInfo.text}</span>
                        <span class="text-xs text-gray-500">${tour.quota ? `${tour.quota} kişi` : 'Belirtilmemiş'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}">
                        ${statusInfo.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <button onclick="toursManager.editTour(${tour.id})" 
                                class="text-admin-primary hover:text-admin-secondary" title="Düzenle">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                        </button>
                        <button onclick="toursManager.toggleTourStatus(${tour.id})" 
                                class="text-blue-600 hover:text-blue-900" title="${tour.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                ${tour.status === 'active' ? 
                                    '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>' :
                                    '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>'
                                }
                            </svg>
                        </button>
                        <button onclick="toursManager.duplicateTour(${tour.id})" 
                                class="text-green-600 hover:text-green-900" title="Kopyala">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                            </svg>
                        </button>
                        <button onclick="toursManager.deleteTour(${tour.id})" 
                                class="text-red-600 hover:text-red-900" title="Sil">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredTours.length / this.itemsPerPage);
        
        if (totalPages <= 1) return '';

        let pagination = '';
        
        // Previous button
        pagination += `
            <button onclick="toursManager.changePage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''} 
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm ${this.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}">
                Önceki
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                pagination += `
                    <button class="px-3 py-1 bg-admin-primary text-white rounded-md text-sm">
                        ${i}
                    </button>
                `;
            } else if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                pagination += `
                    <button onclick="toursManager.changePage(${i})" 
                            class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                pagination += `<span class="px-2 text-gray-400">...</span>`;
            }
        }

        // Next button
        pagination += `
            <button onclick="toursManager.changePage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} 
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm ${this.currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}">
                Sonraki
            </button>
        `;

        return pagination;
    }

    getStatusInfo(status) {
        const statusMap = {
            'active': { text: 'Aktif', class: 'bg-green-100 text-green-800' },
            'inactive': { text: 'Pasif', class: 'bg-gray-100 text-gray-800' },
            'full': { text: 'Dolu', class: 'bg-red-100 text-red-800' },
            'completed': { text: 'Tamamlandı', class: 'bg-blue-100 text-blue-800' }
        };
        return statusMap[status] || { text: 'Bilinmiyor', class: 'bg-gray-100 text-gray-800' };
    }

    getQuotaInfo(tour) {
        if (!tour.quota) return { text: 'Belirtilmemiş', color: 'text-gray-500' };
        
        const available = tour.available_quota || tour.quota;
        const percentage = (available / tour.quota) * 100;
        
        if (percentage === 0) {
            return { text: 'Dolu', color: 'text-red-600 font-medium' };
        } else if (percentage <= 25) {
            return { text: `${available} kişi kaldı`, color: 'text-orange-600 font-medium' };
        } else {
            return { text: `${available} kişi kaldı`, color: 'text-green-600' };
        }
    }

    // ✅ FORM METHODS
    async openAddTourForm() {
        this.editingTour = null;
        this.tempImageUrl = null;
        this.tempHotelImages = { mekke: [], medine: [] };
        dailyPrograms = [];
        
        document.getElementById('tourFormTitle').textContent = 'Yeni Tur Ekle';
        document.getElementById('tourSubmitText').textContent = 'Kaydet';
        
        // Form'u temizle
        document.getElementById('tourForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('mekkeHotelPreview').innerHTML = '';
        document.getElementById('medineHotelPreview').innerHTML = '';
        renderDailyPrograms();
        
        // Kategorileri yükle
        await this.loadCategories();
        
        // Modal'ı göster
        document.getElementById('tourFormModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    async editTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) {
            this.showNotification('Tur bulunamadı', 'error');
            return;
        }

        this.editingTour = tour;
        this.tempImageUrl = tour.image_url;
        
        document.getElementById('tourFormTitle').textContent = 'Tur Düzenle';
        document.getElementById('tourSubmitText').textContent = 'Güncelle';
        
        // Kategorileri yükle
        await this.loadCategories();
        
        // Form alanlarını doldur
        this.populateForm(tour);
        
        // Modal'ı göster
        document.getElementById('tourFormModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

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
        document.getElementById('tourAvailableQuota').value = tour.available_quota || tour.quota || '';

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
        document.getElementById('tourSeoKeywords').value = tour.seo_keywords || '';

        // Ana resim
        if (tour.image_url) {
            document.getElementById('previewImage').src = tour.image_url;
            document.getElementById('imagePreview').classList.remove('hidden');
        }

        // Günlük program
        if (tour.daily_program) {
            try {
                dailyPrograms = typeof tour.daily_program === 'string' ? 
                    JSON.parse(tour.daily_program) : tour.daily_program;
            } catch (e) {
                dailyPrograms = [];
            }
        } else {
            dailyPrograms = [];
        }
        renderDailyPrograms();
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (data.success && data.data.categories) {
                const select = document.getElementById('tourCategory');
                const currentValue = select.value;
                
                select.innerHTML = '<option value="">Kategori Seçin</option>';
                
                data.data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    if (currentValue == category.id) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    }

    async loadCategoryFilter() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (data.success && data.data.categories) {
                const select = document.getElementById('categoryFilter');
                if (select) {
                    select.innerHTML = '<option value="">Tüm Kategoriler</option>';
                    
                    data.data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Kategori filtresi yüklenirken hata:', error);
        }
    }

    // ✅ IMAGE HANDLING
    async handleMainImageUpload(file) {
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/admin/upload/tour-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.tempImageUrl = data.data.imageUrl;
                document.getElementById('previewImage').src = data.data.imageUrl;
                document.getElementById('imagePreview').classList.remove('hidden');
                this.showNotification('Resim başarıyla yüklendi', 'success');
            } else {
                this.showNotification('Resim yüklenirken hata: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            this.showNotification('Resim yüklenirken hata oluştu', 'error');
        }
    }

    async handleHotelImagesUpload(hotelType, files) {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch(`/api/admin/upload/hotel-images/${hotelType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.tempHotelImages[hotelType] = [...this.tempHotelImages[hotelType], ...data.data.imageUrls];
                this.renderHotelImagePreviews(hotelType);
                this.showNotification(`${hotelType} otel resimleri başarıyla yüklendi`, 'success');
            } else {
                this.showNotification('Otel resimleri yüklenirken hata: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Otel resimleri yükleme hatası:', error);
            this.showNotification('Otel resimleri yüklenirken hata oluştu', 'error');
        }
    }

    renderHotelImagePreviews(hotelType) {
        const container = document.getElementById(`${hotelType}HotelPreview`);
        container.innerHTML = '';

        this.tempHotelImages[hotelType].forEach((imageUrl, index) => {
            const div = document.createElement('div');
            div.className = 'relative group';
            div.innerHTML = `
                <img src="${imageUrl}" class="w-full h-20 object-cover rounded border">
                <button type="button" onclick="toursManager.removeHotelImage('${hotelType}', ${index})" 
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                </button>
            `;
            container.appendChild(div);
        });
    }

    removeHotelImage(hotelType, index) {
        this.tempHotelImages[hotelType].splice(index, 1);
        this.renderHotelImagePreviews(hotelType);
    }

    // ✅ FORM SUBMISSION
    async handleFormSubmit() {
        const submitBtn = document.getElementById('tourSubmitBtn');
        const submitText = document.getElementById('tourSubmitText');
        const submitSpinner = document.getElementById('tourSubmitSpinner');

        // Loading state
        submitBtn.disabled = true;
        submitText.textContent = this.editingTour ? 'Güncelleniyor...' : 'Kaydediliyor...';
        submitSpinner.classList.remove('hidden');

        try {
            const formData = new FormData(document.getElementById('tourForm'));
            
            // Günlük programı ekle
            formData.set('daily_program', JSON.stringify(dailyPrograms));
            
            // Otel resimlerini ekle
            formData.set('mekke_hotel_images', JSON.stringify(this.tempHotelImages.mekke));
            formData.set('medine_hotel_images', JSON.stringify(this.tempHotelImages.medine));
            
            // Ana resmi ekle
            if (this.tempImageUrl) {
                formData.set('image_url', this.tempImageUrl);
            }

            const url = this.editingTour ? 
                `/api/admin/tours/${this.editingTour.id}` : 
                '/api/admin/tours';
            
            const method = this.editingTour ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(
                    this.editingTour ? 'Tur başarıyla güncellendi' : 'Tur başarıyla eklendi', 
                    'success'
                );
                
                this.closeTourForm();
                this.loadTours();
                
            } else {
                this.showNotification('Hata: ' + data.message, 'error');
            }

        } catch (error) {
            console.error('Form submit hatası:', error);
            this.showNotification('Form gönderilirken hata oluştu', 'error');
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            submitText.textContent = this.editingTour ? 'Güncelle' : 'Kaydet';
            submitSpinner.classList.add('hidden');
        }
    }

    closeTourForm() {
        document.getElementById('tourFormModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Reset form data
        document.getElementById('tourForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('mekkeHotelPreview').innerHTML = '';
        document.getElementById('medineHotelPreview').innerHTML = '';
        
        this.editingTour = null;
        this.tempImageUrl = null;
        this.tempHotelImages = { mekke: [], medine: [] };
        dailyPrograms = [];
        renderDailyPrograms();
    }

    // ✅ TOUR ACTIONS
    async toggleTourStatus(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        const newStatus = tour.status === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(`Tur ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı`, 'success');
                this.loadTours();
            } else {
                this.showNotification('Durum değiştirilemedi: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Durum değiştirme hatası:', error);
            this.showNotification('Durum değiştirilemedi', 'error');
        }
    }

    async deleteTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        if (!confirm(`"${tour.title}" turunu silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/tours/${tourId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Tur başarıyla silindi', 'success');
                this.loadTours();
            } else {
                this.showNotification('Tur silinemedi: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Tur silme hatası:', error);
            this.showNotification('Tur silinemedi', 'error');
        }
    }

    async duplicateTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;

        const duplicatedTour = { ...tour };
        duplicatedTour.title = `${tour.title} (Kopya)`;
        delete duplicatedTour.id;
        delete duplicatedTour.created_at;
        delete duplicatedTour.updated_at;

        this.editingTour = null;
        this.populateForm(duplicatedTour);
        
        document.getElementById('tourFormTitle').textContent = 'Tur Kopyala';
        document.getElementById('tourSubmitText').textContent = 'Kaydet';
        document.getElementById('tourFormModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // ✅ FILTERING AND SEARCH
    handleSearch(query) {
        this.filterTours();
    }

    handleCategoryFilter(categoryId) {
        this.filterTours();
    }

    handleStatusFilter(status) {
        this.filterTours();
    }

    filterTours() {
        const searchQuery = document.getElementById('tourSearchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredTours = this.tours.filter(tour => {
            const matchesSearch = !searchQuery || 
                tour.title.toLowerCase().includes(searchQuery) ||
                tour.description?.toLowerCase().includes(searchQuery);
            
            const matchesCategory = !categoryFilter || 
                tour.category_id == categoryFilter;
            
            const matchesStatus = !statusFilter || 
                tour.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.currentPage = 1;
        this.renderToursContent();
    }

    resetFilters() {
        document.getElementById('tourSearchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.filteredTours = [...this.tours];
        this.currentPage = 1;
        this.renderToursContent();
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredTours.length / this.itemsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderToursContent();
        }
    }

    // ✅ UTILITY METHODS
    showError(message) {
        const toursContainer = document.getElementById('toursContent');
        if (toursContainer) {
            toursContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-500 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="toursManager.loadTours()" 
                            class="px-6 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors">
                        Tekrar Dene
                    </button>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Basit notification sistemi
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-md text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ✅ GLOBAL INSTANCE VE FUNCTIONS
if (typeof window !== 'undefined') {
    window.toursManager = new ToursManager();
    console.log('✅ Tours Manager hazır!');
}

// Global functions for form
function openAddTourForm() {
    if (window.toursManager) {
        window.toursManager.openAddTourForm();
    }
}

function closeTourForm() {
    if (window.toursManager) {
        window.toursManager.closeTourForm();
    }
}

function removeMainImage() {
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('tourImageUpload').value = '';
    
    if (window.toursManager) {
        window.toursManager.tempImageUrl = null;
    }
}