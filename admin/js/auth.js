// admin/js/auth.js - BASİT VE ÇALIŞAN VERSİYON
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        console.log('🔐 AuthManager oluşturuldu, token:', this.token ? 'var' : 'yok');
    }

    async login(credentials) {
        try {
            console.log('🔑 Login attempt for:', credentials.login);
            
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: credentials.login,
                    password: credentials.password
                })
            });

            console.log('📡 Login response status:', response.status);
            
            const data = await response.json();
            console.log('📡 Login response data:', data);

            if (data.success && data.data) {
                this.token = data.data.token;
                this.user = data.data.user;
                localStorage.setItem('authToken', this.token);
                
                console.log('✅ Login successful for:', this.user.username);
                return { success: true, user: this.user };
            } else {
                console.error('❌ Login failed:', data.message);
                return { success: false, message: data.message || 'Giriş başarısız' };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, message: 'Bağlantı hatası: ' + error.message };
        }
    }

    async validateToken() {
        if (!this.token) {
            console.log('❌ Token yok');
            return false;
        }

        try {
            console.log('🔍 Token validating...');
            
            const response = await fetch('/api/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Profile response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('📡 Profile response data:', data);
                
                if (data.success && data.data) {
                    this.user = data.data.user;
                    console.log('✅ Token valid for:', this.user.username);
                    return true;
                }
            }
            
            console.log('❌ Token invalid');
            this.clearAuth();
            return false;
        } catch (error) {
            console.error('❌ Token validation error:', error);
            this.clearAuth();
            return false;
        }
    }

    clearAuth() {
        console.log('🧹 Auth temizleniyor...');
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
    }

    logout() {
        console.log('🚪 Logout...');
        this.clearAuth();
        
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

    getToken() {
        return this.token;
    }
}

// Global instance oluştur
if (typeof window !== 'undefined') {
    window.authManager = new AuthManager();
    console.log('✅ AuthManager global olarak hazır!');
}