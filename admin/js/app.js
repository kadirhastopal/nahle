// admin/js/app.js - Login Handler Düzeltmesi
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
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById("mobileMenuBtn");
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener("click", this.toggleMobileMenu.bind(this));
        }
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    // ✅ DÜZELTME: Login handler'ı düzelt
    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 Login işlemi başlatılıyor...');
        
        const form = e.target;
        const formData = new FormData(form);
        const errorDiv = document.getElementById('loginError');
        
        // Show loading state
        this.setLoginLoading(true);
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        
        try {
            // ✅ DÜZELTME: AuthManager'a doğru formatta veri gönder
            const result = await authManager.login({
                login: formData.get('login'),
                password: formData.get('password')
            });
            
            if (result.success) {
                console.log('✅ Giriş başarılı!');
                this.showDashboard();
                await this.loadDashboardData();
            } else {
                console.error('❌ Giriş başarısız:', result.message);
                this.showLoginError(result.message || 'Giriş hatası');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showLoginError('Bağlantı hatası: ' + error.message);
        } finally {
            this.setLoginLoading(false);
        }
    }

    setLoginLoading(loading) {
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginBtnLoader = document.getElementById('loginBtnLoader');
        
        if (loginBtn && loginBtnText && loginBtnLoader) {
            if (loading) {
                loginBtn.disabled = true;
                loginBtnText.classList.add('hidden');
                loginBtnLoader.classList.remove('hidden');
            } else {
                loginBtn.disabled = false;
                loginBtnText.classList.remove('hidden');
                loginBtnLoader.classList.add('hidden');
            }
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        
        console.error('Login Error:', message);
    }

    showLogin() {
        const loginSection = document.getElementById('loginSection');
        const mainSection = document.getElementById('mainSection');
        
        if (loginSection && mainSection) {
            loginSection.classList.remove('hidden');
            mainSection.classList.add('hidden');
        }
    }

    showDashboard() {
        const loginSection = document.getElementById('loginSection');
        const mainSection = document.getElementById('mainSection');
        
        if (loginSection && mainSection) {
            loginSection.classList.add('hidden');
            mainSection.classList.remove('hidden');
        }
        
        // Dashboard'ı aktif olarak işaretle
        this.showSection('dashboard');
    }

    async loadDashboardData() {
        try {
            console.log('📊 Dashboard verileri yükleniyor...');
            
            const response = await fetch('/api/admin/dashboard', {
                headers: authManager.getAuthHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderDashboard(data.data);
                console.log('✅ Dashboard verileri yüklendi');
            } else {
                console.error('❌ Dashboard API hatası');
            }
        } catch (error) {
            console.error('❌ Dashboard yükleme hatası:', error);
        }
    }

    renderDashboard(data) {
        const container = document.getElementById('dashboardContent');
        if (!container || !data) return;

        const { stats, recentTours, recentMessages } = data;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Aktif Turlar</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.totalTours || 0}</p>
                        </div>
                        <div class="text-admin-primary text-3xl">🚌</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Kategoriler</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.totalCategories || 0}</p>
                        </div>
                        <div class="text-admin-primary text-3xl">📂</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Yeni Mesajlar</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.newMessages || 0}</p>
                        </div>
                        <div class="text-admin-primary text-3xl">📧</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Toplam Mesajlar</p>
                            <p class="text-2xl font-bold text-gray-900">${stats.totalMessages || 0}</p>
                        </div>
                        <div class="text-admin-primary text-3xl">💬</div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Son Eklenen Turlar</h3>
                    <div class="space-y-3">
                        ${recentTours && recentTours.length > 0 
                            ? recentTours.map(tour => `
                                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div class="text-2xl">🚌</div>
                                    <div class="flex-1">
                                        <p class="font-medium text-gray-900">${tour.title}</p>
                                        <p class="text-sm text-gray-500">${tour.Category?.name || 'Kategori Yok'}</p>
                                    </div>
                                </div>
                            `).join('')
                            : '<p class="text-gray-500 text-center py-4">Henüz tur eklenmemiş</p>'
                        }
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Yeni Mesajlar</h3>
                    <div class="space-y-3">
                        ${recentMessages && recentMessages.length > 0 
                            ? recentMessages.map(message => `
                                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div class="text-2xl">📧</div>
                                    <div class="flex-1">
                                        <p class="font-medium text-gray-900">${message.name}</p>
                                        <p class="text-sm text-gray-500">${message.email}</p>
                                    </div>
                                </div>
                            `).join('')
                            : '<p class="text-gray-500 text-center py-4">Yeni mesaj yok</p>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    showSection(sectionName) {
        console.log('📍 Section değiştiriliyor:', sectionName);
        
        this.currentSection = sectionName;
        
        // Sidebar'da aktif linkı güncelle
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.classList.remove('sidebar-link-active');
            if (link.dataset.section === sectionName) {
                link.classList.add('sidebar-link-active');
            }
        });
        
        // Content alanını güncelle
        const contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(sectionName + 'Content');
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Section'a özel yükleme işlemleri
        switch (sectionName) {
            case 'tours':
                if (typeof toursManager !== 'undefined') {
                    toursManager.loadTours();
                }
                break;
            case 'categories':
                if (typeof categoriesManager !== 'undefined') {
                    categoriesManager.loadCategories();
                }
                break;
            case 'messages':
                if (typeof messagesManager !== 'undefined') {
                    messagesManager.loadMessages();
                }
                break;
        }
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('translate-x-0');
            sidebar.classList.toggle('-translate-x-full');
        }
    }

    logout() {
        authManager.logout();
    }
}

// DOM yüklendikten sonra app'i başlat
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
    
    // Global navigation function
    window.showSection = (sectionName) => {
        window.adminApp.showSection(sectionName);
    };
    
    // Global logout function
    window.logout = () => {
        window.adminApp.logout();
    };
});