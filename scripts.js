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
    const loginBtn = document.getElementById('login-btn');
    const authContainer = document.getElementById('auth-container');
    const postModal = document.getElementById('post-modal');
    const closeModal = document.getElementById('close-modal');
    const newPostForm = document.getElementById('new-post-form');

    let currentCategory = 'all';
    let searchQuery = '';
    let accessToken = sessionStorage.getItem('github_token');

    // GitHub OAuth Config
    const CLIENT_ID = 'Ov23liEwLDCRc8ujnQw6';

    // Initialize Forum
    const initForum = () => {
        checkAuthCallback();
        updateAuthUI();

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
                if (accessToken) {
                    if (postModal) postModal.style.display = 'block';
                } else {
                    window.open(`https://github.com/${REPO_OWNER}/${REPO_NAME}/discussions/new/choose`, '_blank');
                }
            };
        }
    };

    const updateAuthUI = async () => {
        if (!authContainer) return;
        if (accessToken) {
            try {
                const res = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const user = await res.json();
                
                authContainer.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${user.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--accent);">
                        <span style="font-size: 0.85rem; font-weight: 500;">${user.login}</span>
                        <button id="logout-btn" class="btn" style="padding: 0.4rem 1rem; font-size: 0.8rem; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Logout</button>
                    </div>
                `;
                document.getElementById('logout-btn').onclick = () => {
                    sessionStorage.removeItem('github_token');
                    window.location.reload();
                };
            } catch (err) {
                console.error('Failed to fetch user:', err);
                sessionStorage.removeItem('github_token');
                updateAuthUI();
            }
        } else {
            authContainer.innerHTML = `<button id="login-btn" class="btn" style="padding: 0.5rem 1.2rem; background: var(--glass); border: 1px solid var(--glass-border); color: white;">Login with GitHub</button>`;
            document.getElementById('login-btn').onclick = handleLogin;
        }
    };

    const showToast = (message, type = 'success') => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    };

    const checkAuthCallback = async () => {
        // Device Flow doesn't use callbacks, so this is now a no-op
        // We'll handle auth through the login button instead
    };

    const handleLogin = async () => {
        if (!CLIENT_ID) {
            showToast('OAuth Client ID not configured', 'error');
            return;
        }

        try {
            showToast('Initiating login...', 'info');
            
            // Step 1: Request device code
            const deviceResponse = await fetch('https://github.com/login/device/code', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    scope: 'public_repo'
                })
            });
            
            const deviceData = await deviceResponse.json();
            
            if (deviceData.device_code) {
                // Show user code and open GitHub
                const userCode = deviceData.user_code;
                const verificationUri = deviceData.verification_uri;
                
                showToast(`Code: ${userCode} - Opening GitHub...`, 'info');
                
                // Open GitHub in new tab
                window.open(verificationUri, '_blank');
                
                // Step 2: Poll for access token
                pollForToken(deviceData.device_code, deviceData.interval || 5);
            } else {
                throw new Error('Failed to get device code');
            }
        } catch (err) {
            console.error('Device flow failed:', err);
            showToast('Login failed: ' + err.message, 'error');
        }
    };

    const pollForToken = async (deviceCode, interval) => {
        const poll = async () => {
            try {
                const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: CLIENT_ID,
                        device_code: deviceCode,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                    })
                });
                
                const data = await tokenResponse.json();
                
                if (data.access_token) {
                    accessToken = data.access_token;
                    sessionStorage.setItem('github_token', accessToken);
                    await updateAuthUI();
                    showToast('Successfully logged in!');
                } else if (data.error === 'authorization_pending') {
                    // User hasn't authorized yet, keep polling
                    setTimeout(poll, interval * 1000);
                } else if (data.error === 'slow_down') {
                    // We're polling too fast
                    setTimeout(poll, (interval + 5) * 1000);
                } else {
                    throw new Error(data.error_description || data.error || 'Unknown error');
                }
            } catch (err) {
                console.error('Token polling failed:', err);
                showToast('Login failed: ' + err.message, 'error');
            }
        };
        
        poll();
    };

    // Modal Handlers
    if (closeModal) {
        closeModal.onclick = () => { if (postModal) postModal.style.display = 'none'; };
    }
    
    window.onclick = (event) => {
        if (event.target == postModal) {
            if (postModal) postModal.style.display = 'none';
        }
    };

    if (newPostForm) {
        newPostForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-post-btn');
            const title = document.getElementById('post-title').value;
            const body = document.getElementById('post-body').value;
            const categoryId = document.getElementById('post-category').value;

            if (!accessToken) return;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';

            try {
                const REPO_ID = 'R_kgDORC6DUA'; 

                const query = `
                    mutation($repoId: ID!, $title: String!, $body: String!, $categoryId: ID!) {
                        createDiscussion(input: {repositoryId: $repoId, title: $title, body: $body, categoryId: $categoryId}) {
                            discussion {
                                url
                            }
                        }
                    }
                `;

                const res = await fetch('https://api.github.com/graphql', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query,
                        variables: { repoId: REPO_ID, title, body, categoryId }
                    })
                });

                const result = await res.json();
                if (result.data) {
                    showToast('Post published successfully!');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    throw new Error(result.errors?.[0]?.message || 'Failed to publish');
                }
            } catch (err) {
                showToast('Error: ' + err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Discussion';
            }
        };
    }

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
