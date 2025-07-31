// Main App Manager
class AppManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {};
    }

    init() {
        this.loadComponents();
        this.registerPages();
        this.showPage('dashboard');
    }

    loadComponents() {
        // Components are already loaded via script tags
        console.log('✅ App Manager initialized');
    }

    registerPages() {
        // Register page instances
        this.pages = {
            'dashboard': window.dashboardPage,
            'tours': window.toursPage,
            'categories': window.categoriesPage,
            'messages': window.messagesPage,
            'settings': window.settingsPage
        };
    }

    showPage(pageId) {
        console.log(`📄 Switching to page: ${pageId}`);
        
        this.currentPage = pageId;
        
        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'tours': 'Tur Yönetimi',
            'categories': 'Kategori Yönetimi',
            'messages': 'Mesaj Yönetimi',
            'settings': 'Site Ayarları'
        };
        
        window.topBarComponent.updateTitle(titles[pageId] || pageId);
        
        // Load page content
        if (this.pages[pageId]) {
            this.pages[pageId].render();
        } else {
            this.renderNotFound(pageId);
        }
    }

    renderNotFound(pageId) {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="card p-8 text-center">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-5-1.691c-2.598-2.11-3.292-3.582-3-5.592.307-2.114 1.379-4.032 3.172-5.727a7.977 7.977 0 0110.656 0C19.621 9.086 20.693 11.004 21 13.118c.292 2.01-.402 3.482-3 5.592z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Sayfa Bulunamadı</h3>
                <p class="text-gray-600">${pageId} sayfası henüz geliştirilmemiş.</p>
            </div>
        `;
    }

    showToast(message, type = 'success') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize app manager
window.appManager = new AppManager();

// Global toast function
window.showToast = (message, type) => {
    window.appManager.showToast(message, type);
};
