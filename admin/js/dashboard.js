// admin/js/dashboard.js - Dashboard Manager
class DashboardManager {
    constructor() {
        this.stats = null;
    }

    async loadDashboardData() {
        try {
            console.log('📊 Dashboard verileri yükleniyor...');
            
            const response = await fetch('/api/admin/dashboard', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.stats = data.data;
                console.log('✅ Dashboard verileri yüklendi:', this.stats);
                this.renderDashboard();
            } else {
                console.error('❌ Dashboard data load failed');
                this.showError('Dashboard verileri yüklenemedi');
            }
        } catch (error) {
            console.error('❌ Dashboard error:', error);
            this.showError('Bağlantı hatası');
        }
    }

    renderDashboard() {
        const dashboardContainer = document.getElementById('dashboardContent');
        
        if (!dashboardContainer || !this.stats) {
            console.error('❌ Dashboard container veya stats bulunamadı');
            return;
        }

        dashboardContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                🚌
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Aktif Turlar</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.stats.stats.totalTours || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                📂
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Kategoriler</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.stats.stats.totalCategories || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                💬
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Yeni Mesajlar</h3>
                            <p class="text-2xl font-bold text-red-600">${this.stats.stats.newMessages || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                📧
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Toplam Mesaj</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.stats.stats.totalMessages || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow-sm border">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Son Eklenen Turlar</h3>
                    </div>
                    <div class="p-6">
                        ${this.renderRecentTours()}
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm border">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Son Mesajlar</h3>
                    </div>
                    <div class="p-6">
                        ${this.renderRecentMessages()}
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentTours() {
        if (!this.stats.recentTours || this.stats.recentTours.length === 0) {
            return `
                <div class="text-center py-4">
                    <p class="text-gray-500">Henüz tur bulunmuyor.</p>
                </div>
            `;
        }

        return this.stats.recentTours.map(tour => `
            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-admin-light rounded-full flex items-center justify-center">
                        <span class="text-admin-primary text-xs">🚌</span>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">${tour.title}</p>
                        <p class="text-xs text-gray-500">
                            ${tour.Category ? tour.Category.name : 'Kategori Yok'} • 
                            ${tour.duration_days} gün
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                        ${tour.price_try ? new Intl.NumberFormat('tr-TR').format(tour.price_try) + ' ₺' : 'Fiyat Yok'}
                    </p>
                    <p class="text-xs text-gray-500">${tour.available_quota}/${tour.quota} kota</p>
                </div>
            </div>
        `).join('');
    }

    renderRecentMessages() {
        if (!this.stats.recentMessages || this.stats.recentMessages.length === 0) {
            return `
                <div class="text-center py-4">
                    <p class="text-gray-500">Henüz mesaj bulunmuyor.</p>
                </div>
            `;
        }

        return this.stats.recentMessages.map(message => `
            <div class="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-start">
                    <div class="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-blue-600 text-xs">💬</span>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">${message.name}</p>
                        <p class="text-sm text-gray-600 line-clamp-2">${message.message}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${message.email} • ${this.formatDate(message.created_at)}
                        </p>
                    </div>
                </div>
                <div class="ml-4">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        message.status === 'new' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                    }">
                        ${message.status === 'new' ? 'Yeni' : 'Okundu'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
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
            return dateString;
        }
    }

    showError(message) {
        const dashboardContainer = document.getElementById('dashboardContent');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-500 mb-4">
                        <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="dashboardManager.loadDashboardData()" 
                            class="px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary transition-colors">
                        Tekrar Dene
                    </button>
                </div>
            `;
        }
    }
}

// Global instance oluştur
if (typeof window !== 'undefined') {
    window.dashboardManager = new DashboardManager();
    console.log('✅ Dashboard Manager hazır!');
}