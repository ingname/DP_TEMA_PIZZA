import { placeOrder1 } from './order.js';

let cart = [];
let totalPrice = 0;
let orderInsure = [];
let cartCountElement;

document.addEventListener('DOMContentLoaded', () => {
    const cart = document.querySelector('.cart');
    const cartToggle = document.createElement('button');
    cartToggle.textContent = 'Корзина';
    cartToggle.className = 'cart-toggle';
    document.body.appendChild(cartToggle);

    cartCountElement = document.createElement('span');
    cartCountElement.className = 'cart-count';
    cartCountElement.textContent = 0;
    cartToggle.appendChild(cartCountElement);

    cartToggle.addEventListener('click', () => {
        cart.classList.toggle('open');
    });

    fetchUserInfo()

    fetchProducts().then(() => {
        renderCart();
    });
    const headerTitle = document.querySelector('.header h1');
    const mainLink = document.createElement('a');
    mainLink.textContent = headerTitle.textContent;
    mainLink.href = '/';
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
    const header = document.querySelector('.header');
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
    if (userInfo.role == 1 || userInfo.role == 3 || userInfo.role == 2){
        const orderButton = document.createElement('button');
        orderButton.textContent = 'Мои заказы';
        orderButton.onclick = () => window.location.href = '/own_orders';
        userContainer.insertBefore(orderButton, userContainer.firstChild);
    }
    if (userInfo.role == 1 || userInfo.role == 3 || userInfo.role == 2){
        const mapButton = document.createElement('button');
        mapButton.textContent = 'Курьер';
        mapButton.onclick = () => window.location.href = '/map';
        userContainer.insertBefore(mapButton, userContainer.firstChild);
    }

    userContainer.insertBefore(userInfoDiv, authButton);

    
}


const productsContainer = document.querySelector('.products');
const cartItems = document.getElementById('cart-items');
const total = document.getElementById('total');
const placeOrderButton = document.getElementById('placeOrderButton');

let products = [];

async function fetchProducts() {
    let url = 'http://127.0.0.1:5000/api/pizzas';
    try {
        const response = await fetch(url);
        const data = await response.json();
        products = data;

        products.forEach((product, index) => {
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            const imgSrc = product.image ? `data:image/jpeg;base64,${product.image}` : '/static/placeholder.jpg';
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <img src="${imgSrc}" alt="${product.name}">
                <p>${product.price}р.</p>
                <button class="add-button">Добавить</button>
            `;
            const button = productElement.querySelector('button');
            button.addEventListener('click', () => addToCart(index));
            productsContainer.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

async function addToCart(productId) {
    cart.push(productId);
    orderInsure.push({ name: products[productId].name, price: products[productId].price, id_pizza:products[productId].id_pizza});
    totalPrice += Number(products[productId].price);
    updateLocalStorage();
    renderCart();
    updateCartCount();
    animateCartCount();
}

async function removeFromCart(index, productId) {
    cart.splice(index, 1);
    orderInsure.splice(index, 1);
    totalPrice -= Number(products[productId].price);
    updateLocalStorage();
    renderCart();
    updateCartCount();
}

async function renderCart() {
    cartItems.innerHTML = '';
    cart.forEach((productId, index) => {
        const selectedProduct = products[productId];
        const li = document.createElement('li');
        li.textContent = `${selectedProduct.name} - ${selectedProduct.price}р.`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Убрать';
        removeButton.className = 'remove-button';
        removeButton.onclick = () => removeFromCart(index, productId);
        li.appendChild(removeButton);
        cartItems.appendChild(li);
    });
    total.textContent = totalPrice;
}

async function updateCartCount() {
    cartCountElement.textContent = cart.length;
}

async function animateCartCount() {
    cartCountElement.classList.add('animate');
    setTimeout(() => {
        cartCountElement.classList.remove('animate');
    }, 300);
}

function updateLocalStorage() {
    console.log(orderInsure)
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('orderInsure', JSON.stringify(orderInsure));
}

placeOrderButton.addEventListener('click', placeOrder);

async function placeOrder() {
    if (orderInsure.length > 0) {
        placeOrder1(orderInsure);
    }
}