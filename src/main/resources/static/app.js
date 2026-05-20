// USTC LearnX SPA Engine

// Application Global State
let state = {
    user: null, // Logged in user details {id, username, fullName, role}
    activeView: 'dashboard',
    cts: [],
    timerIntervals: [] // Store countdown intervals to clear them on view changes
};

// Toast Notifications Helper
function showToast(message, type = 'success') {
    const host = document.getElementById('notification-host');
    const toast = document.createElement('div');
    toast.className = `toast glass-panel`;
    toast.style.borderLeft = `4px solid ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--danger)'}`;
    
    let icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fa-solid ${icon}" style="color: ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--danger)'}; font-size: 1.2rem;"></i>
            <div>
                <p style="font-size: 0.9rem; font-weight: 500;">${message}</p>
            </div>
        </div>
    `;
    host.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Clear all active intervals (countdowns)
function clearAllIntervals() {
    state.timerIntervals.forEach(id => clearInterval(id));
    state.timerIntervals = [];
}

// Format LocalDateTime to readable format
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Fetch helper with auto-redirect to login on 401
async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (response.status === 401 && !url.includes('/api/auth/current-user') && !url.includes('/api/auth/login')) {
            state.user = null;
            renderAuthPage();
            return null;
        }
        return response;
    } catch (e) {
        showToast("Network connection error", "error");
        throw e;
    }
}

// --- App Entrypoint ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup global events
    document.getElementById('btn-logout').addEventListener('click', logout);
    
    // 1.5 Setup mobile menu
    const sidebar = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // 2. Check login status
    await checkAuth();
});

// Check if user has active Batch
async function checkAuth() {
    try {
        const res = await apiFetch('/api/auth/current-user');
        if (res && res.ok) {
            state.user = await res.json();
            setupSidebar();
            switchView('dashboard');
        } else {
            renderLandingPage();
        }
    } catch (e) {
        renderLandingPage();
    }
}

function renderLandingPage() {
    clearAllIntervals();
    const host = document.getElementById('main-view-host');
    host.innerHTML = `
        <div class="landing-container">
            <div class="split-screen-container">
                <!-- Left Side: Welcome Content & Actions -->
                <div class="split-side-content" style="background: rgba(255, 255, 255, 0.95); justify-content: center;">
                    <div style="display: flex; flex-direction: column; gap: 1.8rem; text-align: left; max-width: 420px; margin: 0 auto; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 0.8rem;">
                            <img src="learnx_logo.png?v=3" alt="LearnX Logo" style="width: 50px; height: 50px; object-fit: contain;">
                            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; font-weight: 700; color: #11212D; margin: 0;">LearnX</h2>
                        </div>
                        <div>
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 2.4rem; font-weight: 800; color: #06141B; line-height: 1.15; margin-bottom: 0.8rem; letter-spacing: -0.5px;">Welcome to LearnX</h1>
                            <p style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 600; color: #253745; margin-bottom: 0.8rem; line-height: 1.35;">
                                Your all in one academic workspace.
                            </p>
                            <p style="font-family: 'Outfit', sans-serif; font-size: 0.95rem; color: #4A5C6A; line-height: 1.5; margin: 0;">
                                Access your class schedules, track grades and performance, share study resources, and take online exams—all designed to help you stay organized and boost your learning.
                            </p>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem; width: 100%; margin-top: 0.5rem;">
                            <button class="btn btn-login-goto" style="background: #11212D; color: #fff; border: none; border-radius: 30px; padding: 0.9rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s;">Sign In to Account</button>
                            <button class="btn btn-secondary btn-signup-goto" style="background: transparent; color: #11212D; border: 1.5px solid #11212D; border-radius: 30px; padding: 0.85rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s;">Create New Account</button>
                        </div>
                    </div>
                </div>
                <!-- Right Side: Fluid Liquid Glass Animation -->
                <div class="split-side-animation">
                    <div class="fluid-blob fluid-blob-1"></div>
                    <div class="fluid-blob fluid-blob-2"></div>
                    <div class="fluid-blob fluid-blob-3"></div>
                    
                    <!-- Glass panel card floating in front of fluid background -->
                    <div class="glass-panel" style="position: relative; z-index: 10; max-width: 320px; padding: 2rem; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); text-align: center; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);">
                        <img src="learnx_logo.png?v=3" alt="LearnX Logo" style="width: 70px; height: 70px; object-fit: contain; background: #fff; border-radius: 50%; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); margin-bottom: 1.2rem;">
                        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; color: #fff; margin-bottom: 0.5rem; font-weight: 600;">LearnX</h3>
                        <p style="font-family: 'Outfit', sans-serif; font-size: 0.88rem; color: rgba(255, 255, 255, 0.7); line-height: 1.45; margin: 0;">
                            Empower your learning journey with seamless study organization, intelligent scheduling, and performance analytics.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    host.querySelector('.btn-login-goto').addEventListener('click', renderAuthPage);
    host.querySelector('.btn-signup-goto').addEventListener('click', () => {
        renderAuthPage();
        showSignupForm();
    });
}

// Setup Header Navigation according to role
function setupSidebar() {
    const header = document.getElementById('sidebar');
    header.style.display = 'flex';
    document.getElementById('mobile-header').style.display = 'flex';
    
    document.getElementById('user-role-badge').innerText = state.user.role;
    document.getElementById('user-display-name').innerText = state.user.fullName;
    document.getElementById('user-display-username').innerText = `@${state.user.username}`;
    
    // Sync sidebar avatar with profile picture
    const sidebarPicEl = document.querySelector('.profile-pic');
    if (state.user.profilePicUrl) {
        sidebarPicEl.innerHTML = `<img src="${state.user.profilePicUrl}" alt="Avatar" style="width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover; border: 2px solid var(--glass-border); box-shadow: 0 4px 10px rgba(0,0,0,0.1);">`;
    } else {
        sidebarPicEl.innerHTML = `<i class="fa-solid fa-user-circle"></i>`;
    }
    
    const navContainer = document.getElementById('nav-links-container');
    navContainer.innerHTML = '';
    
    if (state.user.role === 'STUDENT') {
        addNavItem('Home', 'dashboard', 'fa-house');
        addNavItem('Schedule', 'routine-mgr', 'fa-calendar-days');
        addNavItem('Announcements', 'announcements', 'fa-bullhorn');
        addNavItem('Resources', 'notes', 'fa-folder-open');
        addNavItem('Online Exams', 'exams', 'fa-file-lines');
        addNavItem('Performance', 'performance-view', 'fa-chart-line');
        addNavItem('Profile', 'profile', 'fa-user-gear');
    } else if (state.user.role === 'CR') {
        addNavItem('Home', 'dashboard', 'fa-house');
        addNavItem('Schedule & CT Slots', 'routine-mgr', 'fa-calendar-days');
        addNavItem('Announcements', 'announcements', 'fa-bullhorn');
        addNavItem('Management', 'admin-approvals', 'fa-user-check');
        addNavItem('Resources', 'notes', 'fa-folder-open');
        addNavItem('Online Exams', 'exams', 'fa-file-lines');
        addNavItem('Performance', 'performance-view', 'fa-chart-line');
        addNavItem('Profile', 'profile', 'fa-user-gear');
    } else if (state.user.role === 'TEACHER') {
        addNavItem('Home', 'dashboard', 'fa-house');
        addNavItem('Schedule & CT Management', 'routine-mgr', 'fa-calendar-days');
        addNavItem('Announcements', 'announcements', 'fa-bullhorn');
        addNavItem('Online Exams', 'exam-creator', 'fa-square-poll-horizontal');
        addNavItem('Performance (Grading)', 'grades-mgr', 'fa-pen-ruler');
        addNavItem('Resources', 'notes', 'fa-folder-open');
        addNavItem('Profile', 'profile', 'fa-user-gear');
    } else if (state.user.role === 'ADMIN') {
        addNavItem('Home', 'dashboard', 'fa-house');
        addNavItem('User Management', 'admin-approvals', 'fa-users-gear');
        addNavItem('System Logs', 'audit-history', 'fa-clock-rotate-left');
        addNavItem('Master Schedule', 'routine-mgr', 'fa-calendar-days');
        addNavItem('Global Announcements', 'announcements', 'fa-bullhorn');
        addNavItem('System Config (Batches)', 'system-config', 'fa-cogs');
        addNavItem('Profile', 'profile', 'fa-user-gear');
    }
}

function addNavItem(label, viewId, iconClass) {
    const navContainer = document.getElementById('nav-links-container');
    const li = document.createElement('li');
    li.innerHTML = `
        <button class="nav-btn ${state.activeView === viewId ? 'active' : ''}" data-view="${viewId}">
            <i class="fa-solid ${iconClass}"></i> ${label}
        </button>
    `;
    li.querySelector('button').addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        switchView(targetView);
    });
    navContainer.appendChild(li);
}

// Router view-switcher
function switchView(viewName) {
    state.activeView = viewName;
    clearAllIntervals();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const host = document.getElementById('main-view-host');
    host.innerHTML = '';

    switch(viewName) {
        case 'dashboard':
            renderDashboard(host);
            break;
        case 'profile':
            renderProfilePage(host);
            break;
        case 'notes':
            renderNotesVault(host);
            break;
        case 'exams':
            renderExams(host);
            break;
        case 'routine-mgr':
            renderRoutineManager(host);
            break;
        case 'notes-approval':
            renderNotesApproval(host);
            break;
        case 'audit-history':
            renderAuditHistory(host);
            break;
        case 'slot-detector':
            renderSlotDetector(host);
            break;
        case 'exam-creator':
            renderExamCreator(host);
            break;
        case 'grades-mgr':
            renderGradesManager(host);
            break;
        case 'admin-approvals':
            renderAdminApprovals(host);
            break;
        case 'announcements':
            renderAnnouncements(host);
            break;
        case 'performance-view':
            renderPerformanceView(host);
            break;
        case 'system-config':
            renderSystemConfig(host);
            break;
    }
}

