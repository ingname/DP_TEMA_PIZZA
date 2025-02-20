document.addEventListener('DOMContentLoaded', () => {
    fetchUserInfo();
    fetchOrders();

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

async function fetchOrders() {
    const response = await fetch('/api/orders');
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
            <button class="edit-button" onclick="editOrder(${order.id_order})">Изменить</button>
            <button class="save-button" style="display:none;" onclick="saveOrder(${order.id_order})">Сохранить</button>
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

window.editOrder = async function(orderId) {
    const orderCard = Array.from(document.querySelectorAll('.order-card')).find(card => {
        const h3 = card.querySelector('h3');
        return h3.textContent.includes(`#${orderId}`);
    });

    if (!orderCard) {
        console.error(`Order card with id ${orderId} not found`);
        return;
    }

    const statusSpan = orderCard.querySelector('.order-status');

    const statusInput = document.createElement('select');
    statusInput.innerHTML = `
        <option value="В обработке">В обработке</option>
        <option value="Подтвержден">Подтвержден</option>
        <option value="Готовится">Готовится</option>
        <option value="Готов">Готов</option>
    `;
    statusInput.value = statusSpan.textContent;
    statusInput.className = 'form-input';

    statusSpan.replaceWith(statusInput);

    orderCard.querySelector('.edit-button').style.display = 'none';
    orderCard.querySelector('.save-button').style.display = 'inline-block';
};

window.saveOrder = async function(orderId) {
    const orderCard = Array.from(document.querySelectorAll('.order-card')).find(card => {
        const h3 = card.querySelector('h3');
        return h3.textContent.includes(`#${orderId}`);
    });

    if (!orderCard) {
        console.error(`Order card with id ${orderId} not found`);
        return;
    }

    const statusInput = orderCard.querySelector('select.form-input');
    const newStatus = statusInput.value;

    const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
        const statusSpan = document.createElement('span');
        statusSpan.className = 'order-status';
        statusSpan.textContent = newStatus;
        statusInput.replaceWith(statusSpan);

        orderCard.querySelector('.edit-button').style.display = 'inline-block';
        orderCard.querySelector('.save-button').style.display = 'none';
    } else {
        alert('Ошибка при обновлении состояния заказа.');
    }
};