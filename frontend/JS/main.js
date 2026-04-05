// ==========================================
// 1. AUTH & NAVBAR INITIALIZATION
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName') || localStorage.getItem('loggedInUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const overlay = document.getElementById('loginOverlay');
    const authSection = document.getElementById('auth-section');

    if (isLoggedIn === 'true' && userName) {
        if (overlay) overlay.style.display = 'none';
        if (authSection) {
            authSection.innerHTML = `
                <span class="user-name" style="color:white; font-weight:bold; font-size:12px;">HI, ${userName.toUpperCase()}</span>
                <a href="#" class="logout-btn" onclick="handleLogout()" style="color:#ff3b30; margin: 0 15px; text-decoration:none; font-size:12px; font-weight:bold;">LOGOUT</a>
                <span style="cursor:pointer; color:white; font-size:14px;">🔍</span>
            `;
        }
    }
    
    loadProducts();
    updateMiniCart(); 
});

// Helper to get unique user storage keys
function getUserKey(baseName) {
    const user = localStorage.getItem('userName') || localStorage.getItem('loggedInUser');
    return user ? `${baseName}_${user}` : baseName;
}

// ==========================================
// 2. PRODUCT DATA (FETCH FROM MONGODB)
// ==========================================
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/product');
        const data = await response.json();
        const displayArea = document.getElementById('featured-products-grid');
        
        if (!displayArea) return;
        displayArea.innerHTML = ""; 

        const limit = Math.min(data.length, 6);
        data.slice(0, limit).forEach(item => {
            const productCard = `
                <div class="product-card">
                    <div class="img-container">
                       <img src="http://localhost:5000/image/${item.image}" alt="${item.name}">
                    </div>
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <p class="item-price">$${item.price}.00</p>
                        <button class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.price}, '${item.image}')">
                            Add to cart
                        </button>
                    </div>
                </div>
            `;
            displayArea.innerHTML += productCard;
        });
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

// ==========================================
// 3. CART LOGIC (FIXED FOR SESSIONS)
// ==========================================
function addToCart(name, price, image) {
    const user = localStorage.getItem('userName') || localStorage.getItem('loggedInUser');
    if (!user) {
        alert("PLEASE LOG IN TO START YOUR OWN BAG!");
        return;
    }

    const cartKey = getUserKey('cart');
    let cleanPrice = typeof price === 'string' ? parseFloat(price.replace(/[$,]/g, '')) : parseFloat(price);
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    const existingItem = cart.find(item => item.name.toUpperCase() === name.toUpperCase());

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({ name: name.toUpperCase(), price: cleanPrice, image: image, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateMiniCart();
    alert(name.toUpperCase() + " ADDED TO YOUR PRIVATE BAG 🛍️");
}

function updateMiniCart() {
    const cartKey = getUserKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const container = document.getElementById('mini-cart-items');
    const countDisplay = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('mini-cart-total');
    
    // Total count of items, not just unique products
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (countDisplay) countDisplay.innerText = totalQty;
    
    let total = 0;
    if (!container) return; 

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#86868b; padding: 20px; font-size:12px;'>YOUR BAG IS EMPTY.</p>";
        if (totalDisplay) totalDisplay.innerText = "$0.00";
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const itemSubtotal = item.price * (item.quantity || 1);
        total += itemSubtotal;
        return `
            <div class="mini-item" style="display:flex; align-items:center; gap:10px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                <img src="http://localhost:5000/image/${item.image}" style="width:45px; height:45px; object-fit:contain; background:white; border-radius:8px; padding:2px;">
                <div class="mini-details" style="flex:1;">
                    <p style="margin:0; font-size:12px; font-weight:700; color:white;">${item.name}</p>
                    <span style="font-size:11px; color:#86868b;">${item.quantity} x $${item.price}</span>
                </div>
                <span onclick="deleteFromMiniCart(${index})" style="cursor:pointer; font-size:12px; color:#ff3b30;">🗑️</span>
            </div>
        `;
    }).join('');
    if (totalDisplay) totalDisplay.innerText = `$${total.toFixed(2)}`;
}

// ==========================================
// 4. ORDER HISTORY LOGIC (FIXED FOR SESSIONS)
// ==========================================
function toggleOrderPopup() {
    const popup = document.getElementById('order-history-popup');
    const container = document.getElementById('order-list-container');
    if (!popup) return;

    if (popup.style.display === "flex") {
        popup.style.display = "none";
    } else {
        popup.style.display = "flex";
        // Tag history with username
        const historyKey = getUserKey('orderHistory');
        const history = JSON.parse(localStorage.getItem(historyKey)) || [];
        
        if (history.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#86868b; padding-top:20px; font-size:12px;">NO PRIVATE ORDERS YET.</p>`;
            return;
        }

        container.innerHTML = history.reverse().slice(0, 5).map(order => `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #0071e3;">
                <span style="font-size: 10px; color: #0071e3; font-weight: 800; letter-spacing:1px;">ORDER ID: ${order.id || 'UKT-001'}</span>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                    <span style="font-size:16px; font-weight:800; color:white;">$${order.amount}</span>
                    <span style="font-size:10px; color:#86868b; text-transform:uppercase;">${order.date}</span>
                </div>
            </div>
        `).join('');
    }
}

// ==========================================
// 5. LOGOUT & UTILS
// ==========================================
function handleLogout() {
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    // We don't remove the cartKey so the user finds their items when they return
    window.location.reload();
}

function deleteFromMiniCart(index) {
    const cartKey = getUserKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    cart.splice(index, 1);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateMiniCart();
    // If you are on the cart page, refresh it too
    if (typeof renderCartTable === "function") renderCartTable();
}

function logout() {
    localStorage.removeItem("loggedInUser"); // The "Key" to the locker is removed
    window.location.href = "index.html";
}