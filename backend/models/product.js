const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: String,
    price: { type: Number, required: true },
    description: String,
    image: { type: String, required: true },
    category: { type: String, default: 'Gadgets' },
    stock: { type: Number, default: 0 },
    videoUrl: String, // Add this for YouTube embeds
    colors: [String], // Array for multiple colors
    storage: [String] // Array for storage options
}, { 
    timestamps: true, // This adds 'createdAt' automatically!
    collection: 'product' // Forces it to use your existing collection
});

module.exports = mongoose.model('Product', productSchema);

function searchProducts() {
    const input = document.getElementById('product-search').value.toUpperCase();
    const grid = document.getElementById('all-products-grid');
    
    // Safety check: stop if the grid isn't on this page
    if (!grid) return;

    const cards = grid.getElementsByClassName('product-card');
    let count = 0;

    for (let i = 0; i < cards.length; i++) {
        // Look for the H3 tag inside the card
        const title = cards[i].querySelector('h3');
        if (title) {
            const textValue = title.textContent || title.innerText;
            
            if (textValue.toUpperCase().indexOf(input) > -1) {
                cards[i].style.display = "";
                count++;
            } else {
                cards[i].style.display = "none";
            }
        }
    }

    // Update the results count text (e.g., "12 Products Found")
    const countDisplay = document.getElementById('product-count');
    if (countDisplay) {
        countDisplay.innerText = count;
    }
}