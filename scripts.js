// Simple landing page interactions
document.addEventListener('DOMContentLoaded', () => {
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

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Animate elements on scroll
    document.querySelectorAll('.feature-card, .step, .video-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    // Terminal Tab Switching
    document.querySelectorAll('.terminal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            document.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.terminal-body').forEach(b => b.classList.add('hidden'));
            
            // Add active class
            tab.classList.add('active');
            const targetBody = document.getElementById(`tab-${tab.dataset.tab}`);
            if (targetBody) targetBody.classList.remove('hidden');
        });
    });
});

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    // Fallback for svg button context
    const button = event.currentTarget;
    
    navigator.clipboard.writeText(text).then(() => {
        const svg = button.querySelector('svg');
        const originalStroke = svg.style.stroke;
        
        svg.style.stroke = '#27c93f';
        
        // Reset after 2 seconds
        setTimeout(() => {
            svg.style.stroke = originalStroke;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
