// App State and Constants
const MOCK_API_KEY = 'demo-api-key';
const POPULAR_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];
const RECOMMENDATION_SECTORS = {
    'Technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
    'E-Commerce': ['AMZN', 'SHOP', 'ETSY', 'BABA'],
    'Electric Vehicles': ['TSLA', 'NIO', 'RIVN', 'LCID'],
    'Financial': ['JPM', 'BAC', 'GS', 'V', 'MA'],
    'Healthcare': ['JNJ', 'PFE', 'MRNA', 'UNH']
};

let currentUser = null;
let stockPrices = {};

// Utility Functions
function encryptData(data) {
    // Simple Base64 encoding for demo purposes
    return btoa(JSON.stringify(data));
}

function decryptData(encrypted) {
    // Simple Base64 decoding for demo purposes
    try {
        return JSON.parse(atob(encrypted));
    } catch (e) {
        console.error('Error decrypting data:', e);
        return null;
    }
}

function saveUserData(userData) {
    const encryptedData = encryptData(userData);
    localStorage.setItem(`user_${userData.username}`, encryptedData);
}

function getUserData(username) {
    const encryptedData = localStorage.getItem(`user_${username}`);
    if (!encryptedData) return null;
    return decryptData(encryptedData);
}

function formatCurrency(amount) {
    return parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.display = 'block';

    // Auto-hide message after 5 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Navigation and Page Control
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.getElementById(pageId).classList.add('active');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Handle special page initialization
    if (pageId === 'dashboard') {
        fetchStockPrices();
        updateBalanceDisplay();
    } else if (pageId === 'portfolio') {
        updatePortfolio();
    } else if (pageId === 'recommendations') {
        loadRecommendations();
    }
}

function checkAuth() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        const username = decryptData(loggedInUser);
        currentUser = getUserData(username);

        if (!currentUser) {
            logout();
            return false;
        }

        document.getElementById('userWelcome').textContent = currentUser.username;
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showPage('landing');
}

// Mock API Functions (for demo purposes)
function getMockStockPrice(symbol) {
    // Generate consistent price based on symbol string
    const basePrice = symbol
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000 + 50;

    // Add some random fluctuation
    const fluctuation = (Math.random() - 0.5) * 10;
    return parseFloat((basePrice + fluctuation).toFixed(2));
}

function getPercentChange() {
    // Random percentage change between -3% and +3%
    return (Math.random() * 6 - 3).toFixed(2);
}

async function fetchStockPrice(symbol) {
    // In a real app, this would call an actual API
    return new Promise(resolve => {
        setTimeout(() => {
            const price = getMockStockPrice(symbol);
            resolve(price);
        }, 300);
    });
}

async function fetchStockPrices() {
    const pricesContainer = document.getElementById('livePrices');
    pricesContainer.innerHTML = '<div class="loading"></div>';

    // Mock API call to get stock prices for popular stocks
    try {
        // Process each stock with a slight delay to simulate real API
        let html = '';

        for (const symbol of POPULAR_STOCKS) {
            const price = await fetchStockPrice(symbol);
            const percentChange = getPercentChange();
            stockPrices[symbol] = price;

            const changeClass = parseFloat(percentChange) >= 0 ? 'positive-change' : 'negative-change';
            const changeSymbol = parseFloat(percentChange) >= 0 ? '+' : '';

            html += `
                        <div class="price-card">
                            <div class="stock-symbol">${symbol}</div>
                            <div class="stock-price">$${formatCurrency(price)}</div>
                            <div class="stock-change ${changeClass}">${changeSymbol}${percentChange}%</div>
                        </div>
                    `;
        }

        pricesContainer.innerHTML = html;
    } catch (error) {
        pricesContainer.innerHTML = '<p>Error loading stock prices. Please try again later.</p>';
        console.error('Error fetching stock prices:', error);
    }
}

