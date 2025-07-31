// Settings Page Module
class SettingsPage {
    constructor() {
        this.settings = {};
        this.activeTab = 'general';
    }

    async render() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading
        contentArea.innerHTML = this.getLoadingHTML();
        
        try {
            // Load settings
            await this.loadSettings();
            
            // Render content
            contentArea.innerHTML = this.getSettingsHTML();
            this.bindEvents();
            
        } catch (error) {
            console.error('Settings load error:', error);
            contentArea.innerHTML = this.getErrorHTML();
        }
    }

    async loadSettings() {
        try {
            const response = await adminAPI.getSettings();
            if (response.success) {
                this.settings = response.data.settings || {};
            }
        } catch (error) {
            console.error('Load settings error:', error);
            this.settings = {};
        }
    }

    getSettingsHTML() {
        return `
            <div class="space-y-6">
                <!-- Tab Navigation -->
                <div class="card">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-xl font-bold text-heading">Site Ayarları</h3>
                        <p class="text-secondary mt-1">Web sitenizin genel ayarlarını buradan yönetebilirsiniz</p>
                    </div>
                    
                    <div class="border-b border-gray-200">
                        <nav class="flex space-x-8 px-6">
                            <button onclick="window.settingsPage.switchTab('general')" 
                                    class="tab-btn ${this.activeTab === 'general' ? 'active' : ''} py-4 px-1 border-b-2 font-medium text-sm">
                                🏢 Genel Ayarlar
                            </button>
                            <button onclick="window.settingsPage.switchTab('branding')" 
                                    class="tab-btn ${this.activeTab === 'branding' ? 'active' : ''} py-4 px-1 border-b-2 font-medium text-sm">
                                🎨 Logo & Marka
                            </button>
                            <button onclick="window.settingsPage.switchTab('contact')" 
                                    class="tab-btn ${this.activeTab === 'contact' ? 'active' : ''} py-4 px-1 border-b-2 font-medium text-sm">
                                📞 İletişim Sayfası
                            </button>
                            <button onclick="window.settingsPage.switchTab('smtp')" 
                                    class="tab-btn ${this.activeTab === 'smtp' ? 'active' : ''} py-4 px-1 border-b-2 font-medium text-sm">
                                📧 SMTP / Mail
                            </button>
                            <button onclick="window.settingsPage.switchTab('seo')" 
                                    class="tab-btn ${this.activeTab === 'seo' ? 'active' : ''} py-4 px-1 border-b-2 font-medium text-sm">
                                🔍 SEO Ayarları
                            </button>
                        </nav>
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="card">
                    <form id="settingsForm" class="p-6">
                        ${this.getTabContent()}
                        
                        <div class="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                            <div class="text-sm text-gray-500">
                                Değişiklikler otomatik olarak kaydedilir
                            </div>
                            <div class="flex space-x-4">
                                <button type="button" onclick="window.settingsPage.testSMTP()" class="btn-secondary ${this.activeTab === 'smtp' ? '' : 'hidden'}" id="testSMTPBtn">
                                    📤 SMTP Test Et
                                </button>
                                <button type="submit" class="btn-primary">
                                    💾 Ayarları Kaydet
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    getTabContent() {
        switch (this.activeTab) {
            case 'general':
                return this.getGeneralTabHTML();
            case 'branding':
                return this.getBrandingTabHTML();
            case 'contact':
                return this.getContactTabHTML();
            case 'smtp':
                return this.getSMTPTabHTML();
            case 'seo':
                return this.getSEOTabHTML();
            default:
                return this.getGeneralTabHTML();
        }
    }

    getGeneralTabHTML() {
        return `
            <div class="space-y-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Genel Site Ayarları</h4>
                
                <div class="form-row form-row-2">
                    <div>
                        <label class="form-label">Site Adı *</label>
                        <input type="text" name="site_name" value="${this.settings.site_name || 'Nahletur'}" class="form-input" required>
                    </div>
                    <div>
                        <label class="form-label">Site Tagline</label>
                        <input type="text" name="site_tagline" value="${this.settings.site_tagline || 'Hac ve Umre Tur Hizmetleri'}" class="form-input">
                    </div>
                </div>
                
                <div>
                    <label class="form-label">Site Açıklaması</label>
                    <textarea name="site_description" rows="3" class="form-input" placeholder="Site hakkında genel açıklama...">${this.settings.site_description || ''}</textarea>
                </div>
                
                <div class="form-row form-row-3">
                    <div>
                        <label class="form-label">Para Birimi</label>
                        <select name="currency" class="form-input">
                            <option value="USD" ${this.settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${this.settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="TRY" ${this.settings.currency === 'TRY' ? 'selected' : ''}>TRY (₺)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="form-label">Dil</label>
                        <select name="language" class="form-input">
                            <option value="tr" ${this.settings.language === 'tr' ? 'selected' : ''}>Türkçe</option>
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="ar" ${this.settings.language === 'ar' ? 'selected' : ''}>العربية</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="form-label">Saat Dilimi</label>
                        <select name="timezone" class="form-input">
                            <option value="Europe/Istanbul" ${this.settings.timezone === 'Europe/Istanbul' ? 'selected' : ''}>İstanbul (GMT+3)</option>
                            <option value="Europe/London" ${this.settings.timezone === 'Europe/London' ? 'selected' : ''}>London (GMT+0)</option>
                            <option value="America/New_York" ${this.settings.timezone === 'America/New_York' ? 'selected' : ''}>New York (GMT-5)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getBrandingTabHTML() {
        return `
            <div class="space-y-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Logo ve Marka Ayarları</h4>
                
                <!-- Logo Upload -->
                <div class="space-y-4">
                    <div>
                        <label class="form-label">Site Logosu</label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <input type="file" id="logo-upload" accept="image/*" class="hidden" onchange="window.settingsPage.handleLogoUpload(event)">
                            <label for="logo-upload" class="cursor-pointer block text-center">
                                ${this.settings.logo_url ? `
                                    <div class="mb-4">
                                        <img src="${this.settings.logo_url}" alt="Mevcut Logo" class="max-h-24 mx-auto rounded-lg border">
                                    </div>
                                    <div class="text-sm text-admin-primary font-medium">Logoyu Değiştir</div>
                                ` : `
                                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"/>
                                    </svg>
                                    <p class="text-sm text-gray-600">
                                        <span class="font-medium text-admin-primary">Logo yüklemek için tıklayın</span> veya sürükleyin
                                    </p>
                                `}
                                <p class="text-xs text-gray-500 mt-1">PNG, JPG, SVG (Max 2MB, Önerilen: 200x60px)</p>
                            </label>
                            <input type="hidden" name="logo_url" value="${this.settings.logo_url || ''}">
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Favicon</label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input type="file" id="favicon-upload" accept="image/*,.ico" class="hidden" onchange="window.settingsPage.handleFaviconUpload(event)">
                            <label for="favicon-upload" class="cursor-pointer block text-center">
                                ${this.settings.favicon_url ? `
                                    <div class="flex items-center justify-center mb-2">
                                        <img src="${this.settings.favicon_url}" alt="Mevcut Favicon" class="w-8 h-8 rounded border mr-3">
                                        <span class="text-sm text-admin-primary font-medium">Favicon'u Değiştir</span>
                                    </div>
                                ` : `
                                    <p class="text-sm text-gray-600">
                                        <span class="font-medium text-admin-primary">Favicon yükleyin</span>
                                    </p>
                                `}
                                <p class="text-xs text-gray-500">ICO, PNG (32x32px önerilir)</p>
                            </label>
                            <input type="hidden" name="favicon_url" value="${this.settings.favicon_url || ''}">
                        </div>
                    </div>
                </div>
                
                <!-- Brand Colors -->
                <div class="border-t pt-6">
                    <h5 class="font-semibold text-gray-800 mb-4">Marka Renkleri</h5>
                    <div class="form-row form-row-2">
                        <div>
                            <label class="form-label">Ana Renk (Primary)</label>
                            <div class="flex items-center space-x-3">
                                <input type="color" name="primary_color" value="${this.settings.primary_color || '#259ebe'}" class="w-12 h-10 rounded border">
                                <input type="text" name="primary_color_hex" value="${this.settings.primary_color || '#259ebe'}" class="form-input flex-1" placeholder="#259ebe">
                            </div>
                        </div>
                        <div>
                            <label class="form-label">İkincil Renk (Secondary)</label>
                            <div class="flex items-center space-x-3">
                                <input type="color" name="secondary_color" value="${this.settings.secondary_color || '#2d7daa'}" class="w-12 h-10 rounded border">
                                <input type="text" name="secondary_color_hex" value="${this.settings.secondary_color || '#2d7daa'}" class="form-input flex-1" placeholder="#2d7daa">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContactTabHTML() {
        return `
            <div class="space-y-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">İletişim Sayfası İçeriği</h4>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-blue-800">İletişim Sayfası Yönetimi</h3>
                            <div class="mt-2 text-sm text-blue-700">
                                <p>Bu bilgiler sitenizin iletişim sayfasında görünecek. İletişim formu buradan gelen mesajları belirlediğiniz e-posta adresine gönderecek.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-row form-row-2">
                    <div>
                        <label class="form-label">Şirket/Organizasyon Adı</label>
                        <input type="text" name="company_name" value="${this.settings.company_name || ''}" class="form-input" placeholder="Nahletur Tourism">
                    </div>
                    <div>
                        <label class="form-label">İletişim Başlığı</label>
                        <input type="text" name="contact_title" value="${this.settings.contact_title || 'Bizimle İletişime Geçin'}" class="form-input">
                    </div>
                </div>
                
                <div>
                    <label class="form-label">İletişim Sayfası Açıklaması</label>
                    <textarea name="contact_description" rows="3" class="form-input" placeholder="Hac ve Umre turları hakkında sorularınız için bizimle iletişime geçebilirsiniz...">${this.settings.contact_description || ''}</textarea>
                </div>
                
                <div class="border-t pt-6">
                    <h5 class="font-semibold text-gray-800 mb-4">İletişim Bilgileri</h5>
                    <div class="space-y-4">
                        <div class="form-row form-row-2">
                            <div>
                                <label class="form-label">Ana Telefon</label>
                                <input type="text" name="phone" value="${this.settings.phone || ''}" class="form-input" placeholder="+90 212 xxx xx xx">
                            </div>
                            <div>
                                <label class="form-label">WhatsApp</label>
                                <input type="text" name="whatsapp" value="${this.settings.whatsapp || ''}" class="form-input" placeholder="+90 5xx xxx xx xx">
                            </div>
                        </div>
                        
                        <div class="form-row form-row-2">
                            <div>
                                <label class="form-label">E-posta (Genel)</label>
                                <input type="email" name="email" value="${this.settings.email || ''}" class="form-input" placeholder="info@nahletur.com">
                            </div>
                            <div>
                                <label class="form-label">E-posta (Rezervasyon)</label>
                                <input type="email" name="reservation_email" value="${this.settings.reservation_email || ''}" class="form-input" placeholder="rezervasyon@nahletur.com">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="border-t pt-6">
                    <h5 class="font-semibold text-gray-800 mb-4">Adres Bilgileri</h5>
                    <div class="space-y-4">
                        <div>
                            <label class="form-label">Tam Adres</label>
                            <textarea name="address" rows="3" class="form-input" placeholder="Merkez Mah. Atatürk Cad. No:123 Fatih/İSTANBUL">${this.settings.address || ''}</textarea>
                        </div>
                        
                        <div class="form-row form-row-3">
                            <div>
                                <label class="form-label">Şehir</label>
                                <input type="text" name="city" value="${this.settings.city || ''}" class="form-input" placeholder="İstanbul">
                            </div>
                            <div>
                                <label class="form-label">Posta Kodu</label>
                                <input type="text" name="postal_code" value="${this.settings.postal_code || ''}" class="form-input" placeholder="34000">
                            </div>
                            <div>
                                <label class="form-label">Ülke</label>
                                <input type="text" name="country" value="${this.settings.country || 'Türkiye'}" class="form-input">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="border-t pt-6">
                    <h5 class="font-semibold text-gray-800 mb-4">Çalışma Saatleri</h5>
                    <div class="space-y-4">
                        <div class="form-row form-row-2">
                            <div>
                                <label class="form-label">Hafta İçi</label>
                                <input type="text" name="working_hours_weekday" value="${this.settings.working_hours_weekday || '09:00 - 18:00'}" class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Hafta Sonu</label>
                                <input type="text" name="working_hours_weekend" value="${this.settings.working_hours_weekend || '10:00 - 16:00'}" class="form-input">
                            </div>
                        </div>
                        
                        <div>
                            <label class="form-label">Özel Not</label>
                            <input type="text" name="working_hours_note" value="${this.settings.working_hours_note || ''}" class="form-input" placeholder="Tatil günlerinde kapalı">
                        </div>
                    </div>
                </div>
                
                <div class="border-t pt-6">
                    <h5 class="font-semibold text-gray-800 mb-4">Sosyal Medya</h5>
                    <div class="form-row form-row-2">
                        <div>
                            <label class="form-label">Facebook</label>
                            <input type="url" name="facebook" value="${this.settings.facebook || ''}" class="form-input" placeholder="https://facebook.com/nahletur">
                        </div>
                        <div>
                            <label class="form-label">Instagram</label>
                            <input type="url" name="instagram" value="${this.settings.instagram || ''}" class="form-input" placeholder="https://instagram.com/nahletur">
                        </div>
                    </div>
                    
                    <div class="form-row form-row-2 mt-4">
                        <div>
                            <label class="form-label">Twitter</label>
                            <input type="url" name="twitter" value="${this.settings.twitter || ''}" class="form-input" placeholder="https://twitter.com/nahletur">
                        </div>
                        <div>
                            <label class="form-label">YouTube</label>
                            <input type="url" name="youtube" value="${this.settings.youtube || ''}" class="form-input" placeholder="https://youtube.com/nahletur">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSMTPTabHTML() {
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-blue-800">SMTP Ayarları</h3>
                            <div class="mt-2 text-sm text-blue-700">
                                <p>İletişim formundan gelen mesajlar bu SMTP ayarları ile belirlediğiniz e-posta adresine gönderilecek.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Mail Server Ayarları</h4>
                
                <div class="form-row form-row-2">
                    <div>
                        <label class="form-label">SMTP Sunucu *</label>
                        <input type="text" name="smtp_host" value="${this.settings.smtp_host || ''}" class="form-input" placeholder="smtp.gmail.com">
                    </div>
                    <div>
                        <label class="form-label">SMTP Port *</label>
                        <input type="number" name="smtp_port" value="${this.settings.smtp_port || '587'}" class="form-input" placeholder="587">
                    </div>
                </div>
                
                <div class="form-row form-row-2">
                    <div>
                        <label class="form-label">E-posta Adresi *</label>
                        <input type="email" name="smtp_user" value="${this.settings.smtp_user || ''}" class="form-input" placeholder="info@nahletur.com">
                    </div>
                    <div>
                        <label class="form-label">E-posta Şifresi *</label>
                        <input type="password" name="smtp_pass" value="${this.settings.smtp_pass || ''}" class="form-input" placeholder="••••••••">
                        <p class="text-xs text-gray-500 mt-1">Gmail için App Password kullanın</p>
                    </div>
                </div>
                
                <div class="form-row form-row-2">
                    <div>
                        <label class="form-label">Şifreleme</label>
                        <select name="smtp_encryption" class="form-input">
                            <option value="tls" ${this.settings.smtp_encryption === 'tls' ? 'selected' : ''}>TLS (Önerilen)</option>
                            <option value="ssl" ${this.settings.smtp_encryption === 'ssl' ? 'selected' : ''}>SSL</option>
                            <option value="none" ${this.settings.smtp_encryption === 'none' ? 'selected' : ''}>Şifreleme Yok</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Gönderen Adı</label>
                        <input type="text" name="smtp_from_name" value="${this.settings.smtp_from_name || 'Nahletur'}" class="form-input" placeholder="Nahletur">
                    </div>
                </div>
                
                <div class="border-t pt-6">
                    <h5 class="font-semibold text-gray-800 mb-4">Mail Ayarları</h5>
                    <div class="form-row form-row-2">
                        <div>
                            <label class="form-label">Mesajların Gönderileceği E-posta</label>
                            <input type="email" name="contact_form_email" value="${this.settings.contact_form_email || ''}" class="form-input" placeholder="admin@nahletur.com">
                            <p class="text-xs text-gray-500 mt-1">İletişim formundan gelen mesajlar bu adrese gönderilir</p>
                        </div>
                        <div>
                            <label class="flex items-center mt-8">
                                <input type="checkbox" name="smtp_enabled" ${this.settings.smtp_enabled ? 'checked' : ''} class="mr-3 rounded border-gray-300">
                                <span class="form-label mb-0">SMTP Sistemini Aktif Et</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSEOTabHTML() {
        return `
            <div class="space-y-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">SEO Ayarları</h4>
                
                <div>
                    <label class="form-label">Site Meta Başlığı</label>
                    <input type="text" name="meta_title" value="${this.settings.meta_title || ''}" class="form-input" placeholder="Nahletur - Hac ve Umre Tur Hizmetleri">
                    <p class="text-xs text-gray-500 mt-1">Tarayıcı sekmesinde görünecek başlık</p>
                </div>
                
                <div>
                    <label class="form-label">Site Meta Açıklaması</label>
                    <textarea name="meta_description" rows="3" class="form-input" placeholder="Hac ve Umre turları konusunda uzman ekibimizle...">${this.settings.meta_description || ''}</textarea>
                    <p class="text-xs text-gray-500 mt-1">Arama motorlarında görünecek açıklama (160 karakter)</p>
                </div>
                
                <div class="form-row form-row-2">
                    <div>
                        <label class="form-label">Google Analytics ID</label>
                        <input type="text" name="google_analytics" value="${this.settings.google_analytics || ''}" class="form-input" placeholder="G-XXXXXXXXXX">
                    </div>
                    <div>
                        <label class="form-label">Google Tag Manager ID</label>
                        <input type="text" name="google_tag_manager" value="${this.settings.google_tag_manager || ''}" class="form-input" placeholder="GTM-XXXXXXX">
                    </div>
                </div>
                
                <div>
                    <label class="form-label">Anahtar Kelimeler</label>
                    <input type="text" name="meta_keywords" value="${this.settings.meta_keywords || ''}" class="form-input" placeholder="umre, hac, tur, mekke, medine">
                    <p class="text-xs text-gray-500 mt-1">Virgülle ayırın</p>
                </div>
            </div>
        `;
    }

    async handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            showToast('Logo dosyası çok büyük! Maksimum 2MB olmalı.', 'error');
            return;
        }
        
        try {
            showToast('Logo yükleniyor...', 'info');
            const response = await adminAPI.uploadLogo(file);
            
            if (response.success) {
                this.settings.logo_url = response.data.url;
                showToast('Logo başarıyla yüklendi!', 'success');
                this.render(); // Re-render to show new logo
            }
        } catch (error) {
            showToast('Logo yükleme hatası: ' + error.message, 'error');
        }
    }

    async handleFaviconUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            showToast('Favicon yükleniyor...', 'info');
            const response = await adminAPI.uploadFavicon(file);
            
            if (response.success) {
                this.settings.favicon_url = response.data.url;
                showToast('Favicon başarıyla yüklendi!', 'success');
                this.render(); // Re-render to show new favicon
            }
        } catch (error) {
            showToast('Favicon yükleme hatası: ' + error.message, 'error');
        }
    }

    bindEvents() {
        const form = document.getElementById('settingsForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Color picker sync
        this.syncColorPickers();
        
        // Tab styling
        this.updateTabStyles();
    }

    syncColorPickers() {
        const primaryColor = document.querySelector('input[name="primary_color"]');
        const primaryHex = document.querySelector('input[name="primary_color_hex"]');
        const secondaryColor = document.querySelector('input[name="secondary_color"]');
        const secondaryHex = document.querySelector('input[name="secondary_color_hex"]');
        
        if (primaryColor && primaryHex) {
            primaryColor.addEventListener('change', (e) => {
                primaryHex.value = e.target.value;
            });
            primaryHex.addEventListener('change', (e) => {
                primaryColor.value = e.target.value;
            });
        }
        
        if (secondaryColor && secondaryHex) {
            secondaryColor.addEventListener('change', (e) => {
                secondaryHex.value = e.target.value;
            });
            secondaryHex.addEventListener('change', (e) => {
                secondaryColor.value = e.target.value;
            });
        }
    }

    updateTabStyles() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.classList.contains('active')) {
                btn.classList.add('border-admin-primary', 'text-admin-primary');
                btn.classList.remove('border-transparent', 'text-gray-500');
            } else {
                btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                btn.classList.remove('border-admin-primary', 'text-admin-primary');
            }
        });

        // Show/hide test SMTP button
        const testBtn = document.getElementById('testSMTPBtn');
        if (testBtn) {
            if (this.activeTab === 'smtp') {
                testBtn.classList.remove('hidden');
            } else {
                testBtn.classList.add('hidden');
            }
        }
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        this.render();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settingsData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('_enabled') || key.endsWith('_active')) {
                settingsData[key] = true;
            } else {
                settingsData[key] = value;
            }
        }
        
        // Handle checkboxes that weren't checked
        const checkboxes = ['smtp_enabled'];
        checkboxes.forEach(checkbox => {
            if (!formData.has(checkbox)) {
                settingsData[checkbox] = false;
            }
        });

        try {
            const response = await adminAPI.saveSettings(settingsData);
            if (response.success) {
                showToast('Ayarlar kaydedildi!', 'success');
                this.settings = { ...this.settings, ...settingsData };
            }
        } catch (error) {
            showToast('Kaydetme hatası: ' + error.message, 'error');
        }
    }

    async testSMTP() {
        try {
            showToast('SMTP testi yapılıyor...', 'info');
            const response = await adminAPI.testSMTP();
            if (response.success) {
                showToast('✅ SMTP test başarılı! Test e-postası gönderildi.', 'success');
            } else {
                showToast('❌ SMTP test başarısız: ' + response.message, 'error');
            }
        } catch (error) {
            showToast('SMTP test hatası: ' + error.message, 'error');
        }
    }

    getLoadingHTML() {
        return `
            <div class="text-center py-12">
                <div class="loading-spinner mb-4"></div>
                <p class="text-secondary">Ayarlar yükleniyor...</p>
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
                <h3 class="text-lg font-semibent text-gray-900 mb-2">Ayarlar Yüklenemedi</h3>
                <p class="text-secondary mb-4">Ayar verilerini yüklerken bir hata oluştu.</p>
                <button onclick="window.settingsPage.render()" class="btn-primary">Tekrar Dene</button>
            </div>
        `;
    }
}

// Initialize settings page
window.settingsPage = new SettingsPage();
