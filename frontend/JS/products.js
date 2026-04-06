async function loadAllProducts() {
    try {
       // Change the URL inside your fetch function
// Point this to the main working route
const response = await fetch('http://uk-techub-1.onrender.com/api/product');
        const data = await response.json();
        
        console.log("Database Response:", data); // Check F12 in Chrome to see this!

        const displayArea = document.getElementById('all-products-grid');
        displayArea.innerHTML = ""; 

        if (data.length === 0) {
            displayArea.innerHTML = "<p>No products found in database.</p>";
            return;
        }

       data.forEach(item => {
    const productCard = `
        <div class="product-card">
            <div class="img-container">
                <img src="http://uk-techub-1.onrender.com/image/${item.image}" alt="${item.name}">
            </div>
            <h3>${item.name}</h3>
            <p class="item-price">$${item.price}.00</p>
            <p class="item-category">${item.category}</p>
            <button class="add-to-cart-btn">Add to cart</button>
        </div>
    `;
    displayArea.innerHTML += productCard;
});

    } catch (error) {
        console.error("Error fetching shop products:", error);
    }
}
window.onload = loadAllProducts;

