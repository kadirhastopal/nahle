// admin/js/app.js - ELEMENT ID'LERİ DÜZELTİLMİŞ VERSİYON
class AdminApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        console.log('🚀 Admin panel başlatılıyor...');
        
        // AuthManager'ın yüklenmesini bekle
        await this.waitForAuthManager();
        
        // Auth kontrolü yap
        await this.checkAuth();
        
        // Event listener'ları bağla
        this.bindEvents();
    }

    waitForAuthManager() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (typeof window.authManager !== 'undefined') {
                    console.log('✅ AuthManager hazır');
                    resolve();
                } else {
                    console.log('⏳ AuthManager bekleniyor...');
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    async checkAuth() {
        console.log('🔐 Auth kontrol ediliyor...');
        
        try {
            const isValid = await authManager.validateToken();
            
            if (isValid) {
                console.log('✅ Token geçerli, dashboard gösteriliyor');
                this.showDashboard();
            } else {
                console.log('❌ Token geçersiz, login gösteriliyor');
                this.showLogin();
            }
        } catch (error) {
            console.error('❌ Auth kontrolü hatası:', error);
            this.showLogin();
        }
    }

    bindEvents() {
        console.log('🔗 Event listener\'lar bağlanıyor...');
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Mobile menu button
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Sidebar overlay
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) {
            overlay.addEventListener('click', this.closeMobileMenu.bind(this));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 Login işlemi başlatılıyor...');
        
        const form = e.target;
        const formData = new FormData(form);
        const errorDiv = document.getElementById('loginError');
        
        // Loading state
        this.setLoginLoading(true);
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        
        try {
            const result = await authManager.login({
                login: formData.get('login'),
                password: formData.get('password')
            });
            
            if (result.success) {
                console.log('✅ Giriş başarılı!');
                this.showDashboard();
            } else {
                console.log('❌ Giriş başarısız:', result.message);
                this.showLoginError(result.message || 'Giriş bilgileri hatalı');
            }
        } catch (error) {
            console.error('❌ Login hatası:', error);
            this.showLoginError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            this.setLoginLoading(false);
        }
    }

    setLoginLoading(loading) {
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const btnText = submitBtn?.querySelector('.btn-text');
        const spinner = submitBtn?.querySelector('.loading-spinner');
        
        if (submitBtn) {
            submitBtn.disabled = loading;
        }
        
        if (btnText && spinner) {
            if (loading) {
                btnText.classList.add('hidden');
                spinner.classList.remove('hidden');
            } else {
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
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
        console.log('🔐 Login ekranı gösteriliyor');
        
        // ✅ DÜZELTME: Doğru element ID'leri
        const loginSection = document.getElementById('loginSection');
        const mainSection = document.getElementById('mainSection');
        
        if (loginSection) {
            loginSection.classList.remove('hidden');
            console.log('✅ Login section gösterildi');
        } else {
            console.error('❌ loginSection bulunamadı');
        }
        
        if (mainSection) {
            mainSection.classList.add('hidden');
            console.log('✅ Main section gizlendi');
        } else {
            console.error('❌ mainSection bulunamadı');
        }
    }

    showDashboard() {
        console.log('📊 Dashboard gösteriliyor');
        
        // ✅ DÜZELTME: Doğru element ID'leri
        const loginSection = document.getElementById('loginSection');
        const mainSection = document.getElementById('mainSection');
        
        if (loginSection) {
            loginSection.classList.add('hidden');
            console.log('✅ Login section gizlendi');
        } else {
            console.error('❌ loginSection bulunamadı');
        }
        
        if (mainSection) {
            mainSection.classList.remove('hidden');
            console.log('✅ Main section gösterildi');
        } else {
            console.error('❌ mainSection bulunamadı');
        }
        
        // Dashboard'ı varsayılan olarak göster
        setTimeout(() => {
            this.showSection('dashboard');
        }, 100);
    }

    showSection(sectionName) {
        console.log('📍 Section değiştiriliyor:', sectionName);
        
        try {
            // Tüm section'ları gizle
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Hedef section'ı göster
            const targetSection = document.getElementById(sectionName + 'Section');
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
                console.log('✅ Section gösterildi:', sectionName);
            } else {
                console.error('❌ Section bulunamadı:', sectionName + 'Section');
                return;
            }
            
            // Sidebar aktif durumunu güncelle
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('sidebar-link-active');
                if (link.dataset.section === sectionName) {
                    link.classList.add('sidebar-link-active');
                }
            });
            
            // Page title güncelle
            const titles = {
                'dashboard': 'Dashboard',
                'tours': 'Tur Yönetimi',
                'categories': 'Kategori Yönetimi',
                'messages': 'Mesaj Yönetimi',
                'settings': 'Site Ayarları'
            };
            
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = titles[sectionName] || 'Admin Panel';
            }
            
            // Section data yükle
            setTimeout(() => {
                this.loadSectionData(sectionName);
            }, 100);
            
            // Mobile menu kapat
            this.closeMobileMenu();
            
        } catch (error) {
            console.error('❌ Section değiştirme hatası:', error);
        }
    }

    loadSectionData(sectionName) {
        console.log('📊 Section data yükleniyor:', sectionName);
        
        try {
            switch(sectionName) {
                case 'dashboard':
                    if (typeof window.dashboardManager !== 'undefined' && dashboardManager.loadDashboardData) {
                        dashboardManager.loadDashboardData();
                    } else {
                        console.warn('⚠️ Dashboard manager bulunamadı');
                        setTimeout(() => {
                            if (typeof window.dashboardManager !== 'undefined') {
                                dashboardManager.loadDashboardData();
                            }
                        }, 1000);
                    }
                    break;
                    
                case 'tours':
                    if (typeof window.toursManager !== 'undefined' && toursManager.loadTours) {
                        toursManager.loadTours();
                    } else {
                        console.warn('⚠️ Tours manager bulunamadı');
                    }
                    break;
                    
                case 'categories':
                    if (typeof window.categoriesManager !== 'undefined' && categoriesManager.loadCategories) {
                        categoriesManager.loadCategories();
                    } else {
                        console.warn('⚠️ Categories manager bulunamadı');
                    }
                    break;
                    
                case 'messages':
                    if (typeof window.messagesManager !== 'undefined' && messagesManager.loadMessages) {
                        messagesManager.loadMessages();
                    } else {
                        console.warn('⚠️ Messages manager bulunamadı');
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Section data yükleme hatası:', error);
        }
    }

    // Mobile menu functions
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('translate-x-0');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
        }
        
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
        }
        
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    logout() {
        console.log('🚪 Çıkış yapılıyor...');
        
        if (typeof window.authManager !== 'undefined' && authManager.logout) {
            authManager.logout();
        } else {
            localStorage.removeItem('authToken');
            location.reload();
        }
    }

    // ✅ DEBUG: Element durumlarını kontrol et
    debugElements() {
        console.log('🔍 Element Debug:');
        console.log('loginSection:', document.getElementById('loginSection'));
        console.log('mainSection:', document.getElementById('mainSection'));
        console.log('dashboardSection:', document.getElementById('dashboardSection'));
        
        const loginSection = document.getElementById('loginSection');
        const mainSection = document.getElementById('mainSection');
        
        if (loginSection) {
            console.log('loginSection classes:', loginSection.classList.toString());
            console.log('loginSection display:', window.getComputedStyle(loginSection).display);
        }
        
        if (mainSection) {
            console.log('mainSection classes:', mainSection.classList.toString());
            console.log('mainSection display:', window.getComputedStyle(mainSection).display);
        }
    }
}

// DOM yüklendikten sonra başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM yüklendi, AdminApp başlatılıyor...');
    
    // Global admin app instance
    window.adminApp = new AdminApp();
    
    // Global functions
    window.showSection = (sectionName) => {
        if (window.adminApp) {
            window.adminApp.showSection(sectionName);
        }
    };
    
    window.logout = () => {
        if (window.adminApp) {
            window.adminApp.logout();
        }
    };

    window.toggleMobileMenu = () => {
        if (window.adminApp) {
            window.adminApp.toggleMobileMenu();
        }
    };

    window.closeMobileMenu = () => {
        if (window.adminApp) {
            window.adminApp.closeMobileMenu();
        }
    };

    // ✅ DEBUG function
    window.debugElements = () => {
        if (window.adminApp) {
            window.adminApp.debugElements();
        }
    };
});

console.log('📋 admin/js/app.js yüklendi');