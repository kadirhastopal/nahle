// admin/js/tour-form-extended.js - TAM VE EKSİKSİZ VERSİYON
class ExtendedTourForm {
    constructor() {
        this.formSteps = ['basic', 'details', 'hotels', 'schedule', 'seo'];
        this.currentStep = 0;
        this.formData = {}; // ✅ Kalıcı veri depolama
    }

    // ✅ DÜZELTME: Veri koruma sistemi
    saveStepData() {
        const currentStepElement = document.getElementById(`step-${this.formSteps[this.currentStep]}`);
        if (!currentStepElement) return;

        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });

        console.log(`💾 Step ${this.currentStep} verileri kaydedildi:`, this.formData);
    }

    // ✅ DÜZELTME: Veri yükleme sistemi
    loadStepData() {
        const currentStepElement = document.getElementById(`step-${this.formSteps[this.currentStep]}`);
        if (!currentStepElement) return;

        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (this.formData[input.name] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = this.formData[input.name];
                } else if (input.type === 'radio') {
                    input.checked = input.value === this.formData[input.name];
                } else {
                    input.value = this.formData[input.name];
                }
            }
        });

        console.log(`📥 Step ${this.currentStep} verileri yüklendi`);
    }

    // Ana form HTML'ini oluştur - TAM VERSİYON
    renderExtendedTourModal() {
        return `
            <div id="tourModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                    <div class="mt-3">
                        <!-- Modal Header -->
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-semibold text-gray-900" id="tourModalTitle">Yeni Tur Ekle</h3>
                            <button onclick="toursManager.closeTourModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Progress Steps -->
                        <div class="mb-8">
                            <div class="flex items-center justify-between">
                                ${this.renderProgressSteps()}
                            </div>
                        </div>

                        <!-- Form Content -->
                        <form id="tourForm" class="space-y-6">
                            <!-- Step 1: Temel Bilgiler -->
                            <div id="step-basic" class="step-content">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">📋 Temel Bilgiler</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tur Başlığı *</label>
                                        <input type="text" name="title" required 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                                        <select name="category_id" required 
                                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                            <option value="">Kategori Seçin</option>
                                            <!-- Kategoriler dinamik olarak yüklenecek -->
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                        <select name="status" 
                                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                            <option value="active">Aktif</option>
                                            <option value="inactive">Pasif</option>
                                            <option value="full">Dolu</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Toplam Gün Sayısı *</label>
                                        <input type="number" name="duration_days" required min="1" max="30"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Gece Sayısı</label>
                                        <input type="number" name="duration_nights" min="0" max="29"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Mekke Gece Sayısı</label>
                                        <input type="number" name="mekke_nights" min="0" max="20"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Medine Gece Sayısı</label>
                                        <input type="number" name="medine_nights" min="0" max="15"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi *</label>
                                        <input type="date" name="start_date" required
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                                        <input type="date" name="end_date"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL) *</label>
                                        <input type="number" name="price_try" required min="0" step="0.01"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kontenjan</label>
                                        <input type="number" name="quota" min="1" max="1000"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
                                        <textarea name="short_description" rows="3" maxlength="200"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                                    </div>

                                    <div class="md:col-span-2 flex items-center gap-4">
                                        <label class="flex items-center">
                                            <input type="checkbox" name="featured" class="mr-2">
                                            <span class="text-sm font-medium text-gray-700">Öne Çıkarılsın</span>
                                        </label>
                                        <div class="flex items-center gap-2">
                                            <label class="block text-sm font-medium text-gray-700">Öncelik Sırası</label>
                                            <input type="number" name="priority" min="0" max="100" value="0"
                                                   class="w-20 px-2 py-1 border border-gray-300 rounded-md">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 2: Uçuş ve Sorumlular -->
                            <div id="step-details" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">✈️ Uçuş Bilgileri ve Sorumlular</h4>
                                
                                <!-- Uçuş Bilgileri -->
                                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h5 class="font-medium text-gray-800 mb-3">Gidiş Uçuş Bilgileri</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Havayolu</label>
                                            <input type="text" name="departure_airline" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Kalkış Şehri</label>
                                            <input type="text" name="departure_city" value="İstanbul"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Havalimanı</label>
                                            <select name="departure_airport" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <option value="IST">İstanbul Havalimanı (IST)</option>
                                                <option value="SAW">Sabiha Gökçen (SAW)</option>
                                                <option value="ESB">Esenboğa (ESB)</option>
                                                <option value="ADB">Adnan Menderes (ADB)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h5 class="font-medium text-gray-800 mb-3">Dönüş Uçuş Bilgileri</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Havayolu</label>
                                            <input type="text" name="return_airline" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Varış Şehri</label>
                                            <input type="text" name="arrival_city" value="İstanbul"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Havalimanı</label>
                                            <select name="arrival_airport" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <option value="IST">İstanbul Havalimanı (IST)</option>
                                                <option value="SAW">Sabiha Gökçen (SAW)</option>
                                                <option value="ESB">Esenboğa (ESB)</option>
                                                <option value="ADB">Adnan Menderes (ADB)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- Sorumlular -->
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <h5 class="font-medium text-gray-800 mb-4">👥 Sorumlular</h5>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <!-- Havalimanı Sorumlusu -->
                                        <div>
                                            <h6 class="text-sm font-medium text-gray-700 mb-2">Havalimanı Sorumlusu</h6>
                                            <div class="space-y-2">
                                                <input type="text" name="airport_responsible_name" placeholder="Ad Soyad"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <input type="tel" name="airport_responsible_phone" placeholder="Telefon"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                        </div>

                                        <!-- Medine Sorumlusu -->
                                        <div>
                                            <h6 class="text-sm font-medium text-gray-700 mb-2">Medine Sorumlusu</h6>
                                            <div class="space-y-2">
                                                <input type="text" name="medine_responsible_name" placeholder="Ad Soyad"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <input type="tel" name="medine_responsible_phone" placeholder="Telefon"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                        </div>

                                        <!-- Mekke Sorumlusu 1 -->
                                        <div>
                                            <h6 class="text-sm font-medium text-gray-700 mb-2">Mekke Sorumlusu 1</h6>
                                            <div class="space-y-2">
                                                <input type="text" name="mekke_responsible1_name" placeholder="Ad Soyad"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <input type="tel" name="mekke_responsible1_phone" placeholder="Telefon"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                        </div>

                                        <!-- Mekke Sorumlusu 2 -->
                                        <div>
                                            <h6 class="text-sm font-medium text-gray-700 mb-2">Mekke Sorumlusu 2</h6>
                                            <div class="space-y-2">
                                                <input type="text" name="mekke_responsible2_name" placeholder="Ad Soyad"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <input type="tel" name="mekke_responsible2_phone" placeholder="Telefon"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3: Oteller -->
                            <div id="step-hotels" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">🏨 Otel Bilgileri</h4>
                                
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <!-- Mekke Oteli -->
                                    <div class="bg-green-50 p-6 rounded-lg">
                                        <h5 class="font-medium text-gray-800 mb-4 flex items-center">
                                            🕋 Mekke Oteli
                                        </h5>
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Otel Adı</label>
                                                <input type="text" name="mekke_hotel_name" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                                <input type="text" name="mekke_hotel_address" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Bölge</label>
                                                <select name="mekke_hotel_region" 
                                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                    <option value="">Bölge Seçin</option>
                                                    <option value="Ajyad">Ajyad</option>
                                                    <option value="Aziziye">Aziziye</option>
                                                    <option value="Misfalah">Misfalah</option>
                                                    <option value="Shisha">Shisha</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Harem'e Mesafe (metre)</label>
                                                <input type="number" name="mekke_hotel_distance" min="0" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Yıldız</label>
                                                <select name="mekke_hotel_stars" 
                                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                    <option value="">Yıldız Seçin</option>
                                                    <option value="3">3 Yıldız</option>
                                                    <option value="4">4 Yıldız</option>
                                                    <option value="5">5 Yıldız</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Otel Özellikleri</label>
                                                <textarea name="mekke_hotel_features" rows="3" placeholder="WiFi, Klima, 24 saat room service..."
                                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Medine Oteli -->
                                    <div class="bg-blue-50 p-6 rounded-lg">
                                        <h5 class="font-medium text-gray-800 mb-4 flex items-center">
                                            🕌 Medine Oteli
                                        </h5>
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Otel Adı</label>
                                                <input type="text" name="medine_hotel_name" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                                <input type="text" name="medine_hotel_address" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Bölge</label>
                                                <select name="medine_hotel_region" 
                                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                    <option value="">Bölge Seçin</option>
                                                    <option value="Haram Civarı">Haram Civarı</option>
                                                    <option value="Merkez">Merkez</option>
                                                    <option value="Quba">Quba</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Harem'e Mesafe (metre)</label>
                                                <input type="number" name="medine_hotel_distance" min="0" 
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Yıldız</label>
                                                <select name="medine_hotel_stars" 
                                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                    <option value="">Yıldız Seçin</option>
                                                    <option value="3">3 Yıldız</option>
                                                    <option value="4">4 Yıldız</option>
                                                    <option value="5">5 Yıldız</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Otel Özellikleri</label>
                                                <textarea name="medine_hotel_features" rows="3" placeholder="WiFi, Klima, 24 saat room service..."
                                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 4: Program -->
                            <div id="step-schedule" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">📅 Program Detayları</h4>
                                
                                <div class="space-y-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Detaylı Açıklama</label>
                                        <textarea name="description" rows="6" 
                                                  placeholder="Turun detaylı açıklamasını buraya yazın..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                    </div>

                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Dahil Olan Hizmetler</label>
                                            <textarea name="included_services" rows="8" 
                                                      placeholder="• Otel konaklama&#10;• Uçak bileti (gidiş-dönüş)&#10;• Rehberlik hizmeti&#10;• Transfer hizmetleri&#10;• Vize işlemleri&#10;• Sigorta"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Dahil Olmayan Hizmetler</label>
                                            <textarea name="excluded_services" rows="8" 
                                                      placeholder="• Kişisel harcamalar&#10;• Ekstra turlar&#10;• Fazla bagaj ücreti&#10;• Oda servisi&#10;• Kişisel sigorta&#10;• Ekstra yemekler"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Ziyaret Edilecek Yerler</label>
                                        <textarea name="visit_places" rows="5" 
                                                  placeholder="• Mescid-i Haram&#10;• Mescid-i Nebevi&#10;• Uhud Dağı&#10;• Kuba Camii&#10;• Jannetül Baki Mezarlığı"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                    </div>

                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Gerekli Belgeler</label>
                                            <textarea name="required_documents" rows="4" 
                                                      placeholder="• Pasaport (en az 6 ay geçerli)&#10;• Vize&#10;• Aşı kartı&#10;• Fotoğraflar"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Ekstra Özellikler</label>
                                            <textarea name="extra_features" rows="4" 
                                                      placeholder="• Türkçe rehberlik&#10;• 24 saat iletişim&#10;• Grup büyüklüğü: 20-30 kişi&#10;• Özel aktiviteler"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Ödeme Koşulları</label>
                                            <textarea name="payment_terms" rows="4" 
                                                      placeholder="• %30 kapora ile rezervasyon&#10;• Kalan tutar 30 gün öncesinde&#10;• Kredi kartı ile taksitlendirme&#10;• Banka havalesi kabul edilir"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">İptal Koşulları</label>
                                            <textarea name="cancellation_policy" rows="4" 
                                                      placeholder="• 60 gün öncesi: %10 kesinti&#10;• 30 gün öncesi: %25 kesinti&#10;• 15 gün öncesi: %50 kesinti&#10;• Son dakika iptal: %100 kesinti"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Önemli Notlar</label>
                                        <textarea name="important_notes" rows="4" 
                                                  placeholder="Tur öncesi bildirilmesi gereken önemli notlar..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 5: SEO & Medya -->
                            <div id="step-seo" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">🔍 SEO & Medya Ayarları</h4>
                                
                                <div class="space-y-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">URL (Slug)</label>
                                        <input type="text" name="slug" 
                                               placeholder="umre-turu-2024-ekonomik" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        <p class="text-xs text-gray-500 mt-1">URL'de kullanılacak benzersiz isim (otomatik oluşturulur)</p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">SEO Anahtar Kelimeler</label>
                                        <input type="text" name="seo_keywords" 
                                               placeholder="umre, hac, tur, ziyaret, mekke, medine" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        <p class="text-xs text-gray-500 mt-1">Virgülle ayırarak yazın</p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Meta Açıklama</label>
                                        <textarea name="meta_description" rows="3" maxlength="160" 
                                                  placeholder="Arama motorlarında görünecek açıklama (160 karakter)"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        <p class="text-xs text-gray-500 mt-1">Google'da görünecek açıklama</p>
                                    </div>

                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h5 class="font-medium text-gray-800 mb-3">Gelişmiş Ayarlar</h5>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Öncelik Sırası</label>
                                                <input type="number" name="priority" min="0" max="100" value="0"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <p class="text-xs text-gray-500 mt-1">Yüksek değer üstte görünür (0-100)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 p-4 rounded-lg">
                                        <h5 class="font-medium text-gray-800 mb-3">📱 Sosyal Medya Önizleme</h5>
                                        <p class="text-sm text-gray-600 mb-3">Bu tur sosyal medyada şöyle görünecek:</p>
                                        <div class="bg-white p-4 border rounded-lg">
                                            <div class="font-medium text-gray-900 mb-1" id="preview-title">Tur Başlığı</div>
                                            <div class="text-sm text-gray-600 mb-2" id="preview-description">Kısa açıklama burada görünecek...</div>
                                            <div class="text-xs text-green-600" id="preview-url">nahletur.com/tur-adi</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Navigation Buttons -->
                            <div class="flex justify-between items-center pt-6 border-t border-gray-200">
                                <button type="button" id="prevBtn" onclick="extendedTourForm.prevStep()" 
                                        class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors hidden">
                                    ⬅️ Önceki
                                </button>
                                
                                <div class="flex gap-3">
                                    <button type="button" onclick="toursManager.closeTourModal()" 
                                            class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                                        İptal
                                    </button>
                                    
                                    <button type="button" id="nextBtn" onclick="extendedTourForm.nextStep()" 
                                            class="px-6 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors">
                                        Sonraki ➡️
                                    </button>
                                    
                                    <button type="submit" id="submitBtn" 
                                            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors hidden">
                                        💾 Kaydet
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Progress steps render
    renderProgressSteps() {
        const steps = [
            { id: 'basic', title: 'Temel Bilgiler', icon: '📋' },
            { id: 'details', title: 'Uçuş & Sorumlular', icon: '✈️' },
            { id: 'hotels', title: 'Oteller', icon: '🏨' },
            { id: 'schedule', title: 'Program', icon: '📅' },
            { id: 'seo', title: 'SEO & Medya', icon: '🔍' }
        ];

        return steps.map((step, index) => {
            const isActive = index === this.currentStep;
            const isCompleted = index < this.currentStep;
            
            return `
                <div class="flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full ${
                            isActive ? 'bg-admin-primary text-white' : 
                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                        }">
                            ${isCompleted ? '✓' : step.icon}
                        </div>
                        <span class="ml-2 text-sm font-medium hidden md:inline">${step.title}</span>
                    </div>
                    ${index < steps.length - 1 ? `
                        <div class="flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'} rounded hidden md:block"></div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // ✅ DÜZELTME: Next step fonksiyonu
    nextStep() {
        // Mevcut adım verilerini kaydet
        this.saveStepData();
        
        // Doğrulama
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.currentStep < this.formSteps.length - 1) {
            this.currentStep++;
            this.updateStepVisibility();
            this.updateNavigationButtons();
            this.updateProgressSteps();
            
            // Yeni adımın verilerini yükle
            setTimeout(() => {
                this.loadStepData();
            }, 100);
        }
    }

    // ✅ DÜZELTME: Previous step fonksiyonu
    prevStep() {
        // Mevcut adım verilerini kaydet
        this.saveStepData();
        
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStepVisibility();
            this.updateNavigationButtons();
            this.updateProgressSteps();
            
            // Önceki adımın verilerini yükle
            setTimeout(() => {
                this.loadStepData();
            }, 100);
        }
    }

    updateStepVisibility() {
        // Tüm adımları gizle
        this.formSteps.forEach(step => {
            const element = document.getElementById(`step-${step}`);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Mevcut adımı göster
        const currentElement = document.getElementById(`step-${this.formSteps[this.currentStep]}`);
        if (currentElement) {
            currentElement.classList.remove('hidden');
        }
    }

    updateProgressSteps() {
        const progressContainer = document.querySelector('.flex.items-center.justify-between');
        if (progressContainer) {
            progressContainer.innerHTML = this.renderProgressSteps();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Önceki butonu
        if (this.currentStep === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        // Sonraki/Kaydet butonları
        if (this.currentStep === this.formSteps.length - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.formSteps[this.currentStep]}`);
        if (!currentStepElement) return true;

        // Required alanları kontrol et
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
                
                // Error mesajı göster
                this.showFieldError(field, 'Bu alan zorunludur');
            } else {
                field.classList.remove('border-red-500');
                this.removeFieldError(field);
            }
        });

        if (!isValid) {
            this.showToast('Lütfen zorunlu alanları doldurun', 'error');
        }

        return isValid;
    }

    showFieldError(field, message) {
        // Varolan error mesajını kaldır
        this.removeFieldError(field);
        
        // Yeni error mesajı ekle
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1 field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    removeFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showToast(message, type = 'info') {
        // Toast bildirim sistemi
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

    // ✅ DÜZELTME: Form verilerini topla - TAM VERSİYON
    collectFormData() {
        // Son adımın verilerini de kaydet
        this.saveStepData();

        // Form verilerini temizle ve düzenle
        const cleanData = { ...this.formData };
        
        // JSON formatına çevrilmesi gereken alanları düzenle
        cleanData.departure_info = {
            airline: cleanData.departure_airline || '',
            departure_city: cleanData.departure_city || 'İstanbul',
            departure_airport: cleanData.departure_airport || 'IST'
        };

        cleanData.return_info = {
            airline: cleanData.return_airline || '',
            arrival_city: cleanData.arrival_city || 'İstanbul', 
            arrival_airport: cleanData.arrival_airport || 'IST'
        };

        cleanData.responsible_contacts = {
            airport: {
                name: cleanData.airport_responsible_name || '',
                phone: cleanData.airport_responsible_phone || ''
            },
            medine: {
                name: cleanData.medine_responsible_name || '',
                phone: cleanData.medine_responsible_phone || ''
            },
            mekke: [
                {
                    name: cleanData.mekke_responsible1_name || '',
                    phone: cleanData.mekke_responsible1_phone || ''
                },
                {
                    name: cleanData.mekke_responsible2_name || '',
                    phone: cleanData.mekke_responsible2_phone || ''
                }
            ]
        };

        cleanData.mekke_hotel = {
            name: cleanData.mekke_hotel_name || '',
            address: cleanData.mekke_hotel_address || '',
            region: cleanData.mekke_hotel_region || '',
            distance_to_haram: parseInt(cleanData.mekke_hotel_distance) || 0,
            stars: cleanData.mekke_hotel_stars || '',
            features: cleanData.mekke_hotel_features || ''
        };

        cleanData.medine_hotel = {
            name: cleanData.medine_hotel_name || '',
            address: cleanData.medine_hotel_address || '',
            region: cleanData.medine_hotel_region || '',
            distance_to_haram: parseInt(cleanData.medine_hotel_distance) || 0,
            stars: cleanData.medine_hotel_stars || '',
            features: cleanData.medine_hotel_features || ''
        };

        // Checkbox değerini düzelt
        cleanData.featured = Boolean(cleanData.featured);

        // Gereksiz alanları temizle
        const fieldsToRemove = [
            'departure_airline', 'departure_city', 'departure_airport',
            'return_airline', 'arrival_city', 'arrival_airport',
            'airport_responsible_name', 'airport_responsible_phone',
            'medine_responsible_name', 'medine_responsible_phone',
            'mekke_responsible1_name', 'mekke_responsible1_phone',
            'mekke_responsible2_name', 'mekke_responsible2_phone',
            'mekke_hotel_name', 'mekke_hotel_address', 'mekke_hotel_region',
            'mekke_hotel_distance', 'mekke_hotel_stars', 'mekke_hotel_features',
            'medine_hotel_name', 'medine_hotel_address', 'medine_hotel_region',
            'medine_hotel_distance', 'medine_hotel_stars', 'medine_hotel_features'
        ];

        fieldsToRemove.forEach(field => delete cleanData[field]);

        return cleanData;
    }

    // Form'u sıfırla
    resetForm() {
        this.currentStep = 0;
        this.formData = {};
        
        const form = document.getElementById('tourForm');
        if (form) {
            form.reset();
        }
        
        this.updateStepVisibility();
        this.updateNavigationButtons();
        this.updateProgressSteps();
    }

    // Kategorileri yükle
    async loadCategories() {
        try {
            const response = await fetch('/api/categories', {
                headers: window.authManager.getAuthHeaders()
            });
            
            if (response.ok) {
                const result = await response.json();
                const categorySelect = document.querySelector('select[name="category_id"]');
                
                if (categorySelect && result.success) {
                    // Mevcut seçenekleri temizle (ilk seçenek hariç)
                    categorySelect.innerHTML = '<option value="">Kategori Seçin</option>';
                    
                    // Kategorileri ekle
                    result.data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                    
                    // Mevcut seçimi koru
                    if (this.formData.category_id) {
                        categorySelect.value = this.formData.category_id;
                    }
                }
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    }

    // ✅ DÜZELTME: Mevcut tur verilerini form'a yükle - TAM VERSİYON  
    populateForm(tour) {
        if (!tour) return;
        
        console.log('📥 Tur verileri forma yükleniyor:', tour);
        
        // Tüm tur verilerini formData'ya kopyala
        this.formData = { ...tour };
        
        // Kategori ID'sini ayarla
        if (tour.Category && tour.Category.id) {
            this.formData.category_id = tour.Category.id;
        }

        // Boolean alanları düzelt
        this.formData.featured = Boolean(tour.featured);
        
        // JSON alanlarını çöz
        if (tour.departure_info) {
            const dep = tour.departure_info;
            this.formData.departure_airline = dep.airline || '';
            this.formData.departure_city = dep.departure_city || 'İstanbul';
            this.formData.departure_airport = dep.departure_airport || 'IST';
        }

        if (tour.return_info) {
            const ret = tour.return_info;
            this.formData.return_airline = ret.airline || '';
            this.formData.arrival_city = ret.arrival_city || 'İstanbul';
            this.formData.arrival_airport = ret.arrival_airport || 'IST';
        }

        if (tour.responsible_contacts) {
            const contacts = tour.responsible_contacts;
            if (contacts.airport) {
                this.formData.airport_responsible_name = contacts.airport.name || '';
                this.formData.airport_responsible_phone = contacts.airport.phone || '';
            }
            if (contacts.medine) {
                this.formData.medine_responsible_name = contacts.medine.name || '';
                this.formData.medine_responsible_phone = contacts.medine.phone || '';
            }
            if (contacts.mekke && contacts.mekke.length > 0) {
                this.formData.mekke_responsible1_name = contacts.mekke[0]?.name || '';
                this.formData.mekke_responsible1_phone = contacts.mekke[0]?.phone || '';
                this.formData.mekke_responsible2_name = contacts.mekke[1]?.name || '';
                this.formData.mekke_responsible2_phone = contacts.mekke[1]?.phone || '';
            }
        }

        if (tour.mekke_hotel) {
            const hotel = tour.mekke_hotel;
            this.formData.mekke_hotel_name = hotel.name || '';
            this.formData.mekke_hotel_address = hotel.address || '';
            this.formData.mekke_hotel_region = hotel.region || '';
            this.formData.mekke_hotel_distance = hotel.distance_to_haram || '';
            this.formData.mekke_hotel_stars = hotel.stars || '';
            this.formData.mekke_hotel_features = hotel.features || '';
        }

        if (tour.medine_hotel) {
            const hotel = tour.medine_hotel;
            this.formData.medine_hotel_name = hotel.name || '';
            this.formData.medine_hotel_address = hotel.address || '';
            this.formData.medine_hotel_region = hotel.region || '';
            this.formData.medine_hotel_distance = hotel.distance_to_haram || '';
            this.formData.medine_hotel_stars = hotel.stars || '';
            this.formData.medine_hotel_features = hotel.features || '';
        }
        
        console.log('✅ Form data hazırlandı:', this.formData);
        
        // İlk adımın verilerini yükle
        setTimeout(() => {
            this.loadStepData();
        }, 100);
    }
}

// Global instance oluştur
const extendedTourForm = new ExtendedTourForm();