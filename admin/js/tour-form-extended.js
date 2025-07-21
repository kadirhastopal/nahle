// admin/js/tour-form-extended.js - Gelişmiş Tur Form Sistemi
class ExtendedTourForm {
    constructor() {
        this.formSteps = ['basic', 'details', 'hotels', 'schedule', 'seo'];
        this.currentStep = 0;
        this.formData = {};
    }

    // Ana form HTML'ini oluştur
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
                                        <input type="number" name="medine_nights" min="0" max="20"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi *</label>
                                        <input type="date" name="start_date" required
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi *</label>
                                        <input type="date" name="end_date" required
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL) *</label>
                                        <input type="number" name="price_try" required min="0" step="0.01"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                                        <input type="number" name="quota" min="1" max="500"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary">
                                    </div>

                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
                                        <textarea name="short_description" rows="2" maxlength="200"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                                                  placeholder="Maksimum 200 karakter"></textarea>
                                    </div>

                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Detaylı Açıklama</label>
                                        <textarea name="description" rows="4"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"></textarea>
                                    </div>

                                    <div class="md:col-span-2 flex items-center gap-4">
                                        <label class="flex items-center">
                                            <input type="checkbox" name="featured" value="1" class="mr-2">
                                            <span class="text-sm font-medium text-gray-700">⭐ Öne Çıkan Tur</span>
                                        </label>
                                        <div>
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
                                    <h5 class="font-medium text-gray-800 mb-3">👥 Sorumlu Kişiler</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">🛫 Havalimanı Sorumlusu</label>
                                            <input type="text" name="airport_responsible_name" placeholder="Ad Soyad"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2">
                                            <input type="tel" name="airport_responsible_phone" placeholder="Telefon"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">🕌 Medine Sorumlusu</label>
                                            <input type="text" name="medine_responsible_name" placeholder="Ad Soyad"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2">
                                            <input type="tel" name="medine_responsible_phone" placeholder="Telefon"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">🕋 Mekke Sorumlular</label>
                                            <input type="text" name="mekke_responsible1_name" placeholder="1. Sorumlu Ad"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2">
                                            <input type="tel" name="mekke_responsible1_phone" placeholder="1. Sorumlu Tel"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2">
                                            <input type="text" name="mekke_responsible2_name" placeholder="2. Sorumlu Ad"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md mb-2">
                                            <input type="tel" name="mekke_responsible2_phone" placeholder="2. Sorumlu Tel"
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3: Otel Bilgileri -->
                            <div id="step-hotels" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">🏨 Otel Bilgileri</h4>
                                
                                <!-- Mekke Oteli -->
                                <div class="bg-green-50 p-4 rounded-lg mb-6">
                                    <h5 class="font-medium text-gray-800 mb-3">🕋 Mekke Oteli</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Otel Adı</label>
                                            <input type="text" name="mekke_hotel_name" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Bölge</label>
                                            <select name="mekke_hotel_region" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <option value="">Bölge Seçin</option>
                                                <option value="Harem">Harem Bölgesi</option>
                                                <option value="Aziziye">Aziziye Bölgesi</option>
                                                <option value="Misfalah">Misfalah Bölgesi</option>
                                                <option value="Marwa">Marwa Bölgesi</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Hareem'e Uzaklık (m)</label>
                                            <input type="number" name="mekke_hotel_distance" min="0" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Yıldız Sayısı</label>
                                            <select name="mekke_hotel_stars" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <option value="">Seçin</option>
                                                <option value="3">3 Yıldız</option>
                                                <option value="4">4 Yıldız</option>
                                                <option value="5">5 Yıldız</option>
                                            </select>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                            <textarea name="mekke_hotel_address" rows="2"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Otel Özellikleri</label>
                                            <textarea name="mekke_hotel_features" rows="2" 
                                                      placeholder="WiFi, Klima, Kahvaltı, vb..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- Medine Oteli -->
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <h5 class="font-medium text-gray-800 mb-3">🕌 Medine Oteli</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Otel Adı</label>
                                            <input type="text" name="medine_hotel_name" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Bölge</label>
                                            <select name="medine_hotel_region" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <option value="">Bölge Seçin</option>
                                                <option value="Harem">Harem Bölgesi</option>
                                                <option value="Al-Qiblatain">Al-Qiblatain</option>
                                                <option value="Quba">Quba Bölgesi</option>
                                                <option value="Rawdah">Rawdah Bölgesi</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Hareem'e Uzaklık (m)</label>
                                            <input type="number" name="medine_hotel_distance" min="0" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Yıldız Sayısı</label>
                                            <select name="medine_hotel_stars" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                                <option value="">Seçin</option>
                                                <option value="3">3 Yıldız</option>
                                                <option value="4">4 Yıldız</option>
                                                <option value="5">5 Yıldız</option>
                                            </select>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                            <textarea name="medine_hotel_address" rows="2"
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Otel Özellikleri</label>
                                            <textarea name="medine_hotel_features" rows="2" 
                                                      placeholder="WiFi, Klima, Kahvaltı, vb..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 4: Program ve Detaylar -->
                            <div id="step-schedule" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">📅 Program ve Detaylar</h4>
                                
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <!-- Sol kolon -->
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">✅ Dahil Olan Hizmetler</label>
                                            <textarea name="included_services" rows="6" 
                                                      placeholder="• Gidiş-dönüş uçak bileti&#10;• Otel konaklama&#10;• 3 öğün yemek&#10;• Vize işlemleri..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">❌ Dahil Olmayan Hizmetler</label>
                                            <textarea name="excluded_services" rows="4" 
                                                      placeholder="• Kişisel harcamalar&#10;• Ekstra turlar&#10;• İçecekler..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">📋 Gerekli Evraklar</label>
                                            <textarea name="required_documents" rows="4" 
                                                      placeholder="• Pasaport (min 6 ay geçerli)&#10;• Vize başvuru formu&#10;• Fotoğraf (beyaz fon)..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>

                                    <!-- Sağ kolon -->
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">🏛️ Ziyaret Edilecek Yerler</label>
                                            <textarea name="visit_places" rows="6" 
                                                      placeholder="• Kâbe-i Şerif&#10;• Mescid-i Nebevi&#10;• Uhud Dağı&#10;• Sevr Mağarası..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">⭐ Ekstra Özellikler</label>
                                            <textarea name="extra_features" rows="4" 
                                                      placeholder="• Rehberli turlar&#10;• Özel transfer&#10;• Zamzam suyu..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">⚠️ Önemli Notlar</label>
                                            <textarea name="important_notes" rows="4" 
                                                      placeholder="• Çocuk indirimleri&#10;• Sağlık durumu bilgileri&#10;• İklim bilgileri..."
                                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">💰 Ödeme Şartları</label>
                                        <textarea name="payment_terms" rows="4" 
                                                  placeholder="• Kapora: %30&#10;• Ara ödeme: %40 (45 gün öncesi)&#10;• Kalan tutar: 15 gün öncesi..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">🚫 İptal Politikası</label>
                                        <textarea name="cancellation_policy" rows="4" 
                                                  placeholder="• 60 gün öncesi: %10 ceza&#10;• 30 gün öncesi: %30 ceza&#10;• 15 gün öncesi: %50 ceza..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 5: SEO ve Medya -->
                            <div id="step-seo" class="step-content hidden">
                                <h4 class="text-lg font-medium text-gray-900 mb-4">🔍 SEO ve Medya</h4>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                        <input type="text" name="slug" 
                                               placeholder="ornek-umre-turu-2025"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary">
                                        <small class="text-gray-500">Boş bırakılırsa başlıktan otomatik oluşturulur</small>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeler</label>
                                        <textarea name="seo_keywords" rows="2" 
                                                  placeholder="umre turu, umre paketi, mekke medine, hac umre, 2025 umre"
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        <small class="text-gray-500">Virgülle ayırarak yazın</small>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Meta Açıklama</label>
                                        <textarea name="meta_description" rows="3" maxlength="160"
                                                  placeholder="Konforlu ve ekonomik umre turu için hemen rezervasyon yaptırın..."
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary"></textarea>
                                        <small class="text-gray-500">Maksimum 160 karakter (Google için ideal)</small>
                                    </div>

                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h5 class="font-medium text-gray-800 mb-3">📸 Medya Dosyaları</h5>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Ana Görsel</label>
                                                <input type="file" name="main_image" accept="image/*"
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                <small class="text-gray-500">Önerilen: 1200x600px, JPG/PNG</small>
                                            </div>

                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Galeri Resimleri</label>
                                                <input type="file" name="gallery_images" accept="image/*" multiple
                                                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                <small class="text-gray-500">Çoklu seçim yapabilirsiniz</small>
                                            </div>
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
                        <div class="ml-2 hidden sm:block">
                            <span class="text-xs font-medium ${
                                isActive ? 'text-admin-primary' : 
                                isCompleted ? 'text-green-600' : 'text-gray-500'
                            }">${step.title}</span>
                        </div>
                    </div>
                    ${index < steps.length - 1 ? `
                        <div class="flex-1 h-px bg-gray-300 mx-4 hidden sm:block"></div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Step navigation
    nextStep() {
        if (this.currentStep < this.formSteps.length - 1) {
            // Mevcut step'i validate et
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateStepVisibility();
                this.updateNavigationButtons();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStepVisibility();
            this.updateNavigationButtons();
        }
    }

    updateStepVisibility() {
        // Tüm step'leri gizle
        this.formSteps.forEach(step => {
            const element = document.getElementById(`step-${step}`);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Aktif step'i göster
        const activeStep = document.getElementById(`step-${this.formSteps[this.currentStep]}`);
        if (activeStep) {
            activeStep.classList.remove('hidden');
        }

        // Progress bar'ı güncelle
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
        const currentStepName = this.formSteps[this.currentStep];
        const stepElement = document.getElementById(`step-${currentStepName}`);
        
        if (!stepElement) return true;

        // Required alanları kontrol et
        const requiredFields = stepElement.querySelectorAll('[required]');
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

    // Form verilerini topla
    collectFormData() {
        const form = document.getElementById('tourForm');
        const formData = new FormData(form);
        const data = {};

        // Temel form verilerini al
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // JSON formatına çevrilmesi gereken alanları düzenle
        data.departure_info = {
            airline: data.departure_airline || '',
            departure_city: data.departure_city || 'İstanbul',
            departure_airport: data.departure_airport || 'IST'
        };

        data.return_info = {
            airline: data.return_airline || '',
            arrival_city: data.arrival_city || 'İstanbul', 
            arrival_airport: data.arrival_airport || 'IST'
        };

        data.responsible_contacts = {
            airport: {
                name: data.airport_responsible_name || '',
                phone: data.airport_responsible_phone || ''
            },
            medine: {
                name: data.medine_responsible_name || '',
                phone: data.medine_responsible_phone || ''
            },
            mekke: [
                {
                    name: data.mekke_responsible1_name || '',
                    phone: data.mekke_responsible1_phone || ''
                },
                {
                    name: data.mekke_responsible2_name || '',
                    phone: data.mekke_responsible2_phone || ''
                }
            ]
        };

        data.mekke_hotel = {
            name: data.mekke_hotel_name || '',
            address: data.mekke_hotel_address || '',
            region: data.mekke_hotel_region || '',
            distance_to_haram: data.mekke_hotel_distance || 0,
            stars: data.mekke_hotel_stars || '',
            features: data.mekke_hotel_features || ''
        };

        data.medine_hotel = {
            name: data.medine_hotel_name || '',
            address: data.medine_hotel_address || '',
            region: data.medine_hotel_region || '',
            distance_to_haram: data.medine_hotel_distance || 0,
            stars: data.medine_hotel_stars || '',
            features: data.medine_hotel_features || ''
        };

        // Checkbox değerini düzelt
        data.featured = form.elements.featured?.checked ? true : false;

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

        fieldsToRemove.forEach(field => delete data[field]);

        return data;
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
                }
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    }

    // Mevcut tur verilerini form'a yükle
    populateForm(tour) {
        const form = document.getElementById('tourForm');
        if (!form || !tour) return;

        // Temel alanları doldur
        const basicFields = [
            'title', 'category_id', 'status', 'duration_days', 'duration_nights',
            'mekke_nights', 'medine_nights', 'start_date', 'end_date', 'price_try',
            'quota', 'short_description', 'description', 'included_services',
            'excluded_services', 'required_documents', 'visit_places', 'extra_features',
            'important_notes', 'payment_terms', 'cancellation_policy', 'slug',
            'seo_keywords', 'meta_description', 'priority'
        ];

        basicFields.forEach(field => {
            const element = form.elements[field];
            if (element && tour[field] !== undefined) {
                element.value = tour[field] || '';
            }
        });

        // Featured checkbox
        if (form.elements.featured) {
            form.elements.featured.checked = tour.featured || false;
        }

        // JSON alanları
        if (tour.departure_info) {
            const dep = tour.departure_info;
            if (form.elements.departure_airline) form.elements.departure_airline.value = dep.airline || '';
            if (form.elements.departure_city) form.elements.departure_city.value = dep.departure_city || '';
            if (form.elements.departure_airport) form.elements.departure_airport.value = dep.departure_airport || '';
        }

        if (tour.return_info) {
            const ret = tour.return_info;
            if (form.elements.return_airline) form.elements.return_airline.value = ret.airline || '';
            if (form.elements.arrival_city) form.elements.arrival_city.value = ret.arrival_city || '';
            if (form.elements.arrival_airport) form.elements.arrival_airport.value = ret.arrival_airport || '';
        }

        if (tour.responsible_contacts) {
            const contacts = tour.responsible_contacts;
            if (contacts.airport) {
                if (form.elements.airport_responsible_name) form.elements.airport_responsible_name.value = contacts.airport.name || '';
                if (form.elements.airport_responsible_phone) form.elements.airport_responsible_phone.value = contacts.airport.phone || '';
            }
            if (contacts.medine) {
                if (form.elements.medine_responsible_name) form.elements.medine_responsible_name.value = contacts.medine.name || '';
                if (form.elements.medine_responsible_phone) form.elements.medine_responsible_phone.value = contacts.medine.phone || '';
            }
            if (contacts.mekke && contacts.mekke.length > 0) {
                if (form.elements.mekke_responsible1_name) form.elements.mekke_responsible1_name.value = contacts.mekke[0]?.name || '';
                if (form.elements.mekke_responsible1_phone) form.elements.mekke_responsible1_phone.value = contacts.mekke[0]?.phone || '';
                if (contacts.mekke[1]) {
                    if (form.elements.mekke_responsible2_name) form.elements.mekke_responsible2_name.value = contacts.mekke[1]?.name || '';
                    if (form.elements.mekke_responsible2_phone) form.elements.mekke_responsible2_phone.value = contacts.mekke[1]?.phone || '';
                }
            }
        }

        if (tour.mekke_hotel) {
            const hotel = tour.mekke_hotel;
            if (form.elements.mekke_hotel_name) form.elements.mekke_hotel_name.value = hotel.name || '';
            if (form.elements.mekke_hotel_address) form.elements.mekke_hotel_address.value = hotel.address || '';
            if (form.elements.mekke_hotel_region) form.elements.mekke_hotel_region.value = hotel.region || '';
            if (form.elements.mekke_hotel_distance) form.elements.mekke_hotel_distance.value = hotel.distance_to_haram || '';
            if (form.elements.mekke_hotel_stars) form.elements.mekke_hotel_stars.value = hotel.stars || '';
            if (form.elements.mekke_hotel_features) form.elements.mekke_hotel_features.value = hotel.features || '';
        }

        if (tour.medine_hotel) {
            const hotel = tour.medine_hotel;
            if (form.elements.medine_hotel_name) form.elements.medine_hotel_name.value = hotel.name || '';
            if (form.elements.medine_hotel_address) form.elements.medine_hotel_address.value = hotel.address || '';
            if (form.elements.medine_hotel_region) form.elements.medine_hotel_region.value = hotel.region || '';
            if (form.elements.medine_hotel_distance) form.elements.medine_hotel_distance.value = hotel.distance_to_haram || '';
            if (form.elements.medine_hotel_stars) form.elements.medine_hotel_stars.value = hotel.stars || '';
            if (form.elements.medine_hotel_features) form.elements.medine_hotel_features.value = hotel.features || '';
        }
    }
}

// Global instance oluştur
const extendedTourForm = new ExtendedTourForm();