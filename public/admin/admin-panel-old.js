// Admin Panel Full Functionality
let authToken = localStorage.getItem('adminToken');
let currentEditId = null;

// API Helper with auth
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
        return;
    }
    
    return await response.json();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        showLogin();
    } else {
        showDashboard();
        loadDashboardData();
    }
});

// Auth Functions
function showLogin() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
}

function logout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    showLogin();
}

// Login Handler
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
            loadDashboardData();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı hatası';
        errorDiv.classList.remove('hidden');
    }
});

// Dashboard Data
async function loadDashboardData() {
    try {
        const [tours, blogs, testimonials, contacts] = await Promise.all([
            apiRequest('/tours'),
            apiRequest('/blogs'),
            apiRequest('/testimonials'),
            apiRequest('/contact')
        ]);
        
        document.getElementById('totalTours').textContent = tours?.data?.length || 0;
        document.getElementById('totalBlogs').textContent = blogs?.data?.length || 0;
        document.getElementById('totalTestimonials').textContent = testimonials?.data?.length || 0;
        document.getElementById('totalContacts').textContent = contacts?.data?.length || 0;
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
    }
}

// Section Management
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show selected
    document.getElementById(section).classList.remove('hidden');
    
    // Update menu
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('bg-gray-700', 'text-white');
        el.classList.add('text-gray-300');
    });
    
    event.target.classList.add('bg-gray-700', 'text-white');
    
    // Load section data
    switch(section) {
        case 'tours': loadTours(); break;
        case 'blogs': loadBlogs(); break;
        case 'testimonials': loadTestimonials(); break;
        case 'contacts': loadContacts(); break;
        case 'settings': loadSettings(); break;
    }
}

// TOURS MANAGEMENT
async function loadTours() {
    const tours = await apiRequest('/tours');
    const tbody = document.getElementById('toursTableBody');
    
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
                    <button onclick="editTour(${tour.id})" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                    <button onclick="deleteTour(${tour.id})" class="text-red-600 hover:text-red-800">Sil</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz tur eklenmemiş</td></tr>';
    }
}

function openTourModal() {
    currentEditId = null;
    document.getElementById('tourModal').classList.remove('hidden');
    document.getElementById('tourForm').reset();
    document.getElementById('modalTitle').textContent = 'Yeni Tur Ekle';
}

function closeTourModal() {
    document.getElementById('tourModal').classList.add('hidden');
    currentEditId = null;
}

async function saveTour(event) {
    event.preventDefault();
    
    const formData = new FormData(document.getElementById('tourForm'));
    
    // Convert form data to JSON
    const tourData = {
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        currency: formData.get('currency'),
        duration: formData.get('duration'),
        departure_date: formData.get('departure_date'),
        return_date: formData.get('return_date'),
        quota: parseInt(formData.get('quota')),
        available_quota: parseInt(formData.get('available_quota')),
        is_featured: formData.get('is_featured') === 'on',
        is_active: formData.get('is_active') === 'on',
        features: formData.get('features').split(',').map(f => f.trim()).filter(f => f),
        includes: formData.get('includes').split(',').map(i => i.trim()).filter(i => i),
        excludes: formData.get('excludes').split(',').map(e => e.trim()).filter(e => e)
    };
    
    try {
        const endpoint = currentEditId ? `/tours/${currentEditId}` : '/tours';
        const method = currentEditId ? 'PUT' : 'POST';
        
        const result = await apiRequest(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData)
        });
        
        if (result.success) {
            closeTourModal();
            loadTours();
            alert(currentEditId ? 'Tur güncellendi!' : 'Tur eklendi!');
        } else {
            alert('Hata: ' + (result.message || 'İşlem başarısız'));
        }
    } catch (error) {
        alert('Bir hata oluştu');
        console.error(error);
    }
}

async function editTour(id) {
    currentEditId = id;
    const tour = await apiRequest(`/tours/${id}`);
    
    if (tour?.data) {
        const form = document.getElementById('tourForm');
        form.title.value = tour.data.title;
        form.type.value = tour.data.type;
        form.description.value = tour.data.description;
        form.price.value = tour.data.price;
        form.currency.value = tour.data.currency;
        form.duration.value = tour.data.duration;
        form.departure_date.value = tour.data.departure_date.split('T')[0];
        form.return_date.value = tour.data.return_date.split('T')[0];
        form.quota.value = tour.data.quota;
        form.available_quota.value = tour.data.available_quota;
        form.features.value = tour.data.features?.join(', ') || '';
        form.includes.value = tour.data.includes?.join(', ') || '';
        form.excludes.value = tour.data.excludes?.join(', ') || '';
        form.is_featured.checked = tour.data.is_featured;
        form.is_active.checked = tour.data.is_active;
        
        document.getElementById('modalTitle').textContent = 'Tur Düzenle';
        document.getElementById('tourModal').classList.remove('hidden');
    }
}

