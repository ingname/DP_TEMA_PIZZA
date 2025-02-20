document.addEventListener('DOMContentLoaded', () => {
    fetchUserInfo();
    fetchOwnOrders();

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

async function fetchOwnOrders() {
    const response = await fetch('/api/own_orders');
    if (response.ok) {
        const orders = await response.json();
        displayOrders(orders);
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        const orderDetails = document.createElement('div');
        orderDetails.className = 'order-details';
        orderDetails.innerHTML = `
            <h3>Заказ #${order.id_order}</h3>
            <p>Фамилия: <span class="editable" data-field="surname">${order.surname}</span></p>
            <p>Имя: <span class="editable" data-field="name">${order.name}</span></p>
            <p>Улица: <span class="editable" data-field="street">${order.street}</span></p>
            <p>Дом: <span class="editable" data-field="house">${order.house}</span></p>
            <p>Квартира: <span class="editable" data-field="flat">${order.flat}</span></p>
            <p>Город: <span class="editable" data-field="city">${order.city}</span></p>
            <p>Телефон: <span class="editable" data-field="phone_number">${order.phone_number}</span></p>
            <p>Статус: <span class="order-status">${order.condition}</span></p>
        `;
        orderCard.appendChild(orderDetails);

        const pizzaDetails = document.createElement('div');
        pizzaDetails.className = 'pizza-details';
        pizzaDetails.innerHTML = `<h4>Пиццы в заказе</h4>`;

        order.pizzas.forEach(pizza => {
            const pizzaDetail = document.createElement('p');
            pizzaDetail.textContent = `Название: ${pizza.pizza_name}, Цена: ${pizza.price}р.`;
            pizzaDetails.appendChild(pizzaDetail);
        });

        orderCard.appendChild(pizzaDetails);
        ordersContainer.appendChild(orderCard);
    });
}