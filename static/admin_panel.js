document.addEventListener('DOMContentLoaded', () => {
    fetchUserInfo();

    const headerTitle = document.querySelector('.header h1');
    const mainLink = document.createElement('a');
    mainLink.textContent = headerTitle.textContent;
    mainLink.href = '/';
    mainLink.style.color = 'white';
    mainLink.style.textDecoration = 'none';
    headerTitle.textContent = '';
    headerTitle.appendChild(mainLink);
});

async function fetchUserInfo() {
    const response = await fetch('/current_user');
    if (response.ok) {
        const data = await response.json();
        updateHeader(data);
    }
}

function updateHeader(userInfo) {
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button');
    authButton.style.display = 'none';
    logoutButton.style.display = 'block';
    
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'user-info';

    const userNameSpan = document.createElement('span');
    userNameSpan.textContent = userInfo.login;
    userInfoDiv.appendChild(userNameSpan);

    const userContainer = document.querySelector('.user-container');
    if (userInfo.role == 1) {
        const adminButton = document.createElement('button');
        adminButton.textContent = 'Панель администратора';
        adminButton.onclick = () => window.location.href = '/admin/dashboard';
        userContainer.insertBefore(adminButton, userContainer.firstChild);
    }

    userContainer.insertBefore(userInfoDiv, authButton);
}