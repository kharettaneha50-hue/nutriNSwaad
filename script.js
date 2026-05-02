// --- Product Data ---
const snackBars = [
    {
        id: 1,
        title: "Ragi & Almond Crunch Bar",
        description: "Packed with fiber-rich ragi, roasted almonds, and a touch of honey.",
        price: 3.99,
        image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800",
        badge: "Bestseller"
    },
    {
        id: 2,
        title: "Quinoa Seed Medley Bar",
        description: "A superfood blend of puffed quinoa, pumpkin seeds, and chia.",
        price: 4.49,
        image: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&q=80&w=800",
        badge: "High Protein"
    },
    {
        id: 3,
        title: "Dark Choco Oat & Nut Bar",
        description: "Guilt-free indulgence with 70% dark chocolate, oats, and walnuts.",
        price: 4.99,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800",
        badge: "Low Sugar"
    }
];

const jams = [
    {
        id: 4,
        title: "Pure Strawberry Preserve",
        description: "Made with 80% whole strawberries. No artificial colors or flavors.",
        price: 7.99,
        image: "https://images.unsplash.com/photo-1555986872-9118c7bc7dd8?auto=format&fit=crop&q=80&w=800",
        badge: "100% Natural"
    },
    {
        id: 5,
        title: "Zesty Orange Marmalade",
        description: "A tangy delight perfect for your morning toast. Sweetened with stevia.",
        price: 6.99,
        image: "https://plus.unsplash.com/premium_photo-1675237625807-59f77f683401?auto=format&fit=crop&q=80&w=800",
        badge: "Sugar Free"
    },
    {
        id: 6,
        title: "Mixed Berry Jelly",
        description: "A beautiful blend of blueberries, raspberries, and blackberries.",
        price: 8.49,
        image: "https://images.unsplash.com/photo-1594244243642-1e96a4a68af5?auto=format&fit=crop&q=80&w=800",
        badge: "Antioxidant Rich"
    }
];

// --- State ---
let cart = [];

// --- DOM Elements ---
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.querySelector('.nav-links');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const snackBarsGrid = document.getElementById('snack-bars-grid');
const jamsGrid = document.getElementById('jams-grid');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(snackBars, snackBarsGrid);
    renderProducts(jams, jamsGrid);
    createToastElement();
    
    // Load cart from local storage if available
    const savedCart = localStorage.getItem('nutrinovaCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
});

// --- Mobile Menu Toggle ---
menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.querySelector('i').classList.remove('fa-times');
        menuBtn.querySelector('i').classList.add('fa-bars');
    });
});

// --- Render Products ---
function renderProducts(products, container) {
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h4 class="product-title">${product.title}</h4>
                <p class="product-desc">${product.description}</p>
                <div class="product-bottom">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Cart Functionality ---
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('show');
}

function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('show');
}

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

function getAllProducts() {
    return [...snackBars, ...jams];
}

function addToCart(productId) {
    const product = getAllProducts().find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();
    saveCart();
    showToast(`${product.title} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
            saveCart();
        }
    }
}

function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update items display
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
        cartTotalPrice.textContent = '$0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <i class="fas fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('nutrinovaCart', JSON.stringify(cart));
}

// --- Toast Notification ---
let toastEl;

function createToastElement() {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span class="toast-msg">Item added!</span>
    `;
    document.body.appendChild(toastEl);
}

function showToast(message) {
    toastEl.querySelector('.toast-msg').textContent = message;
    toastEl.classList.add('show');
    
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// --- Contact Form ---
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast("Thanks for reaching out! We will get back to you soon.");
    e.target.reset();
});

// --- Scroll effect on Navbar ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '10px 0';
        navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.padding = '15px 0';
        navbar.style.boxShadow = 'var(--shadow-sm)';
    }
});
