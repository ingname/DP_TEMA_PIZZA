async function logout() {
    const response = await fetch('/logout', { method: 'POST' });
    if (response.ok) {
        window.location.href = '/';
    }
}

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

    const form = document.getElementById('add-user-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        let login = document.getElementById('login').value.trim().toLowerCase();
        let password = document.getElementById('password').value.trim();
        let confirmPassword = document.getElementById('confirm-password').value.trim();
        const role = document.getElementById('role').value;

        if (password !== confirmPassword) {
            alert('Пароли не совпадают.');
            return;
        }

        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        formData.append('role', role);

        try {
            const response = await fetch('/api/add_user', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Пользователь успешно добавлен!');
            } else {
                alert('Ошибка при добавлении пользователя.');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке данных на сервер.');
        }
    });
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