async function renderProfilePage(host) {
    // Fetch profile metadata first
    let departments = [], semesters = [], Batchs = [], designations = [];
    try {
        const res = await fetch('/api/metadata');
        if (res.ok) {
            const options = await res.json();
            departments = options.filter(o => o.type === 'DEPARTMENT').map(o => o.value);
            semesters = options.filter(o => o.type === 'SEMESTER').map(o => o.value);
            Batchs = options.filter(o => o.type === 'BATCH').map(o => o.value);
            designations = options.filter(o => o.type === 'DESIGNATION').map(o => o.value);
        }
    } catch (e) { console.error(e); }

    const avatarHtml = state.user.profilePicUrl
        ? `<img src="${state.user.profilePicUrl}" alt="Avatar" class="profile-avatar-image">`
        : `<div class="profile-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`;

    // Build conditional fields HTML
    let condFieldsHtml = '';
    if (state.user.role === 'STUDENT' || state.user.role === 'CR') {
        condFieldsHtml = `
            <div class="form-group" style="margin-top: 0.8rem;">
                <label for="profile-semester">Semester <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                <select id="profile-semester" required>${semesters.map(s => `<option value="${s}" ${state.user.semester === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-top: 0.8rem;">
                <label for="profile-Batch">Batch <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                <select id="profile-Batch" required>${Batchs.map(s => `<option value="${s}" ${state.user.batch === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-top: 0.8rem;">
                <label for="profile-section">Section</label>
                <input type="text" id="profile-section" class="form-input" value="${state.user.section || ''}">
            </div>
        `;
    } else if (state.user.role === 'TEACHER') {
        condFieldsHtml = `
            <div class="form-group" style="margin-top: 0.8rem;">
                <label for="profile-designation">Designation <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                <select id="profile-designation" required>${designations.map(d => `<option value="${d}" ${state.user.designation === d ? 'selected' : ''}>${d}</option>`).join('')}</select>
            </div>
        `;
    }

    host.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>My Profile</h2>
                <p>Manage your account details and profile information.</p>
            </div>
        </div>
        <div class="profile-showcase-container">
            <!-- Left: Premium Profile Card -->
            <div class="glass-panel premium-profile-card">
                <div class="profile-avatar-wrapper" id="avatar-wrapper">
                    ${avatarHtml}
                    <div class="avatar-edit-overlay">
                        <i class="fa-solid fa-camera"></i>
                    </div>
                    <input type="file" id="avatar-file-input" accept="image/*">
                </div>
                <div>
                    <div class="profile-card-name">${state.user.fullName}</div>
                    <div class="profile-card-role">@${state.user.username} · ${state.user.role}</div>
                </div>
                <div class="profile-pills-row">
                    ${state.user.department ? `<span class="routine-day-badge">${state.user.department}</span>` : ''}
                    ${state.user.semester ? `<span class="routine-day-badge">${state.user.semester}</span>` : ''}
                    ${state.user.batch ? `<span class="routine-day-badge">Batch ${state.user.batch}</span>` : ''}
                    ${state.user.designation ? `<span class="routine-day-badge">${state.user.designation}</span>` : ''}
                </div>
                <div class="profile-kpi-stats-grid">
                    <div class="profile-kpi-box">
                        <span class="lbl">ID No.</span>
                        <span class="val">${state.user.idNo || 'N/A'}</span>
                    </div>
                    <div class="profile-kpi-box">
                        <span class="lbl">Section</span>
                        <span class="val">${state.user.section || 'N/A'}</span>
                    </div>
                    <div class="profile-kpi-box">
                        <span class="lbl">Role</span>
                        <span class="val">${state.user.role}</span>
                    </div>
                </div>
            </div>

            <!-- Right: Edit Form -->
            <div class="glass-panel section-card" style="height: fit-content;">
                <h3>Edit Profile Information</h3>
                <form id="form-profile-update">
                    <div class="form-group">
                        <label>Username (Read-only)</label>
                        <input type="text" class="form-input" disabled value="${state.user.username}">
                    </div>
                    <div class="form-group" style="margin-top: 0.8rem;">
                        <label>Role (Read-only)</label>
                        <input type="text" class="form-input" disabled value="${state.user.role}">
                    </div>
                    <div class="form-group" style="margin-top: 0.8rem;">
                        <label for="profile-fullname">Full Name <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                        <input type="text" id="profile-fullname" class="form-input" required value="${state.user.fullName}">
                    </div>
                    <div class="form-group" style="margin-top: 0.8rem;">
                        <label for="profile-email">Email Address <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                        <input type="email" id="profile-email" class="form-input" required value="${state.user.email}">
                    </div>
                    <div class="form-group" style="margin-top: 0.8rem;">
                        <label for="profile-idno">ID Number <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                        <input type="text" id="profile-idno" class="form-input" required value="${state.user.idNo || ''}">
                    </div>
                    <div class="form-group" style="margin-top: 0.8rem;">
                        <label for="profile-department">Department <span class="sensitive-field-indicator"><i class="fa-solid fa-shield-halved"></i> Sensitive</span></label>
                        <select id="profile-department" required>${departments.map(d => `<option value="${d}" ${state.user.department === d ? 'selected' : ''}>${d}</option>`).join('')}</select>
                    </div>
                    
                    <div id="profile-conditional-fields">${condFieldsHtml}</div>
                    
                    <button type="submit" class="btn" style="margin-top: 1.5rem;">
                        <i class="fa-solid fa-floppy-disk"></i> Save Profile Changes
                    </button>
                </form>
            </div>
        </div>
    `;

    // Avatar upload handler
    const avatarWrapper = document.getElementById('avatar-wrapper');
    const avatarInput = document.getElementById('avatar-file-input');
    avatarWrapper.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be under 5MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            // Update UI instantly
            avatarWrapper.querySelector('.profile-avatar-image, .profile-avatar-placeholder').outerHTML = `<img src="${base64}" alt="Avatar" class="profile-avatar-image">`;
            // Sync sidebar
            const sidebarPicEl = document.querySelector('.profile-pic');
            sidebarPicEl.innerHTML = `<img src="${base64}" alt="Avatar" style="width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover; border: 2px solid var(--glass-border); box-shadow: 0 4px 10px rgba(0,0,0,0.1);">`;
            // Save to backend
            try {
                const res = await apiFetch('/api/profile/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profilePicUrl: base64, fullName: state.user.fullName, email: state.user.email, idNo: state.user.idNo, department: state.user.department })
                });
                if (res && res.ok) {
                    state.user.profilePicUrl = base64;
                    showToast('Profile picture updated!');
                } else {
                    showToast('Failed to save picture', 'error');
                }
            } catch (err) {
                showToast('Error saving picture', 'error');
            }
        };
        reader.readAsDataURL(file);
    });

    // Profile form submit handler
    document.getElementById('form-profile-update').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('profile-fullname').value;
        const email = document.getElementById('profile-email').value;
        const idNo = document.getElementById('profile-idno').value;
        const department = document.getElementById('profile-department').value;
        
        const semester = document.getElementById('profile-semester') ? document.getElementById('profile-semester').value : null;
        const batch = document.getElementById('profile-Batch') ? document.getElementById('profile-Batch').value : null;
        const section = document.getElementById('profile-section') ? document.getElementById('profile-section').value : null;
        const designation = document.getElementById('profile-designation') ? document.getElementById('profile-designation').value : null;

        const body = { fullName, email, idNo, department, semester, batch, section, designation };

        try {
            const response = await apiFetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (response && response.ok) {
                const data = await response.json();
                showToast(data.message, "warning");
            } else if (response) {
                const err = await response.json();
                showToast(err.error || "Failed to update profile", "error");
            }
        } catch (err) {
            showToast("Error updating profile", "error");
        }
    });
}

// --- LOGOUT ---
async function logout() {
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            state.user = null;
            document.getElementById('sidebar').style.display = 'none';
            renderLandingPage();
            showToast("Logged out successfully");
        }
    } catch (e) {
        showToast("Error logging out", "error");
    }
}

// --- AUTH PAGE RENDER ---
function renderAuthPage() {
    clearAllIntervals();
    const host = document.getElementById('main-view-host');
    host.innerHTML = `
        <div class="landing-container">
            <div class="split-screen-container">
                <!-- Left Side: Injected Forms (Login/Signup/Recovery) -->
                <div class="split-side-content" id="auth-card-content" style="background: rgba(255, 255, 255, 0.95); overflow-y: auto;">
                    <!-- Injected forms -->
                </div>
                <!-- Right Side: Fluid Liquid Glass Animation -->
                <div class="split-side-animation">
                    <div class="fluid-blob fluid-blob-1"></div>
                    <div class="fluid-blob fluid-blob-2"></div>
                    <div class="fluid-blob fluid-blob-3"></div>
                    
                    <div class="glass-panel" style="position: relative; z-index: 10; max-width: 320px; padding: 2rem; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); text-align: center; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);">
                        <img src="learnx_logo.png?v=3" alt="LearnX Logo" style="width: 70px; height: 70px; object-fit: contain; background: #fff; border-radius: 50%; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); margin-bottom: 1.2rem;">
                        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; color: #fff; margin-bottom: 0.5rem; font-weight: 600;">Secure Access</h3>
                        <p style="font-family: 'Outfit', sans-serif; font-size: 0.88rem; color: rgba(255, 255, 255, 0.7); line-height: 1.45; margin: 0;">
                            Your data is safe under LearnX authentication protocols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    showLoginForm();
}

function showLoginForm() {
    const card = document.getElementById('auth-card-content');
    card.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.2rem; max-width: 400px; margin: auto auto; width: 100%; padding: 1.5rem 0;">
            <div style="display: flex; justify-content: flex-start; align-items: center;">
                <img src="learnx_logo.png?v=3" alt="LearnX Logo" style="width: 44px; height: 44px; object-fit: contain;">
            </div>
            
            <div class="auth-header" style="text-align: left;">
                <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 2.1rem; font-weight: 800; color: #06141B; margin: 0 0 0.4rem 0; letter-spacing: -0.5px;">Welcome back!</h2>
                <p style="color: #4A5C6A; font-size: 0.95rem; margin: 0; line-height: 1.35;">Academic ease, skip the complex, and master your path with LearnX!</p>
            </div>
            
            <form id="form-login" style="display: flex; flex-direction: column; gap: 0.9rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="login-username" style="font-weight: 600; color: #253745; font-size: 0.9rem; margin-bottom: 0.3rem; display: block;">Username</label>
                    <input type="text" id="login-username" class="form-input" required placeholder="e.g. cr1, teacher1, student1" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.65rem 1rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="login-password" style="font-weight: 600; color: #253745; font-size: 0.9rem; margin-bottom: 0.3rem; display: block;">Password</label>
                    <input type="password" id="login-password" class="form-input" required placeholder="••••••••" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.65rem 1rem;">
                    <a id="link-goto-recovery" style="color: #253745; text-decoration: none; cursor: pointer; font-size: 0.82rem; display: block; margin-top: 0.4rem; text-align: right; font-weight: 500;">Forgot Password?</a>
                </div>
                <button type="submit" class="btn" style="margin-top: 0.4rem; background: #11212D; color: #fff; border: none; border-radius: 30px; padding: 0.75rem; font-weight: 600; cursor: pointer; font-size: 0.95rem; width: 100%;">
                    Sign In
                </button>
            </form>
            
            <p style="text-align: center; color: #4A5C6A; font-size: 0.88rem; margin: 0.5rem 0 0 0;">
                Don't have an account? <a id="link-goto-signup" style="color: #11212D; text-decoration: none; font-weight: 700; cursor: pointer;">Sign Up</a>
            </p>
        </div>
    `;

    document.getElementById('form-login').addEventListener('submit', handleLogin);
    document.getElementById('link-goto-signup').addEventListener('click', showSignupForm);
    document.getElementById('link-goto-recovery').addEventListener('click', showRecoveryForm);
}

function showRecoveryForm() {
    const card = document.getElementById('auth-card-content');
    card.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.2rem; max-width: 400px; margin: 0 auto; width: 100%;">
            <div style="display: flex; justify-content: flex-start; align-items: center;">
                <img src="learnx_logo.png?v=3" alt="LearnX Logo" style="width: 44px; height: 44px; object-fit: contain;">
            </div>
            
            <div class="auth-header" style="text-align: left;">
                <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 2.1rem; font-weight: 800; color: #06141B; margin: 0 0 0.4rem 0; letter-spacing: -0.5px;">Reset Password</h2>
                <p style="color: #4A5C6A; font-size: 0.95rem; margin: 0; line-height: 1.35;">Enter your email or username to request a recovery code</p>
            </div>
            
            <form id="form-recovery-request" style="display: flex; flex-direction: column; gap: 0.9rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="recovery-email" style="font-weight: 600; color: #253745; font-size: 0.9rem; margin-bottom: 0.3rem; display: block;">Email or Username</label>
                    <input type="text" id="recovery-email" class="form-input" required placeholder="e.g. student1@ustc.edu or student1" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.65rem 1rem;">
                </div>
                <button type="submit" class="btn" style="margin-top: 0.4rem; background: #11212D; color: #fff; border: none; border-radius: 30px; padding: 0.75rem; font-weight: 600; cursor: pointer; font-size: 0.95rem; width: 100%;">
                    Request Verification Code
                </button>
            </form>
            
            <div id="recovery-reset-container" style="display: none; margin-top: 1.2rem; border-top: 1px solid var(--glass-border); padding-top: 1.2rem;">
                <form id="form-recovery-reset" style="display: flex; flex-direction: column; gap: 0.9rem;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label for="recovery-code" style="font-weight: 600; color: #253745; font-size: 0.9rem; margin-bottom: 0.3rem; display: block;">Verification Code</label>
                        <input type="text" id="recovery-code" class="form-input" required placeholder="e.g. 123456" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.65rem 1rem;">
                        <p id="recovery-mock-info" style="font-size: 0.8rem; color: var(--success); margin: 0.3rem 0 0 0; font-weight: 500;"></p>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label for="recovery-new-password" style="font-weight: 600; color: #253745; font-size: 0.9rem; margin-bottom: 0.3rem; display: block;">New Password</label>
                        <input type="password" id="recovery-new-password" class="form-input" required placeholder="••••••••" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.65rem 1rem;">
                    </div>
                    <button type="submit" class="btn" style="margin-top: 0.4rem; background: #11212D; color: #fff; border: none; border-radius: 30px; padding: 0.75rem; font-weight: 600; cursor: pointer; font-size: 0.95rem; width: 100%;">
                        Reset Password
                    </button>
                </form>
            </div>
            
            <p style="text-align: center; color: #4A5C6A; font-size: 0.88rem; margin: 0.5rem 0 0 0;">
                Remembered your password? <a id="link-goto-login" style="color: #11212D; text-decoration: none; font-weight: 700; cursor: pointer;">Sign In</a>
            </p>
        </div>
    `;

    document.getElementById('link-goto-login').addEventListener('click', showLoginForm);

    document.getElementById('form-recovery-request').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('recovery-email').value;

        try {
            const res = await fetch('/api/auth/recover/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                const data = await res.json();
                showToast(data.message);
                
                const infoP = document.getElementById('recovery-mock-info');
                infoP.innerHTML = `<i class="fa-solid fa-circle-info"></i> [TEST CODE] Received code: <strong>${data.code}</strong>`;
                
                document.getElementById('recovery-code').value = data.code;
                state.recoveryEmail = data.email;
                document.getElementById('recovery-reset-container').style.display = 'block';
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to initiate recovery request", "error");
            }
        } catch (err) {
            showToast("Error connecting to server", "error");
        }
    });

    document.getElementById('form-recovery-reset').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('recovery-code').value;
        const password = document.getElementById('recovery-new-password').value;
        const email = state.recoveryEmail;

        try {
            const res = await fetch('/api/auth/recover/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password })
            });

            if (res.ok) {
                showToast("Password has been reset successfully!");
                showLoginForm();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to reset password", "error");
            }
        } catch (err) {
            showToast("Error resetting password", "error");
        }
    });
}

