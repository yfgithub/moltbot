const REPO_OWNER = 'yfgithub';
const REPO_NAME = 'moltbot';

// Mock/Initial Data (to be replaced by API fetch in professional version)
const threadsData = [
    {
        id: '1',
        title: "Moltbot v2.0 Roadmap: What's coming next?",
        author: 'MoltMaster',
        time: '2 hours ago',
        tags: ['Official', 'Roadmap'],
        avatar: 'images/mascot.png',
        comments: 24,
        heat: 156,
        category: 'Announcements'
    },
    {
        id: '2',
        title: 'New Plugin: Multi-Agent coordination for marketing teams',
        author: 'PluginDev',
        time: '5 hours ago',
        tags: ['Showcase', 'Plugins'],
        avatar: null,
        comments: 12,
        heat: 89,
        category: 'Showcase'
    },
    {
        id: '3',
        title: 'Transitioning from Clawdbot to Moltbot: A quick migration guide',
        author: 'ClawdLegacy',
        time: '8 hours ago',
        tags: ['Guides'],
        avatar: null,
        comments: 45,
        heat: 312,
        category: 'Technical Support'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const threadList = document.getElementById('thread-list');
    const searchInput = document.getElementById('search-input');
    const categoryItems = document.querySelectorAll('.category-item');
    const newPostBtn = document.getElementById('new-post-btn');

    let currentCategory = 'all';
    let searchQuery = '';

    // Initialize Forum
    const initForum = () => {
        // Handle URL parameters for category filtering
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('cat');
        if (catParam) {
            currentCategory = catParam;
            // Update active state in sidebar
            categoryItems.forEach(item => {
                if (item.getAttribute('data-category') === catParam) {
                    categoryItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        }

        // Simulate API loading delay
        setTimeout(() => {
            renderThreads();
        }, 800);

        if (newPostBtn) {
            newPostBtn.onclick = () => {
                window.open(`https://github.com/${REPO_OWNER}/${REPO_NAME}/discussions/new/choose`, '_blank');
            };
        }
    };

    const renderThreads = () => {
        if (!threadList) return;

        const filteredThreads = threadsData.filter(thread => {
            const matchesCategory = currentCategory === 'all' || thread.category === currentCategory;
            const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                thread.author.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        threadList.innerHTML = '';

        if (filteredThreads.length === 0) {
            threadList.innerHTML = `<div class="empty-state">No discussions found matching your criteria.</div>`;
            return;
        }

        filteredThreads.forEach(thread => {
            const card = document.createElement('a');
            card.href = `thread.html?id=${thread.id}`;
            card.className = 'thread-card';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';

            const avatarHtml = thread.avatar 
                ? `<img src="${thread.avatar}" alt="User" style="width: 100%; height: 100%; object-fit: cover;">`
                : '';
            
            const avatarStyle = !thread.avatar ? 'style="background: #334155; border-color: #94a3b8;"' : '';

            card.innerHTML = `
                <div class="user-avatar" ${avatarStyle}>${avatarHtml}</div>
                <div class="thread-content">
                    <div class="thread-meta">
                        <span>u/${thread.author}</span> • <span>${thread.time}</span>
                    </div>
                    <div class="thread-title">${thread.title}</div>
                    <div class="thread-tags">
                        ${thread.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="thread-stats">
                    <span>💬 ${thread.comments}</span>
                    <span>🔥 ${thread.heat}</span>
                </div>
            `;
            
            // Add fade-in effect
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            card.style.transition = 'all 0.4s ease';
            
            threadList.appendChild(card);
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        });
    };

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderThreads();
        });
    }

    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            currentCategory = item.getAttribute('data-category') || 'all';
            renderThreads();
        });
    });

    initForum();

    // Intersection Observer for scroll animations (legacy from previous version)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.sidebar-menu, .forum-header').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});
