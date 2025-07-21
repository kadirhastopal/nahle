// admin/js/auth.js - DÜZELTİLMİŞ VERSİYON
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        
        // Initialize validation if token exists
        if (this.token) {
            this.validateToken();
        }
    }

    async login(credentials) {
        try {
            console.log('🔐 Login attempt:', credentials.login || credentials.username);
            
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: credentials.login || credentials.username,
                    password: credentials.password
                })
            });

            const data = await response.json();
            console.log('📡 Login response:', data);

            if (data.success) {
                this.token = data.data.token;
                this.user = data.data.user;
                localStorage.setItem('authToken', this.token);
                
                console.log('✅ Login successful:', this.user.username);
                return { success: true, user: this.user };
            } else {
                console.error('❌ Login failed:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, message: error.message || 'Giriş hatası' };
        }
    }

    async validateToken() {
        if (!this.token) return false;

        try {
            console.log('🔍 Validating token...');
            
            const response = await fetch('/api/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.data.user;
                console.log('✅ Token valid:', this.user.username);
                return true;
            } else {
                console.log('❌ Token invalid');
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('❌ Token validation error:', error);
            this.logout();
            return false;
        }
    }

    logout() {
        console.log('🚪 Logging out...');
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        
        // Sayfayı yenile
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    getUser() {
        return this.user;
    }

    showError(message) {
        console.error('Auth Error:', message);
        
        // Login error div'ini bul ve göster
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        
        // Toast notification sistemi varsa kullan
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', message);
        }
    }
}

// ✅ DÜZELTME: Global instance oluştur
if (typeof window !== 'undefined') {
    window.authManager = new AuthManager();
    console.log('✅ AuthManager global olarak hazır!');
}