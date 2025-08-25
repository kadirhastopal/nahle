// Admin Panel JavaScript
let authToken = localStorage.getItem('adminToken');
let currentEditId = null;

// Check if logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a token
    if (authToken) {
        // Verify token is valid
        verifyToken();
    } else {
        showLogin();
    }
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Verify token is still valid
async function verifyToken() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showDashboard();
            loadDashboardData();
        } else {
            // Token invalid, show login
            localStorage.removeItem('adminToken');
            authToken = null;
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            localStorage.setItem('adminToken', authToken);
            errorDiv.classList.add('hidden');
            showDashboard();
            loadDashboardData();
        } else {
            errorDiv.textContent = data.message || 'Giriş başarısız';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı hatası';
        errorDiv.classList.remove('hidden');
    }
}

// Show login screen
function showLogin() {
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    showLogin();
}

// API Request helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            ...options.headers
        }
    });
    
    if (response.status === 401) {
        logout();
        return null;
    }
    
    return await response.json();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [tours, blogs, testimonials, contacts] = await Promise.all([
            apiRequest('/tours'),
            apiRequest('/blogs'),
            apiRequest('/testimonials'),
            apiRequest('/contact')
        ]);
        
        if (document.getElementById('totalTours')) {
            document.getElementById('totalTours').textContent = tours?.data?.length || 0;
        }
        if (document.getElementById('totalBlogs')) {
            document.getElementById('totalBlogs').textContent = blogs?.data?.length || 0;
        }
        if (document.getElementById('totalTestimonials')) {
            document.getElementById('totalTestimonials').textContent = testimonials?.data?.length || 0;
        }
        if (document.getElementById('totalContacts')) {
            document.getElementById('totalContacts').textContent = contacts?.data?.length || 0;
        }
    } catch (error) {
        console.error('Dashboard data loading error:', error);
    }
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show selected section
    const sectionEl = document.getElementById(section);
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
    }
    
    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('bg-gray-700', 'text-white');
        el.classList.add('text-gray-300');
    });
    
    if (event && event.target) {
        event.target.classList.add('bg-gray-700', 'text-white');
        event.target.classList.remove('text-gray-300');
    }
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'tours':
            loadTours();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Load tours
async function loadTours() {
    const tours = await apiRequest('/tours');
    const tbody = document.getElementById('toursTableBody');
    
    if (!tbody) return;
    
    if (tours?.data?.length > 0) {
        tbody.innerHTML = tours.data.map(tour => `
            <tr class="border-t">
                <td class="px-6 py-4">${tour.title}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${tour.type === 'hac' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${tour.type === 'hac' ? 'Hac' : 'Umre'}
                    </span>
                </td>
                <td class="px-6 py-4">${tour.currency === 'USD' ? '$' : '₺'}${tour.price}</td>
                <td class="px-6 py-4">${new Date(tour.departure_date).toLocaleDateString('tr-TR')}</td>
                <td class="px-6 py-4">
                    <button onclick="deleteTour(${tour.id})" class="text-red-600 hover:text-red-800">Sil</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz tur eklenmemiş</td></tr>';
    }
}

// Delete tour
async function deleteTour(id) {
    if (!confirm('Bu turu silmek istediğinize emin misiniz?')) return;
    
    try {
        const result = await apiRequest(`/tours/${id}`, { method: 'DELETE' });
        if (result?.success) {
            loadTours();
        }
    } catch (error) {
        alert('Silme işlemi başarısız');
    }
}

// Load settings
async function loadSettings() {
    const settings = await apiRequest('/settings');
    
    if (settings?.data) {
        const form = document.getElementById('settingsForm');
        if (form) {
            Object.keys(settings.data).forEach(key => {
                if (form[key]) {
                    form[key].value = settings.data[key];
                }
            });
        }
    }
}

// Open tour modal
function openTourModal() {
    alert('Tur ekleme özelliği yakında eklenecek');
}
