let authToken = localStorage.getItem('adminToken');
let currentSection = 'dashboard';

// Check auth on load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Login Form Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
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
            showDashboard();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı hatası';
        errorDiv.classList.remove('hidden');
    }
});

// Show/Hide Functions
function showLogin() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadDashboardData();
    showSection('dashboard');
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    showLogin();
}

// Section Management
function showSection(section) {
    currentSection = section;
    
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
    
    event.target.classList.add('bg-gray-700', 'text-white');
    event.target.classList.remove('text-gray-300');
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'tours':
            loadTours();
            break;
        case 'blogs':
            loadBlogs();
            break;
        case 'testimonials':
            loadTestimonials();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// API Helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    if (response.status === 401) {
        logout();
        return;
    }
    
    return await response.json();
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Load tours count
        const tours = await apiRequest('/tours');
        if (tours?.data) {
            document.getElementById('totalTours').textContent = tours.data.length;
        }
        
        // Load blogs count
        const blogs = await apiRequest('/blogs');
        if (blogs?.data) {
            document.getElementById('totalBlogs').textContent = blogs.data.length;
        }
        
        // Load testimonials count
        const testimonials = await apiRequest('/testimonials');
        if (testimonials?.data) {
            document.getElementById('totalTestimonials').textContent = testimonials.data.length;
        }
        
        // Load contacts count
        const contacts = await apiRequest('/contact');
        if (contacts?.data) {
            document.getElementById('totalContacts').textContent = contacts.data.length;
        }
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
    }
}

// Load Tours
async function loadTours() {
    try {
        const tours = await apiRequest('/tours');
        const tbody = document.getElementById('toursTableBody');
        
        if (tours?.data && tours.data.length > 0) {
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
                        <button onclick="editTour(${tour.id})" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                        <button onclick="deleteTour(${tour.id})" class="text-red-600 hover:text-red-800">Sil</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz tur eklenmemiş</td></tr>';
        }
    } catch (error) {
        console.error('Turlar yükleme hatası:', error);
    }
}

// Tour Modal
function openTourModal() {
    alert('Tur ekleme modalı açılacak');
    // Modal implementation will be added
}

// Delete Tour
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

// Placeholder functions
function loadBlogs() { console.log('Blogs loading...'); }
function loadTestimonials() { console.log('Testimonials loading...'); }
function loadContacts() { console.log('Contacts loading...'); }
function loadSettings() { console.log('Settings loading...'); }
function editTour(id) { console.log('Edit tour:', id); }