// Portfolio Management Functions
function updateBalanceDisplay() {
    if (currentUser) {
        document.getElementById('availableBalance').textContent = formatCurrency(currentUser.balance);
    }
}

async function searchStock() {
    const symbol = document.getElementById('stockSearchInput').value.trim().toUpperCase();
    const resultContainer = document.getElementById('stockSearchResult');

    if (!symbol) {
        resultContainer.innerHTML = '<p class="message error">Please enter a stock symbol</p>';
        return;
    }

    resultContainer.innerHTML = '<div class="loading"></div>';

    try {
        const price = await fetchStockPrice(symbol);
        stockPrices[symbol] = price;

        resultContainer.innerHTML = `
                    <div class="card">
                        <h4>${symbol}</h4>
                        <p>Current Price: $${formatCurrency(price)}</p>
                        <button class="btn" onclick="fillBuyForm('${symbol}', ${price})">Buy Now</button>
                    </div>
                `;
    } catch (error) {
        resultContainer.innerHTML = '<p class="message error">Error fetching stock price. Please try again.</p>';
        console.error('Error searching stock:', error);
    }
}

function fillBuyForm(symbol, price) {
    document.getElementById('buySymbol').value = symbol;
    calculateEstimatedCost();
}

function calculateEstimatedCost() {
    const symbol = document.getElementById('buySymbol').value.trim().toUpperCase();
    const quantity = parseInt(document.getElementById('buyQuantity').value) || 0;

    if (symbol && quantity > 0) {
        if (!stockPrices[symbol]) {
            // Fetch price if not already in cache
            fetchStockPrice(symbol).then(price => {
                stockPrices[symbol] = price;
                const total = price * quantity;
                document.getElementById('estimatedCost').value = `$${formatCurrency(total)}`;
            });
        } else {
            const total = stockPrices[symbol] * quantity;
            document.getElementById('estimatedCost').value = `$${formatCurrency(total)}`;
        }
    } else {
        document.getElementById('estimatedCost').value = '$0.00';
    }
}

async function buyStock(e) {
    e.preventDefault();

    const symbol = document.getElementById('buySymbol').value.trim().toUpperCase();
    const quantity = parseInt(document.getElementById('buyQuantity').value) || 0;

    if (!symbol || quantity <= 0) {
        showMessage('stockSearchResult', 'Please enter a valid symbol and quantity', 'error');
        return;
    }

    try {
        // Ensure we have the latest price
        const price = await fetchStockPrice(symbol);
        stockPrices[symbol] = price;

        const totalCost = price * quantity;

        if (totalCost > currentUser.balance) {
            showMessage('stockSearchResult', 'Insufficient funds for this purchase', 'error');
            return;
        }

        // Update user's portfolio
        if (!currentUser.portfolio[symbol]) {
            currentUser.portfolio[symbol] = {
                quantity: quantity,
                averagePrice: price
            };
        } else {
            // Calculate new average price
            const currentQuantity = currentUser.portfolio[symbol].quantity;
            const currentAvgPrice = currentUser.portfolio[symbol].averagePrice;
            const newTotalQuantity = currentQuantity + quantity;
            const newAvgPrice = ((currentQuantity * currentAvgPrice) + (quantity * price)) / newTotalQuantity;

            currentUser.portfolio[symbol].quantity = newTotalQuantity;
            currentUser.portfolio[symbol].averagePrice = newAvgPrice;
        }

        // Update balance
        currentUser.balance -= totalCost;

        // Save updated user data
        saveUserData(currentUser);
        updateBalanceDisplay();

        // Show success message
        showMessage('stockSearchResult', `Successfully purchased ${quantity} shares of ${symbol}`, 'success');

        // Reset form
        document.getElementById('buyStockForm').reset();
        document.getElementById('estimatedCost').value = '';

    } catch (error) {
        showMessage('stockSearchResult', 'Error processing your purchase. Please try again.', 'error');
        console.error('Error buying stock:', error);
    }
}