async function showSignupForm() {
    const card = document.getElementById('auth-card-content');
    card.innerHTML = `<div style="text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue);"></i><p style="margin-top:1rem; color: var(--text-secondary);">Loading form configuration...</p></div>`;

    let departments = [];
    let semesters = [];
    let Batchs = [];
    let designations = [];

    try {
        const res = await fetch('/api/metadata');
        if (res.ok) {
            const options = await res.json();
            departments = options.filter(o => o.type === 'DEPARTMENT').map(o => o.value);
            semesters = options.filter(o => o.type === 'SEMESTER').map(o => o.value);
            Batchs = options.filter(o => o.type === 'BATCH').map(o => o.value);
            designations = options.filter(o => o.type === 'DESIGNATION').map(o => o.value);
        }
    } catch (e) {
        console.error("Failed to load metadata", e);
    }

    card.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px; margin: auto auto; width: 100%; padding: 1.5rem 0;">
            <div style="display: flex; justify-content: flex-start; align-items: center;">
                <img src="learnx_logo.png?v=3" alt="LearnX Logo" style="width: 44px; height: 44px; object-fit: contain;">
            </div>
            
            <div class="auth-header" style="text-align: left;">
                <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 2.1rem; font-weight: 800; color: #06141B; margin: 0 0 0.2rem 0; letter-spacing: -0.5px;">Create Account</h2>
                <p style="color: #4A5C6A; font-size: 0.92rem; margin: 0; line-height: 1.35;">Register a student, class representative, or teacher account</p>
            </div>
            
            <form id="form-signup" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-username" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Username</label>
                    <input type="text" id="signup-username" class="form-input" required placeholder="e.g. nafis10" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-password" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Password</label>
                    <input type="password" id="signup-password" class="form-input" required placeholder="••••••••" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-fullname" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Full Name</label>
                    <input type="text" id="signup-fullname" class="form-input" required placeholder="e.g. Nafis Chowdhury" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-idno" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">ID Number</label>
                    <input type="text" id="signup-idno" class="form-input" required placeholder="e.g. 2020-1-60-001" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-department" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Department</label>
                    <select id="signup-department" required style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem; background: #fff; width: 100%;">
                        <option value="">Select Department</option>
                        ${departments.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-role" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Account Role</label>
                    <select id="signup-role" required style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem; background: #fff; width: 100%;">
                        <option value="STUDENT">Student (Requires approval)</option>
                        <option value="CR">Class Representative (CR) (Requires approval)</option>
                        <option value="TEACHER">Teacher (Requires Admin approval)</option>
                    </select>
                </div>

                <!-- Conditional Fields -->
                <div id="signup-conditional-fields" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <!-- Dynamically populated -->
                </div>

                <button type="submit" class="btn" style="margin-top: 0.4rem; background: #11212D; color: #fff; border: none; border-radius: 30px; padding: 0.75rem; font-weight: 600; cursor: pointer; font-size: 0.95rem; width: 100%;">
                    Register Account
                </button>
            </form>
            
            <p style="text-align: center; color: #4A5C6A; font-size: 0.88rem; margin: 0.4rem 0 0 0;">
                Already have an account? <a id="link-goto-login" style="color: #11212D; text-decoration: none; font-weight: 700; cursor: pointer;">Sign In</a>
            </p>
        </div>
    `;

    const roleSelect = document.getElementById('signup-role');
    const condContainer = document.getElementById('signup-conditional-fields');

    const updateConditionalFields = () => {
        const role = roleSelect.value;
        if (role === 'STUDENT' || role === 'CR') {
            condContainer.innerHTML = `
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-email" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Email Address</label>
                    <input type="email" id="signup-email" class="form-input" required placeholder="e.g. name@ustc.edu" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-semester" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Semester</label>
                    <select id="signup-semester" required style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem; background: #fff; width: 100%;">
                        <option value="">Select Semester</option>
                        ${semesters.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-Batch" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Batch</label>
                    <select id="signup-Batch" required style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem; background: #fff; width: 100%;">
                        <option value="">Select Batch</option>
                        ${Batchs.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-section" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Section (Optional)</label>
                    <input type="text" id="signup-section" class="form-input" placeholder="e.g. A" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
            `;
        } else if (role === 'TEACHER') {
            condContainer.innerHTML = `
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-email" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Email Address</label>
                    <input type="email" id="signup-email" class="form-input" required placeholder="e.g. name@ustc.edu" style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="signup-designation" style="font-weight: 600; color: #253745; font-size: 0.88rem; margin-bottom: 0.25rem; display: block;">Designation</label>
                    <select id="signup-designation" required style="border-radius: 20px; border: 1px solid #9BA8AB; padding: 0.55rem 0.95rem; background: #fff; width: 100%;">
                        <option value="">Select Designation</option>
                        ${designations.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
            `;
        }
    };

    roleSelect.addEventListener('change', updateConditionalFields);
    updateConditionalFields(); // Initial render

    document.getElementById('form-signup').addEventListener('submit', handleSignup);
    document.getElementById('link-goto-login').addEventListener('click', showLoginForm);
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            state.user = await res.json();
            setupSidebar();
            switchView('dashboard');
            showToast(`Welcome back, ${state.user.fullName}!`);
        } else {
            let errMsg = "Login failed";
            try {
                const err = await res.json();
                errMsg = err.error || errMsg;
            } catch (jsonErr) {}
            showToast(errMsg, "error");
        }
    } catch (err) {
        showToast("Error connecting to server", "error");
    }
}

async function handleSignup(e) {
    e.preventDefault();
    try {
        const fullName = document.getElementById('signup-fullname').value;
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const idNo = document.getElementById('signup-idno').value;
        const department = document.getElementById('signup-department').value;
        const role = document.getElementById('signup-role').value;

        const emailEl = document.getElementById('signup-email');
        const email = emailEl ? emailEl.value : '';
        const semesterEl = document.getElementById('signup-semester');
        const semester = semesterEl ? semesterEl.value : null;
        const batchEl = document.getElementById('signup-Batch');
        const batch = batchEl ? batchEl.value : null;
        const sectionEl = document.getElementById('signup-section');
        const section = sectionEl ? sectionEl.value : null;
        const designationEl = document.getElementById('signup-designation');
        const designation = designationEl ? designationEl.value : null;

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password, role, idNo, department, semester, batch, section, designation })
        });

        if (res.ok) {
            const data = await res.json();
            const card = document.getElementById('auth-card-content');
            card.innerHTML = `
                <div style="text-align: center; padding: 2rem; margin: auto auto;">
                    <i class="fa-solid fa-circle-check" style="font-size: 4rem; color: var(--success); margin-bottom: 1.5rem; display: block;"></i>
                    <h2 style="margin-bottom: 1rem;">Registration Pending</h2>
                    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 2rem;">
                        ${data.message || "Your form is under progress. You will be notified via email once approved."}
                    </p>
                    <button class="btn btn-goto-home" style="width: auto;">Back to Home</button>
                </div>
            `;
            card.querySelector('.btn-goto-home').addEventListener('click', renderLandingPage);
        } else {
            let errMsg = "Signup failed";
            try {
                const err = await res.json();
                errMsg = err.error || errMsg;
            } catch (jsonErr) {}
            showToast(errMsg, "error");
        }
    } catch (err) {
        showToast("Error connecting to server", "error");
    }
}

// --- VIEW: DASHBOARD ---
async function renderDashboard(container) {
    const firstName = state.user.fullName ? state.user.fullName.split(' ')[0] : state.user.username;
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Welcome back, ${firstName} 👋</h2>
                <p>Here's your academic snapshot for today.</p>
            </div>
        </div>
        
        <!-- 1. Exam Countdowns (Most Important) -->
        <div class="glass-panel section-card">
            <h3><i class="fa-solid fa-fire" style="color: var(--danger); margin-right: 0.3rem;"></i> Upcoming Exam Countdowns</h3>
            <div class="countdown-container" id="countdown-list-host">
                <div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 1rem;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Loading countdowns...
                </div>
            </div>
        </div>

        <!-- 2. Today's Classes Timeline -->
        <div class="glass-panel section-card">
            <h3><i class="fa-solid fa-clock" style="color: var(--accent-blue); margin-right: 0.3rem;"></i> Today's Classes</h3>
            <div id="today-classes-host">
                <div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 1rem;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Loading schedule...
                </div>
            </div>
        </div>

        <!-- 3. Unread Announcements -->
        <div class="glass-panel section-card">
            <h3><i class="fa-solid fa-bell" style="color: var(--warning); margin-right: 0.3rem;"></i> Unread Announcements</h3>
            <div id="unread-announcements-host">
                <div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 1rem;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Loading notices...
                </div>
            </div>
        </div>
    `;

    loadCountdownData();
    loadTodayClassesTimeline();
    loadUnreadAnnouncements();
}

async function loadRoutineData() {
    const res = await apiFetch('/api/schedule/routine');
    if (!res || !res.ok) return;
    
    const items = await res.json();
    const tbody = document.getElementById('routine-tbody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No class routines configured.</td></tr>`;
        return;
    }

    // Sort routine by Day and start time
    const dayOrder = { "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3, "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6, "SUNDAY": 7 };
    items.sort((a, b) => {
        if (dayOrder[a.dayOfWeek] !== dayOrder[b.dayOfWeek]) {
            return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
        }
        return a.startTime.localeCompare(b.startTime);
    });

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="routine-day-badge">${item.dayOfWeek.substring(0, 3)}</span></td>
            <td class="routine-time">${item.startTime.substring(0,5)} - ${item.endTime.substring(0,5)}</td>
            <td style="font-weight: 500;">${item.courseName}</td>
            <td>${item.teacherName || 'N/A'}</td>
            <td><span style="font-family: 'Space Grotesk', sans-serif;">${item.roomNo || 'N/A'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

async function loadCountdownData() {
    const res = await apiFetch('/api/schedule/ct');
    if (!res || !res.ok) return;

    const cts = await res.json();
    const host = document.getElementById('countdown-list-host');
    host.innerHTML = '';

    const futureCts = cts.filter(ct => new Date(ct.dateTime) > new Date());
    futureCts.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    if (futureCts.length === 0) {
        host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 1.5rem;">No upcoming exams.</div>`;
        return;
    }

    futureCts.forEach(ct => {
        const card = document.createElement('div');
        card.className = 'countdown-card glass-panel';
        
        const dateObj = new Date(ct.dateTime);
        const ctId = `ct-timer-${ct.id}`;
        
        card.innerHTML = `
            <div class="info">
                <h4>${ct.courseName}</h4>
                <p><i class="fa-solid fa-calendar-day"></i> ${formatDateTime(ct.dateTime)} | Room ${ct.roomNo || 'TBA'}</p>
                <p style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-hashtag"></i> Topic: ${ct.topic || 'General Syllabus'}</p>
            </div>
            <div class="countdown-timer" id="${ctId}">
                <!-- Real-time timer values injected here -->
            </div>
        `;
        
        host.appendChild(card);
        
        // Start countdown timer
        const timerId = setInterval(() => {
            const now = new Date().getTime();
            const distance = dateObj.getTime() - now;
            
            const timerContainer = document.getElementById(ctId);
            if (!timerContainer) return;
            
            if (distance < 0) {
                timerContainer.innerHTML = `<span style="color: var(--danger); font-weight: bold;">STARTED</span>`;
                clearInterval(timerId);
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const isUrgent = days === 0 && hours < 24;
            const cls = isUrgent ? 'urgent' : '';
            
            timerContainer.innerHTML = `
                ${days > 0 ? `<div class="timer-box days"><span class="timer-val">${days}</span><span class="timer-unit">Days</span></div>` : ''}
                <div class="timer-box ${cls}"><span class="timer-val">${hours}</span><span class="timer-unit">Hrs</span></div>
                <div class="timer-box ${cls}"><span class="timer-val">${minutes}</span><span class="timer-unit">Min</span></div>
                <div class="timer-box ${cls}"><span class="timer-val">${seconds}</span><span class="timer-unit">Sec</span></div>
            `;
        }, 1000);
        
        state.timerIntervals.push(timerId);
    });
}

// --- Dashboard Helper: Today's Classes Timeline ---
async function loadTodayClassesTimeline() {
    const res = await apiFetch('/api/schedule/routine');
    if (!res || !res.ok) {
        const host = document.getElementById('today-classes-host');
        if (host) host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">Could not load schedule.</div>`;
        return;
    }
    const items = await res.json();
    const host = document.getElementById('today-classes-host');
    if (!host) return;

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const today = days[new Date().getDay()];
    const todayClasses = items.filter(item => item.dayOfWeek === today);
    todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayClasses.length === 0) {
        host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">
            <i class="fa-solid fa-mug-saucer" style="font-size: 2rem; margin-bottom: 0.75rem; display: block; opacity: 0.4;"></i>
            No classes scheduled for today. Enjoy your free day!
        </div>`;
        return;
    }

    let html = '<div class="timeline-list">';
    todayClasses.forEach(item => {
        html += `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-card">
                    <div>
                        <div class="timeline-time">${item.startTime.substring(0,5)} \u2013 ${item.endTime.substring(0,5)}</div>
                        <div class="timeline-subject">${item.courseName}</div>
                        <div class="timeline-details">
                            <span><i class="fa-solid fa-chalkboard-user"></i> ${item.teacherName || 'TBA'}</span>
                            <span><i class="fa-solid fa-location-dot"></i> Room ${item.roomNo || 'TBA'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    host.innerHTML = html;
}

// --- Dashboard Helper: Unread Announcements ---
async function loadUnreadAnnouncements() {
    const res = await apiFetch('/api/announcements');
    if (!res || !res.ok) {
        const host = document.getElementById('unread-announcements-host');
        if (host) host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">Could not load announcements.</div>`;
        return;
    }
    const announcements = await res.json();
    const host = document.getElementById('unread-announcements-host');
    if (!host) return;

    const readIds = JSON.parse(localStorage.getItem('learnx_read_announcements') || '[]');
    const unread = announcements.filter(a => !readIds.includes(a.id));

    if (unread.length === 0) {
        host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">
            <i class="fa-solid fa-check-double" style="font-size: 2rem; margin-bottom: 0.75rem; display: block; opacity: 0.4; color: var(--success);"></i>
            All caught up! No unread announcements.
        </div>`;
        return;
    }

    host.innerHTML = '';
    unread.slice(0, 5).forEach(a => {
        const card = document.createElement('div');
        card.style.cssText = 'padding: 1rem 1.25rem; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35); border-radius: 14px; margin-bottom: 0.75rem; cursor: pointer; transition: all 0.25s ease;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
                <div style="flex: 1; min-width: 0;">
                    <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-blue); font-family: 'Space Grotesk', sans-serif;">${a.title}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.3rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${a.content}</p>
                </div>
                <span class="routine-day-badge" style="font-size: 0.65rem; white-space: nowrap; flex-shrink: 0;">${a.createdByRole}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                <span style="font-size: 0.72rem; color: var(--text-muted);"><i class="fa-solid fa-user"></i> ${a.createdBy}</span>
                <span style="font-size: 0.72rem; color: var(--text-muted);"><i class="fa-solid fa-clock"></i> ${formatDateTime(a.createdAt)}</span>
            </div>
        `;
        card.addEventListener('click', () => {
            readIds.push(a.id);
            localStorage.setItem('learnx_read_announcements', JSON.stringify([...new Set(readIds)]));
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            showToast('Announcement marked as read');
        });
        card.addEventListener('mouseenter', () => { card.style.background = 'rgba(255,255,255,0.38)'; card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.04)'; });
        card.addEventListener('mouseleave', () => { card.style.background = 'rgba(255,255,255,0.2)'; card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; });
        host.appendChild(card);
    });

    if (unread.length > 5) {
        const more = document.createElement('div');
        more.style.cssText = 'text-align: center; padding: 0.75rem;';
        more.innerHTML = `<a style="color: var(--accent-blue); cursor: pointer; font-size: 0.85rem; font-weight: 600; text-decoration: none;" id="see-all-announcements"><i class="fa-solid fa-arrow-right"></i> See all ${unread.length} unread announcements</a>`;
        host.appendChild(more);
        more.querySelector('#see-all-announcements').addEventListener('click', () => switchView('announcements'));
    }
}

async function loadStudentPerformance(hostId = 'dashboard-grades-host') {
    const res = await apiFetch('/api/dashboard/performance');
    if (!res || !res.ok) return;

    const stats = await res.json();
    const host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = '';

    if (stats.length === 0) {
        host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No performance records available yet.</div>`;
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'glass-panel section-card';
    wrapper.innerHTML = `
        <h3>Academic Performance</h3>
        <div class="perf-card-grid" id="${hostId}-cards-container"></div>
    `;
    host.appendChild(wrapper);

    const cardsContainer = document.getElementById(`${hostId}-cards-container`);
    stats.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'perf-stat-card';
        
        // Percentile SVG calculations
        const radius = 28;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (stat.percentile / 100) * circumference;

        card.innerHTML = `
            <div class="perf-stat-header">
                <div class="perf-stat-title">
                    <h4>${stat.courseName.split(' - ')[0]}</h4>
                    <p>${stat.assessmentName}</p>
                </div>
                <div class="percentile-radial">
                    <svg>
                        <circle class="bg" cx="35" cy="35" r="${radius}"></circle>
                        <circle class="progress" cx="35" cy="35" r="${radius}" 
                            stroke-dasharray="${circumference}" 
                            stroke-dashoffset="${strokeDashoffset}"></circle>
                    </svg>
                    <span class="percentile-text">${stat.percentile}%</span>
                </div>
            </div>
            
            <div class="perf-metrics">
                <div class="metric-box">
                    <span class="metric-lbl">Marks</span>
                    <span class="metric-val score">${stat.marksObtained}/${stat.maxMarks}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-lbl">Class Avg</span>
                    <span class="metric-val">${stat.classAverage}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-lbl">Class Max</span>
                    <span class="metric-val">${stat.classHighest}</span>
                </div>
            </div>
            
            <div style="font-size: 0.75rem; text-align: center; color: var(--text-secondary); margin-top: 0.25rem;">
                Percentile indicates you scored higher than ${stat.percentile}% of the batch.
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

function renderPerformanceView(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Academic Performance Analytics</h2>
                <p>View your overall gradebook and course-wise percentile breakdown.</p>
            </div>
        </div>
        <div class="performance-analytics-wrapper">
            <!-- KPI Summary Row -->
            <div class="kpi-row" id="perf-kpi-row">
                <div class="glass-panel kpi-card"><h4>Est. GPA</h4><div class="value" id="kpi-gpa">--</div></div>
                <div class="glass-panel kpi-card"><h4>Avg Percentile</h4><div class="value" id="kpi-percentile">--</div></div>
                <div class="glass-panel kpi-card"><h4>Exams Taken</h4><div class="value" id="kpi-exams">--</div></div>
                <div class="glass-panel kpi-card"><h4>Best Course</h4><div class="value" id="kpi-best" style="font-size: 1.2rem;">--</div></div>
            </div>

            <!-- Comparative Charts -->
            <div class="glass-panel comparative-chart-panel">
                <h3>Score Comparison (You vs Class Avg vs Class Max)</h3>
                <div class="comparison-list" id="perf-comparison-list">
                    <div style="text-align: center; color: var(--text-secondary); padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading performance data...</div>
                </div>
            </div>
        </div>
    `;
    loadPerformanceAnalytics();
}

async function loadPerformanceAnalytics() {
    const res = await apiFetch('/api/dashboard/performance');
    if (!res || !res.ok) return;

    const stats = await res.json();
    const listHost = document.getElementById('perf-comparison-list');
    listHost.innerHTML = '';

    if (stats.length === 0) {
        listHost.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No performance records available yet.</div>`;
        document.getElementById('kpi-gpa').textContent = 'N/A';
        document.getElementById('kpi-percentile').textContent = 'N/A';
        document.getElementById('kpi-exams').textContent = '0';
        document.getElementById('kpi-best').textContent = 'N/A';
        return;
    }

    // Calculate KPIs
    const avgPercentile = (stats.reduce((sum, s) => sum + s.percentile, 0) / stats.length).toFixed(1);
    const avgScore = stats.reduce((sum, s) => sum + (s.marksObtained / s.maxMarks), 0) / stats.length;
    const gpa = (avgScore * 4).toFixed(2);
    let bestCourse = stats.reduce((best, s) => s.percentile > best.percentile ? s : best, stats[0]);

    document.getElementById('kpi-gpa').textContent = gpa;
    document.getElementById('kpi-percentile').textContent = avgPercentile + '%';
    document.getElementById('kpi-exams').textContent = stats.length;
    document.getElementById('kpi-best').textContent = bestCourse.courseName.split(' - ')[0];

    // Build comparison bars
    stats.forEach(stat => {
        const maxVal = stat.maxMarks || 100;
        const userPct = ((stat.marksObtained / maxVal) * 100).toFixed(0);
        const avgPct = ((stat.classAverage / maxVal) * 100).toFixed(0);
        const maxPct = ((stat.classHighest / maxVal) * 100).toFixed(0);

        const item = document.createElement('div');
        item.className = 'comparison-item';
        item.innerHTML = `
            <div class="comparison-header">
                <div class="comparison-title">
                    <h4>${stat.courseName.split(' - ')[0]}</h4>
                    <p>${stat.assessmentName} · Percentile: ${stat.percentile}%</p>
                </div>
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-blue); font-family: 'Space Grotesk', sans-serif;">${stat.marksObtained}/${stat.maxMarks}</span>
            </div>
            <div class="comparison-bars-container">
                <div class="bar-row">
                    <span class="bar-lbl">You</span>
                    <div class="bar-track"><div class="bar-fill user" style="width: 0%" data-target="${userPct}"></div></div>
                    <span class="bar-val">${stat.marksObtained}</span>
                </div>
                <div class="bar-row">
                    <span class="bar-lbl">Class Avg</span>
                    <div class="bar-track"><div class="bar-fill avg" style="width: 0%" data-target="${avgPct}"></div></div>
                    <span class="bar-val">${stat.classAverage}</span>
                </div>
                <div class="bar-row">
                    <span class="bar-lbl">Class Max</span>
                    <div class="bar-track"><div class="bar-fill max" style="width: 0%" data-target="${maxPct}"></div></div>
                    <span class="bar-val">${stat.classHighest}</span>
                </div>
            </div>
        `;
        listHost.appendChild(item);
    });

    // Animate bars after render
    requestAnimationFrame(() => {
        document.querySelectorAll('.bar-fill[data-target]').forEach(bar => {
            bar.style.width = bar.getAttribute('data-target') + '%';
        });
    });
}

// --- VIEW: NOTES VAULT (STUDENT) ---
async function renderNotesVault(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Notes Vault & Resources</h2>
                <p>Download study resources with exam tags or share your notes for review.</p>
            </div>
        </div>

        <div class="dashboard-grid">
            <!-- Left panel: File library -->
            <div class="glass-panel section-card">
                <h3>Approved Resources</h3>
                <div class="resource-filters">
                    <input type="text" id="notes-search" class="form-input" placeholder="Search by course code or title..." style="max-width: 300px;">
                </div>
                <div class="notes-grid" id="notes-library-host">
                    <div style="text-align: center; color: var(--text-secondary); width: 100%; padding: 2rem;">Loading library notes...</div>
                </div>
            </div>

            <!-- Right panel: Upload Note form -->
            <div class="glass-panel section-card" style="height: fit-content;">
                <h3>Upload Shared Notes</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Students require CR or Teacher approval before notes are visible in the vault.
                </p>
                <form id="form-upload-resource">
                    <div class="form-group">
                        <label for="up-title">Resource Title</label>
                        <input type="text" id="up-title" class="form-input" required placeholder="e.g. B-Tree Indexing slide notes">
                    </div>
                    <div class="form-group">
                        <label for="up-course">Course Name</label>
                        <select id="up-course" required>
                            <option value="CSE 3101 - Database Systems">CSE 3101 - Database Systems</option>
                            <option value="CSE 3103 - Software Engineering">CSE 3103 - Software Engineering</option>
                            <option value="CSE 3105 - Compiler Design">CSE 3105 - Compiler Design</option>
                            <option value="CSE 3107 - Computer Networks">CSE 3107 - Computer Networks</option>
                            <option value="HUM 3109 - Technical Writing">HUM 3109 - Technical Writing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="up-tags">Exam Tags (comma separated)</label>
                        <input type="text" id="up-tags" class="form-input" placeholder="e.g. CT1, Midterm, Final">
                    </div>
                    <div class="form-group">
                        <label for="up-file">Choose File</label>
                        <input type="file" id="up-file" class="form-input" required>
                    </div>
                    <button type="submit" class="btn" style="margin-top: 1rem;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Resource
                    </button>
                </form>
            </div>
        </div>
    `;

    loadNotesLibrary();
    document.getElementById('notes-search').addEventListener('input', filterNotes);
    document.getElementById('form-upload-resource').addEventListener('submit', handleResourceUpload);
}

let activeResources = [];

async function loadNotesLibrary() {
    const res = await apiFetch('/api/resources/approved');
    if (!res || !res.ok) return;

    activeResources = await res.json();
    activeResources.sort((a, b) => {
        const netA = (a.likesCount || 0) - (a.dislikesCount || 0);
        const netB = (b.likesCount || 0) - (b.dislikesCount || 0);
        return netB - netA;
    });
    renderFilteredNotes(activeResources);
}

function renderFilteredNotes(resources) {
    const host = document.getElementById('notes-library-host');
    host.innerHTML = '';

    if (resources.length === 0) {
        host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); width: 100%; padding: 2rem;">No study materials found matching search criteria.</div>`;
        return;
    }

    resources.forEach(note => {
        const card = document.createElement('div');
        card.className = 'glass-panel note-card interactive';
        
        const tags = note.examTags ? note.examTags.split(',') : [];
        const tagsHtml = tags.map(t => `<span class="tag exam">${t.trim()}</span>`).join('');

        const isLiked = note.userReaction === 'LIKE';
        const isDisliked = note.userReaction === 'DISLIKE';

        let driveHtml = '';
        if (note.driveLink) {
            driveHtml = `<a href="${note.driveLink}" target="_blank" rel="noopener" class="btn btn-secondary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem; text-decoration: none; background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #059669;">
                <i class="fa-brands fa-google-drive"></i> Drive
            </a>`;
        }

        card.innerHTML = `
            <div class="note-card-header">
                <div class="note-title">${note.title}</div>
                <i class="fa-solid fa-file-pdf" style="color: var(--accent-blue); font-size: 1.25rem;"></i>
            </div>
            <div class="note-meta">
                <span>Course: ${note.courseName.split(' - ')[0]}</span>
                <span>Uploaded by: ${note.uploadedBy.fullName}</span>
                <div class="tag-list">${tagsHtml}</div>
            </div>
            <div class="note-actions">
                <div class="resource-reactions-row">
                    <button class="rx-btn like-btn ${isLiked ? 'active' : ''}" data-id="${note.id}" data-action="LIKE">
                        <i class="fa-solid fa-thumbs-up"></i> <span>${note.likesCount || 0}</span>
                    </button>
                    <button class="rx-btn dislike-btn ${isDisliked ? 'active' : ''}" data-id="${note.id}" data-action="DISLIKE">
                        <i class="fa-solid fa-thumbs-down"></i> <span>${note.dislikesCount || 0}</span>
                    </button>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${driveHtml}
                    <a href="/api/resources/download/${note.id}" class="btn btn-secondary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem; text-decoration: none;">
                        <i class="fa-solid fa-download"></i> Download
                    </a>
                </div>
            </div>
        `;

        // Bind reaction click handlers
        card.querySelectorAll('.rx-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const resId = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                const isCurrentlyActive = btn.classList.contains('active');

                try {
                    if (isCurrentlyActive) {
                        // Remove reaction
                        await apiFetch(`/api/resources/${resId}/react`, { method: 'DELETE' });
                    } else {
                        // Set reaction
                        await apiFetch(`/api/resources/${resId}/react?type=${action}`, { method: 'POST' });
                    }
                    // Reload to get fresh counts and re-sort
                    loadNotesLibrary();
                } catch (err) {
                    showToast('Reaction failed', 'error');
                }
            });
        });

        host.appendChild(card);
    });
}

function filterNotes() {
    const q = document.getElementById('notes-search').value.toLowerCase();
    const filtered = activeResources.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.courseName.toLowerCase().includes(q) ||
        (r.examTags && r.examTags.toLowerCase().includes(q))
    );
    renderFilteredNotes(filtered);
}

async function handleResourceUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('up-file');
    const title = document.getElementById('up-title').value;
    const courseName = document.getElementById('up-course').value;
    const examTags = document.getElementById('up-tags').value;

    if (fileInput.files.length === 0) {
        showToast("Please choose a file to upload", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("title", title);
    formData.append("courseName", courseName);
    formData.append("examTags", examTags);

    try {
        const res = await apiFetch('/api/resources/upload', {
            method: 'POST',
            body: formData
        });

        if (res && res.ok) {
            showToast(state.user.role === 'STUDENT' ? "Resource uploaded. Pending approval." : "Resource uploaded successfully!");
            document.getElementById('form-upload-resource').reset();
            loadNotesLibrary();
        } else {
            showToast("Upload failed", "error");
        }
    } catch (err) {
        showToast("Error uploading file", "error");
    }
}

// --- VIEW: EXAMS / QUIZZES (STUDENT) ---
async function renderExams(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Class Quiz Assessments</h2>
                <p>Complete Google Forms-style online exams. Scores are automatically graded.</p>
            </div>
        </div>

        <div class="glass-panel section-card">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                <button class="btn exam-tab" id="tab-active-exams" style="width: auto; background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%); color: #fff;">Active & Upcoming</button>
                <button class="btn btn-secondary exam-tab" id="tab-past-exams" style="width: auto;">Submitted & Past</button>
            </div>
            <div class="routine-table-container">
                <table class="routine-table">
                    <thead>
                        <tr>
                            <th>Exam Title</th>
                            <th>Description</th>
                            <th>Time Window</th>
                            <th>Duration</th>
                            <th>Status/Grade</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="exams-list-tbody">
                        <tr><td colspan="6" style="text-align: center;">Loading exams list...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('tab-active-exams').addEventListener('click', (e) => {
        document.querySelectorAll('.exam-tab').forEach(t => {
            t.classList.add('btn-secondary');
            t.style.background = 'transparent';
            t.style.color = 'var(--text-primary)';
        });
        e.target.classList.remove('btn-secondary');
        e.target.style.background = 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)';
        e.target.style.color = '#fff';
        loadExamsList('ACTIVE');
    });

    document.getElementById('tab-past-exams').addEventListener('click', (e) => {
        document.querySelectorAll('.exam-tab').forEach(t => {
            t.classList.add('btn-secondary');
            t.style.background = 'transparent';
            t.style.color = 'var(--text-primary)';
        });
        e.target.classList.remove('btn-secondary');
        e.target.style.background = 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)';
        e.target.style.color = '#fff';
        loadExamsList('PAST');
    });

    loadExamsList('ACTIVE');
}

async function loadExamsList(tab = 'ACTIVE') {
    const res = await apiFetch('/api/exams');
    if (!res || !res.ok) return;

    let list = await res.json();
    const tbody = document.getElementById('exams-list-tbody');
    tbody.innerHTML = '';

    const now = new Date();
    list = list.filter(exam => {
        const end = new Date(exam.endTime);
        const isPast = now > end || exam.alreadySubmitted;
        return tab === 'ACTIVE' ? !isPast : isPast;
    });

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No exams published yet.</td></tr>`;
        return;
    }

    list.forEach(exam => {
        const row = document.createElement('tr');
        const now = new Date();
        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);
        const isOpen = now >= start && now <= end;
        
        let statusHtml = '';
        let btnHtml = '';

        if (exam.alreadySubmitted) {
            statusHtml = `<span style="color: var(--success); font-weight: bold;"><i class="fa-solid fa-circle-check"></i> Graded: ${exam.score} pts</span>`;
            btnHtml = `<button class="btn btn-secondary" style="width:auto; padding:0.4rem 0.8rem; font-size:0.8rem;" disabled>Submitted</button>`;
        } else if (!isOpen && now < start) {
            statusHtml = `<span style="color: var(--warning);"><i class="fa-solid fa-clock"></i> Starts ${formatDateTime(exam.startTime)}</span>`;
            btnHtml = `<button class="btn btn-secondary" style="width:auto; padding:0.4rem 0.8rem; font-size:0.8rem;" disabled>Locked</button>`;
        } else if (now > end) {
            statusHtml = `<span style="color: var(--danger);"><i class="fa-solid fa-circle-xmark"></i> Ended</span>`;
            btnHtml = `<button class="btn btn-secondary" style="width:auto; padding:0.4rem 0.8rem; font-size:0.8rem;" disabled>Expired</button>`;
        } else {
            statusHtml = `<span style="color: var(--accent-blue); font-weight: 500;"><i class="fa-solid fa-bolt"></i> Open</span>`;
            btnHtml = `<button class="btn btn-take-exam" data-id="${exam.id}" style="width:auto; padding:0.4rem 0.8rem; font-size:0.8rem;">Take Exam</button>`;
        }

        row.innerHTML = `
            <td style="font-weight: 600;">${exam.title}</td>
            <td style="font-size:0.85rem; color: var(--text-secondary); max-width:300px;">${exam.description || ''}</td>
            <td style="font-size:0.85rem;">${formatDateTime(exam.startTime)} - ${formatDateTime(exam.endTime)}</td>
            <td style="font-family: 'Space Grotesk', sans-serif;">${exam.durationMinutes} mins</td>
            <td>${statusHtml}</td>
            <td>${btnHtml}</td>
        `;

        const btn = row.querySelector('.btn-take-exam');
        if (btn) {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                startTakingExam(id);
            });
        }

        tbody.appendChild(row);
    });
}

async function startTakingExam(examId) {
    const res = await apiFetch(`/api/exams/${examId}`);
    if (!res || !res.ok) return;

    const exam = await res.json();
    const host = document.getElementById('main-view-host');
    clearAllIntervals();

    // RENDER EXAM TAKING SCREEN
    host.innerHTML = `
        <div class="exam-taking-header">
            <div>
                <h2 style="font-family: 'Space Grotesk', sans-serif;">${exam.title}</h2>
                <p style="color: var(--text-secondary); margin-top: 0.25rem;">${exam.description || ''}</p>
            </div>
            <div class="exam-timer-fixed" id="exam-live-countdown">
                --:--
            </div>
        </div>

        <form id="form-exam-submission">
            <div id="exam-questions-list"></div>
            <button type="submit" class="btn" style="max-width: 250px; display: block; margin: 2rem 0;">
                <i class="fa-solid fa-paper-plane"></i> Submit Answers
            </button>
        </form>
    `;

    const qList = document.getElementById('exam-questions-list');
    exam.questions.forEach((q, index) => {
        const qBlock = document.createElement('div');
        qBlock.className = 'exam-question-item';
        
        let answersHtml = '';
        if (q.questionType === 'MCQ') {
            const options = q.options ? q.options.split(';') : [];
            answersHtml = `<div class="mcq-options-container">`;
            options.forEach((opt, oIdx) => {
                answersHtml += `
                    <label class="mcq-option-label" for="q-${q.id}-opt-${oIdx}">
                        <input type="radio" name="question-${q.id}" id="q-${q.id}-opt-${oIdx}" value="${opt}" required>
                        <span>${opt}</span>
                    </label>
                `;
            });
            answersHtml += `</div>`;
        } else {
            // SHORT_ANSWER
            answersHtml = `
                <input type="text" name="question-${q.id}" class="form-input" placeholder="Type your answer here..." required>
            `;
        }

        qBlock.innerHTML = `
            <h4>Question ${index + 1}: ${q.questionText} <span style="font-size:0.8rem; color: var(--text-secondary);">(${q.points} Points)</span></h4>
            ${answersHtml}
        `;
        
        // Add MCQ selection styles
        if (q.questionType === 'MCQ') {
            qBlock.querySelectorAll('.mcq-option-label').forEach(lbl => {
                lbl.addEventListener('click', (e) => {
                    qBlock.querySelectorAll('.mcq-option-label').forEach(l => l.classList.remove('selected'));
                    lbl.classList.add('selected');
                });
            });
        }

        qList.appendChild(qBlock);
    });

    // Set Live Timer countdown
    const limitMs = exam.durationMinutes * 60 * 1000;
    const endTimestamp = new Date().getTime() + limitMs;

    const examTimerId = setInterval(() => {
        const now = new Date().getTime();
        const diff = endTimestamp - now;

        if (diff <= 0) {
            clearInterval(examTimerId);
            showToast("Time's up! Automatically submitting answers.", "warning");
            submitExamAnswers(examId, true);
            return;
        }

        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        document.getElementById('exam-live-countdown').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);

    state.timerIntervals.push(examTimerId);

    document.getElementById('form-exam-submission').addEventListener('submit', (e) => {
        e.preventDefault();
        submitExamAnswers(examId, false);
    });
}

async function submitExamAnswers(examId, autoSubmit = false) {
    clearAllIntervals();
    const form = document.getElementById('form-exam-submission');
    const formData = new FormData(form);
    
    // Parse answers from inputs
    const answers = [];
    const questionsSet = new Set();
    
    document.querySelectorAll('[name^="question-"]').forEach(el => {
        const qId = el.name.replace('question-', '');
        if (questionsSet.has(qId)) return;
        questionsSet.add(qId);

        let ansVal = "";
        if (el.type === 'radio') {
            const checked = form.querySelector(`input[name="question-${qId}"]:checked`);
            ansVal = checked ? checked.value : "";
        } else {
            ansVal = el.value;
        }

        answers.push({
            questionId: parseInt(qId),
            answer: ansVal
        });
    });

    try {
        const res = await apiFetch(`/api/exams/${examId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers)
        });

        if (res && res.ok) {
            const report = await res.json();
            showToast(`Exam submitted successfully!`);
            
            // Render Score report screen
            const host = document.getElementById('main-view-host');
            host.innerHTML = `
                <div class="auth-container">
                    <div class="glass-panel auth-card" style="text-align: center; max-width: 500px;">
                        <i class="fa-solid fa-award" style="color: var(--accent-blue); font-size: 4rem; margin-bottom: 1.5rem;"></i>
                        <h2 style="font-family: 'Space Grotesk', sans-serif;">Exam Submitted!</h2>
                        <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 2rem;">
                            Your responses have been recorded and graded.
                        </p>
                        
                        <div style="background: rgba(0,180,216,0.1); border:1px solid rgba(0,180,216,0.25); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                            <span style="font-size:0.85rem; text-transform: uppercase; color: var(--text-secondary);">Score Achieved</span>
                            <h3 style="font-size: 3rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--accent-blue); margin-top: 0.5rem;">
                                ${report.score} <span style="font-size: 1.2rem; color: var(--text-secondary);">points</span>
                            </h3>
                        </div>

                        <button class="btn btn-secondary" onclick="window.location.reload();">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
        } else {
            const err = await res.json();
            showToast(err.error || "Submission failed", "error");
            switchView('exams');
        }
    } catch (e) {
        showToast("Error submitting responses", "error");
        switchView('exams');
    }
}

// --- VIEW: ROUTINE / SCHEDULER MANAGER ---
let editingRoutineId = null;

function renderRoutineManager(container) {
    if (state.user.role === 'STUDENT') {
        renderStudentSchedule(container);
        return;
    }

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Academic Schedule Planner</h2>
                <p>Configure the weekly routine class timings and announce upcoming tests.</p>
            </div>
        </div>

        <div class="dashboard-grid">
            <!-- Left Panel: Create CT form -->
            <div class="glass-panel section-card" style="height: fit-content;">
                <h3>Announce Class Test (CT)</h3>
                <form id="form-create-ct">
                    <div class="form-group">
                        <label for="ct-course">Course Name</label>
                        <select id="ct-course" required>
                            <option value="CSE 3101 - Database Systems">CSE 3101 - Database Systems</option>
                            <option value="CSE 3103 - Software Engineering">CSE 3103 - Software Engineering</option>
                            <option value="CSE 3105 - Compiler Design">CSE 3105 - Compiler Design</option>
                            <option value="CSE 3107 - Computer Networks">CSE 3107 - Computer Networks</option>
                            <option value="HUM 3109 - Technical Writing">HUM 3109 - Technical Writing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ct-datetime">Date & Time</label>
                        <input type="datetime-local" id="ct-datetime" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="ct-duration">Duration (Minutes)</label>
                        <input type="number" id="ct-duration" class="form-input" required value="45" min="10">
                    </div>
                    <div class="form-group">
                        <label for="ct-room">Room No</label>
                        <input type="text" id="ct-room" class="form-input" required placeholder="e.g. 302, Lab 3">
                    </div>
                    <div class="form-group">
                        <label for="ct-topic">Syllabus Topic</label>
                        <input type="text" id="ct-topic" class="form-input" required placeholder="e.g. Normalization, First & Follow Sets">
                    </div>
                    <button type="submit" class="btn" style="margin-top: 1rem;">
                        <i class="fa-solid fa-bullhorn"></i> Announce CT
                    </button>
                </form>
            </div>

            <!-- Right Panel: Routine Scheduler Builder -->
            <div class="glass-panel section-card">
                <h3 id="routine-form-title">Add Routine Class Slot</h3>
                <form id="form-create-routine" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="rt-course">Course Name</label>
                        <input type="text" id="rt-course" class="form-input" required placeholder="e.g. CSE 3101 - Database Systems">
                    </div>
                    <div class="form-group">
                        <label for="rt-day">Day of Week</label>
                        <select id="rt-day" required>
                            <option value="MONDAY">Monday</option>
                            <option value="TUESDAY">Tuesday</option>
                            <option value="WEDNESDAY">Wednesday</option>
                            <option value="THURSDAY">Thursday</option>
                            <option value="FRIDAY">Friday</option>
                            <option value="SATURDAY">Saturday</option>
                            <option value="SUNDAY">Sunday</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="rt-room">Room No</label>
                        <input type="text" id="rt-room" class="form-input" required placeholder="e.g. 302">
                    </div>
                    <div class="form-group">
                        <label for="rt-start">Start Time</label>
                        <input type="time" id="rt-start" class="form-input" required value="08:30">
                    </div>
                    <div class="form-group">
                        <label for="rt-end">End Time</label>
                        <input type="time" id="rt-end" class="form-input" required value="09:45">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="rt-teacher">Teacher Name</label>
                        <input type="text" id="rt-teacher" class="form-input" required placeholder="e.g. Dr. Mahfuzur Rahman">
                    </div>
                    <div style="grid-column: 1 / -1; display: flex; gap: 1rem; margin-top: 0.5rem;">
                        <button type="submit" id="btn-routine-submit" class="btn" style="flex: 1;">
                            <i class="fa-solid fa-plus"></i> Add Routine Class
                        </button>
                        <button type="button" id="btn-routine-cancel" class="btn btn-secondary" style="flex: 1; display: none;">
                            <i class="fa-solid fa-xmark"></i> Cancel Edit
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Full Width Panel: Existing Routine Slots List -->
        <div class="glass-panel section-card" style="margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                <h3>Current Class Routine Slots</h3>
                <span class="tag" style="background: rgba(var(--accent-blue-rgb), 0.15); color: var(--accent-blue); padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 600; font-size: 0.8rem;">
                    ${state.user.studentClass ? state.user.studentClass.className : 'All Classes'}
                </span>
            </div>
            <div class="routine-table-container">
                <table class="routine-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Time Slot</th>
                            <th>Course Name</th>
                            <th>Room No</th>
                            <th>Teacher Name</th>
                            <th style="text-align: center; width: 180px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="routine-list-tbody">
                        <tr><td colspan="6" style="text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading scheduled routine classes...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('form-create-ct').addEventListener('submit', handleAnnounceCt);
    document.getElementById('form-create-routine').addEventListener('submit', handleAddRoutine);
    
    const cancelBtn = document.getElementById('btn-routine-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEditRoutine);
    }

    editingRoutineId = null;
    loadRoutineManagerList();
}

async function handleAnnounceCt(e) {
    e.preventDefault();
    const courseName = document.getElementById('ct-course').value;
    const dateTime = document.getElementById('ct-datetime').value;
    const durationMinutes = document.getElementById('ct-duration').value;
    const roomNo = document.getElementById('ct-room').value;
    const topic = document.getElementById('ct-topic').value;

    try {
        const res = await apiFetch('/api/schedule/ct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseName, dateTime, durationMinutes: parseInt(durationMinutes), roomNo, topic })
        });

        if (res && res.ok) {
            showToast("Class test announced successfully!");
            document.getElementById('form-create-ct').reset();
        } else {
            showToast("Error creating CT", "error");
        }
    } catch (e) {
        showToast("Connection failed", "error");
    }
}

async function handleAddRoutine(e) {
    e.preventDefault();
    const courseName = document.getElementById('rt-course').value;
    const dayOfWeek = document.getElementById('rt-day').value;
    const roomNo = document.getElementById('rt-room').value;
    const startTime = document.getElementById('rt-start').value + ":00";
    const endTime = document.getElementById('rt-end').value + ":00";
    const teacherName = document.getElementById('rt-teacher').value;

    const payload = { courseName, dayOfWeek, roomNo, startTime, endTime, teacherName };

    try {
        let res;
        if (editingRoutineId) {
            res = await apiFetch(`/api/schedule/routine/${editingRoutineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await apiFetch('/api/schedule/routine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (res && res.ok) {
            if (editingRoutineId) {
                showToast("Routine class updated successfully!");
                cancelEditRoutine();
            } else {
                showToast("Routine class scheduled successfully!");
                document.getElementById('form-create-routine').reset();
            }
            loadRoutineManagerList();
        } else {
            const errData = res ? await res.json().catch(() => ({})) : {};
            const errMsg = errData.error || "Error saving routine slot";
            showToast(errMsg, "error");
        }
    } catch (e) {
        showToast("Connection failed", "error");
    }
}

async function loadRoutineManagerList() {
    const tbody = document.getElementById('routine-list-tbody');
    if (!tbody) return;

    try {
        const res = await apiFetch('/api/schedule/routine');
        if (!res || !res.ok) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load routine slots.</td></tr>`;
            return;
        }

        const routines = await res.json();
        tbody.innerHTML = '';

        if (routines.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No scheduled routine classes.</td></tr>`;
            return;
        }

        const dayOrder = { 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7 };
        routines.sort((a, b) => {
            const dayA = dayOrder[a.dayOfWeek] || 99;
            const dayB = dayOrder[b.dayOfWeek] || 99;
            if (dayA !== dayB) return dayA - dayB;
            return a.startTime.localeCompare(b.startTime);
        });

        routines.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600; color: var(--accent-blue);">${item.dayOfWeek}</td>
                <td style="white-space: nowrap;">${item.startTime.substring(0, 5)} - ${item.endTime.substring(0, 5)}</td>
                <td style="font-weight: 500;">${item.courseName}</td>
                <td><span class="tag" style="background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border);">${item.roomNo}</span></td>
                <td>${item.teacherName || 'N/A'}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-edit-routine" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; width: auto; background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%);">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-delete-routine" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; width: auto; background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;

            row.querySelector('.btn-edit-routine').addEventListener('click', () => startEditRoutine(item));
            row.querySelector('.btn-delete-routine').addEventListener('click', () => handleDeleteRoutine(item.id));

            tbody.appendChild(row);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Connection failed.</td></tr>`;
    }
}

function startEditRoutine(item) {
    editingRoutineId = item.id;
    
    const title = document.getElementById('routine-form-title');
    if (title) title.innerText = "Edit Routine Class Slot";

    const submitBtn = document.getElementById('btn-routine-submit');
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Changes`;
        submitBtn.style.background = `linear-gradient(135deg, #10b981 0%, #059669 100%)`;
    }

    const cancelBtn = document.getElementById('btn-routine-cancel');
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    document.getElementById('rt-course').value = item.courseName;
    document.getElementById('rt-day').value = item.dayOfWeek;
    document.getElementById('rt-room').value = item.roomNo;
    document.getElementById('rt-start').value = item.startTime.substring(0, 5);
    document.getElementById('rt-end').value = item.endTime.substring(0, 5);
    document.getElementById('rt-teacher').value = item.teacherName || '';
    
    document.getElementById('form-create-routine').scrollIntoView({ behavior: 'smooth' });
}

function cancelEditRoutine() {
    editingRoutineId = null;

    const title = document.getElementById('routine-form-title');
    if (title) title.innerText = "Add Routine Class Slot";

    const submitBtn = document.getElementById('btn-routine-submit');
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Routine Class`;
        submitBtn.style.background = `linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)`;
    }

    const cancelBtn = document.getElementById('btn-routine-cancel');
    if (cancelBtn) cancelBtn.style.display = 'none';

    document.getElementById('form-create-routine').reset();
}

async function handleDeleteRoutine(id) {
    if (!confirm("Are you sure you want to delete this routine class slot?")) {
        return;
    }

    try {
        const res = await apiFetch(`/api/schedule/routine/${id}`, {
            method: 'DELETE'
        });

        if (res && res.ok) {
            showToast("Routine class deleted successfully!");
            if (editingRoutineId === id) {
                cancelEditRoutine();
            }
            loadRoutineManagerList();
        } else {
            const errData = res ? await res.json().catch(() => ({})) : {};
            const errMsg = errData.error || "Error deleting routine slot";
            showToast(errMsg, "error");
        }
    } catch (e) {
        showToast("Connection failed", "error");
    }
}

// --- VIEW: RESOURCE APPROVAL PANEL (CR) ---
async function renderNotesApproval(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Document Resource Approval</h2>
                <p>Review student notes uploads. Verify files before making them visible in notes vault.</p>
            </div>
        </div>

        <div class="glass-panel section-card">
            <h3>Pending Notes Uploads</h3>
            <div class="routine-table-container">
                <table class="routine-table">
                    <thead>
                        <tr>
                            <th>Resource Title</th>
                            <th>Course</th>
                            <th>Uploader</th>
                            <th>File Name</th>
                            <th>Exam Tag</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="approvals-tbody">
                        <tr><td colspan="6" style="text-align: center;">Loading submissions...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    loadPendingNotes();
}

async function loadPendingNotes() {
    const res = await apiFetch('/api/resources/pending');
    if (!res || !res.ok) return;

    const list = await res.json();
    const tbody = document.getElementById('approvals-tbody');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No pending notes files waiting for approval.</td></tr>`;
        return;
    }

    list.forEach(note => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:600;">${note.title}</td>
            <td>${note.courseName.split(' - ')[0]}</td>
            <td>${note.uploadedBy.fullName}</td>
            <td><a href="/api/resources/download/${note.id}" style="color:var(--accent-blue); text-decoration:none;"><i class="fa-solid fa-paperclip"></i> ${note.fileName}</a></td>
            <td><span class="tag">${note.examTags || 'N/A'}</span></td>
            <td>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-approve" data-id="${note.id}" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow:none; padding: 0.35rem 0.75rem; font-size: 0.75rem; width:auto;">Approve</button>
                    <button class="btn btn-danger btn-reject" data-id="${note.id}" style="box-shadow:none; padding: 0.35rem 0.75rem; font-size: 0.75rem; width:auto;">Delete</button>
                </div>
            </td>
        `;
        
        row.querySelector('.btn-approve').addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const response = await apiFetch(`/api/resources/${id}/approve`, { method: 'POST' });
            if (response && response.ok) {
                showToast("Note approved successfully!");
                loadPendingNotes();
            }
        });

        row.querySelector('.btn-reject').addEventListener('click', async (e) => {
            if (confirm("Are you sure you want to reject and delete this note upload?")) {
                const id = e.currentTarget.getAttribute('data-id');
                const response = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
                if (response && response.ok) {
                    showToast("Note rejected and deleted", "warning");
                    loadPendingNotes();
                }
            }
        });

        tbody.appendChild(row);
    });
}

// --- VIEW: AUDIT LOGS HISTORY ---
async function renderAuditHistory(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Routine & CT History Logs</h2>
                <p>Change tracking history: audit list detailing who updated schedule routines and when.</p>
            </div>
        </div>

        <div class="glass-panel section-card">
            <h3>Schedule Audits Feed</h3>
            <div class="audit-log-list" id="audit-log-container">
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Loading audits feed...</div>
            </div>
        </div>
    `;

    const res = await apiFetch('/api/schedule/audit-logs');
    if (!res || !res.ok) return;

    const logs = await res.json();
    const containerEl = document.getElementById('audit-log-container');
    containerEl.innerHTML = '';

    if (logs.length === 0) {
        containerEl.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No audits recorded yet.</div>`;
        return;
    }

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = `glass-panel audit-log-item ${log.action}`;
        
        item.innerHTML = `
            <div class="audit-meta">
                <span><i class="fa-solid fa-user-pen"></i> Changed by: <strong>${log.changedBy}</strong></span>
                <span><i class="fa-solid fa-clock"></i> ${formatDateTime(log.timestamp)}</span>
            </div>
            <div class="audit-desc">
                <span class="tag" style="text-transform:uppercase; margin-right: 0.5rem; background: rgba(0,0,0,0.3); font-weight:700;">${log.action}</span>
                ${log.details}
            </div>
        `;
        containerEl.appendChild(item);
    });
}

// --- VIEW: SLOT DETECTOR (TEACHER) ---
function renderSlotDetector(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>CT Free Slot Finder</h2>
                <p>Scans weekly class routines and exams schedules to discover free tutoring or test timeslots.</p>
            </div>
        </div>

        <div class="dashboard-grid">
            <!-- Parameters Panel -->
            <div class="glass-panel section-card" style="height: fit-content;">
                <h3>Search Parameters</h3>
                <form id="form-scan-slots">
                    <div class="form-group">
                        <label for="slot-date">Target Date</label>
                        <input type="date" id="slot-date" class="form-input" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="slot-duration">Required Duration (Minutes)</label>
                        <select id="slot-duration" required>
                            <option value="30">30 mins</option>
                            <option value="45" selected>45 mins</option>
                            <option value="60">60 mins</option>
                            <option value="90">90 mins (1.5 Hours)</option>
                            <option value="120">120 mins (2 Hours)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Detect Free Slots
                    </button>
                </form>
            </div>

            <!-- Free Slots Panel -->
            <div class="glass-panel section-card">
                <h3>Recommended Free Slots</h3>
                <p style="font-size:0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    The system scans standard hours (08:00 AM - 06:00 PM). Click on a recommended slot to schedule.
                </p>
                <div class="slots-container" id="slots-results-host">
                    <div class="no-slots">Enter scan parameters to detect available slots.</div>
                </div>
            </div>
        </div>

        <!-- Schedule CT Modal (embedded card, toggled programmatically) -->
        <div class="glass-panel section-card" id="ct-schedule-modal" style="display: none; margin-top: 2rem;">
            <h3>Schedule Test in Selected Slot</h3>
            <form id="form-schedule-detected-ct" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="modal-course">Course Name</label>
                    <input type="text" id="modal-course" class="form-input" value="CSE 3101 - Database Systems" required>
                </div>
                <div class="form-group">
                    <label for="modal-datetime">Scheduled Date & Time</label>
                    <input type="datetime-local" id="modal-datetime" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="modal-duration">Duration (mins)</label>
                    <input type="number" id="modal-duration" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="modal-room">Room Number</label>
                    <input type="text" id="modal-room" class="form-input" value="302" required>
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="modal-topic">Syllabus Topic</label>
                    <input type="text" id="modal-topic" class="form-input" required placeholder="e.g. Normalization and B-Trees">
                </div>
                <div style="grid-column: 1 / -1; display:flex; gap:1rem; margin-top: 0.5rem;">
                    <button type="submit" class="btn" style="width: auto;">Confirm CT Schedule</button>
                    <button type="button" class="btn btn-secondary" id="btn-close-modal" style="width: auto;">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('form-scan-slots').addEventListener('submit', scanFreeSlots);
    document.getElementById('btn-close-modal').addEventListener('click', () => {
        document.getElementById('ct-schedule-modal').style.display = 'none';
    });
    document.getElementById('form-schedule-detected-ct').addEventListener('submit', confirmModalCtSchedule);
}

async function scanFreeSlots(e) {
    e.preventDefault();
    const date = document.getElementById('slot-date').value;
    const duration = document.getElementById('slot-duration').value;

    const res = await apiFetch(`/api/slots/detect?date=${date}&duration=${duration}`);
    if (!res || !res.ok) return;

    const slots = await res.json();
    const host = document.getElementById('slots-results-host');
    host.innerHTML = '';

    // Close scheduling modal if visible
    document.getElementById('ct-schedule-modal').style.display = 'none';

    if (slots.length === 0) {
        host.innerHTML = `<div class="no-slots" style="color:var(--danger);"><i class="fa-solid fa-circle-exclamation"></i> No free slots found for the requested duration on this date.</div>`;
        return;
    }

    slots.forEach(slot => {
        const btn = document.createElement('div');
        btn.className = 'slot-pill';
        btn.innerHTML = `<i class="fa-solid fa-circle-plus"></i> ${slot.start.substring(0,5)} - ${slot.end.substring(0,5)}`;
        
        btn.addEventListener('click', () => {
            // Open schedule CT form prefilled
            const modal = document.getElementById('ct-schedule-modal');
            modal.style.display = 'block';
            
            // Format datetime: YYYY-MM-DDThh:mm
            const dateTimeStr = `${date}T${slot.start.substring(0,5)}`;
            document.getElementById('modal-datetime').value = dateTimeStr;
            document.getElementById('modal-duration').value = duration;
            modal.scrollIntoView({ behavior: 'smooth' });
        });
        
        host.appendChild(btn);
    });
}

async function confirmModalCtSchedule(e) {
    e.preventDefault();
    const courseName = document.getElementById('modal-course').value;
    const dateTime = document.getElementById('modal-datetime').value;
    const durationMinutes = document.getElementById('modal-duration').value;
    const roomNo = document.getElementById('modal-room').value;
    const topic = document.getElementById('modal-topic').value;

    const res = await apiFetch('/api/schedule/ct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseName, dateTime, durationMinutes: parseInt(durationMinutes), roomNo, topic })
    });

    if (res && res.ok) {
        showToast("Class test scheduled successfully!");
        document.getElementById('ct-schedule-modal').style.display = 'none';
        
        // Re-scan to update slots visualizer
        const date = document.getElementById('slot-date').value;
        const duration = document.getElementById('slot-duration').value;
        const mockEvent = { preventDefault: () => {} };
        scanFreeSlots(mockEvent);
    } else {
        showToast("Failed to schedule class test", "error");
    }
}

// --- VIEW: EXAM / GOOGLE-FORM CREATOR (TEACHER) ---
function renderExamCreator(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Google Forms Exam Creator</h2>
                <p>Compose assessments containing multiple-choice and short answer questions.</p>
            </div>
        </div>

        <div class="glass-panel exam-creator-card">
            <h3>Exam Settings</h3>
            <form id="form-create-full-exam">
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
                    <div class="form-group">
                        <label for="ex-title">Exam Title</label>
                        <input type="text" id="ex-title" class="form-input" required placeholder="e.g. Database Normalization Quiz">
                    </div>
                    <div class="form-group">
                        <label for="ex-duration">Duration (Minutes)</label>
                        <input type="number" id="ex-duration" class="form-input" required value="20" min="5">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="ex-desc">Short Description</label>
                        <input type="text" id="ex-desc" class="form-input" placeholder="e.g. Covers 1NF, 2NF, 3NF and BCNF problems.">
                    </div>
                    <div class="form-group">
                        <label for="ex-start">Opens At</label>
                        <input type="datetime-local" id="ex-start" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="ex-end">Closes At</label>
                        <input type="datetime-local" id="ex-end" class="form-input" required>
                    </div>
                </div>

                <h3 style="margin-top:2rem; margin-bottom:1rem; border-left: 3px solid var(--accent-indigo); padding-left: 0.75rem;">Exam Questions</h3>
                <div id="exam-creator-questions-host">
                    <!-- Dynamic question blocks -->
                </div>

                <div style="display:flex; gap:1rem; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" id="btn-add-creator-q" style="width: auto;">
                        <i class="fa-solid fa-circle-plus"></i> Add Question
                    </button>
                    <button type="submit" class="btn" style="width: auto; background: linear-gradient(135deg, var(--success) 0%, #059669 100%); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Create & Publish Exam
                    </button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('btn-add-creator-q').addEventListener('click', addCreatorQuestionBlock);
    document.getElementById('form-create-full-exam').addEventListener('submit', handleCreateFullExam);
    
    // Add first question automatically
    addCreatorQuestionBlock();
}

let questionIndexCount = 0;

function addCreatorQuestionBlock() {
    const host = document.getElementById('exam-creator-questions-host');
    const idx = questionIndexCount++;
    
    const block = document.createElement('div');
    block.className = 'question-block';
    block.id = `creator-q-block-${idx}`;
    
    block.innerHTML = `
        <button type="button" class="btn-remove"><i class="fa-solid fa-trash-can"></i> Remove</button>
        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:1rem; margin-bottom: 1rem;">
            <div class="form-group">
                <label>Question Text</label>
                <input type="text" class="form-input q-text" required placeholder="Type the question statement...">
            </div>
            <div class="form-group">
                <label>Question Type</label>
                <select class="q-type" required>
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                </select>
            </div>
            <div class="form-group">
                <label>Points</label>
                <input type="number" class="form-input q-points" required value="5" min="1">
            </div>
        </div>

        <div class="mcq-details-area">
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Choices Options (semicolon-separated)</label>
                <input type="text" class="form-input q-options" placeholder="Option A;Option B;Option C;Option D" value="Option A;Option B;Option C;Option D">
            </div>
        </div>

        <div class="form-group">
            <label>Correct Answer Value (Exact string match)</label>
            <input type="text" class="form-input q-correct" required placeholder="e.g. Option B, or SHORT_ANSWER answer">
        </div>
    `;

    block.querySelector('.btn-remove').addEventListener('click', () => {
        if (host.children.length > 1) {
            block.remove();
        } else {
            showToast("An exam must have at least one question", "warning");
        }
    });

    const typeSelect = block.querySelector('.q-type');
    const mcqArea = block.querySelector('.mcq-details-area');
    
    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'MCQ') {
            mcqArea.style.display = 'block';
        } else {
            mcqArea.style.display = 'none';
        }
    });

    host.appendChild(block);
}

async function handleCreateFullExam(e) {
    e.preventDefault();
    const title = document.getElementById('ex-title').value;
    const description = document.getElementById('ex-desc').value;
    const durationMinutes = parseInt(document.getElementById('ex-duration').value);
    const startTime = document.getElementById('ex-start').value;
    const endTime = document.getElementById('ex-end').value;

    const questions = [];
    document.querySelectorAll('.question-block').forEach(block => {
        const questionText = block.querySelector('.q-text').value;
        const questionType = block.querySelector('.q-type').value;
        const points = parseInt(block.querySelector('.q-points').value);
        const options = questionType === 'MCQ' ? block.querySelector('.q-options').value : null;
        const correctAnswer = block.querySelector('.q-correct').value;

        questions.push({ questionText, questionType, points, options, correctAnswer });
    });

    try {
        const res = await apiFetch('/api/exams/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, durationMinutes, startTime, endTime, questions })
        });

        if (res && res.ok) {
            showToast("Google Form exam published successfully!");
            switchView('dashboard');
        } else {
            showToast("Failed to create exam", "error");
        }
    } catch (e) {
        showToast("Server connection error", "error");
    }
}

// --- VIEW: GRADES & SUBMISSIONS MANAGER (TEACHER) ---
async function renderGradesManager(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Grades & Exam Results Inspector</h2>
                <p>Inspect student quiz submissions or upload direct performance results.</p>
            </div>
        </div>

        <div class="dashboard-grid">
            
            <!-- Upload Marks direct form -->
            <div class="glass-panel section-card" style="height: fit-content;">
                <h3>Upload Course Marks</h3>
                <form id="form-upload-grade">
                    <div class="form-group">
                        <label for="gd-username">Student Username</label>
                        <select id="gd-username" required>
                            <!-- Seeded students list -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gd-course">Course Name</label>
                        <select id="gd-course" required>
                            <option value="CSE 3101 - Database Systems">CSE 3101 - Database Systems</option>
                            <option value="CSE 3103 - Software Engineering">CSE 3103 - Software Engineering</option>
                            <option value="CSE 3105 - Compiler Design">CSE 3105 - Compiler Design</option>
                            <option value="CSE 3107 - Computer Networks">CSE 3107 - Computer Networks</option>
                            <option value="HUM 3109 - Technical Writing">HUM 3109 - Technical Writing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gd-assess">Assessment Type</label>
                        <input type="text" id="gd-assess" class="form-input" required placeholder="e.g. CT 2, Midterm, Lab Final">
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label for="gd-obtained">Marks Obtained</label>
                            <input type="number" id="gd-obtained" class="form-input" required step="0.5" min="0">
                        </div>
                        <div class="form-group">
                            <label for="gd-max">Maximum Marks</label>
                            <input type="number" id="gd-max" class="form-input" required step="0.5" value="20" min="1">
                        </div>
                    </div>
                    <button type="submit" class="btn" style="margin-top: 1rem;">
                        <i class="fa-solid fa-circle-check"></i> Save Grades Entry
                    </button>
                </form>
            </div>

            <!-- Inspect Exam quiz submissions -->
            <div class="glass-panel section-card">
                <h3>Quiz Submissions Inspector</h3>
                <div class="form-group">
                    <label for="gd-exam-select">Select Published Quiz</label>
                    <select id="gd-exam-select" required>
                        <option value="">-- Choose Quiz Exam --</option>
                    </select>
                </div>
                
                <div class="routine-table-container" style="margin-top: 1rem;">
                    <table class="routine-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Username</th>
                                <th>Submitted At</th>
                                <th>Score Achieved</th>
                            </tr>
                        </thead>
                        <tbody id="quiz-subs-tbody">
                            <tr><td colspan="4" style="text-align: center; color:var(--text-secondary);">Select an exam above to view submissions</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    loadStudentsDropdown();
    loadExamsDropdown();
    
    document.getElementById('form-upload-grade').addEventListener('submit', handleUploadGrade);
    document.getElementById('gd-exam-select').addEventListener('change', inspectQuizSubmissions);
}

async function loadStudentsDropdown() {
    // We can fetch from backend users, but to make it simple we load options since they are seeded.
    const select = document.getElementById('gd-username');
    select.innerHTML = `
        <option value="student1">Nafis Sadik (student1)</option>
        <option value="student2">Sultana Razia (student2)</option>
        <option value="student3">Abid Hasan (student3)</option>
        <option value="student4">Mehnaz Chowdhury (student4)</option>
        <option value="cr1">Tanvir Ahmed (cr1)</option>
    `;
}

async function loadExamsDropdown() {
    const res = await apiFetch('/api/exams');
    if (!res || !res.ok) return;

    const list = await res.json();
    const select = document.getElementById('gd-exam-select');
    
    list.forEach(ex => {
        const opt = document.createElement('option');
        opt.value = ex.id;
        opt.innerText = ex.title;
        select.appendChild(opt);
    });
}

async function inspectQuizSubmissions() {
    const examId = document.getElementById('gd-exam-select').value;
    const tbody = document.getElementById('quiz-subs-tbody');
    
    if (!examId) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color:var(--text-secondary);">Select an exam above to view submissions</td></tr>`;
        return;
    }

    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Loading submissions...</td></tr>`;

    const res = await apiFetch(`/api/exams/${examId}/submissions`);
    if (!res || !res.ok) return;

    const list = await res.json();
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No responses submitted for this quiz yet.</td></tr>`;
        return;
    }

    list.forEach(sub => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:600;">${sub.studentName}</td>
            <td>@${sub.studentUsername}</td>
            <td style="font-size:0.85rem;">${formatDateTime(sub.submittedAt)}</td>
            <td style="font-weight:700; color:var(--accent-blue); font-family:'Space Grotesk',sans-serif;">${sub.score} pts</td>
        `;
        tbody.appendChild(row);
    });
}

async function handleUploadGrade(e) {
    e.preventDefault();
    const studentUsername = document.getElementById('gd-username').value;
    const courseName = document.getElementById('gd-course').value;
    const assessmentName = document.getElementById('gd-assess').value;
    const marksObtained = parseFloat(document.getElementById('gd-obtained').value);
    const maxMarks = parseFloat(document.getElementById('gd-max').value);

    if (marksObtained > maxMarks) {
        showToast("Obtained marks cannot exceed maximum marks", "error");
        return;
    }

    try {
        const res = await apiFetch('/api/dashboard/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentUsername, courseName, assessmentName, marksObtained, maxMarks })
        });

        if (res && res.ok) {
            showToast("Academic grade entry recorded!");
            document.getElementById('gd-assess').value = '';
            document.getElementById('gd-obtained').value = '';
        } else {
            showToast("Failed to upload grade", "error");
        }
    } catch (e) {
        showToast("Server communication error", "error");
    }
}

// --- VIEW: MANAGEMENT CENTER ---
async function renderAdminApprovals(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Management Center</h2>
                <p>Approve registration requests, configure dropdown options, and handle profile update verification requests.</p>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2rem; width: 100%;">
            <!-- 1. Pending Registrations -->
            <div class="glass-panel section-card">
                <h3>Pending Registration Requests</h3>
                <div class="routine-table-container">
                    <table class="routine-table">
                        <thead>
                            <tr>
                                <th>Name & Username</th>
                                <th>Email & ID</th>
                                <th>Details</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="mgmt-pending-tbody">
                            <tr><td colspan="5" style="text-align: center;">Loading requests...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 2. System Metadata dropdown settings -->
            <div class="glass-panel section-card">
                <h3>Dropdown Options Configuration</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">Configure the active semesters, departments, Batchs, and designations available in registration and profile sheets.</p>
                <div class="dashboard-grid" style="grid-template-columns: 1fr 2fr; gap: 2rem;">
                    <!-- Add option form -->
                    <div class="glass-panel" style="padding: 1.5rem; background: rgba(255,255,255,0.25); border: 1px solid var(--glass-border);">
                        <h4 style="margin-bottom: 1rem;">Add New Option</h4>
                        <form id="form-add-metadata">
                            <div class="form-group">
                                <label for="meta-type">Option Type</label>
                                <select id="meta-type" required>
                                    <option value="DEPARTMENT">Department</option>
                                    <option value="SEMESTER">Semester</option>
                                    <option value="Batch">Batch</option>
                                    <option value="DESIGNATION">Designation</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-top: 1rem;">
                                <label for="meta-value">Option Value</label>
                                <input type="text" id="meta-value" class="form-input" required placeholder="e.g. CSE - Computer Science">
                            </div>
                            <button type="submit" class="btn" style="margin-top: 1.5rem; padding: 0.5rem;">Add Option</button>
                        </form>
                    </div>

                    <!-- Current Options List -->
                    <div>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.5rem;">
                            <button class="btn btn-secondary filter-meta active" data-type="DEPARTMENT" style="width: auto; padding: 0.4rem 1rem; font-size: 0.85rem;">Departments</button>
                            <button class="btn btn-secondary filter-meta" data-type="SEMESTER" style="width: auto; padding: 0.4rem 1rem; font-size: 0.85rem;">Semesters</button>
                            <button class="btn btn-secondary filter-meta" data-type="BATCH" style="width: auto; padding: 0.4rem 1rem; font-size: 0.85rem;">Batches</button>
                            <button class="btn btn-secondary filter-meta" data-type="DESIGNATION" style="width: auto; padding: 0.4rem 1rem; font-size: 0.85rem;">Designations</button>
                        </div>
                        <div class="routine-table-container" style="max-height: 250px; overflow-y: auto;">
                            <table class="routine-table">
                                <thead>
                                    <tr>
                                        <th>Value</th>
                                        <th style="width: 80px; text-align: right;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="meta-list-tbody">
                                    <tr><td colspan="2" style="text-align: center;">Loading options...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. ADMIN-ONLY: Pending Profile Updates and Admin creation -->
            <div id="admin-only-sections" style="display: none; flex-direction: column; gap: 2rem;">
                <div class="glass-panel section-card">
                    <h3>Pending Profile Verification Requests</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">Approve or reject updates to sensitive user profile fields before they take effect.</p>
                    <div class="routine-table-container">
                        <table class="routine-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Proposed Profile Updates</th>
                                    <th>Submission Date</th>
                                    <th style="width: 200px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="mgmt-profile-tbody">
                                <tr><td colspan="4" style="text-align: center;">Loading requests...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="glass-panel section-card" style="max-width: 600px;">
                    <h3>Administrator Management</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">Create additional system administrator accounts.</p>
                    <form id="form-create-admin">
                        <div class="form-group">
                            <label for="adm-username">Username</label>
                            <input type="text" id="adm-username" class="form-input" required placeholder="e.g. admin2">
                        </div>
                        <div class="form-group" style="margin-top: 0.5rem;">
                            <label for="adm-fullname">Full Name</label>
                            <input type="text" id="adm-fullname" class="form-input" required placeholder="e.g. John Doe">
                        </div>
                        <div class="form-group" style="margin-top: 0.5rem;">
                            <label for="adm-email">Email Address</label>
                            <input type="email" id="adm-email" class="form-input" required placeholder="e.g. john@ustc.edu">
                        </div>
                        <div class="form-group" style="margin-top: 0.5rem;">
                            <label for="adm-password">Password</label>
                            <input type="password" id="adm-password" class="form-input" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn" style="margin-top: 1rem;">
                            <i class="fa-solid fa-user-shield"></i> Create Admin Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    loadMgmtPendingRequests();
    loadMgmtMetadata('DEPARTMENT');

    document.getElementById('form-add-metadata').addEventListener('submit', handleAddMetadata);

    document.querySelectorAll('.filter-meta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-meta').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const type = e.currentTarget.getAttribute('data-type');
            loadMgmtMetadata(type);
        });
    });

    if (state.user.role === 'ADMIN') {
        document.getElementById('admin-only-sections').style.display = 'flex';
        loadMgmtProfileRequests();
        document.getElementById('form-create-admin').addEventListener('submit', handleCreateAdmin);
    }
}

async function loadMgmtPendingRequests() {
    const res = await apiFetch('/api/approvals/pending');
    if (!res || !res.ok) return;

    const list = await res.json();
    const tbody = document.getElementById('mgmt-pending-tbody');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No pending registration requests.</td></tr>`;
        return;
    }

    list.forEach(req => {
        let details = `Department: ${req.department || 'N/A'}`;
        if (req.role === 'STUDENT' || req.role === 'CR') {
            details += `<br/>Batch: ${req.batch || 'N/A'} | Semester: ${req.semester || 'N/A'}`;
            if (req.section) details += ` | Section: ${req.section}`;
        } else if (req.role === 'TEACHER') {
            details += `<br/>Designation: ${req.designation || 'N/A'}`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="font-weight:600;">${req.fullName}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">@${req.username}</div>
            </td>
            <td>
                <div>${req.email}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">ID: ${req.idNo || 'N/A'}</div>
            </td>
            <td style="font-size: 0.85rem; color: var(--text-secondary);">${details}</td>
            <td><span class="routine-day-badge" style="background: rgba(0, 113, 227, 0.15); border-color: rgba(0, 113, 227, 0.3); color: var(--accent-blue); font-size:0.75rem;">${req.role}</span></td>
            <td>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-approve" data-id="${req.id}" style="background:linear-gradient(135deg, #30d158 0%, #249d41 100%); box-shadow:none; padding: 0.35rem 0.75rem; font-size: 0.75rem; width:auto;">Approve</button>
                    <button class="btn btn-danger btn-reject" data-id="${req.id}" style="box-shadow:none; padding: 0.35rem 0.75rem; font-size: 0.75rem; width:auto;">Reject</button>
                </div>
            </td>
        `;

        row.querySelector('.btn-approve').addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const response = await apiFetch(`/api/approvals/approve/${id}`, { method: 'POST' });
            if (response && response.ok) {
                showToast("Account approved successfully!");
                loadMgmtPendingRequests();
            } else if (response) {
                const err = await response.json();
                showToast(err.error || "Approval failed", "error");
            }
        });

        row.querySelector('.btn-reject').addEventListener('click', async (e) => {
            if (confirm("Are you sure you want to reject and delete this registration request?")) {
                const id = e.currentTarget.getAttribute('data-id');
                const response = await apiFetch(`/api/approvals/reject/${id}`, { method: 'DELETE' });
                if (response && response.ok) {
                    showToast("Registration request rejected", "warning");
                    loadMgmtPendingRequests();
                } else if (response) {
                    const err = await response.json();
                    showToast(err.error || "Rejection failed", "error");
                }
            }
        });

        tbody.appendChild(row);
    });
}

async function loadMgmtMetadata(type) {
    const tbody = document.getElementById('meta-list-tbody');
    tbody.innerHTML = `<tr><td colspan="2" style="text-align: center;">Loading options...</td></tr>`;

    try {
        const res = await fetch('/api/metadata');
        if (res.ok) {
            const list = await res.json();
            const filtered = list.filter(item => item.type === type);
            tbody.innerHTML = '';

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-secondary);">No options found for this type.</td></tr>`;
                return;
            }

            filtered.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.value}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-danger btn-delete-meta" data-id="${item.id}" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; width: auto; box-shadow: none;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;

                row.querySelector('.btn-delete-meta').addEventListener('click', async (e) => {
                    if (confirm(`Are you sure you want to delete the option "${item.value}"?`)) {
                        const id = e.currentTarget.getAttribute('data-id');
                        const response = await apiFetch(`/api/metadata/${id}`, { method: 'DELETE' });
                        if (response && response.ok) {
                            showToast("Option deleted successfully!");
                            loadMgmtMetadata(type);
                        } else if (response) {
                            const err = await response.json();
                            showToast(err.error || "Failed to delete option", "error");
                        }
                    }
                });

                tbody.appendChild(row);
            });
        }
    } catch (e) {
        showToast("Error loading dropdown options", "error");
    }
}

