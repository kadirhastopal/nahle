// admin/js/app.js
class AdminApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        console.log('🚀 Admin panel başlatılıyor...');
        
        // Sayfa yüklendikten sonra auth kontrolü yap
        await this.checkAuth();
        
        // Event listener'ları bağla
        this.bindEvents();
    }

    async checkAuth() {
        console.log('🔐 Auth kontrol ediliyor...');
        
        const isValid = await authManager.validateToken();
        
        if (isValid) {
            console.log('✅ Token geçerli, dashboard gösteriliyor');
            this.showDashboard();
            await this.loadDashboardData();
        } else {
            console.log('❌ Token geçersiz, login gösteriliyor');
            this.showLogin();
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar);
        }

        // Sidebar overlay
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', this.closeSidebar);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 Login işlemi başlatılıyor...');
        
        const form = e.target;
        const formData = new FormData(form);
        const errorDiv = document.getElementById('loginError');
        
        // Show loading state
        this.setLoginLoading(true);
        errorDiv.classList.add('hidden');
        
        try {
            const result = await authManager.login({
                login: formData.get('login'),
                password: formData.get('password')
            });
            
            if (result.success) {
                console.log('✅ Giriş başarılı!');
                this.showDashboard();
                await this.loadDashboardData();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            this.setLoginLoading(false);
        }
    }

    setLoginLoading(loading) {
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginBtnLoader = document.getElementById('loginBtnLoader');

        if (loginBtn) {
            loginBtn.disabled = loading;
            if (loginBtnText) loginBtnText.classList.toggle('hidden', loading);
            if (loginBtnLoader) loginBtnLoader.classList.toggle('hidden', !loading);
        }
    }

    showLogin() {
        console.log('📋 Login ekranı gösteriliyor');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    }

    showDashboard() {
        console.log('📊 Dashboard gösteriliyor');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        
        if (authManager.user) {
            const displayName = authManager.user.display_name || authManager.user.full_name || authManager.user.username;
            document.getElementById('userDisplayName').textContent = displayName;
            document.getElementById('userInitial').textContent = displayName.charAt(0).toUpperCase();
        }
    }

    async loadDashboardData() {
        console.log('📊 Dashboard verileri yükleniyor...');
        await dashboardManager.loadDashboardData();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }
}

// Global functions for navigation
function showSection(sectionName) {
    console.log('📄 Section değiştiriliyor:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.remove('hidden');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'text-white', 'bg-pink-700');
        item.classList.add('text-pink-100');
    });
    
    // Find and activate current nav item
    const currentNavItem = document.querySelector(`a[onclick="showSection('${sectionName}')"]`);
    if (currentNavItem) {
        currentNavItem.classList.remove('text-pink-100');
        currentNavItem.classList.add('active', 'text-white', 'bg-pink-700');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'tours': 'Tur Yönetimi',
        'categories': 'Kategori Yönetimi',
        'messages': 'Mesaj Yönetimi',
        'settings': 'Site Ayarları'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Admin Panel';
    
    // Close sidebar on mobile
    if (window.adminApp) {
        window.adminApp.closeSidebar();
    }
    
    // Load section specific data
    if (sectionName === 'dashboard') {
        dashboardManager.loadDashboardData();
    }
}

function logout() {
    console.log('🚪 Çıkış yapılıyor...');
    authManager.logout();
    if (window.adminApp) {
        window.adminApp.showLogin();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminApp = new AdminApp();
});

console.log('✅ Admin panel script yüklendi!');
