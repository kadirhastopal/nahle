// Logo Upload Handler
async function uploadLogo(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('logoFile');
    if (!fileInput.files[0]) {
        alert('Lütfen bir logo seçin');
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
            
            // Update logo in header
            const headerLogo = document.querySelector('.header-logo');
            if (headerLogo) {
                headerLogo.src = result.data.logo;
            }
        } else {
            alert('Logo yükleme başarısız: ' + result.message);
        }
    } catch (error) {
        alert('Logo yükleme hatası');
        console.error(error);
    }
}

// Settings Form Submit
async function saveSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Ayarlar başarıyla kaydedildi!');
            // Reload page to apply settings
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            alert('Ayarlar kaydedilemedi');
        }
    } catch (error) {
        alert('Bir hata oluştu');
        console.error(error);
    }
}

// Contact View Modal
function viewContact(id) {
    apiRequest(`/contact/${id}/read`, { method: 'PUT' });
    
    apiRequest(`/contact`).then(contacts => {
        const contact = contacts.data.find(c => c.id === id);
        if (contact) {
            document.getElementById('contactDetail').innerHTML = `
                <div class="space-y-3">
                    <div>
                        <label class="font-semibold">Ad Soyad:</label>
                        <p>${contact.name}</p>
                    </div>
                    <div>
                        <label class="font-semibold">Email:</label>
                        <p>${contact.email}</p>
                    </div>
                    <div>
                        <label class="font-semibold">Telefon:</label>
                        <p>${contact.phone || '-'}</p>
                    </div>
                    <div>
                        <label class="font-semibold">Konu:</label>
                        <p>${contact.subject}</p>
                    </div>
                    <div>
                        <label class="font-semibold">Mesaj:</label>
                        <p class="whitespace-pre-wrap bg-gray-50 p-3 rounded">${contact.message}</p>
                    </div>
                    <div>
                        <label class="font-semibold">Tarih:</label>
                        <p>${new Date(contact.createdAt).toLocaleString('tr-TR')}</p>
                    </div>
                </div>
            `;
            document.getElementById('contactModal').classList.remove('hidden');
        }
    });
}

function closeContactModal() {
    document.getElementById('contactModal').classList.add('hidden');
}

// Testimonials Management
async function loadTestimonials() {
    const testimonials = await apiRequest('/testimonials');
    const tbody = document.getElementById('testimonialsTableBody');
    
    if (testimonials?.data?.length > 0) {
        tbody.innerHTML = testimonials.data.map(testimonial => `
            <tr class="border-t">
                <td class="px-6 py-4">${testimonial.name}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${testimonial.tour_type === 'hac' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${testimonial.tour_type === 'hac' ? 'Hac' : 'Umre'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex text-yellow-400">
                        ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <button onclick="editTestimonial(${testimonial.id})" class="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                    <button onclick="deleteTestimonial(${testimonial.id})" class="text-red-600 hover:text-red-800">Sil</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-500">Henüz yorum eklenmemiş</td></tr>';
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    
    try {
        const result = await apiRequest(`/testimonials/${id}`, { method: 'DELETE' });
        if (result?.success) {
            loadTestimonials();
            alert('Yorum silindi!');
        }
    } catch (error) {
        alert('Silme işlemi başarısız');
    }
}