async function updatePortfolio() {
    if (!currentUser) return;

    const portfolioTable = document.getElementById('portfolioTable');
    const totalValueElement = document.getElementById('totalPortfolioValue');

    // Clear previous data
    portfolioTable.innerHTML = '';

    const portfolio = currentUser.portfolio;
    const symbols = Object.keys(portfolio);

    if (symbols.length === 0) {
        document.getElementById('portfolioContent').innerHTML =
            '<p>You don\'t have any stocks in your portfolio yet.</p>';
        totalValueElement.textContent = '0.00';
        return;
    }

    let totalPortfolioValue = 0;

    // Update prices for all stocks in portfolio
    for (const symbol of symbols) {
        const price = await fetchStockPrice(symbol);
        stockPrices[symbol] = price;

        const item = portfolio[symbol];
        const quantity = item.quantity;
        const totalValue = price * quantity;
        totalPortfolioValue += totalValue;

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${symbol}</td>
                    <td>${quantity}</td>
                    <td>$${formatCurrency(price)}</td>
                    <td>$${formatCurrency(totalValue)}</td>
                    <td>
                        <button class="btn btn-danger" onclick="openSellModal('${symbol}', ${quantity}, ${price})">Sell</button>
                    </td>
                `;

        portfolioTable.appendChild(row);
    }

    totalValueElement.textContent = formatCurrency(totalPortfolioValue);
}

function openSellModal(symbol, quantity, price) {
    document.getElementById('sellSymbol').value = symbol;
    document.getElementById('sellCurrentQuantity').value = quantity;
    document.getElementById('sellCurrentPrice').value = `$${formatCurrency(price)}`;
    document.getElementById('sellQuantity').value = 1;
    document.getElementById('sellQuantity').max = quantity;
    updateSellTotal();

    document.getElementById('sellModal').style.display = 'flex';
}

function updateSellTotal() {
    const symbol = document.getElementById('sellSymbol').value;
    const quantity = parseInt(document.getElementById('sellQuantity').value) || 0;
    const price = stockPrices[symbol] || 0;

    document.getElementById('sellTotal').value = `$${formatCurrency(price * quantity)}`;
}

function closeSellModal() {
    document.getElementById('sellModal').style.display = 'none';
}

async function sellStock(e) {
    e.preventDefault();

    const symbol = document.getElementById('sellSymbol').value;
    const quantity = parseInt(document.getElementById('sellQuantity').value) || 0;
    const price = stockPrices[symbol];

    if (!symbol || quantity <= 0 || !price) {
        showMessage('portfolioMessage', 'Invalid sell order', 'error');
        closeSellModal();
        return;
    }

    const currentQuantity = currentUser.portfolio[symbol].quantity;

    if (quantity > currentQuantity) {
        showMessage('portfolioMessage', 'You cannot sell more shares than you own', 'error');
        closeSellModal();
        return;
    }

    const sellValue = price * quantity;

    // Update portfolio
    if (quantity === currentQuantity) {
        // Sell all shares
        delete currentUser.portfolio[symbol];
    } else {
        // Sell partial position
        currentUser.portfolio[symbol].quantity -= quantity;
    }

    // Update balance
    currentUser.balance += sellValue;

    // Save updated user data
    saveUserData(currentUser);

    // Close modal and update UI
    closeSellModal();
    updatePortfolio();
    showMessage('portfolioMessage', `Successfully sold ${quantity} shares of ${symbol} for $${formatCurrency(sellValue)}`, 'success');
}

async function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendationsContent');
    recommendationsContainer.innerHTML = '<div class="loading"></div>';

    try {
        let html = '';

        // Generate recommendations based on sectors
        for (const [sector, stocks] of Object.entries(RECOMMENDATION_SECTORS)) {
            // Pick a random stock from this sector
            const randomIndex = Math.floor(Math.random() * stocks.length);
            const symbol = stocks[randomIndex];

            // Get the latest price
            const price = await fetchStockPrice(symbol);
            stockPrices[symbol] = price;

            const percentChange = getPercentChange();
            const changeClass = parseFloat(percentChange) >= 0 ? 'positive-change' : 'negative-change';
            const changeSymbol = parseFloat(percentChange) >= 0 ? '+' : '';

            html += `
                        <div class="recommendation-card">
                            <div class="recommendation-header">
                                <h3>${sector}</h3>
                            </div>
                            <div class="recommendation-body">
                                <h4>${symbol}</h4>
                                <p>Current Price: $${formatCurrency(price)}</p>
                                <p class="${changeClass}">${changeSymbol}${percentChange}% today</p>
                                <p>This ${sector} stock shows strong potential based on recent market trends.</p>
                            </div>
                            <div class="recommendation-footer">
                                <button class="btn" onclick="fillBuyForm('${symbol}', ${price})">Buy Now</button>
                                <button class="btn btn-secondary" onclick="showPage('dashboard')">View Charts</button>
                            </div>
                        </div>
                    `;
        }

        recommendationsContainer.innerHTML = html;
    } catch (error) {
        recommendationsContainer.innerHTML = '<p>Error loading recommendations. Please try again later.</p>';
        console.error('Error loading recommendations:', error);
    }
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            if (checkAuth()) {
                showPage(pageId);
            } else {
                showPage('login');
            }
        });
    });

    // Mobile menu toggle
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });

    // Auth navigation
    document.getElementById('goToLoginBtn').addEventListener('click', () => showPage('login'));
    document.getElementById('goToSignupBtn').addEventListener('click', () => showPage('signup'));
    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup');
    });
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login');
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            showMessage('loginMessage', 'Please enter both username and password', 'error');
            return;
        }

        const userData = getUserData(username);

        if (!userData || userData.password !== password) {
            showMessage('loginMessage', 'Invalid username or password', 'error');
            return;
        }

        // Login successful
        currentUser = userData;
        localStorage.setItem('currentUser', encryptData(username));
        document.getElementById('userWelcome').textContent = username;

        // Clear form
        document.getElementById('loginForm').reset();

        // Navigate to dashboard
        showPage('dashboard');
    });

    // Signup form
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const initialBalance = parseFloat(document.getElementById('initialBalance').value) || 10000;

        if (!username || !password) {
            showMessage('signupMessage', 'Please enter username and password', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('signupMessage', 'Passwords do not match', 'error');
            return;
        }

        // Check if user already exists
        if (getUserData(username)) {
            showMessage('signupMessage', 'Username already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            username,
            password,
            balance: initialBalance,
            portfolio: {}
        };

        saveUserData(newUser);

        // Auto login
        currentUser = newUser;
        localStorage.setItem('currentUser', encryptData(username));
        document.getElementById('userWelcome').textContent = username;

        // Clear form
        document.getElementById('signupForm').reset();

        // Navigate to dashboard
        showPage('dashboard');
        showMessage('stockSearchResult', 'Account created successfully! Welcome to Portfolio Management.', 'success');
    });

    // Stock search
    document.getElementById('stockSearchBtn').addEventListener('click', searchStock);

    // Buy form calculation
    document.getElementById('buyQuantity').addEventListener('input', calculateEstimatedCost);
    document.getElementById('buySymbol').addEventListener('input', calculateEstimatedCost);

    // Buy stock form
    document.getElementById('buyStockForm').addEventListener('submit', buyStock);

    // Sell modal events
    document.querySelector('.close').addEventListener('click', closeSellModal);
    document.getElementById('cancelSell').addEventListener('click', closeSellModal);
    document.getElementById('sellQuantity').addEventListener('input', updateSellTotal);
    document.getElementById('sellStockForm').addEventListener('submit', sellStock);

    // Check if user is already logged in
    if (checkAuth()) {
        showPage('dashboard');
    }
});

// Global Functions (to be called from HTML)
window.fillBuyForm = fillBuyForm;
window.openSellModal = openSellModal;
window.showPage = showPage;