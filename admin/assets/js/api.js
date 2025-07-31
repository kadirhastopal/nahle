// API Helper Functions
class AdminAPI {
    constructor() {
        this.baseURL = '/api/admin';
        this.token = localStorage.getItem('adminToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('adminToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('adminToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(credentials) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    // Dashboard endpoints
    async getDashboardStats() {
        return this.request('/dashboard');
    }

    // Tours endpoints
    async getTours() {
        return this.request('/tours');
    }

    async createTour(tourData) {
        return this.request('/tours', {
            method: 'POST',
            body: JSON.stringify(tourData)
        });
    }

    async updateTour(id, tourData) {
        return this.request(`/tours/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tourData)
        });
    }

    async deleteTour(id) {
        return this.request(`/tours/${id}`, {
            method: 'DELETE'
        });
    }

    // Categories endpoints
    async getCategories() {
        return this.request('/categories');
    }

    async createCategory(categoryData) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    async updateCategory(id, categoryData) {
        return this.request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    }

    async deleteCategory(id) {
        return this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }

    // Messages endpoints
    async getMessages() {
        return this.request('/messages');
    }

    async updateMessageStatus(id, status) {
        return this.request(`/messages/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async markAllMessagesAsRead() {
        return this.request('/messages/mark-all-read', {
            method: 'PUT'
        });
    }

    async deleteMessage(id) {
        return this.request(`/messages/${id}`, {
            method: 'DELETE'
        });
    }

    // Settings endpoints
    async getSettings() {
        return this.request('/settings');
    }

    async saveSettings(settingsData) {
        return this.request('/settings', {
            method: 'POST',
            body: JSON.stringify(settingsData)
        });
    }

    async testSMTP() {
        return this.request('/test-smtp', {
            method: 'POST'
        });
    }

    // Upload endpoints
    async uploadTourImages(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        
        return this.request('/upload/tour-images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    async uploadHotelImages(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        
        return this.request('/upload/hotel-images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    async uploadLogo(file) {
        const formData = new FormData();
        formData.append('logo', file);
        
        return this.request('/upload/logo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    async uploadFavicon(file) {
        const formData = new FormData();
        formData.append('favicon', file);
        
        return this.request('/upload/favicon', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    async deleteImage(folder, filename) {
        return this.request(`/upload/${folder}/${filename}`, {
            method: 'DELETE'
        });
    }
}

// Global API instance
window.adminAPI = new AdminAPI();
console.log('✅ AdminAPI initialized successfully');
