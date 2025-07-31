// Sidebar Component
class SidebarComponent {
    constructor() {
        this.currentSection = 'dashboard';
        this.menuItems = [
            {
                id: 'dashboard',
                name: 'Dashboard',
                icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                       </svg>`
            },
            {
                id: 'tours',
                name: 'Tur Yönetimi',
                icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                       </svg>`
            },
            {
                id: 'categories',
                name: 'Kategoriler',
                icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm-6 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clip-rule="evenodd"/>
                       </svg>`
            },
            {
                id: 'settings',
                name: 'Site Ayarları',
                icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                       </svg>`
            }
        ];
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const sidebarHTML = `
            <div class="w-64 bg-white h-screen shadow-lg fixed left-0 top-0">
                <div class="p-6 border-b">
                    <h2 class="text-xl font-bold text-admin-primary">Nahletur Admin</h2>
                </div>
                
                <nav class="p-4 space-y-2">
                    ${this.menuItems.map(item => `
                        <a href="#" class="sidebar-link ${item.id === this.currentSection ? 'sidebar-link-active' : ''}" 
                           data-section="${item.id}">
                            ${item.icon}
                            <span>${item.name}</span>
                        </a>
                    `).join('')}
                </nav>
                
                <div class="absolute bottom-4 left-4 right-4">
                    <button onclick="logout()" class="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        Çıkış Yap
                    </button>
                </div>
            </div>
        `;

        document.getElementById('sidebarComponent').innerHTML = sidebarHTML;
    }

    bindEvents() {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    navigateToSection(section) {
        // Update active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('sidebar-link-active');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('sidebar-link-active');
        
        this.currentSection = section;
        
        // Notify app manager
        if (window.appManager) {
            window.appManager.showPage(section);
        }
    }
}

// Initialize sidebar component
window.sidebarComponent = new SidebarComponent();
