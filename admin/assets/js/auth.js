// Authentication Handler
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.init();
    }

    init() {
        // Check if already logged in
        if (this.token) {
            this.showDashboard();
        } else {
            this.showLogin();
        }

        // Setup login form
        this.setupLoginForm();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loginError = document.getElementById('loginError');

        // Show loading
        loginBtn.innerHTML = 'Giriş yapılıyor...';
        loginBtn.disabled = true;
        loginError.classList.add('hidden');

        try {
            const response = await adminAPI.login({ username, password });
            
            if (response.success) {
                this.token = response.data.token;
                adminAPI.setToken(this.token);
                this.showDashboard();
            }
        } catch (error) {
            loginError.textContent = error.message || 'Giriş başarısız';
            loginError.classList.remove('hidden');
        } finally {
            loginBtn.innerHTML = 'Giriş Yap';
            loginBtn.disabled = false;
        }
    }

    showLogin() {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        
        // Initialize dashboard components
        window.sidebarComponent?.init();
        window.topBarComponent?.init();
        window.appManager?.init();
    }

    logout() {
        this.token = null;
        adminAPI.removeToken();
        this.showLogin();
    }
}

// Initialize auth manager
window.authManager = new AuthManager();

// Global logout function
window.logout = () => {
    window.authManager.logout();
};
