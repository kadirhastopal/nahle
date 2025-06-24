// admin/js/messages.js
class MessagesManager {
    constructor() {
        this.messages = [];
        this.currentFilter = 'all';
    }

    async loadMessages() {
        try {
            console.log('📧 Mesajlar yükleniyor...');
            
            const response = await fetch('/api/admin/messages', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.messages = data.data.messages;
                this.renderMessages();
                this.updateMessageCount();
                console.log('✅ Mesajlar yüklendi:', this.messages.length);
            } else {
                console.error('❌ Mesajlar yüklenemedi');
                this.showError('Mesajlar yüklenirken hata oluştu');
            }
        } catch (error) {
            console.error('❌ Mesaj yükleme hatası:', error);
            this.showError('Bağlantı hatası');
        }
    }

    async updateMessageStatus(id, status) {
        try {
            const response = await fetch(`/api/admin/messages/${id}/status`, {
                method: 'PUT',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                await this.loadMessages(); // Listeyi yenile
                this.showSuccess('Mesaj durumu güncellendi');
            } else {
                this.showError('Durum güncellenirken hata oluştu');
            }
        } catch (error) {
            console.error('Status update error:', error);
            this.showError('Bağlantı hatası');
        }
    }

    renderMessages() {
        const container = document.getElementById('messagesContent');
        if (!container) return;

        if (!this.messages || this.messages.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-500">Henüz mesaj bulunmuyor</p>
                </div>
            `;
            return;
        }

        const filteredMessages = this.filterMessages();

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-800">İletişim Mesajları</h3>
                        <div class="flex gap-2">
                            ${this.renderFilterButtons()}
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gönderen
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tur Tipi
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mesaj
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${filteredMessages.map(message => this.renderMessageRow(message)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderFilterButtons() {
        const filters = [
            { key: 'all', label: 'Tümü', count: this.messages.length },
            { key: 'new', label: 'Yeni', count: this.messages.filter(m => m.status === 'new').length },
            { key: 'read', label: 'Okundu', count: this.messages.filter(m => m.status === 'read').length },
            { key: 'replied', label: 'Yanıtlandı', count: this.messages.filter(m => m.status === 'replied').length }
        ];

        return filters.map(filter => `
            <button 
                onclick="messagesManager.setFilter('${filter.key}')"
                class="px-3 py-1 text-sm rounded-lg transition-colors ${
                    this.currentFilter === filter.key
                        ? 'bg-admin-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }"
            >
                ${filter.label} ${filter.count > 0 ? `(${filter.count})` : ''}
            </button>
        `).join('');
    }

    renderMessageRow(message) {
        const statusColors = {
            'new': 'bg-red-100 text-red-800',
            'read': 'bg-blue-100 text-blue-800',
            'replied': 'bg-green-100 text-green-800',
            'archived': 'bg-gray-100 text-gray-800'
        };

        return `
            <tr class="${message.status === 'new' ? 'bg-red-50' : ''}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="font-medium text-gray-900">${message.name}</div>
                        <div class="text-sm text-gray-500">${message.email}</div>
                        ${message.phone ? `<div class="text-sm text-gray-500">${message.phone}</div>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        ${message.tour_type_label || 'Belirtilmemiş'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-xs truncate" title="${message.message}">
                        ${message.message}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${message.created_date}<br>
                    <span class="text-xs">${message.created_time}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColors[message.status]}">
                        ${message.status_label}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                        ${message.status === 'new' ? `
                            <button 
                                onclick="messagesManager.updateMessageStatus(${message.id}, 'read')"
                                class="text-blue-600 hover:text-blue-900"
                                title="Okundu İşaretle"
                            >
                                👁️
                            </button>
                        ` : ''}
                        ${message.status !== 'replied' ? `
                            <button 
                                onclick="messagesManager.updateMessageStatus(${message.id}, 'replied')"
                                class="text-green-600 hover:text-green-900"
                                title="Yanıtlandı İşaretle"
                            >
                                ✅
                            </button>
                        ` : ''}
                        <button 
                            onclick="messagesManager.updateMessageStatus(${message.id}, 'archived')"
                            class="text-gray-600 hover:text-gray-900"
                            title="Arşivle"
                        >
                            📁
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    filterMessages() {
        if (this.currentFilter === 'all') {
            return this.messages;
        }
        return this.messages.filter(message => message.status === this.currentFilter);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderMessages();
    }

    updateMessageCount() {
        const newCount = this.messages.filter(m => m.status === 'new').length;
        const badge = document.getElementById('newMessagesCount');
        if (badge) {
            if (newCount > 0) {
                badge.textContent = newCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    showSuccess(message) {
        this.showNotification('success', message);
    }

    showError(message) {
        this.showNotification('error', message);
    }

    showNotification(type, message) {
        // Basit notification sistemi
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Global messages manager instance
window.messagesManager = new MessagesManager();
