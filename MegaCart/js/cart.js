
function renderCart() {
    const username = localStorage.getItem('currentUser');
    const cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalDiv.innerHTML = '';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartItemsDiv.innerHTML += `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" />
            <div class="cart-details">
              <h3>${item.title}</h3>
              <p>$${item.price} x 
                <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)" />
                = $${itemTotal.toFixed(2)}
              </p>
              <button onclick="removeItem(${index})">Remove</button>
            </div>
          </div>
        `;
    });

    cartTotalDiv.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
    updateCartCount();

}

function updateQuantity(index, newQty) {
    const username = localStorage.getItem('currentUser');
    let cart = JSON.parse(localStorage.getItem(`cart_${username}`));
    cart[index].quantity = parseInt(newQty);
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    renderCart();
}

function removeItem(index) {
    const username = localStorage.getItem('currentUser');
    let cart = JSON.parse(localStorage.getItem(`cart_${username}`));
    cart.splice(index, 1);
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    renderCart();
}

function buyNow() {
    alert("Purchase successful!");
    const username = localStorage.getItem('currentUser');
    localStorage.removeItem(`cart_${username}`);
    renderCart();
}