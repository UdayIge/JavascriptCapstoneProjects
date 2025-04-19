// DOM Elements
const mainHeader = document.getElementById('main-header');
const navMenu = document.querySelector('.nav-menu');
const menuToggle = document.querySelector('.menu-toggle');
const logoutBtn = document.getElementById('logout-btn');

// Form Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const bookServiceForm = document.getElementById('book-service-form');

// Page Elements
const allPages = document.querySelectorAll('.page-content');
const loginPage = document.getElementById('login-page');
const signupPage = document.getElementById('signup-page');
const homePage = document.getElementById('home-page');
const servicesPage = document.getElementById('services-page');
const servicePreventivePage = document.getElementById('service-preventive-page');
const serviceBodyPage = document.getElementById('service-body-page');
const serviceCarePage = document.getElementById('service-care-page');
const bookingPage = document.getElementById('booking-page');
const bookingSuccessPage = document.getElementById('booking-success-page');
const reportsPage = document.getElementById('reports-page');

// Authentication Links
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

// Initialize the application
function init() {
    // Add event listeners
    setupEventListeners();

    // Check if user is logged in
    checkAuthStatus();

    // Handle routing based on URL
    handleRouting();
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Logout button
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (bookServiceForm) {
        bookServiceForm.addEventListener('submit', handleBookingSubmission);
    }

    // Auth page navigation
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(signupPage);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(loginPage);
        });
    }

    // Add event listeners for all navigation links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('http')) {
                e.preventDefault();
                navigate(href);
            }
        });
    });
}

// Check authentication status
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        // User is logged in, show header and hide login/signup
        mainHeader.classList.remove('hidden');
        if (loginPage) loginPage.classList.add('hidden');
        if (signupPage) signupPage.classList.add('hidden');
    } else {
        // User is not logged in, hide header and show login
        mainHeader.classList.add('hidden');
        if (loginPage) loginPage.classList.remove('hidden');
        if (homePage) homePage.classList.add('hidden');
    }
}

// Handle routing based on URL
function handleRouting() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);

    // Default to index.html if no filename
    const currentPage = filename || 'index.html';

    // Route to the appropriate page
    switch (currentPage) {
        case 'index.html':
            showPage(homePage);
            break;
        case 'services.html':
            showPage(servicesPage);
            break;
        case 'service-preventive.html':
            showPage(servicePreventivePage);
            break;
        case 'service-body.html':
            showPage(serviceBodyPage);
            break;
        case 'service-care.html':
            showPage(serviceCarePage);
            break;
        case 'booking.html':
            showPage(bookingPage);
            break;
        case 'booking-success.html':
            showPage(bookingSuccessPage);
            break;
        case 'reports.html':
            showPage(reportsPage);
            loadBookings();
            break;
        default:
            // If not logged in, show login page
            if (!localStorage.getItem('currentUser')) {
                showPage(loginPage);
            } else {
                showPage(homePage);
            }
    }
}

// Navigate to a specific page
function navigate(href) {
    // Check if user is logged in for protected routes
    if (!localStorage.getItem('currentUser') && href !== 'login.html' && href !== 'signup.html') {
        href = 'login.html';
    }

    // Update the browser history
    window.history.pushState({}, '', href);

    // Handle routing based on the new URL
    handleRouting();
}

// Show a specific page and hide others
function showPage(pageElement) {
    // Hide all pages
    allPages.forEach(page => {
        page.classList.add('hidden');
    });

    // Show the requested page
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
}

// User Authentication Functions

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find the user
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        // Set current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Show the header and navigate to home page
        mainHeader.classList.remove('hidden');
        navigate('index.html');
    } else {
        alert('Invalid username or password. Please try again.');
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validate the form
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists. Please choose a different username.');
        return;
    }

    // Create a new user
    const newUser = {
        name,
        username,
        email,
        password
    };

    // Add the new user to users array
    users.push(newUser);

    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Show the header and navigate to home page
    mainHeader.classList.remove('hidden');
    navigate('index.html');

    alert('Account created successfully! You are now logged in.');
}

// Handle logout
function logout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');

    // Hide the header and navigate to login page
    mainHeader.classList.add('hidden');
    navigate('login.html');
}

// Booking Functions

// Handle booking form submission
function handleBookingSubmission(e) {
    e.preventDefault();

    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        navigate('login.html');
        return;
    }

    // Get form values
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const serviceType = document.getElementById('service-type').value;
    const vehicleMake = document.getElementById('vehicle-make').value;
    const vehicleModel = document.getElementById('vehicle-model').value;
    const bookingDate = document.getElementById('booking-date').value;
    const notes = document.getElementById('notes').value;

    // Create booking object
    const booking = {
        id: Date.now().toString(),
        username: currentUser.username,
        name,
        phone,
        serviceType,
        vehicleMake,
        vehicleModel,
        bookingDate,
        notes,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    // Add the new booking
    bookings.push(booking);

    // Save bookings to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Set the booking details for the success page
    setBookingConfirmationDetails(booking);

    // Navigate to booking success page
    navigate('booking-success.html');
}

// Set booking confirmation details on the success page
function setBookingConfirmationDetails(booking) {
    const confirmName = document.getElementById('confirm-name');
    const confirmService = document.getElementById('confirm-service');
    const confirmDate = document.getElementById('confirm-date');
    const confirmVehicle = document.getElementById('confirm-vehicle');

    if (confirmName) confirmName.textContent = booking.name;
    if (confirmService) confirmService.textContent = booking.serviceType;
    if (confirmDate) confirmDate.textContent = formatDate(booking.bookingDate);
    if (confirmVehicle) confirmVehicle.textContent = `${booking.vehicleMake} ${booking.vehicleModel}`;
}

// Load bookings for the reports page
function loadBookings() {
    const bookingsList = document.getElementById('bookings-list');

    if (!bookingsList) return;

    // Clear the bookings list
    bookingsList.innerHTML = '';

    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        navigate('login.html');
        return;
    }

    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    // Filter bookings for the current user
    const userBookings = bookings.filter(booking => booking.username === currentUser.username);

    if (userBookings.length === 0) {
        bookingsList.innerHTML = '<p>You have no bookings yet.</p>';
        return;
    }

    // Sort bookings by date (newest first)
    userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Create booking elements
    userBookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';

        bookingItem.innerHTML = `
            <h3>${booking.serviceType}</h3>
            <p><strong>Booking Date:</strong> ${formatDate(booking.bookingDate)}</p>
            <p><strong>Vehicle:</strong> ${booking.vehicleMake} ${booking.vehicleModel}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
        `;

        bookingsList.appendChild(bookingItem);
    });
}

// Helper Functions

// Format date to a more readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize the application when the DOM content is loaded
document.addEventListener('DOMContentLoaded', init);