async function handleAddMetadata(e) {
    e.preventDefault();
    const type = document.getElementById('meta-type').value;
    const value = document.getElementById('meta-value').value;

    try {
        const res = await apiFetch('/api/metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, value })
        });

        if (res && res.ok) {
            showToast("New dropdown option added!");
            document.getElementById('meta-value').value = '';
            document.querySelectorAll('.filter-meta').forEach(b => {
                if (b.getAttribute('data-type') === type) {
                    b.click();
                }
            });
        } else if (res) {
            const err = await res.json();
            showToast(err.error || "Failed to add option", "error");
        }
    } catch (err) {
        showToast("Error adding metadata", "error");
    }
}

async function loadMgmtProfileRequests() {
    const res = await apiFetch('/api/approvals/profile-requests');
    if (!res || !res.ok) return;

    const list = await res.json();
    const tbody = document.getElementById('mgmt-profile-tbody');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No pending profile update requests.</td></tr>`;
        return;
    }

    list.forEach(req => {
        let updatesHtml = '';
        const user = req.user;

        const checkField = (fieldLabel, newValue, oldValue) => {
            if (newValue && newValue !== oldValue) {
                updatesHtml += `<div><strong>${fieldLabel}</strong>: <span style="text-decoration:line-through; color:var(--danger);">${oldValue || '(Empty)'}</span> &rarr; <span style="color:var(--success); font-weight:600;">${newValue}</span></div>`;
            }
        };

        checkField("Full Name", req.newFullName, user.fullName);
        checkField("Email", req.newEmail, user.email);
        checkField("ID No.", req.newIdNo, user.idNo);
        checkField("Department", req.newDepartment, user.department);
        checkField("Batch", req.newBatch, user.batch);
        checkField("Semester", req.newSemester, user.semester);
        checkField("Section", req.newSection, user.section);
        checkField("Designation", req.newDesignation, user.designation);

        const date = new Date(req.createdAt).toLocaleString();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="font-weight:600;">${user.fullName}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">@${user.username} (${user.role})</div>
            </td>
            <td style="font-size: 0.85rem; line-height: 1.5;">${updatesHtml}</td>
            <td style="font-size: 0.8rem; color: var(--text-muted);">${date}</td>
            <td>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-approve-prof" data-id="${req.id}" style="background:linear-gradient(135deg, #30d158 0%, #249d41 100%); box-shadow:none; padding: 0.35rem 0.75rem; font-size: 0.75rem; width:auto;">Verify</button>
                    <button class="btn btn-danger btn-reject-prof" data-id="${req.id}" style="box-shadow:none; padding: 0.35rem 0.75rem; font-size: 0.75rem; width:auto;">Reject</button>
                </div>
            </td>
        `;

        row.querySelector('.btn-approve-prof').addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const response = await apiFetch(`/api/approvals/profile-requests/${id}/approve`, { method: 'POST' });
            if (response && response.ok) {
                showToast("Profile change request verified and applied!");
                loadMgmtProfileRequests();
            } else if (response) {
                const err = await response.json();
                showToast(err.error || "Approval failed", "error");
            }
        });

        row.querySelector('.btn-reject-prof').addEventListener('click', async (e) => {
            if (confirm("Are you sure you want to reject this profile change request?")) {
                const id = e.currentTarget.getAttribute('data-id');
                const response = await apiFetch(`/api/approvals/profile-requests/${id}/reject`, { method: 'POST' });
                if (response && response.ok) {
                    showToast("Profile change request rejected", "warning");
                    loadMgmtProfileRequests();
                } else if (response) {
                    const err = await response.json();
                    showToast(err.error || "Rejection failed", "error");
                }
            }
        });

        tbody.appendChild(row);
    });
}

