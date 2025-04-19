// Step 5: js/products.js

function fetchProducts() {
    fetch("https://dummyjson.com/products")
        .then(res => res.json())
        .then(data => renderProducts(data.products))
        .catch(err => console.error("Error fetching products:", err));
}

function renderProducts(products) {
    const container = document.getElementById("product-container");
    container.innerHTML = "";
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart(${product.id}, '${product.title}', ${product.price}, '${product.thumbnail}')">Add to Cart</button>
    `;

        container.appendChild(card);
    });
}

function addToCart(id, title, price, image) {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    let cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, title, price, image, quantity: 1 });
    }

    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    alert('Added to cart!');
    updateCartCount();
}
