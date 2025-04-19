// Step 3: js/auth.js

function toggleForm(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (type === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    if (!username || !password) {
        alert('Please fill in both fields');
        return;
    }
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        alert('User already exists');
        return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Signup successful! Please login.');
    toggleForm('login');
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        alert('Invalid credentials');
        return;
    }
    localStorage.setItem('currentUser', username);
    window.location.href = 'home.html';
}

function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function updateCartCount() {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    const cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.textContent = `Cart (${totalItems})`;
    }
}