async function handleCreateAdmin(e) {
    e.preventDefault();
    const username = document.getElementById('adm-username').value;
    const fullName = document.getElementById('adm-fullname').value;
    const email = document.getElementById('adm-email').value;
    const password = document.getElementById('adm-password').value;

    try {
        const res = await apiFetch('/api/approvals/admin-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, fullName, email, password })
        });

        if (res && res.ok) {
            showToast("System administrator account created successfully!");
            document.getElementById('form-create-admin').reset();
        } else if (res) {
            const err = await res.json();
            showToast(err.error || "Failed to create administrator", "error");
        }
    } catch (err) {
        showToast("Error creating administrator", "error");
    }
}
function renderAnnouncements(host) {
    const canPublish = state.user.role === 'CR' || state.user.role === 'TEACHER' || state.user.role === 'ADMIN';
    host.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Announcements</h2>
                <p>Important notices from teachers, CRs, or admins.</p>
            </div>
            ${canPublish ? `<button class="btn" id="btn-open-announce-modal" style="width: auto; padding: 0.6rem 1.25rem; font-size: 0.9rem;"><i class="fa-solid fa-plus"></i> Publish Notice</button>` : ''}
        </div>

        <div id="announcements-feed-host">
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading announcements...</div>
        </div>

        <!-- Publish Announcement Modal -->
        <div id="announce-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 200; justify-content: center; align-items: center;">
            <div class="glass-panel" style="max-width: 520px; width: 90%; padding: 2rem; background: rgba(255,255,255,0.92); border: 1px solid var(--glass-border); border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                <h3 style="margin-bottom: 1.25rem; font-family: 'Space Grotesk', sans-serif;"><i class="fa-solid fa-bullhorn" style="margin-right: 0.4rem;"></i> Publish Announcement</h3>
                <form id="form-publish-announce">
                    <div class="form-group">
                        <label for="announce-title">Title</label>
                        <input type="text" id="announce-title" class="form-input" required placeholder="e.g. CT 2 Postponed">
                    </div>
                    <div class="form-group" style="margin-top: 0.8rem;">
                        <label for="announce-content">Content</label>
                        <textarea id="announce-content" class="form-input" required rows="4" placeholder="Write your announcement details here..." style="resize: vertical; min-height: 80px;"></textarea>
                    </div>
                    ${state.user.role !== 'CR' ? `<div class="form-group" style="margin-top: 0.8rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="announce-global" checked> <span style="font-size: 0.85rem;">Global announcement (visible to all)</span>
                        </label>
                    </div>` : ''}
                    <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                        <button type="submit" class="btn" style="flex: 1;"><i class="fa-solid fa-paper-plane"></i> Publish</button>
                        <button type="button" class="btn btn-secondary" id="btn-close-announce-modal" style="flex: 0.5;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    loadAnnouncementsFeed();

    if (canPublish) {
        const modal = document.getElementById('announce-modal-overlay');
        document.getElementById('btn-open-announce-modal').addEventListener('click', () => { modal.style.display = 'flex'; });
        document.getElementById('btn-close-announce-modal').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

        document.getElementById('form-publish-announce').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('announce-title').value;
            const content = document.getElementById('announce-content').value;
            const globalEl = document.getElementById('announce-global');
            const isGlobal = globalEl ? globalEl.checked : false;

            try {
                const res = await apiFetch('/api/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content, global: isGlobal })
                });
                if (res && res.ok) {
                    showToast('Announcement published!');
                    modal.style.display = 'none';
                    document.getElementById('form-publish-announce').reset();
                    loadAnnouncementsFeed();
                } else if (res) {
                    const err = await res.json();
                    showToast(err.error || 'Failed to publish', 'error');
                }
            } catch (err) {
                showToast('Error publishing announcement', 'error');
            }
        });
    }
}

