// Tours Page Module
class ToursPage {
    constructor() {
        this.tours = [];
        this.categories = [];
        this.currentTour = null;
        this.showForm = false;
        this.hotels = [];
    }

    async render() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading
        contentArea.innerHTML = this.getLoadingHTML();
        
        try {
            // Load data
            await this.loadTours();
            await this.loadCategories();
            
            // Render content
            if (this.showForm) {
                contentArea.innerHTML = this.getTourFormHTML();
                this.bindFormEvents();
            } else {
                contentArea.innerHTML = this.getToursListHTML();
                this.bindListEvents();
            }
            
        } catch (error) {
            console.error('Tours load error:', error);
            contentArea.innerHTML = this.getErrorHTML();
        }
    }

    async loadTours() {
        try {
            const response = await adminAPI.getTours();
            if (response.success) {
                this.tours = response.data.tours;
            }
        } catch (error) {
            console.error('Load tours error:', error);
            this.tours = [];
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

    getToursListHTML() {
        return `
            <div class="card">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-heading">Tur Yönetimi</h3>
                            <p class="text-secondary mt-1">Turlarınızı buradan yönetebilirsiniz</p>
                        </div>
                        <button onclick="window.toursPage.showNewTourForm()" class="btn-primary">
                            <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                            </svg>
                            Yeni Tur Ekle
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    ${this.tours.length === 0 ? this.getEmptyStateHTML() : this.getToursTableHTML()}
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 4a7.962 7.962 0 016 2.291M6 20.7l3.6-1.2A2 2 0 0110.8 19h2.4a2 2 0 011.2.5l3.6 1.2"></path>
                    </svg>
                </div>
                <h3 class="empty-state-title">Henüz tur eklenmemiş</h3>
                <p class="empty-state-text">İlk turunuzu ekleyerek başlayın.</p>
                <button onclick="window.toursPage.showNewTourForm()" class="btn-primary">
                    İlk Turu Ekle
                </button>
            </div>
        `;
    }

    getToursTableHTML() {
        return `
            <div class="overflow-x-auto">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tur Adı</th>
                            <th>Kategori</th>
                            <th>Fiyat</th>
                            <th>Durum</th>
                            <th>Oteller</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.tours.map(tour => `
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-gray-100 rounded-lg mr-4 flex items-center justify-center shadow-sm">
                                            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="font-semibold text-gray-900">${tour.title}</div>
                                            <div class="text-sm text-gray-500">${tour.duration || ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="text-sm">
                                        <div class="font-medium text-gray-900">${tour.category?.name || 'Kategori Yok'}</div>
                                    </div>
                                </td>
                                <td>
                                    <div class="text-sm">
                                        <div class="font-semibold text-gray-900">$${Number(tour.price).toLocaleString()}</div>
                                        ${tour.discount_price ? `<div class="text-xs text-green-600 font-medium">İndirim: $${Number(tour.discount_price).toLocaleString()}</div>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <span class="status-${tour.status}">${this.getStatusText(tour.status)}</span>
                                </td>
                                <td>
                                    <div class="text-sm text-gray-600">
                                        ${tour.hotels && Array.isArray(tour.hotels) ? tour.hotels.length + ' Otel' : '0 Otel'}
                                    </div>
                                </td>
                                <td>
                                    <div class="flex space-x-2">
                                        <button onclick="window.toursPage.editTour(${tour.id})" class="action-btn action-btn-edit">
                                            Düzenle
                                        </button>
                                        <button onclick="window.toursPage.deleteTour(${tour.id})" class="action-btn action-btn-delete">
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

    getTourFormHTML() {
        const isEdit = this.currentTour !== null;
        const tour = this.currentTour || {};
        
        // Hotels verilerini düzgün yükle
        if (isEdit && tour.hotels && Array.isArray(tour.hotels)) {
            this.hotels = [...tour.hotels]; // Deep copy
        } else if (!isEdit) {
            this.hotels = []; // Yeni tur için temiz başla
        }
        
        return `
            <div class="card">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-heading">
                                ${isEdit ? 'Tur Düzenle' : 'Yeni Tur Ekle'}
                            </h3>
                            <p class="text-secondary mt-1">${isEdit ? 'Tur bilgilerini güncelleyin' : 'Detaylı tur bilgilerini girin'}</p>
                        </div>
                        <button onclick="window.toursPage.showToursList()" class="btn-secondary">
                            ← Geri Dön
                        </button>
                    </div>
                </div>
                
                <form id="tourForm" class="p-6">
                    <!-- Temel Bilgiler -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">📋 Temel Bilgiler</h4>
                        <div class="space-y-6">
                            <div class="form-row form-row-2">
                                <div>
                                    <label class="form-label">Tur Adı *</label>
                                    <input type="text" name="title" value="${tour.title || ''}" class="form-input" placeholder="Örn: Umre Turu - 15 Gün" required>
                                </div>
                                
                                <div>
                                    <label class="form-label">Kategori *</label>
                                    <select name="category_id" class="form-input" required>
                                        <option value="">Kategori Seçin</option>
                                        ${this.categories.map(cat => `
                                            <option value="${cat.id}" ${tour.category_id == cat.id ? 'selected' : ''}>${cat.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="form-label">Kısa Açıklama</label>
                                <textarea name="description" rows="3" class="form-input" placeholder="Tur hakkında kısa açıklama...">${tour.description || ''}</textarea>
                            </div>
                            
                            <div>
                                <label class="form-label">Detaylı Açıklama</label>
                                <textarea name="content" rows="6" class="form-input" placeholder="Tur hakkında detaylı bilgi, özellikler, notlar...">${tour.content || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Fiyat ve Tarih Bilgileri -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">💰 Fiyat ve Tarih</h4>
                        <div class="space-y-6">
                            <div class="form-row form-row-3">
                                <div>
                                    <label class="form-label">Fiyat ($) *</label>
                                    <input type="number" name="price" value="${tour.price || ''}" class="form-input" placeholder="5000" required>
                                </div>
                                
                                <div>
                                    <label class="form-label">İndirimli Fiyat ($)</label>
                                    <input type="number" name="discount_price" value="${tour.discount_price || ''}" class="form-input" placeholder="4500">
                                </div>
                                
                                <div>
                                    <label class="form-label">Süre</label>
                                    <input type="text" name="duration" value="${tour.duration || ''}" class="form-input" placeholder="15 Gün">
                                </div>
                            </div>
                            
                            <div class="form-row form-row-2">
                                <div>
                                    <label class="form-label">Başlangıç Tarihi</label>
                                    <input type="date" name="start_date" value="${tour.start_date ? tour.start_date.split('T')[0] : ''}" class="form-input">
                                </div>
                                
                                <div>
                                    <label class="form-label">Bitiş Tarihi</label>
                                    <input type="date" name="end_date" value="${tour.end_date ? tour.end_date.split('T')[0] : ''}" class="form-input">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lokasyon ve Kapasite -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">📍 Lokasyon ve Kapasite</h4>
                        <div class="space-y-6">
                            <div class="form-row form-row-2">
                                <div>
                                    <label class="form-label">Lokasyon</label>
                                    <input type="text" name="location" value="${tour.location || ''}" class="form-input" placeholder="Mekke, Medine">
                                </div>
                                
                                <div>
                                    <label class="form-label">Maksimum Katılımcı</label>
                                    <input type="number" name="max_participants" value="${tour.max_participants || ''}" class="form-input" placeholder="40">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Otel Yönetimi -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            🏨 Otel Yönetimi
                            <button type="button" onclick="window.toursPage.addHotel()" class="btn-primary ml-4 text-sm py-2 px-4">
                                + Otel Ekle
                            </button>
                        </h4>
                        <div id="hotelsContainer" class="space-y-4">
                            ${this.getHotelsHTML()}
                        </div>
                    </div>

                    <!-- Program ve İtinerari -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">📅 Program ve İtinerari</h4>
                        <div class="space-y-6">
                            <div>
                                <label class="form-label">Günlük Program</label>
                                <textarea name="itinerary" rows="8" class="form-input" placeholder="1. Gün: Istanbul - Cidde
2. Gün: Mekke'ye Varış
3. Gün: Umre İbadeti
...">${tour.itinerary || ''}</textarea>
                                <p class="text-sm text-gray-500 mt-1">Her günü ayrı satırda yazın</p>
                            </div>
                        </div>
                    </div>

                    <!-- Dahil Olan/Olmayan Hizmetler -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">✅ Hizmetler</h4>
                        <div class="space-y-6">
                            <div class="form-row form-row-2">
                                <div>
                                    <label class="form-label">Dahil Olan Hizmetler</label>
                                    <textarea name="included_services" rows="6" class="form-input" placeholder="• Havayolu bileti (gidiş-dönüş)
- Vize işlemleri
- Konaklama (14 gece)
- Günde 3 öğün yemek
- Umre rehberlik hizmeti
- Hava alanı transferleri">${tour.included_services || ''}</textarea>
                                </div>
                                
                                <div>
                                    <label class="form-label">Dahil Olmayan Hizmetler</label>
                                    <textarea name="excluded_services" rows="6" class="form-input" placeholder="• Kişisel harcamalar
- İçecekler (yemekler haricinde)
- Ek turlar
- Bahşişler
- Seyahat sigortası">${tour.excluded_services || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Notlar ve Şartlar -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">📝 Notlar ve Şartlar</h4>
                        <div class="space-y-6">
                            <div>
                                <label class="form-label">Önemli Notlar</label>
                                <textarea name="important_notes" rows="4" class="form-input" placeholder="• Pasaport geçerlilik süresi en az 6 ay olmalıdır
- Kadın misafirlerimiz için mahrem gereklidir
- Sağlık raporu gerekebilir">${tour.important_notes || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- SEO ve Ayarlar -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">🔍 SEO ve Ayarlar</h4>
                        <div class="space-y-6">
                            <div class="form-row form-row-2">
                                <div>
                                    <label class="form-label">Meta Başlık</label>
                                    <input type="text" name="meta_title" value="${tour.meta_title || ''}" class="form-input" placeholder="SEO için sayfa başlığı">
                                </div>
                                
                                <div>
                                    <label class="form-label">Durum</label>
                                    <select name="status" class="form-input">
                                        <option value="draft" ${tour.status === 'draft' ? 'selected' : ''}>Taslak</option>
                                        <option value="active" ${tour.status === 'active' ? 'selected' : ''}>Aktif</option>
                                        <option value="inactive" ${tour.status === 'inactive' ? 'selected' : ''}>Pasif</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="form-label">Meta Açıklama</label>
                                <textarea name="meta_description" rows="2" class="form-input" placeholder="SEO için sayfa açıklaması (160 karakter)">${tour.meta_description || ''}</textarea>
                            </div>
                            
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" name="featured" ${tour.featured ? 'checked' : ''} class="mr-3 rounded border-gray-300">
                                    <span class="form-label mb-0">Öne Çıkan Tur</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center pt-6 border-t border-gray-200">
                        <div class="text-sm text-gray-500">
                            * işaretli alanlar zorunludur
                        </div>
                        <div class="flex space-x-4">
                            <button type="button" onclick="window.toursPage.showToursList()" class="btn-secondary">
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

    getHotelsHTML() {
        if (this.hotels.length === 0) {
            return '<p class="text-gray-500 text-center py-4">Henüz otel eklenmemiş. "Otel Ekle" butonuna tıklayarak başlayın.</p>';
        }

        return this.hotels.map((hotel, index) => `
            <div class="hotel-item card p-4" data-index="${index}">
                <div class="flex justify-between items-start mb-4">
                    <h5 class="font-semibold text-gray-800">Otel ${index + 1}</h5>
                    <button type="button" onclick="window.toursPage.removeHotel(${index})" class="text-red-600 hover:text-red-800 text-sm">
                        × Sil
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="form-row form-row-2">
                        <div>
                            <label class="form-label">Otel Adı *</label>
                            <input type="text" name="hotels[${index}][name]" value="${hotel.name || ''}" class="form-input" placeholder="Örn: Hilton Makkah" required>
                        </div>
                        <div>
                            <label class="form-label">Yıldız Sayısı</label>
                            <select name="hotels[${index}][stars]" class="form-input">
                                <option value="">Seçin</option>
                                <option value="3" ${hotel.stars == 3 ? 'selected' : ''}>3 Yıldız</option>
                                <option value="4" ${hotel.stars == 4 ? 'selected' : ''}>4 Yıldız</option>
                                <option value="5" ${hotel.stars == 5 ? 'selected' : ''}>5 Yıldız</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row form-row-2">
                        <div>
                            <label class="form-label">Şehir</label>
                            <input type="text" name="hotels[${index}][city]" value="${hotel.city || ''}" class="form-input" placeholder="Örn: Mekke">
                        </div>
                        <div>
                            <label class="form-label">Mesafeye Yakınlık</label>
                            <input type="text" name="hotels[${index}][distance]" value="${hotel.distance || ''}" class="form-input" placeholder="Örn: Haram'a 200m">
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Otel Açıklaması</label>
                        <textarea name="hotels[${index}][description]" rows="3" class="form-input" placeholder="Otel özellikleri, imkanlar, oda tipleri...">${hotel.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row form-row-2">
                        <div>
                            <label class="form-label">Check-in Tarihi</label>
                            <input type="date" name="hotels[${index}][checkin]" value="${hotel.checkin || ''}" class="form-input">
                        </div>
                        <div>
                            <label class="form-label">Check-out Tarihi</label>
                            <input type="date" name="hotels[${index}][checkout]" value="${hotel.checkout || ''}" class="form-input">
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    addHotel() {
        this.hotels.push({
            name: '',
            stars: '',
            city: '',
            distance: '',
            description: '',
            images: [],
            checkin: '',
            checkout: ''
        });
        this.updateHotelsContainer();
    }

    removeHotel(index) {
        if (confirm('Bu oteli kaldırmak istediğinizden emin misiniz?')) {
            this.hotels.splice(index, 1);
            this.updateHotelsContainer();
        }
    }

    updateHotelsContainer() {
        const container = document.getElementById('hotelsContainer');
        if (container) {
            container.innerHTML = this.getHotelsHTML();
        }
    }

    bindListEvents() {
        // List events are bound via onclick attributes
    }

    bindFormEvents() {
        const form = document.getElementById('tourForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        // Process hotels data
        const hotelsData = [];
        this.hotels.forEach((_, index) => {
            const hotel = {
                name: formData.get(`hotels[${index}][name]`),
                stars: formData.get(`hotels[${index}][stars]`) ? parseInt(formData.get(`hotels[${index}][stars]`)) : null,
                city: formData.get(`hotels[${index}][city]`),
                distance: formData.get(`hotels[${index}][distance]`),
                description: formData.get(`hotels[${index}][description]`),
                checkin: formData.get(`hotels[${index}][checkin]`),
                checkout: formData.get(`hotels[${index}][checkout]`),
                images: []
            };
            if (hotel.name) {
                hotelsData.push(hotel);
            }
        });

        const tourData = {
            title: formData.get('title'),
            slug: this.generateSlug(formData.get('title')),
            description: formData.get('description'),
            content: formData.get('content'),
            category_id: parseInt(formData.get('category_id')),
            price: parseFloat(formData.get('price')),
            discount_price: formData.get('discount_price') ? parseFloat(formData.get('discount_price')) : null,
            duration: formData.get('duration'),
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
            location: formData.get('location'),
            max_participants: formData.get('max_participants') ? parseInt(formData.get('max_participants')) : 0,
            itinerary: formData.get('itinerary'),
            hotels: hotelsData,
            included_services: formData.get('included_services'),
            excluded_services: formData.get('excluded_services'),
            important_notes: formData.get('important_notes'),
            status: formData.get('status'),
            featured: formData.get('featured') ? true : false,
            meta_title: formData.get('meta_title'),
            meta_description: formData.get('meta_description')
        };

        try {
            let response;
            if (this.currentTour) {
                response = await adminAPI.updateTour(this.currentTour.id, tourData);
            } else {
                response = await adminAPI.createTour(tourData);
            }

            if (response.success) {
                showToast(this.currentTour ? 'Tur güncellendi!' : 'Tur eklendi!', 'success');
                this.showToursList();
            }
        } catch (error) {
            showToast('Hata: ' + error.message, 'error');
        }
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Aktif',
            'inactive': 'Pasif',
            'draft': 'Taslak'
        };
        return statusMap[status] || status;
    }

    showNewTourForm() {
        this.currentTour = null;
        this.showForm = true;
        this.hotels = []; // Temiz başla
        this.render();
    }

    showToursList() {
        this.showForm = false;
        this.currentTour = null;
        this.hotels = []; // Temizle
        this.render();
    }

    async editTour(tourId) {
        try {
            // Turu bul
            this.currentTour = this.tours.find(t => t.id === tourId);
            if (!this.currentTour) {
                showToast('Tur bulunamadı!', 'error');
                return;
            }
            
            this.showForm = true;
            this.render();
        } catch (error) {
            showToast('Düzenleme hatası: ' + error.message, 'error');
        }
    }

    async deleteTour(tourId) {
        if (confirm('Bu turu silmek istediğinizden emin misiniz?')) {
            try {
                const response = await adminAPI.deleteTour(tourId);
                if (response.success) {
                    showToast('Tur silindi!', 'success');
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
                <p class="text-secondary">Turlar yükleniyor...</p>
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
                <p class="text-secondary mb-4">Tur verilerini yüklerken bir hata oluştu.</p>
                <button onclick="window.toursPage.render()" class="btn-primary">Tekrar Dene</button>
            </div>
        `;
    }
}

// Initialize tours page
window.toursPage = new ToursPage();
