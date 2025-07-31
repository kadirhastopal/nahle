// Messages Page Module
class MessagesPage {
    constructor() {
        this.messages = [];
        this.currentMessage = null;
        this.showDetail = false;
    }

    async render() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading
        contentArea.innerHTML = this.getLoadingHTML();
        
        try {
            // Load data
            await this.loadMessages();
            
            // Render content
            if (this.showDetail) {
                contentArea.innerHTML = this.getMessageDetailHTML();
                this.bindDetailEvents();
            } else {
                contentArea.innerHTML = this.getMessagesListHTML();
                this.bindListEvents();
            }
            
        } catch (error) {
            console.error('Messages load error:', error);
            contentArea.innerHTML = this.getErrorHTML();
        }
    }

    async loadMessages() {
        try {
            const response = await adminAPI.getMessages();
            if (response.success) {
                this.messages = response.data.messages;
            }
        } catch (error) {
            console.error('Load messages error:', error);
            this.messages = [];
        }
    }

    getMessagesListHTML() {
        return `
            <div class="card">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-heading">Mesaj Yönetimi</h3>
                            <p class="text-secondary mt-1">Gelen iletişim mesajlarını buradan yönetebilirsiniz</p>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="window.messagesPage.markAllAsRead()" class="btn-secondary text-sm">
                                Tümünü Okundu İşaretle
                            </button>
                            <button onclick="window.messagesPage.render()" class="btn-primary text-sm">
                                🔄 Yenile
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="p-6">
                    ${this.messages.length === 0 ? this.getEmptyStateHTML() : this.getMessagesTableHTML()}
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                </div>
                <h3 class="empty-state-title">Henüz mesaj yok</h3>
                <p class="empty-state-text">İletişim formundan gelen mesajlar burada görünecek.</p>
            </div>
        `;
    }

    getMessagesTableHTML() {
        return `
            <div class="overflow-x-auto">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Gönderen</th>
                            <th>Konu</th>
                            <th>Mesaj</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.messages.map(message => `
                            <tr class="${message.status === 'new' ? 'bg-blue-50' : ''}">
                                <td>
                                    <div>
                                        <div class="font-semibold text-gray-900">${message.name}</div>
                                        <div class="text-sm text-gray-500">${message.email}</div>
                                        ${message.phone ? `<div class="text-sm text-gray-500">${message.phone}</div>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <div class="font-medium text-gray-900 max-w-xs truncate">
                                        ${message.subject || 'Konu belirtilmemiş'}
                                    </div>
                                </td>
                                <td>
                                    <div class="text-sm text-gray-600 max-w-md truncate">
                                        ${message.message}
                                    </div>
                                </td>
                                <td>
                                    <span class="status-${message.status === 'new' ? 'draft' : message.status === 'read' ? 'active' : 'inactive'}">
                                        ${this.getStatusText(message.status)}
                                    </span>
                                </td>
                                <td>
                                    <div class="text-sm text-gray-900">
                                        ${new Date(message.created_at).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        ${new Date(message.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td>
                                    <div class="flex space-x-2">
                                        <button onclick="window.messagesPage.viewMessage(${message.id})" class="action-btn action-btn-edit">
                                            Görüntüle
                                        </button>
                                        <button onclick="window.messagesPage.deleteMessage(${message.id})" class="action-btn action-btn-delete">
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getMessageDetailHTML() {
        const message = this.currentMessage;
        if (!message) return this.getErrorHTML();
        
        return `
            <div class="card">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-heading">Mesaj Detayı</h3>
                            <p class="text-secondary mt-1">Mesaj ID: #${message.id}</p>
                        </div>
                        <button onclick="window.messagesPage.showMessagesList()" class="btn-secondary">
                            ← Geri Dön
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="space-y-6">
                        <!-- Gönderen Bilgileri -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-800 mb-3">Gönderen Bilgileri</h4>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Ad Soyad</label>
                                    <p class="text-gray-900 font-medium">${message.name}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-600">E-posta</label>
                                    <p class="text-gray-900">
                                        <a href="mailto:${message.email}" class="text-admin-primary hover:underline">${message.email}</a>
                                    </p>
                                </div>
                                ${message.phone ? `
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Telefon</label>
                                    <p class="text-gray-900">
                                        <a href="tel:${message.phone}" class="text-admin-primary hover:underline">${message.phone}</a>
                                    </p>
                                </div>
                                ` : ''}
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Gönderim Tarihi</label>
                                    <p class="text-gray-900">${new Date(message.created_at).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Mesaj İçeriği -->
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-3">
                                ${message.subject ? `Konu: ${message.subject}` : 'Mesaj İçeriği'}
                            </h4>
                            <div class="bg-white border border-gray-200 rounded-lg p-4">
                                <p class="text-gray-900 whitespace-pre-wrap">${message.message}</p>
                            </div>
                        </div>
                        
                        <!-- Durum ve İşlemler -->
                        <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div class="flex items-center space-x-4">
                                <span class="text-sm text-gray-600">Durum:</span>
                                <span class="status-${message.status === 'new' ? 'draft' : message.status === 'read' ? 'active' : 'inactive'}">
                                    ${this.getStatusText(message.status)}
                                </span>
                            </div>
                            
                            <div class="flex space-x-3">
                                ${message.status === 'new' ? `
                                    <button onclick="window.messagesPage.markAsRead(${message.id})" class="btn-primary">
                                        Okundu İşaretle
                                    </button>
                                ` : ''}
                                <button onclick="window.messagesPage.replyToMessage('${message.email}', '${message.subject}')" class="btn-secondary">
                                    💬 Yanıtla
                                </button>
                                <button onclick="window.messagesPage.deleteMessage(${message.id})" class="btn-danger text-sm px-3 py-2">
                                    🗑️ Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindListEvents() {
        // Events are bound via onclick attributes
    }

    bindDetailEvents() {
        // Events are bound via onclick attributes
    }

    getStatusText(status) {
        const statusMap = {
            'new': 'Yeni',
            'read': 'Okundu',
            'replied': 'Yanıtlandı'
        };
        return statusMap[status] || status;
    }

    showMessagesList() {
        this.showDetail = false;
        this.currentMessage = null;
        this.render();
    }

    async viewMessage(messageId) {
        try {
            this.currentMessage = this.messages.find(m => m.id === messageId);
            if (!this.currentMessage) {
                showToast('Mesaj bulunamadı!', 'error');
                return;
            }
            
            // Mark as read if it's new
            if (this.currentMessage.status === 'new') {
                await this.markAsRead(messageId, false);
            }
            
            this.showDetail = true;
            this.render();
        } catch (error) {
            showToast('Mesaj görüntüleme hatası: ' + error.message, 'error');
        }
    }

    async markAsRead(messageId, showToastMsg = true) {
        try {
            const response = await adminAPI.updateMessageStatus(messageId, 'read');
            if (response.success) {
                // Update local data
                const message = this.messages.find(m => m.id === messageId);
                if (message) {
                    message.status = 'read';
                }
                if (this.currentMessage && this.currentMessage.id === messageId) {
                    this.currentMessage.status = 'read';
                }
                
                if (showToastMsg) {
                    showToast('Mesaj okundu olarak işaretlendi!', 'success');
                    this.render();
                }
            }
        } catch (error) {
            showToast('Durum güncelleme hatası: ' + error.message, 'error');
        }
    }

    async markAllAsRead() {
        if (confirm('Tüm mesajları okundu olarak işaretlemek istediğinizden emin misiniz?')) {
            try {
                const response = await adminAPI.markAllMessagesAsRead();
                if (response.success) {
                    showToast('Tüm mesajlar okundu olarak işaretlendi!', 'success');
                    this.render();
                }
            } catch (error) {
                showToast('Toplu güncelleme hatası: ' + error.message, 'error');
            }
        }
    }

    async deleteMessage(messageId) {
        if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
            try {
                const response = await adminAPI.deleteMessage(messageId);
                if (response.success) {
                    showToast('Mesaj silindi!', 'success');
                    if (this.currentMessage && this.currentMessage.id === messageId) {
                        this.showMessagesList();
                    } else {
                        this.render();
                    }
                }
            } catch (error) {
                showToast('Silme hatası: ' + error.message, 'error');
            }
        }
    }

    replyToMessage(email, subject) {
        const replySubject = subject ? `Re: ${subject}` : 'Re: İletişim Mesajınız';
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(replySubject)}`;
        window.open(mailtoLink, '_blank');
    }

    getLoadingHTML() {
        return `
            <div class="text-center py-12">
                <div class="loading-spinner mb-4"></div>
                <p class="text-secondary">Mesajlar yükleniyor...</p>
            </div>
        `;
    }

    getErrorHTML() {
        return `
            <div class="card p-8 text-center">
                <div class="text-red-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.828 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Veriler Yüklenemedi</h3>
                <p class="text-secondary mb-4">Mesaj verilerini yüklerken bir hata oluştu.</p>
                <button onclick="window.messagesPage.render()" class="btn-primary">Tekrar Dene</button>
            </div>
        `;
    }
}

// Initialize messages page
window.messagesPage = new MessagesPage();