async function loadAnnouncementsFeed() {
    const res = await apiFetch('/api/announcements');
    if (!res || !res.ok) return;

    const announcements = await res.json();
    const host = document.getElementById('announcements-feed-host');
    host.innerHTML = '';

    // Mark all as read when viewing the announcements page
    const readIds = JSON.parse(localStorage.getItem('learnx_read_announcements') || '[]');
    announcements.forEach(a => readIds.push(a.id));
    localStorage.setItem('learnx_read_announcements', JSON.stringify([...new Set(readIds)]));

    if (announcements.length === 0) {
        host.innerHTML = `<div class="glass-panel" style="padding: 2.5rem; text-align: center;">
            <i class="fa-solid fa-bullhorn" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>No Announcements Yet</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Check back later for important updates.</p>
        </div>`;
        return;
    }

    announcements.forEach(a => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.cssText = 'padding: 1.5rem; margin-bottom: 1rem; border-radius: 16px; transition: all 0.25s ease;';

        const roleColors = { 'ADMIN': 'var(--danger)', 'TEACHER': 'var(--accent-blue)', 'CR': 'var(--warning)' };
        const roleColor = roleColors[a.createdByRole] || 'var(--text-muted)';
        const initial = a.createdBy ? a.createdBy.charAt(0).toUpperCase() : '?';

        const canDelete = state.user.role === 'ADMIN' || state.user.role === 'TEACHER' || a.createdBy === state.user.fullName;
        const deleteBtn = canDelete ? `<button class="btn-del-announce" data-id="${a.id}" style="background: none; border: none; cursor: pointer; color: var(--danger); font-size: 0.85rem; opacity: 0.6; transition: opacity 0.2s;" title="Delete"><i class="fa-solid fa-trash-can"></i></button>` : '';

        card.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: ${roleColor}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; flex-shrink: 0;">${initial}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-weight: 700; font-size: 0.9rem;">${a.createdBy}</span>
                            <span class="routine-day-badge" style="font-size: 0.6rem; padding: 1px 6px; background: ${roleColor}15; border-color: ${roleColor}40; color: ${roleColor};">${a.createdByRole}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 0.72rem; color: var(--text-muted);">${formatDateTime(a.createdAt)}</span>
                            ${deleteBtn}
                        </div>
                    </div>
                    <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--accent-blue); font-family: 'Space Grotesk', sans-serif; margin-bottom: 0.4rem;">${a.title}</h4>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55;">${a.content}</p>
                </div>
            </div>
        `;

        const delBtn = card.querySelector('.btn-del-announce');
        if (delBtn) {
            delBtn.addEventListener('mouseenter', () => { delBtn.style.opacity = '1'; });
            delBtn.addEventListener('mouseleave', () => { delBtn.style.opacity = '0.6'; });
            delBtn.addEventListener('click', async () => {
                if (confirm('Delete this announcement?')) {
                    const res = await apiFetch(`/api/announcements/${a.id}`, { method: 'DELETE' });
                    if (res && res.ok) {
                        showToast('Announcement deleted');
                        loadAnnouncementsFeed();
                    }
                }
            });
        }

        host.appendChild(card);
    });
}

async function renderSystemConfig(host) {
    host.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>System Config (Batches)</h2>
                <p>Manage active student batches from 1 to 99.</p>
            </div>
        </div>
        <div class="glass-panel" style="padding: 2.5rem; border: 1px solid var(--glass-border);">
            <h3>Add New Batch</h3>
            <form id="form-add-batch" style="display: flex; gap: 1rem; align-items: flex-end; margin-top: 1rem; margin-bottom: 2.5rem;">
                <div class="form-group" style="margin-bottom: 0; flex-grow: 1;">
                    <label for="new-batch-name">Batch Name/Number (e.g. 21)</label>
                    <input type="text" id="new-batch-name" class="form-input" required placeholder="Enter batch number...">
                </div>
                <button type="submit" class="btn" style="width: auto;"><i class="fa-solid fa-plus"></i> Add Batch</button>
            </form>
            
            <h3>Active Student Batches</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">The following batches are available for student registration and schedules.</p>
            <div id="batch-list-container">Loading batches...</div>
        </div>
    `;

    document.getElementById('form-add-batch').addEventListener('submit', async (e) => {
        e.preventDefault();
        const batchName = document.getElementById('new-batch-name').value.trim();
        try {
            const res = await apiFetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'BATCH', value: batchName })
            });
            if (res && res.ok) {
                showToast(`Batch ${batchName} added successfully.`);
                document.getElementById('new-batch-name').value = '';
                loadBatches();
            } else if (res) {
                const err = await res.json();
                showToast(err.error || 'Failed to add batch', 'error');
            }
        } catch (err) {
            showToast('Error connecting to server', 'error');
        }
    });

    async function loadBatches() {
        const container = document.getElementById('batch-list-container');
        try {
            const res = await fetch('/api/metadata');
            if (res.ok) {
                const metadata = await res.json();
                const batches = metadata.filter(m => m.type === 'BATCH');
                
                // Sort batches numerically
                batches.sort((a, b) => {
                    const numA = parseInt(a.value) || 0;
                    const numB = parseInt(b.value) || 0;
                    return numA - numB;
                });

                if (batches.length === 0) {
                    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1.5rem;">No active student batches defined.</p>';
                    return;
                }

                let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; max-height: 400px; overflow-y: auto; padding: 0.5rem 0.2rem;">';
                batches.forEach(m => {
                    html += `
                        <div class="glass-panel" style="padding: 0.75rem 1rem; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border-radius: 12px; transition: all 0.2s;">
                            <span style="font-weight: 600; font-family: \'Space Grotesk\', sans-serif;">Batch ${m.value}</span>
                            <button class="btn btn-danger btn-delete-batch" data-id="${m.id}" data-value="${m.value}" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; width: auto; min-width: 0; box-shadow: none; border-radius: 8px;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                });
                html += '</div>';
                container.innerHTML = html;

                // Add delete listeners
                container.querySelectorAll('.btn-delete-batch').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        const val = e.currentTarget.getAttribute('data-value');
                        if (confirm(`Are you sure you want to delete "Batch ${val}"?`)) {
                            try {
                                const response = await apiFetch(`/api/metadata/${id}`, { method: 'DELETE' });
                                if (response && response.ok) {
                                    showToast(`Batch ${val} deleted successfully!`);
                                    loadBatches();
                                } else if (response) {
                                    const err = await response.json();
                                    showToast(err.error || 'Failed to delete batch', 'error');
                                }
                            } catch (err) {
                                showToast('Error connecting to server', 'error');
                            }
                        }
                    });
                });
            } else {
                container.innerHTML = '<p style="color: var(--danger);">Failed to load metadata.</p>';
            }
        } catch (err) {
            container.innerHTML = '<p style="color: var(--danger);">Error connecting to server.</p>';
        }
    }
    
    loadBatches();
}




// --- VIEW: TRIPLE-MODE SCHEDULE CALENDAR (STUDENT) ---
// --- VIEW: TRIPLE-MODE SCHEDULE CALENDAR (STUDENT) ---
async function renderStudentSchedule(container) {
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Class Schedule & Calendar</h2>
                <p>View your daily timeline, weekly routine grid, and monthly calendar.</p>
            </div>
        </div>
        <div class="glass-panel section-card">
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                <button class="btn sched-tab active" data-tab="today" style="width: auto;">Today's Timeline</button>
                <button class="btn btn-secondary sched-tab" data-tab="weekly" style="width: auto;">Weekly Grid</button>
                <button class="btn btn-secondary sched-tab" data-tab="monthly" style="width: auto;">Monthly View</button>
            </div>
            <div id="schedule-content-host" style="min-height: 400px; position: relative;">
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading schedule data...</div>
            </div>
        </div>
    `;

    const tabs = container.querySelectorAll('.sched-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.classList.add('btn-secondary');
                t.style.background = 'transparent';
                t.style.color = 'var(--text-primary)';
            });
            e.target.classList.add('active');
            e.target.classList.remove('btn-secondary');
            e.target.style.background = 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)';
            e.target.style.color = '#fff';
            
            const tabName = e.target.getAttribute('data-tab');
            renderScheduleTab(tabName);
        });
    });

    // Initialize styling for first active tab
    const firstTab = container.querySelector('.sched-tab.active');
    if (firstTab) {
        firstTab.classList.remove('btn-secondary');
        firstTab.style.background = 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)';
        firstTab.style.color = '#fff';
    }

    // Load data
    const [routineRes, ctRes] = await Promise.all([
        apiFetch('/api/schedule/routine'),
        apiFetch('/api/schedule/ct')
    ]);

    if (routineRes && routineRes.ok && ctRes && ctRes.ok) {
        state.routineData = await routineRes.json();
        state.ctData = await ctRes.json();
        renderScheduleTab('today');
    }
}