async function deleteTour(id) {
    if (!confirm('Bu turu silmek istediğinize emin misiniz?')) return;
    
    try {
        const result = await apiRequest(`/tours/${id}`, { method: 'DELETE' });
        if (result?.success) {
            loadTours();
            alert('Tur silindi!');
        }
    } catch (error) {
        alert('Silme işlemi başarısız');
    }
}

// Placeholder functions for other sections
async function loadBlogs() {
    console.log('Blogs loading...');
}

async function loadTestimonials() {
    console.log('Testimonials loading...');
}

async function loadContacts() {
    const contacts = await apiRequest('/contact');
    console.log('Contacts:', contacts);
}

async function loadSettings() {
    const settings = await apiRequest('/settings');
    console.log('Settings:', settings);
}

// Image Upload Functions
function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'w-24 h-24 object-cover rounded border';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// Updated saveTour with image upload
async function saveTourWithImages(event) {
    event.preventDefault();
    
    const formData = new FormData(document.getElementById('tourForm'));
    const fileInput = document.getElementById('tourImages');
    
    // Add images to FormData
    if (fileInput.files.length > 0) {
        for (let file of fileInput.files) {
            formData.append('images', file);
        }
    }
    
    try {
        const endpoint = currentEditId ? `/tours/${currentEditId}` : '/tours';
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(`/api${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeTourModal();
            loadTours();
            alert(currentEditId ? 'Tur güncellendi!' : 'Tur eklendi!');
        } else {
            alert('Hata: ' + (result.message || 'İşlem başarısız'));
        }
    } catch (error) {
        alert('Bir hata oluştu');
        console.error(error);
    }
}

// Blog Management Functions
async function loadBlogs() {
    const blogs = await apiRequest('/blogs');
    const tbody = document.getElementById('blogsTableBody');
    
    if (blogs?.data?.length > 0) {
        tbody.innerHTML = blogs.data.map(blog => `
            <tr class="border-t">
                <td class="px-6 py-4">${blog.title}</td>
                <td class="px-6 py-4">${blog.category || '-'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${blog.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${blog.is_published ? 'Yayında' : 'Taslak'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="editBlog(${blog.id})" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                    <button onclick="deleteBlog(${blog.id})" class="text-red-600 hover:text-red-800">Sil</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-500">Henüz blog yazısı eklenmemiş</td></tr>';
    }
}

// Settings Management
async function loadSettings() {
    const settings = await apiRequest('/settings');
    
    if (settings?.data) {
        const form = document.getElementById('settingsForm');
        Object.keys(settings.data).forEach(key => {
            if (form[key]) {
                form[key].value = settings.data[key];
            }
        });
    }
}

document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const settings = Object.fromEntries(formData);
    
    try {
        const result = await apiRequest('/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        if (result.success) {
            alert('Ayarlar kaydedildi!');
        }
    } catch (error) {
        alert('Ayarlar kaydedilemedi');
    }
});

// Contact Messages
async function loadContacts() {
    const contacts = await apiRequest('/contact');
    const tbody = document.getElementById('contactsTableBody');
    
    if (contacts?.data?.length > 0) {
        tbody.innerHTML = contacts.data.map(contact => `
            <tr class="border-t ${!contact.is_read ? 'bg-blue-50' : ''}">
                <td class="px-6 py-4">${contact.name}</td>
                <td class="px-6 py-4">${contact.email}</td>
                <td class="px-6 py-4">${contact.subject}</td>
                <td class="px-6 py-4">${new Date(contact.createdAt).toLocaleDateString('tr-TR')}</td>
                <td class="px-6 py-4">
                    <button onclick="viewContact(${contact.id})" class="text-blue-600 hover:text-blue-800 mr-3">Görüntüle</button>
                    <button onclick="deleteContact(${contact.id})" class="text-red-600 hover:text-red-800">Sil</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz mesaj yok</td></tr>';
    }
}

async function deleteContact(id) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    
    try {
        const result = await apiRequest(`/contact/${id}`, { method: 'DELETE' });
        if (result?.success) {
            loadContacts();
        }
    } catch (error) {
        alert('Silme işlemi başarısız');
    }
}
