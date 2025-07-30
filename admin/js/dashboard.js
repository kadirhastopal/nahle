// admin/js/dashboard.js - TAM DÜZELTİLMİŞ DASHBOARD MANAGER
class DashboardManager {
    constructor() {
        this.stats = null;
        this.init();
    }

    init() {
        console.log('📊 Dashboard Manager başlatıldı');
    }

    async loadDashboardData() {
        try {
            console.log('📊 Dashboard verileri yükleniyor...');
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('❌ Token bulunamadı');
                this.showError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                return;
            }
            
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    this.stats = data.data;
                    console.log('✅ Dashboard verileri yüklendi:', this.stats);
                    this.renderDashboard();
                } else {
                    console.error('❌ Dashboard API hatası:', data.message);
                    this.showError(data.message || 'Dashboard verileri alınamadı');
                }
            } else if (response.status === 401) {
                console.error('❌ Auth hatası');
                localStorage.removeItem('authToken');
                location.reload();
            } else {
                console.error('❌ Dashboard response hatası:', response.status);
                this.showError('Sunucu hatası. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('❌ Dashboard fetch hatası:', error);
            this.showError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
        }
    }

    renderDashboard() {
        const dashboardContainer = document.getElementById('dashboardContent');
        
        if (!dashboardContainer) {
            console.error('❌ Dashboard container bulunamadı');
            return;
        }

        if (!this.stats) {
            console.error('❌ Stats verisi yok');
            this.showError('Dashboard verileri bulunamadı');
            return;
        }

        const {
            totalTours = 0,
            totalCategories = 0,
            totalMessages = 0,
            newMessages = 0
        } = this.stats.stats || {};

        const recentTours = this.stats.recentTours || [];
        const recentMessages = this.stats.recentMessages || [];

        dashboardContainer.innerHTML = `
            <!-- ✅ STATS CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Tours -->
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Toplam Tur</p>
                            <p class="text-2xl font-semibold text-gray-900">${totalTours}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Total Categories -->
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm-6 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Kategori</p>
                            <p class="text-2xl font-semibold text-gray-900">${totalCategories}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Total Messages -->
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Toplam Mesaj</p>
                            <p class="text-2xl font-semibold text-gray-900">${totalMessages}</p>
                        </div>
                    </div>
                </div>
                
                <!-- New Messages -->
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Yeni Mesaj</p>
                            <p class="text-2xl font-semibold text-gray-900">${newMessages}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ✅ RECENT CONTENT GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Tours -->
                <div class="bg-white rounded-lg shadow-sm border">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Son Eklenen Turlar</h3>
                    </div>
                    <div class="p-6">
                        ${recentTours.length > 0 ? this.renderRecentTours(recentTours) : '<p class="text-gray-500 text-center py-4">Henüz tur eklenmemiş</p>'}
                    </div>
                </div>

                <!-- Recent Messages -->
                <div class="bg-white rounded-lg shadow-sm border">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Son Mesajlar</h3>
                    </div>
                    <div class="p-6">
                        ${recentMessages.length > 0 ? this.renderRecentMessages(recentMessages) : '<p class="text-gray-500 text-center py-4">Henüz mesaj yok</p>'}
                    </div>
                </div>
            </div>

            <!-- ✅ QUICK ACTIONS -->
            <div class="mt-8">
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Hızlı İşlemler</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onclick="showSection('tours')"
                            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div class="text-left">
                                <p class="font-medium text-gray-900">Yeni Tur Ekle</p>
                                <p class="text-sm text-gray-500">Tur listesine git</p>
                            </div>
                        </button>
                        
                        <button 
                            onclick="showSection('messages')"
                            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div class="text-left">
                                <p class="font-medium text-gray-900">Mesajları Görüntüle</p>
                                <p class="text-sm text-gray-500">İletişim mesajları</p>
                            </div>
                        </button>
                        
                        <button 
                            onclick="showSection('categories')"
                            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm-6 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div class="text-left">
                                <p class="font-medium text-gray-900">Kategori Yönetimi</p>
                                <p class="text-sm text-gray-500">Kategori işlemleri</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentTours(tours) {
        return tours.slice(0, 5).map(tour => `
            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-1">
                    <p class="font-medium text-gray-900 text-sm">${tour.title}</p>
                    <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs px-2 py-1 rounded-full ${
                            tour.Category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }">
                            ${tour.Category ? tour.Category.name : 'Kategori Yok'}
                        </span>
                        <span class="text-xs text-gray-500">
                            ${this.formatDate(tour.created_at)}
                        </span>
                    </div>
                </div>
                <div class="ml-3">
                    <span class="text-xs px-2 py-1 rounded-full ${
                        tour.status === 'active' ? 'bg-green-100 text-green-800' : 
                        tour.status === 'full' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${tour.status === 'active' ? 'Aktif' : 
                          tour.status === 'full' ? 'Dolu' : 
                          tour.status === 'inactive' ? 'Pasif' : 'Bilinmiyor'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    renderRecentMessages(messages) {
        return messages.slice(0, 5).map(message => `
            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-1">
                    <p class="font-medium text-gray-900 text-sm">${message.name}</p>
                    <p class="text-gray-600 text-xs mt-1 truncate">${message.subject || message.message}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDate(message.created_at)}</p>
                </div>
                <div class="ml-3">
                    <span class="text-xs px-2 py-1 rounded-full ${
                        message.status === 'new' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }">
                        ${message.status === 'new' ? 'Yeni' : 'Okundu'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'Tarih yok';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date format error:', error);
            return dateString;
        }
    }

    showError(message) {
        const dashboardContainer = document.getElementById('dashboardContent');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-500 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button 
                        onclick="dashboardManager.loadDashboardData()" 
                        class="px-6 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            `;
        }
    }
}

// ✅ GLOBAL INSTANCE OLUŞTUR
if (typeof window !== 'undefined') {
    window.dashboardManager = new DashboardManager();
    console.log('✅ Dashboard Manager hazır!');
}