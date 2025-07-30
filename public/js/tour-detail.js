// public/js/tour-detail.js - GELİŞMİŞ TUR DETAY SAYFASI
class TourDetail {
    constructor() {
        this.tour = null;
        this.tourId = null;
        this.activeTab = 'overview';
        this.init();
    }

    init() {
        console.log('🔍 Tour Detail başlatılıyor...');
        
        // URL'den tour ID'sini al
        this.tourId = this.getTourIdFromUrl();
        
        if (!this.tourId) {
            this.showError('Geçersiz tur ID');
            return;
        }

        // Tour detaylarını yükle
        this.loadTourDetail();
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
            this.showError('Tur detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        }
    }

    renderTourDetail() {
        // Loading state'i gizle, content'i göster
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('tourContent').classList.remove('hidden');

        // Sayfa başlığını güncelle
        document.title = `${this.tour.title} - Nahletur.com`;

        // Ana bileşenleri render et
        this.renderBreadcrumb();
        this.renderHeroSection();
        this.renderBookingSidebar();
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
        } else {
            categoryEl.textContent = 'Kategori';
        }

        titleEl.textContent = this.tour.title;
    }

    renderHeroSection() {
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
                this.tour.Category.name.toLowerCase().includes('hac') ? 
                'bg-green-500 bg-opacity-20 text-green-800' : 
                'bg-blue-500 bg-opacity-20 text-blue-800'
            }`;
        }

        // Featured badge
        if (this.tour.featured) {
            document.getElementById('featuredBadge').classList.remove('hidden');
        }

        // Tour title
        document.getElementById('tourTitle').textContent = this.tour.title;

        // Tour dates
        const startDate = this.tour.start_date ? 
            new Date(this.tour.start_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş';
        const endDate = this.tour.end_date ? 
            new Date(this.tour.end_date).toLocaleDateString('tr-TR') : '';
        document.getElementById('tourDates').textContent = endDate ? 
            `${startDate} - ${endDate}` : startDate;

        // Tour duration
        let durationText = '';
        if (this.tour.duration_days) {
            durationText = `${this.tour.duration_days} Gün`;
            if (this.tour.duration_nights) {
                durationText += ` ${this.tour.duration_nights} Gece`;
            }
        }
        
        // City breakdown
        if (this.tour.mekke_nights || this.tour.medine_nights) {
            durationText += ' (';
            if (this.tour.mekke_nights) durationText += `${this.tour.mekke_nights} Gece Mekke`;
            if (this.tour.mekke_nights && this.tour.medine_nights) durationText += ' | ';
            if (this.tour.medine_nights) durationText += `${this.tour.medine_nights} Gece Medine`;
            durationText += ')';
        }
        
        document.getElementById('tourDuration').textContent = durationText || 'Belirtilmemiş';

        // Tour quota
        const quota = this.tour.available_quota || this.tour.quota || 0;
        const quotaText = quota > 0 ? `${quota} kişi kaldı` : 'Dolu';
        const quotaColor = quota > 10 ? 'text-green-600' : quota > 0 ? 'text-orange-600' : 'text-red-600';
        
        const quotaEl = document.getElementById('tourQuota');
        quotaEl.textContent = quotaText;
        quotaEl.className = quotaColor;
    }

    renderBookingSidebar() {
        // Tour price
        const price = this.tour.formatted_price || this.tour.price_try ? 
            new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(this.tour.price_try) : 
            '₺0';
        document.getElementById('tourPrice').textContent = price;

        // Booking sidebar info
        document.getElementById('bookingTourDates').textContent = 
            document.getElementById('tourDates').textContent;
        document.getElementById('bookingTourDuration').textContent = 
            document.getElementById('tourDuration').textContent;
        document.getElementById('bookingTourQuota').textContent = 
            document.getElementById('tourQuota').textContent;

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmit(e);
            });
        }
    }

    renderTabContents() {
        // Overview tab
        this.renderOverviewTab();
        
        // Program tab
        this.renderProgramTab();
        
        // Hotels tab
        this.renderHotelsTab();
        
        // Services tab
        this.renderServicesTab();
        
        // Documents tab
        this.renderDocumentsTab();
    }

    renderOverviewTab() {
        // Description
        const descriptionEl = document.getElementById('tourDescription');
        const description = this.tour.description || this.tour.short_description || 'Detaylı açıklama bulunmuyor.';
        descriptionEl.innerHTML = `<p class="text-gray-600 leading-relaxed">${description}</p>`;

        // Visit places
        this.renderVisitPlaces();
    }

    renderVisitPlaces() {
        const visitPlacesEl = document.getElementById('visitPlacesList');
        
        if (!this.tour.visit_places) {
            document.getElementById('visitPlacesSection').style.display = 'none';
            return;
        }

        const places = this.parseListContent(this.tour.visit_places);
        
        if (places.length === 0) {
            document.getElementById('visitPlacesSection').style.display = 'none';
            return;
        }

        visitPlacesEl.innerHTML = places.map(place => `
            <div class="bg-blue-50 rounded-lg p-4 text-center">
                <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <h5 class="font-semibold text-gray-800 text-sm">${place}</h5>
            </div>
        `).join('');
    }

    renderProgramTab() {
        const programEl = document.getElementById('dailyProgramContent');
        
        if (!this.tour.daily_program) {
            programEl.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    <p class="text-gray-500">Günlük program henüz eklenmemiş</p>
                </div>
            `;
            return;
        }

        try {
            const dailyPrograms = typeof this.tour.daily_program === 'string' ? 
                JSON.parse(this.tour.daily_program) : this.tour.daily_program;

            if (!Array.isArray(dailyPrograms) || dailyPrograms.length === 0) {
                throw new Error('Program verisi bulunamadı');
            }

            programEl.innerHTML = dailyPrograms.map((program, index) => `
                <div class="border border-gray-200 rounded-lg p-6 mb-4">
                    <div class="flex items-center mb-4">
                        <div class="w-10 h-10 bg-nahletur-primary text-white rounded-full flex items-center justify-center font-bold mr-4">
                            ${index + 1}
                        </div>
                        <h4 class="text-lg font-semibold text-gray-800">${program.title || `${index + 1}. Gün`}</h4>
                    </div>
                    <div class="ml-14">
                        <p class="text-gray-600 leading-relaxed">${program.description || 'Program detayı bulunmuyor.'}</p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Program parse hatası:', error);
            programEl.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Program bilgileri yüklenemedi</p>
                </div>
            `;
        }
    }

    renderHotelsTab() {
        // Mekke Hotel
        this.renderHotelSection('mekke', this.tour.mekke_hotel, this.tour.mekke_hotel_images);
        
        // Medine Hotel
        this.renderHotelSection('medine', this.tour.medine_hotel, this.tour.medine_hotel_images);
    }

    renderHotelSection(city, hotelInfo, hotelImages) {
        const sectionEl = document.getElementById(`${city}HotelSection`);
        const detailsEl = document.getElementById(`${city}HotelDetails`);
        
        if (!hotelInfo && !hotelImages) {
            sectionEl.style.display = 'none';
            return;
        }

        let content = '';
        
        // Hotel info
        if (hotelInfo) {
            content += `
                <div class="mb-4">
                    <h5 class="font-semibold text-gray-800 mb-2">Otel Bilgileri</h5>
                    <p class="text-gray-600">${hotelInfo}</p>
                </div>
            `;
        }

        // Hotel images
        if (hotelImages) {
            try {
                const images = typeof hotelImages === 'string' ? JSON.parse(hotelImages) : hotelImages;
                
                if (Array.isArray(images) && images.length > 0) {
                    content += `
                        <div>
                            <h5 class="font-semibold text-gray-800 mb-3">Otel Resimleri</h5>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                ${images.map(image => `
                                    <img src="${image}" alt="${city} oteli" 
                                         class="w-full h-24 object-cover rounded-lg border hover:scale-105 transition-transform cursor-pointer"
                                         onclick="this.requestFullscreen()">
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error(`${city} hotel images parse hatası:`, error);
            }
        }

        if (content) {
            detailsEl.innerHTML = content;
        } else {
            detailsEl.innerHTML = '<p class="text-gray-500">Otel bilgisi bulunmuyor</p>';
        }
    }

    renderServicesTab() {
        // Included services
        this.renderServicesList('includedServicesList', this.tour.included_services, 'green');
        
        // Excluded services
        this.renderServicesList('excludedServicesList', this.tour.excluded_services, 'red');

        // Flight information
        this.renderFlightInfo();
    }

    renderServicesList(elementId, services, color) {
        const element = document.getElementById(elementId);
        
        if (!services) {
            element.innerHTML = '<p class="text-gray-500">Belirtilmemiş</p>';
            return;
        }

        const serviceItems = this.parseListContent(services);
        
        if (serviceItems.length === 0) {
            element.innerHTML = '<p class="text-gray-500">Belirtilmemiş</p>';
            return;
        }

        const iconColor = color === 'green' ? 'text-green-600' : 'text-red-600';
        const icon = color === 'green' ? 
            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' :
            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>';

        element.innerHTML = serviceItems.map(service => `
            <div class="flex items-start">
                <svg class="w-5 h-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    ${icon}
                </svg>
                <span class="text-gray-700 text-sm">${service}</span>
            </div>
        `).join('');
    }

    renderFlightInfo() {
        // Departure info
        const departureEl = document.getElementById('departureInfo');
        if (this.tour.departure_info) {
            const departureLines = this.tour.departure_info.split('\n').filter(line => line.trim());
            departureEl.querySelector('p').innerHTML = departureLines.join('<br>');
        } else {
            departureEl.querySelector('p').textContent = 'Uçuş bilgisi belirtilmemiş';
        }

        // Return info
        const returnEl = document.getElementById('returnInfo');
        if (this.tour.return_info) {
            const returnLines = this.tour.return_info.split('\n').filter(line => line.trim());
            returnEl.querySelector('p').innerHTML = returnLines.join('<br>');
        } else {
            returnEl.querySelector('p').textContent = 'Uçuş bilgisi belirtilmemiş';
        }
    }

    renderDocumentsTab() {
        // Required documents
        this.renderDocumentSection('requiredDocumentsList', this.tour.required_documents);
        
        // Important notes
        this.renderDocumentSection('importantNotesList', this.tour.important_notes);
        
        // Cancellation policy
        this.renderDocumentSection('cancellationPolicyList', this.tour.cancellation_policy);
        
        // Payment terms
        this.renderDocumentSection('paymentTermsList', this.tour.payment_terms);
    }

    renderDocumentSection(elementId, content) {
        const element = document.getElementById(elementId);
        
        if (!content) {
            element.innerHTML = '<p class="text-gray-500">Belirtilmemiş</p>';
            return;
        }

        const items = this.parseListContent(content);
        
        if (items.length === 0) {
            element.innerHTML = `<p class="text-gray-600">${content}</p>`;
            return;
        }

        element.innerHTML = `
            <ul class="space-y-2">
                ${items.map(item => `
                    <li class="flex items-start">
                        <span class="text-gray-400 mr-2">•</span>
                        <span class="text-gray-700">${item}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // ✅ UTILITY METHODS
    parseListContent(content) {
        if (!content) return [];
        
        // Split by newlines and filter empty lines
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[•\-\*]\s*/, '')) // Remove bullet points
            .filter(line => line.length > 0);
    }

    handleBookingSubmit(e) {
        e.preventDefault();
        
        // Simple booking redirect - you can enhance this
        const personCount = e.target.querySelector('input[type="number"]').value;
        const message = `Merhaba, "${this.tour.title}" turu için ${personCount} kişilik rezervasyon yapmak istiyorum.`;
        const whatsappUrl = `https://wa.me/905063889020?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    }

    showError(message) {
        const loadingState = document.getElementById('loadingState');
        loadingState.innerHTML = `
            <div class="text-center">
                <div class="text-red-500 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="space-x-4">
                    <a href="/" class="bg-nahletur-primary text-white px-6 py-2 rounded-md hover:bg-nahletur-secondary transition-colors">
                        Ana Sayfaya Dön
                    </a>
                    <button onclick="location.reload()" class="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors">
                        Tekrar Dene
                    </button>
                </div>
            </div>
        `;
    }
}

// ✅ GLOBAL FUNCTIONS
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-gray-500', 'hover:text-gray-700');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update button state
    const clickedButton = event.target;
    clickedButton.classList.add('tab-active');
    clickedButton.classList.remove('text-gray-500', 'hover:text-gray-700');
}

// ✅ INITIALIZE ON PAGE LOAD
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Tour Detail sayfası başlatılıyor...');
    
    // Initialize tour detail
    window.tourDetail = new TourDetail();
    
    console.log('✅ Tour Detail hazır!');
});

// ✅ SEO AND ANALYTICS INTEGRATION
function updateMetaTags(tour) {
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && tour.description) {
        metaDescription.setAttribute('content', tour.description.substring(0, 160));
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && tour.seo_keywords) {
        metaKeywords.setAttribute('content', tour.seo_keywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', `${tour.title} - Nahletur.com`);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && tour.short_description) {
        ogDescription.setAttribute('content', tour.short_description);
    }
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && tour.image_url) {
        ogImage.setAttribute('content', window.location.origin + tour.image_url);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
        ogUrl.setAttribute('content', window.location.href);
    }
}

// ✅ ENHANCED IMAGE GALLERY
function openImageGallery(images, currentIndex = 0) {
    if (!images || !Array.isArray(images) || images.length === 0) return;
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center';
    modal.onclick = () => modal.remove();
    
    // Create image container
    const container = document.createElement('div');
    container.className = 'relative max-w-4xl max-h-full p-4';
    container.onclick = (e) => e.stopPropagation();
    
    // Current image
    const img = document.createElement('img');
    img.src = images[currentIndex];
    img.className = 'max-w-full max-h-full object-contain rounded-lg';
    img.alt = 'Tur resmi';
    
    // Navigation buttons (if multiple images)
    if (images.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '‹';
        prevBtn.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white text-3xl p-2 rounded-full hover:bg-opacity-30 transition-colors';
        prevBtn.onclick = () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
            img.src = images[currentIndex];
        };
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '›';
        nextBtn.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white text-3xl p-2 rounded-full hover:bg-opacity-30 transition-colors';
        nextBtn.onclick = () => {
            currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
            img.src = images[currentIndex];
        };
        
        container.appendChild(prevBtn);
        container.appendChild(nextBtn);
    }
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'absolute top-4 right-4 bg-white bg-opacity-20 text-white text-2xl p-2 rounded-full hover:bg-opacity-30 transition-colors';
    closeBtn.onclick = () => modal.remove();
    
    container.appendChild(img);
    container.appendChild(closeBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    // Keyboard navigation
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'ArrowLeft' && images.length > 1) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && images.length > 1) {
            nextBtn.click();
        }
    };
    
    document.addEventListener('keydown', handleKeydown);
}

// ✅ SOCIAL SHARING
function shareTour(platform) {
    const url = window.location.href;
    const title = document.title;
    const text = document.querySelector('meta[name="description"]')?.getAttribute('content') || title;
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            break;
        default:
            // Native Web Share API
            if (navigator.share) {
                navigator.share({
                    title: title,
                    text: text,
                    url: url
                }).catch(console.error);
                return;
            }
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                alert('Link panoya kopyalandı!');
            }).catch(() => {
                // Fallback for older browsers
                const input = document.createElement('input');
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                alert('Link panoya kopyalandı!');
            });
            return;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// ✅ PRICE CALCULATOR
function calculateTotalPrice(personCount, basePrice) {
    if (!personCount || !basePrice) return 0;
    
    let totalPrice = personCount * basePrice;
    
    // Discount for groups (example logic)
    if (personCount >= 10) {
        totalPrice *= 0.95; // 5% discount
    } else if (personCount >= 5) {
        totalPrice *= 0.97; // 3% discount
    }
    
    return totalPrice;
}

// ✅ FORM VALIDATION
function validateBookingForm(form) {
    const personCount = form.querySelector('input[type="number"]').value;
    const errors = [];
    
    if (!personCount || personCount < 1) {
        errors.push('Kişi sayısı en az 1 olmalıdır');
    }
    
    if (personCount > 10) {
        errors.push('Maksimum 10 kişi için rezervasyon yapabilirsiniz');
    }
    
    // Check availability
    const availableQuota = window.tourDetail?.tour?.available_quota || 0;
    if (personCount > availableQuota) {
        errors.push(`Sadece ${availableQuota} kişilik yer kalmıştır`);
    }
    
    return errors;
}

// ✅ LAZY LOADING FOR IMAGES
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ✅ SMOOTH SCROLLING
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ✅ PERFORMANCE MONITORING
function trackPagePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`📊 Sayfa yükleme süresi: ${pageLoadTime}ms`);
            
            // Analytics'e gönderebilirsiniz
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: pageLoadTime,
                    event_category: 'Performance'
                });
            }
        });
    }
}

// Initialize performance tracking
trackPagePerformance();