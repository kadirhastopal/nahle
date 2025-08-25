// Admin Panel Complete
let authToken = localStorage.getItem('adminToken');
let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (authToken) {
        verifyToken();
    } else {
        showLogin();
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Settings form handler
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
});

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
            localStorage.removeItem('adminToken');
            authToken = null;
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
}

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

function showLogin() {
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
}

function showDashboard() {
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
}

function logout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    showLogin();
}

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

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    const sectionEl = document.getElementById(section);
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
    }
    
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('bg-gray-700', 'text-white');
        el.classList.add('text-gray-300');
    });
    
    if (event && event.target) {
        event.target.classList.add('bg-gray-700', 'text-white');
        event.target.classList.remove('text-gray-300');
    }
    
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
                    <button onclick="editTour(${tour.id})" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                    <button onclick="deleteTour(${tour.id})" class="text-red-600 hover:text-red-800">Sil</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz tur eklenmemiş</td></tr>';
    }
}

async function deleteTour(id) {
    if (!confirm('Bu turu silmek istediğinize emin misiniz?')) return;
    
    try {
        const result = await apiRequest(`/tours/${id}`, { method: 'DELETE' });
        if (result?.success) {
            loadTours();
            alert('Tur başarıyla silindi!');
        }
    } catch (error) {
        alert('Silme işlemi başarısız');
    }
}

async function editTour(id) {
    currentEditId = id;
    const tour = await apiRequest(`/tours/${id}`);
    
    if (tour?.data) {
        // Create modal if not exists
        createTourModal();
        
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
        
        document.getElementById('modalTitle').textContent = 'Tur Düzenle';
        document.getElementById('tourModal').classList.remove('hidden');
    }
}

function openTourModal() {
    currentEditId = null;
    createTourModal();
    document.getElementById('tourForm').reset();
    document.getElementById('modalTitle').textContent = 'Yeni Tur Ekle';
    document.getElementById('tourModal').classList.remove('hidden');
}

function closeTourModal() {
    document.getElementById('tourModal').classList.add('hidden');
}

function createTourModal() {
    if (document.getElementById('tourModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'tourModal';
    modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 id="modalTitle" class="text-xl font-bold mb-4">Yeni Tur Ekle</h3>
            <form id="tourForm" onsubmit="saveTour(event)" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Başlık *</label>
                        <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Tip *</label>
                        <select name="type" required class="w-full px-3 py-2 border rounded-lg">
                            <option value="hac">Hac</option>
                            <option value="umre">Umre</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Fiyat *</label>
                        <input type="number" name="price" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Para Birimi</label>
                        <select name="currency" class="w-full px-3 py-2 border rounded-lg">
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Süre *</label>
                        <input type="text" name="duration" placeholder="14 Gün" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Kontenjan *</label>
                        <input type="number" name="quota" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Müsait Kontenjan *</label>
                        <input type="number" name="available_quota" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Hareket Tarihi *</label>
                        <input type="date" name="departure_date" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Dönüş Tarihi *</label>
                        <input type="date" name="return_date" required class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Açıklama *</label>
                    <textarea name="description" rows="3" required class="w-full px-3 py-2 border rounded-lg"></textarea>
                </div>
                
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="closeTourModal()" class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">İptal</button>
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Kaydet</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveTour(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const tourData = Object.fromEntries(formData);
    
    // Convert arrays
    tourData.features = [];
    tourData.includes = [];
    tourData.excludes = [];
    
    try {
        const endpoint = currentEditId ? `/tours/${currentEditId}` : '/tours';
        const method = currentEditId ? 'PUT' : 'POST';
        
        const result = await apiRequest(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData)
        });
        
        if (result?.success) {
            closeTourModal();
            loadTours();
            alert(currentEditId ? 'Tur başarıyla güncellendi!' : 'Tur başarıyla eklendi!');
        } else {
            alert('Hata: ' + (result?.message || 'İşlem başarısız'));
        }
    } catch (error) {
        alert('Bir hata oluştu');
        console.error(error);
    }
}

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

async function saveSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = Object.fromEntries(formData);
    
    try {
        const result = await apiRequest('/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        if (result?.success) {
            alert('Ayarlar başarıyla kaydedildi!');
            window.location.reload();
        } else {
            alert('Ayarlar kaydedilemedi');
        }
    } catch (error) {
        alert('Bir hata oluştu');
        console.error(error);
    }
}

// Logo Upload Handler
document.addEventListener('DOMContentLoaded', function() {
    const logoForm = document.getElementById('logoUploadForm');
    if (logoForm) {
        logoForm.addEventListener('submit', uploadLogo);
    }
});

async function uploadLogo(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('logoFile');
    if (!fileInput.files[0]) {
        alert('Lütfen bir logo dosyası seçin');
        return;
    }
    
    const formData = new FormData();
    formData.append('logo', fileInput.files[0]);
    
    try {
        const response = await fetch('/api/settings/logo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('currentLogo').src = result.data.logo;
            alert('Logo başarıyla güncellendi!');
            fileInput.value = '';
        } else {
            alert('Logo yüklenemedi: ' + (result.message || 'Bir hata oluştu'));
        }
    } catch (error) {
        alert('Logo yükleme hatası');
        console.error(error);
    }
}
