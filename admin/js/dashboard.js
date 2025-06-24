// admin/js/dashboard.js
class DashboardManager {
    constructor() {
        this.stats = null;
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.stats = data.data;
                this.renderDashboard();
            } else {
                console.error('Dashboard data load failed');
            }
        } catch (error) {
            console.error('Dashboard error:', error);
        }
    }

    renderDashboard() {
        const dashboardContainer = document.getElementById('dashboardContent');
        
        if (!dashboardContainer || !this.stats) return;

        dashboardContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Aktif Turlar</h3>
                    <p class="text-2xl font-bold text-gray-900">${this.stats.stats.totalTours}</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Kategoriler</h3>
                    <p class="text-2xl font-bold text-gray-900">${this.stats.stats.totalCategories}</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Yeni Mesajlar</h3>
                    <p class="text-2xl font-bold text-red-600">${this.stats.stats.newMessages}</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Toplam Mesaj</h3>
                    <p class="text-2xl font-bold text-gray-900">${this.stats.stats.totalMessages}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium">Son Turlar</h3>
                    </div>
                    <div class="p-6">
                        ${this.renderRecentTours()}
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium">Son Mesajlar</h3>
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
            return '<p class="text-gray-500">Henüz tur eklenmemiş</p>';
        }

        return this.stats.recentTours.map(tour => `
            <div class="mb-4 p-3 bg-gray-50 rounded">
                <h4 class="font-medium">${tour.title}</h4>
                <p class="text-sm text-gray-600">${tour.Category?.name || 'Kategori yok'}</p>
                <p class="text-sm font-medium text-green-600">${tour.formatted_price_try || '₺0'}</p>
            </div>
        `).join('');
    }

    renderRecentMessages() {
        if (!this.stats.recentMessages || this.stats.recentMessages.length === 0) {
            return '<p class="text-gray-500">Yeni mesaj yok</p>';
        }

        return this.stats.recentMessages.map(message => `
            <div class="mb-4 p-3 bg-gray-50 rounded">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium">${message.name}</h4>
                    <span class="text-xs text-gray-500">${message.created_date || ''}</span>
                </div>
                <p class="text-sm text-gray-600 truncate">${message.message}</p>
            </div>
        `).join('');
    }
}

// Global dashboard instance
window.dashboardManager = new DashboardManager();
