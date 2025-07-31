// Nahletur - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Nahletur website loaded');
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe all feature cards and tour cards
    document.querySelectorAll('.feature-card, .tour-card').forEach(card => {
        observer.observe(card);
    });
    
    // Load tours dynamically (will be implemented later)
    loadPopularTours();
});

async function loadPopularTours() {
    try {
        const response = await fetch('/api/tours?featured=true&limit=6');
        const data = await response.json();
        
        if (data.success && data.data.tours.length > 0) {
            renderTours(data.data.tours);
        }
    } catch (error) {
        console.log('Tours loaded with static content');
    }
}

function renderTours(tours) {
    const toursGrid = document.getElementById('toursGrid');
    if (!toursGrid) return;
    
    toursGrid.innerHTML = tours.map(tour => `
        <div class="tour-card fade-in-up">
            <div class="tour-image">
                ${tour.featured_image ? 
                    `<img src="${tour.featured_image}" alt="${tour.title}" style="width:100%;height:100%;object-fit:cover;">` :
                    '🕌'
                }
            </div>
            <div class="tour-content">
                <h3 class="tour-title">${tour.title}</h3>
                <p class="tour-description">${tour.description || 'Detaylı tur bilgisi için tıklayın.'}</p>
                <div class="tour-footer">
                    <span class="tour-price">$${Number(tour.price).toLocaleString()}</span>
                    <a href="/tur/${tour.slug}" class="btn btn-primary">İncele</a>
                </div>
            </div>
        </div>
    `).join('');
}
