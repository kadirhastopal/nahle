// public/js/tour-detail.js - Tur Detay Sayfası JavaScript
class TourDetail {
    constructor() {
        this.tour = null;
        this.tourId = null;
        this.activeTab = 'overview';
        this.init();
    }

    init() {
        // URL'den tour ID'sini al
        this.tourId = this.getTourIdFromUrl();
        
        if (!this.tourId) {
            this.showError('Geçersiz tur ID');
            return;
        }

        // Tour detaylarını yükle
        this.loadTourDetail();

        // Tab navigation setup
        this.setupTabs();
    }

    getTourIdFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/\/tur\/(\d+)/);
        return matches ? matches[1] : null;
    }

    async loadTourDetail() {
        try {
            console.log('🔍 Tur detayları yükleniyor, ID:', this.tourId);
            
            const response = await fetch(`/api/tours/${this.tourId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.data.tour) {
                this.tour = data.data.tour;
                console.log('✅ Tur detayı yüklendi:', this.tour);
                this.renderTourDetail();
            } else {
                throw new Error('Tur bulunamadı');
            }
        } catch (error) {
            console.error('❌ Tur detay yükleme hatası:', error);
            this.showError();
        }
    }

    renderTourDetail() {
        // Loading state'i gizle, content'i göster
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('tourContent').classList.remove('hidden');

        // Sayfa başlığını güncelle
        document.title = `${this.tour.title} - Nahletur.com`;

        // Breadcrumb
        this.renderBreadcrumb();

        // Tour header
        this.renderTourHeader();

        // Booking card
        this.renderBookingCard();

        // Tab contents
        this.renderTabContents();
    }

    renderBreadcrumb() {
        const categoryEl = document.getElementById('breadcrumbCategory');
        const titleEl = document.getElementById('breadcrumbTitle');

        if (this.tour.Category) {
            categoryEl.textContent = this.tour.Category.name;
            categoryEl.onclick = () => {
                window.location.href = `/${this.tour.Category.slug}`;
            };
        }

        titleEl.textContent = this.tour.title;
    }

    renderTourHeader() {
        // Tour image
        const imageContainer = document.getElementById('tourImageContainer');
        if (this.tour.image_url) {
            imageContainer.style.backgroundImage = `url(${this.tour.image_url})`;
            imageContainer.style.backgroundSize = 'cover';
            imageContainer.style.backgroundPosition = 'center';
        }

        // Badge
        const badge = document.getElementById('tourBadge');
        if (this.tour.Category) {
            badge.textContent = this.tour.Category.name;
            badge.className = `inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 ${
                this.tour.Category.name.toLowerCase().includes('hac') 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'
            }`;
        }

        // Title
        document.getElementById('tourTitle').textContent = this.tour.title;
    }

    renderBookingCard() {
        // Price
        const priceEl = document.getElementById('tourPrice');
        const formattedPrice = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(this.tour.price_try || 0);
        priceEl.textContent = formattedPrice;

        // Tour info
        document.getElementById('tourStartDate').textContent = 
            this.tour.start_date ? new Date(this.tour.start_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş';
        
        document.getElementById('tourDuration').textContent = 
            `${this.tour.duration_days || 0} Gün ${this.tour.duration_nights ? `/ ${this.tour.duration_nights} Gece` : ''}`;
        
        const quotaEl = document.getElementById('tourQuota');
        const quota = this.tour.quota || 0;
        quotaEl.textContent = quota > 0 ? `${quota} Kişi` : 'Dolu';
        quotaEl.className = `font-medium ${quota > 0 ? 'text-green-600' : 'text-red-600'}`;

        const statusEl = document.getElementById('tourStatus');
        const statusMap = {
            'active': { text: 'Aktif', class: 'text-green-600' },
            'full': { text: 'Dolu', class: 'text-red-600' },
            'inactive': { text: 'Pasif', class: 'text-gray-600' }
        };
        const status = statusMap[this.tour.status] || statusMap['inactive'];
        statusEl.textContent = status.text;
        statusEl.className = `font-medium ${status.class}`;
    }

    renderTabContents() {
        this.renderOverviewTab();
        this.renderProgramTab();
        this.renderHotelsTab();
        this.renderServicesTab();
        this.renderDocumentsTab();
    }

    renderOverviewTab() {
        // Description
        const descEl = document.getElementById('tourDescription');
        descEl.innerHTML = this.tour.description ? 
            this.tour.description.replace(/\n/g, '<br>') : 
            'Detaylı açıklama bulunmuyor.';

        // Visit places
        this.renderVisitPlaces();
    }

    renderVisitPlaces() {
        const container = document.getElementById('visitPlacesList');
        
        if (!this.tour.visit_places) {
            container.innerHTML = '<p class="text-gray-500">Ziyaret yerleri belirtilmemiş.</p>';
            return;
        }

        let places = [];
        try {
            if (typeof this.tour.visit_places === 'string') {
                places = this.tour.visit_places.split('\n')
                    .map(p => p.trim().replace(/^[•\-\*]\s*/, ''))
                    .filter(p => p.length > 0);
            } else if (Array.isArray(this.tour.visit_places)) {
                places = this.tour.visit_places;
            }
        } catch (e) {
            console.error('Visit places parse error:', e);
        }

        if (places.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Ziyaret yerleri belirtilmemiş.</p>';
            return;
        }

        container.innerHTML = places.map(place => `
            <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span class="text-nahletur-primary text-lg">📍</span>
                <span class="text-gray-700">${place}</span>
            </div>
        `).join('');
    }

    renderProgramTab() {
        const container = document.getElementById('programDetails');
        
        // Basit program bilgileri
        let programHtml = '';
        
        if (this.tour.duration_days) {
            programHtml += `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 class="font-semibold text-blue-800 mb-3">⏰ Tur Süresi</h4>
                    <p class="text-blue-700">${this.tour.duration_days} Gün`;
            
            if (this.tour.duration_nights) {
                programHtml += ` / ${this.tour.duration_nights} Gece`;
            }
            
            if (this.tour.mekke_nights) {
                programHtml += ` (Mekke: ${this.tour.mekke_nights} gece)`;
            }
            
            if (this.tour.medine_nights) {
                programHtml += ` (Medine: ${this.tour.medine_nights} gece)`;
            }
            
            programHtml += `</p></div>`;
        }

        if (this.tour.departure_info) {
            try {
                const depInfo = typeof this.tour.departure_info === 'string' 
                    ? JSON.parse(this.tour.departure_info) 
                    : this.tour.departure_info;
                
                if (depInfo.airline || depInfo.departure_city) {
                    programHtml += `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h4 class="font-semibold text-green-800 mb-3">✈️ Uçuş Bilgileri</h4>
                            <div class="text-green-700 space-y-1">
                                ${depInfo.airline ? `<p><strong>Havayolu:</strong> ${depInfo.airline}</p>` : ''}
                                ${depInfo.departure_city ? `<p><strong>Kalkış:</strong> ${depInfo.departure_city}</p>` : ''}
                            </div>
                        </div>
                    `;
                }
            } catch (e) {
                console.error('Departure info parse error:', e);
            }
        }

        container.innerHTML = programHtml || '<p class="text-gray-500">Program detayları belirtilmemiş.</p>';
    }

    renderHotelsTab() {
        const container = document.getElementById('hotelDetails');
        let hotelsHtml = '';

        // Mekke Hotel
        if (this.tour.mekke_hotel) {
            try {
                const hotel = typeof this.tour.mekke_hotel === 'string' 
                    ? JSON.parse(this.tour.mekke_hotel) 
                    : this.tour.mekke_hotel;

                if (hotel.name) {
                    hotelsHtml += `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="text-2xl">🕋</span>
                                <h4 class="text-xl font-semibold text-green-800">Mekke Oteli</h4>
                            </div>
                            <div class="space-y-2 text-green-700">
                                <p><strong>Otel:</strong> ${hotel.name}</p>
                                ${hotel.address ? `<p><strong>Adres:</strong> ${hotel.address}</p>` : ''}
                                ${hotel.stars ? `<p><strong>Yıldız:</strong> ${hotel.stars} ⭐</p>` : ''}
                                ${hotel.distance_to_haram ? `<p><strong>Harem'e Mesafe:</strong> ${hotel.distance_to_haram}m</p>` : ''}
                                ${hotel.features ? `<p><strong>Özellikler:</strong> ${hotel.features}</p>` : ''}
                            </div>
                        </div>
                    `;
                }
            } catch (e) {
                console.error('Mekke hotel parse error:', e);
            }
        }

        // Medine Hotel
        if (this.tour.medine_hotel) {
            try {
                const hotel = typeof this.tour.medine_hotel === 'string' 
                    ? JSON.parse(this.tour.medine_hotel) 
                    : this.tour.medine_hotel;

                if (hotel.name) {
                    hotelsHtml += `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="text-2xl">🕌</span>
                                <h4 class="text-xl font-semibold text-blue-800">Medine Oteli</h4>
                            </div>
                            <div class="space-y-2 text-blue-700">
                                <p><strong>Otel:</strong> ${hotel.name}</p>
                                ${hotel.address ? `<p><strong>Adres:</strong> ${hotel.address}</p>` : ''}
                                ${hotel.stars ? `<p><strong>Yıldız:</strong> ${hotel.stars} ⭐</p>` : ''}
                                ${hotel.distance_to_haram ? `<p><strong>Harem'e Mesafe:</strong> ${hotel.distance_to_haram}m</p>` : ''}
                                ${hotel.features ? `<p><strong>Özellikler:</strong> ${hotel.features}</p>` : ''}
                            </div>
                        </div>
                    `;
                }
            } catch (e) {
                console.error('Medine hotel parse error:', e);
            }
        }

        container.innerHTML = hotelsHtml || '<p class="text-gray-500">Otel bilgileri belirtilmemiş.</p>';
    }

    renderServicesTab() {
        // Included services
        this.renderServicesList('includedServices', this.tour.included_services, 'text-green-600', '✅');
        
        // Excluded services
        this.renderServicesList('excludedServices', this.tour.excluded_services, 'text-red-600', '❌');
    }

    renderServicesList(containerId, services, colorClass, icon) {
        const container = document.getElementById(containerId);
        
        if (!services) {
            container.innerHTML = '<p class="text-gray-500">Belirtilmemiş.</p>';
            return;
        }

        let serviceList = [];
        try {
            if (typeof services === 'string') {
                serviceList = services.split('\n')
                    .map(s => s.trim().replace(/^[•\-\*]\s*/, ''))
                    .filter(s => s.length > 0);
            } else if (Array.isArray(services)) {
                serviceList = services;
            }
        } catch (e) {
            console.error('Services parse error:', e);
        }

        if (serviceList.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Belirtilmemiş.</p>';
            return;
        }

        container.innerHTML = serviceList.map(service => `
            <div class="flex items-start gap-3">
                <span class="${colorClass}">${icon}</span>
                <span class="text-gray-700">${service}</span>
            </div>
        `).join('');
    }

    renderDocumentsTab() {
        const container = document.getElementById('requiredDocuments');
        this.renderServicesList('requiredDocuments', this.tour.required_documents, 'text-blue-600', '📋');

        // Important notes
        const notesContainer = document.getElementById('importantNotes');
        if (this.tour.important_notes) {
            notesContainer.innerHTML = this.tour.important_notes.replace(/\n/g, '<br>');
        } else {
            notesContainer.innerHTML = 'Özel not bulunmuyor.';
        }

        // Payment terms sidebar
        const paymentContainer = document.getElementById('paymentTerms');
        if (this.tour.payment_terms) {
            const terms = this.tour.payment_terms.split('\n')
                .map(term => term.trim().replace(/^[•\-\*]\s*/, ''))
                .filter(term => term.length > 0);
            
            paymentContainer.innerHTML = terms.map(term => `
                <div class="flex items-start gap-2">
                    <span class="text-nahletur-primary">•</span>
                    <span>${term}</span>
                </div>
            `).join('');
        } else {
            paymentContainer.innerHTML = '<p>Ödeme koşulları belirtilmemiş.</p>';
        }
    }

    setupTabs() {
        // Tab button click handlers are set via onclick in HTML
    }

    showError(message = 'Tur bulunamadı') {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
    }
}

// Tab navigation functions (global)
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-nahletur-primary', 'text-nahletur-primary');
        btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`button[onclick="showTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-nahletur-primary', 'text-nahletur-primary');
        activeButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    }
}

// Contact function
function contactForTour() {
    const tourTitle = document.getElementById('tourTitle').textContent;
    const message = `Merhaba! "${tourTitle}" turu hakkında bilgi almak ve rezervasyon yaptırmak istiyorum.`;
    const whatsappUrl = `https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(message)}`;
    
    if (confirm('WhatsApp ile iletişime geçmek ister misiniz?')) {
        window.open(whatsappUrl, '_blank');
    } else {
        window.location.href = '/iletisim';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TourDetail();
});

// Set default active tab styles
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        showTab('overview');
    }, 100);
});