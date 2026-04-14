let token = localStorage.getItem('token');
let currentUser = null;

const API_BASE = '/api';

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('d-none'));
    document.getElementById(sectionId).classList.remove('d-none');
    
    if (['lost', 'found'].includes(sectionId)) {
        document.querySelector(`#${sectionId} form`).reset();
        document.getElementById(`${sectionId}Msg`).innerHTML = '';
        document.getElementById(`${sectionId}Matches`).innerHTML = '';
    }
    
    setActiveLink(`nav-${sectionId === 'dashboard' ? 'home' : sectionId}`);
    
    if (sectionId === 'dashboard') loadDashboard();
    if (sectionId === 'items') loadItems();
}

function updateAuthUI() {
    const authNav = document.getElementById('authNav');
    const userDropdown = document.getElementById('userDropdown');
    
    if (token && currentUser) {
        authNav.style.display = 'none';
        userDropdown.style.display = 'block';
        document.getElementById('userNameNav').textContent = currentUser.name;
    } else {
        authNav.style.display = 'block';
        userDropdown.style.display = 'none';
    }
}

async function apiRequest(url, options = {}) {
    const config = {
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(API_BASE + url, config);
    
    let data;
    try {
        data = await res.json();
    } catch (jsonErr) {
        // Non-JSON response (HTML error page, empty body, etc.)
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    
    if (res.status === 401) {
        localStorage.removeItem('token');
        token = null;
        currentUser = null;
        updateAuthUI();
        alert('Session expired. Please login again.');
        showSection('login');
        return null;
    }
    
    if (!res.ok) throw new Error(data.msg || data.error || `Server error: ${res.status}`);
    return data;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msgDiv = document.getElementById('loginMsg');
    
    if (!email || !password) {
        return msgDiv.innerHTML = '<div class="alert alert-warning">Email and password required</div>';
    }
    
    msgDiv.innerHTML = '<div class="alert alert-info">Logging in...</div>';
    
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        updateAuthUI();
        msgDiv.innerHTML = '<div class="alert alert-success">Login successful!</div>';
        setTimeout(() => showSection('dashboard'), 1500);
    } catch (err) {
        msgDiv.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msgDiv = document.getElementById('regMsg');
    
    if (!name || !email || !password) {
        return msgDiv.innerHTML = '<div class="alert alert-warning">All fields required</div>';
    }
    
    msgDiv.innerHTML = '<div class="alert alert-info">Registering...</div>';
    
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        updateAuthUI();
        msgDiv.innerHTML = '<div class="alert alert-success">Registration successful! Logged in.</div>';
        setTimeout(() => showSection('dashboard'), 1500);
    } catch (err) {
        msgDiv.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
});

document.getElementById('lostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) return showSection('login');
    
    const formData = new FormData(e.target);
    const msgDiv = document.getElementById('lostMsg');
    const matchesDiv = document.getElementById('lostMatches');
    msgDiv.innerHTML = '<div class="alert alert-info">Reporting lost item...</div>';
    
    try {
        const data = await fetch(API_BASE + '/lost', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        }).then(r => r.json());
        
        msgDiv.innerHTML = '<div class="alert alert-success">Lost item reported successfully!</div>';
        
        if (data.matches && data.matches.length > 0) {
            matchesDiv.innerHTML = `
                <div class="alert alert-warning">
                    <h5><i class="bi bi-lightning-charge"></i> Potential Matches Found!</h5>
                    ${data.matches.map(match => `
                        <div class="match-item card mb-2 p-3">
                            <h6>${match.title}</h6>
                            <p><strong>Location:</strong> ${match.location}</p>
                            <p><strong>Found by:</strong> ${match.user.name} (${match.user.email})</p>
                            <img src="${match.image}" class="img-thumbnail" style="max-width:200px;">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        e.target.reset();
        setTimeout(() => loadDashboard(), 2000);
    } catch (err) {
        msgDiv.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
});

document.getElementById('foundForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) return showSection('login');
    
    const formData = new FormData(e.target);
    const msgDiv = document.getElementById('foundMsg');
    msgDiv.innerHTML = '<div class="alert alert-info">Reporting found item...</div>';
    
    try {
        await fetch(API_BASE + '/found', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        }).then(r => r.json());
        
        msgDiv.innerHTML = '<div class="alert alert-success">Found item reported successfully!</div>';
        e.target.reset();
        setTimeout(() => loadDashboard(), 1500);
    } catch (err) {
        msgDiv.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
});

async function loadDashboard() {
    try {
        const data = await apiRequest('/dashboard');
        document.getElementById('totalLost').textContent = data.totalLost;
        document.getElementById('totalFound').textContent = data.totalFound;
        document.getElementById('totalMatches').textContent = data.totalMatches;
        
        // Recent matches (last 5 lost items with matches + IMAGES)
        const recentLost = await apiRequest('/lost?limit=5');
        const matchesHtml = recentLost.map(item => item.matches && item.matches.length > 0 ? `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card item-card h-100">
                    ${item.image ? `<img src="${item.image}" class="card-img-top img-placeholder" alt="${item.title}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOGY4IiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; this.classList.add('img-placeholder'); this.onerror=null;">` : ''}
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${item.title}</h6>
                        <p class="small text-muted flex-grow-1">${item.matches.length} matches found</p>
                        <span class="badge bg-warning mt-auto">⚡ Active Matches</span>
                    </div>
                </div>
            </div>
        ` : '').filter(Boolean).join('');
        document.getElementById('recentMatches').innerHTML = matchesHtml || '<p class="text-muted">No recent matches <i class="bi bi-inbox"></i></p>'; 
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

async function loadItems() {
    const type = document.getElementById('itemFilter').value;
    try {
        const items = await apiRequest(`/lost${type ? '?type=' + type : ''}`) || [];
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = items.map(item => `
            <div class="col-md-6 col-lg-4">
                <div class="card item-card">
${item.image ? `<img src="${item.image}" class="card-img-top img-placeholder" alt="${item.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOGY4IiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; this.classList.add('img-placeholder'); this.onerror=null;">` : ''}

                    <div class="card-body">
                        <h6 class="card-title">${item.title}</h6>
                        <p class="card-text small">${item.description.substring(0, 100)}...</p>
                        <p class="small text-muted">
                            <i class="bi bi-geo-alt"></i> ${item.location} | 
                            <i class="bi bi-calendar"></i> ${new Date(item.date).toLocaleDateString()}
                        </p>
                        ${item.matches?.length > 0 ? `<span class="badge bg-warning">${item.matches.length} matches</span>` : ''}
                        <p class="small">By: ${item.user?.name}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Items load error:', err);
    }
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    updateAuthUI();
    showSection('dashboard');
}

// Active nav link helper
function setActiveLink(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(activeId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.modern-navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Init
updateAuthUI();
setActiveLink('nav-home');
showSection('dashboard');

