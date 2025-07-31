// Dashboard Page Module
class DashboardPage {
    constructor() {
        this.stats = {
            totalTours: 0,
            activeTours: 0,
            totalCategories: 0,
            newMessages: 0
        };
    }

    async render() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading first
        contentArea.innerHTML = this.getLoadingHTML();
        
        try {
            // Load dashboard data
            await this.loadStats();
            
            // Render dashboard content
            contentArea.innerHTML = this.getDashboardHTML();
            
        } catch (error) {
            console.error('Dashboard load error:', error);
            contentArea.innerHTML = this.getErrorHTML();
        }
    }

    async loadStats() {
        try {
            const response = await adminAPI.getDashboardStats();
            if (response.success) {
                this.stats = response.data;
            }
        } catch (error) {
            console.error('Stats load error:', error);
            // Keep default stats on error
        }
    }

    getDashboardHTML() {
        return `
            <!-- Stats Cards -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="card p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-full">
                            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-gray-600 text-sm">Toplam Tur</p>
                            <p class="text-2xl font-bold text-gray-800">${this.stats.totalTours}</p>
                        </div>
                    </div>
                </div>
                
                <div class="card p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-100 rounded-full">
                            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-gray-600 text-sm">Aktif Tur</p>
                            <p class="text-2xl font-bold text-gray-800">${this.stats.activeTours}</p>
                        </div>
                    </div>
                </div>
                
                <div class="card p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-100 rounded-full">
                            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm-6 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-gray-600 text-sm">Kategori</p>
                            <p class="text-2xl font-bold text-gray-800">${this.stats.totalCategories}</p>
                        </div>
                    </div>
                </div>
                
                <div class="card p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-red-100 rounded-full">
                            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-gray-600 text-sm">Yeni Mesaj</p>
                            <p class="text-2xl font-bold text-gray-800">${this.stats.newMessages}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Welcome Card -->
            <div class="grid md:grid-cols-2 gap-6 mb-8">
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">Hoş Geldiniz!</h3>
                    <p class="text-gray-600 mb-4">Nahletur Admin Panel'e hoş geldiniz. Buradan turlarınızı, kategorilerinizi ve mesajlarınızı yönetebilirsiniz.</p>
                    <div class="flex space-x-3">
                        <button onclick="window.sidebarComponent.navigateToSection('tours')" class="btn-primary">
                            Turları Yönet
                        </button>
                        <button onclick="window.sidebarComponent.navigateToSection('categories')" class="btn-secondary">
                            Kategoriler
                        </button>
                    </div>
                </div>
                
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">Hızlı İşlemler</h3>
                    <div class="space-y-3">
                        <button onclick="this.showNewTourModal()" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center">
                            <svg class="w-5 h-5 text-admin-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                            </svg>
                            Yeni Tur Ekle
                        </button>
                        <button onclick="window.sidebarComponent.navigateToSection('messages')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center">
                            <svg class="w-5 h-5 text-admin-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                            </svg>
                            Mesajları Görüntüle
                            ${this.stats.newMessages > 0 ? `<span class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">${this.stats.newMessages}</span>` : ''}
                        </button>
                        <button onclick="window.sidebarComponent.navigateToSection('settings')" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center">
                            <svg class="w-5 h-5 text-admin-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                            </svg>
                            Site Ayarları
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- System Status -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-800">Sistem Durumu</h3>
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span class="text-sm text-gray-700">Database Bağlantısı</span>
                    </div>
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span class="text-sm text-gray-700">API Servisleri</span>
                    </div>
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span class="text-sm text-gray-700">File Upload</span>
                    </div>
                </div>
            </div>
        `;
    }

    getLoadingHTML() {
        return `
            <div class="text-center py-12">
                <div class="loading-spinner mb-4"></div>
                <p class="text-gray-500">Dashboard yükleniyor...</p>
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
                <h3 class="text-lg font-medium text-gray-900 mb-2">Veri Yüklenemedi</h3>
                <p class="text-gray-600 mb-4">Dashboard verilerini yüklerken bir hata oluştu.</p>
                <button onclick="window.dashboardPage.render()" class="btn-primary">
                    Tekrar Dene
                </button>
            </div>
        `;
    }

    showNewTourModal() {
        // Navigate to tours page and show new tour form
        window.sidebarComponent.navigateToSection('tours');
        // Will be implemented when tours page is ready
        setTimeout(() => {
            if (window.toursPage && window.toursPage.showNewTourForm) {
                window.toursPage.showNewTourForm();
            }
        }, 100);
    }
}

// Initialize dashboard page
window.dashboardPage = new DashboardPage();
