// admin/js/auth.js - DÜZELTİLMİŞ
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        
        // Initialize validation if token exists
        if (this.token) {
            this.validateToken();
        }
    }

    async login(username, password) {
        try {
            console.log('🔐 Login attempt:', username);
            
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: username,     // ✅ DÜZELTME: 'login' field kullan
                    password: password
                })
            });

            const data = await response.json();
            console.log('📡 Login response:', data);

            if (data.success) {
                this.token = data.data.token;
                this.user = data.data.user;
                localStorage.setItem('authToken', this.token);
                
                console.log('✅ Login successful:', this.user.username);
                return true;
            } else {
                console.error('❌ Login failed:', data.message);
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showError(error.message || 'Giriş hatası');
            return false;
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
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getAuthHeaders() {
        if (!this.token) {
            console.warn('⚠️ No auth token available');
            return {
                'Content-Type': 'application/json'
            };
        }
        
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    showError(message) {
        console.error('🚨 Auth Error:', message);
        
        // Show error in UI if available
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    // Test admin user creation (for debugging)
    async testConnection() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            console.log('🏥 Health check:', data);
            return data.status === 'OK';
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return false;
        }
    }
}

// Global auth instance
if (typeof window !== 'undefined') {
    window.authManager = new AuthManager();
    console.log('✅ Auth Manager initialized');
}