function renderScheduleTab(tabName) {
    const host = document.getElementById('schedule-content-host');
    host.innerHTML = '';
    
    if (tabName === 'today') {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const today = days[new Date().getDay()];
        const todayClasses = state.routineData.filter(item => item.dayOfWeek === today);
        todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (todayClasses.length === 0) {
            host.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 3rem;">No classes today.</div>`;
            return;
        }

        let html = '<div class="timeline-list">';
        todayClasses.forEach(item => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-card glass-panel" style="padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                        <div class="timeline-time" style="font-weight:700; color:var(--accent-blue); margin-bottom:0.25rem;">${item.startTime.substring(0,5)} - ${item.endTime.substring(0,5)}</div>
                        <div class="timeline-subject" style="font-size:1.1rem; margin-bottom:0.5rem;">${item.courseName}</div>
                        <div class="timeline-details" style="font-size:0.85rem; color:var(--text-secondary); display:flex; gap:1rem;">
                            <span><i class="fa-solid fa-chalkboard-user"></i> ${item.teacherName || 'TBA'}</span>
                            <span><i class="fa-solid fa-location-dot"></i> Room ${item.roomNo || 'TBA'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        host.innerHTML = html;
    } else if (tabName === 'weekly') {
        // Build weekly grid
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        
        let html = `<div class="schedule-weekly-grid" style="display:grid; grid-template-columns: 100px repeat(6, 1fr); gap: 0.5rem; overflow-x: auto; padding-bottom: 1rem;">`;
        
        // Header
        html += `<div style="font-weight:700; color:var(--text-secondary); padding:0.5rem;">Time / Day</div>`;
        for (let i=0; i<6; i++) {
            html += `<div style="font-weight:700; color:var(--accent-blue); text-align:center; padding:0.5rem;">${days[i].substring(0,3)}</div>`;
        }

        // We assume timeslots are 08:30, 10:00, 11:30, 01:00, 02:30, 04:00
        const timeSlots = ["08:30", "10:00", "11:30", "13:00", "14:30", "16:00"];
        
        timeSlots.forEach(time => {
            html += `<div style="font-family:'Space Grotesk',sans-serif; font-size:0.85rem; color:var(--text-secondary); display:flex; align-items:center; justify-content:flex-end; padding-right:1rem;">${time}</div>`;
            
            for (let i=0; i<6; i++) {
                const day = days[i];
                const matchingClass = state.routineData.find(c => c.dayOfWeek === day && c.startTime.startsWith(time));
                
                if (matchingClass) {
                    html += `
                        <div class="glass-panel" style="padding:0.75rem; border-radius:12px; background:rgba(17,33,45,0.05); border-color:rgba(17,33,45,0.15); font-size:0.8rem; display:flex; flex-direction:column; gap:0.25rem;">
                            <strong style="color:var(--accent-blue);">${matchingClass.courseName.split(' - ')[0]}</strong>
                            <span style="color:var(--text-secondary); font-size:0.75rem;">${matchingClass.teacherName}</span>
                            <span style="color:var(--text-secondary); font-size:0.75rem;"><i class="fa-solid fa-location-dot"></i> ${matchingClass.roomNo}</span>
                        </div>
                    `;
                } else {
                    html += `<div class="glass-panel" style="background:transparent; border-style:dashed; border-color:rgba(0,0,0,0.05); border-radius:12px;"></div>`;
                }
            }
        });
        
        html += `</div>`;
        host.innerHTML = html;
    } else if (tabName === 'monthly') {
        host.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h3 style="font-family:'Space Grotesk',sans-serif;">${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div style="display:flex; gap:1rem;">
                    <span style="font-size:0.8rem;"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--danger); margin-right:4px;"></span>Exam/CT</span>
                    <span style="font-size:0.8rem;"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--accent-blue); margin-right:4px;"></span>Class</span>
                </div>
            </div>
            <div class="monthly-calendar-grid" style="display:grid; grid-template-columns: repeat(7, 1fr); gap:0.5rem; text-align:center;">
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Sun</div>
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Mon</div>
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Tue</div>
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Wed</div>
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Thu</div>
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Fri</div>
                <div style="font-weight:600; padding:0.5rem; color:var(--text-secondary);">Sat</div>
            </div>
            <div id="monthly-days-host" style="display:grid; grid-template-columns: repeat(7, 1fr); gap:0.5rem;"></div>
            
            <div id="monthly-selected-details" class="glass-panel" style="margin-top: 1.5rem; padding: 1rem; border-radius: 12px; display: none;"></div>
        `;
        
        const daysHost = document.getElementById('monthly-days-host');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let i=0; i<firstDay; i++) {
            daysHost.innerHTML += `<div></div>`;
        }
        
        for (let i=1; i<=daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dateObj.getDay()];
            
            const hasClass = state.routineData.some(r => r.dayOfWeek === dayOfWeek);
            const ctsOnDay = state.ctData.filter(ct => new Date(ct.dateTime).toDateString() === dateObj.toDateString());
            
            let dots = '';
            if (hasClass) dots += `<div style="width:6px; height:6px; border-radius:50%; background:var(--accent-blue);"></div>`;
            if (ctsOnDay.length > 0) dots += `<div style="width:6px; height:6px; border-radius:50%; background:var(--danger);"></div>`;
            
            const isToday = i === now.getDate() ? 'border: 2px solid var(--accent-blue);' : 'border: 1px solid var(--glass-border);';
            
            daysHost.innerHTML += `
                <div class="calendar-day-cell glass-panel interactive" data-date="${dateObj.toISOString()}" style="padding:0.75rem 0.5rem; border-radius:12px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0.25rem; ${isToday}">
                    <span style="font-weight:600; font-family:'Space Grotesk',sans-serif;">${i}</span>
                    <div style="display:flex; gap:4px; margin-top:2px; height:6px;">${dots}</div>
                </div>
            `;
        }
        
        document.querySelectorAll('.calendar-day-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.getAttribute('data-date');
                const dateObj = new Date(dateStr);
                const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dateObj.getDay()];
                
                const classes = state.routineData.filter(r => r.dayOfWeek === dayOfWeek);
                const cts = state.ctData.filter(ct => new Date(ct.dateTime).toDateString() === dateObj.toDateString());
                
                const detailsHost = document.getElementById('monthly-selected-details');
                detailsHost.style.display = 'block';
                
                let detailsHtml = `<h4 style="margin-bottom:0.75rem; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:0.5rem;">Events for ${dateObj.toLocaleDateString()}</h4>`;
                
                if (classes.length === 0 && cts.length === 0) {
                    detailsHtml += `<p style="color:var(--text-secondary); font-size:0.9rem;">No classes or exams scheduled.</p>`;
                }
                
                if (cts.length > 0) {
                    detailsHtml += `<div style="margin-bottom:1rem;">`;
                    cts.forEach(ct => {
                        detailsHtml += `<div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem; color:var(--danger);">
                            <i class="fa-solid fa-fire"></i>
                            <span style="font-weight:600;">${ct.courseName} CT</span>
                            <span style="font-size:0.8rem; background:rgba(255,0,0,0.1); padding:2px 6px; border-radius:4px;">${new Date(ct.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | Rm ${ct.roomNo}</span>
                        </div>`;
                    });
                    detailsHtml += `</div>`;
                }
                
                if (classes.length > 0) {
                    classes.sort((a,b) => a.startTime.localeCompare(b.startTime));
                    classes.forEach(c => {
                        detailsHtml += `<div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem; color:var(--accent-blue);">
                            <i class="fa-solid fa-clock"></i>
                            <span style="font-weight:600; font-size:0.9rem;">${c.startTime.substring(0,5)} - ${c.endTime.substring(0,5)}</span>
                            <span style="font-size:0.9rem;">${c.courseName.split(' - ')[0]} (Rm ${c.roomNo})</span>
                        </div>`;
                    });
                }
                
                detailsHost.innerHTML = detailsHtml;
            });
        });
    }
}
