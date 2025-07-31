// TopBar Component
class TopBarComponent {
    constructor() {
        this.pageTitle = 'Dashboard';
        this.breadcrumbs = [];
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const topBarHTML = `
            <div class="bg-white shadow-sm border-b">
                <div class="flex justify-between items-center p-4">
                    <div class="flex items-center">
                        <!-- Mobile Menu Button -->
                        <button id="mobileMenuBtn" class="md:hidden mr-4 p-2 rounded-lg hover:bg-gray-100">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        
                        <div>
                            <h1 id="pageTitle" class="text-2xl font-semibold text-gray-800">${this.pageTitle}</h1>
                            ${this.breadcrumbs.length > 0 ? `
                                <nav class="text-sm text-gray-500 mt-1">
                                    ${this.breadcrumbs.map((crumb, index) => `
                                        <span>${crumb}</span>
                                        ${index < this.breadcrumbs.length - 1 ? '<span class="mx-2">/</span>' : ''}
                                    `).join('')}
                                </nav>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- Notifications -->
                        <div class="relative">
                            <button id="notificationBtn" class="p-2 rounded-lg hover:bg-gray-100 relative">
                                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                                <span id="notificationBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
                            </button>
                        </div>
                        
                        <!-- User Menu -->
                        <div class="relative">
                            <button id="userMenuBtn" class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                                <div class="w-8 h-8 bg-admin-primary rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">A</span>
                                </div>
                                <span class="text-gray-700 text-sm">Admin</span>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            
                            <!-- User Dropdown -->
                            <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profil Ayarları</a>
                                <div class="border-t my-1"></div>
                                <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('topBarComponent').innerHTML = topBarHTML;
    }

    bindEvents() {
        // Mobile menu toggle
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // User menu toggle
        document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserMenu();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.w-64');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    closeAllDropdowns() {
        document.getElementById('userDropdown')?.classList.add('hidden');
    }

    updateTitle(title, breadcrumbs = []) {
        this.pageTitle = title;
        this.breadcrumbs = breadcrumbs;
        
        const titleElement = document.getElementById('pageTitle');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    updateNotificationCount(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }
}

// Initialize topbar component
window.topBarComponent = new TopBarComponent();
