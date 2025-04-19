document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const menuContainer = document.getElementById('menu-container');
    const receiptContainer = document.getElementById('receipt-container');
    const historyContainer = document.getElementById('history-container');

    // Data Store
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let currentUser = null;
    let cart = [];
    let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || {};
    let orderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '1000');

    // Menu Categories and Items
    const menuCategories = [
        { id: 'silog', name: 'Silog Meals' },
        { id: 'breakfast', name: 'Breakfast' },
        { id: 'beverages', name: 'Beverages' },
        { id: 'desserts', name: 'Desserts' }
    ];

    const menuItems = [
        // Silog Meals
        { id: 1, category: 'silog', name: 'Tapsilog', price: 8.99, desc: 'Marinated beef with garlic rice and fried egg', image: "/PROJECT/pic/tapsilog.jpg" },
        { id: 2, category: 'silog', name: 'Porksilog', price: 12.99, desc: 'Crispy pork belly with garlic rice and fried egg', image: "/PROJECT/pic/porksilog.jpg" },
        { id: 3, category: 'silog', name: 'Chicksilog', price: 6.99, desc: 'Juicy chicken with garlic rice and fried egg', image: "/PROJECT/pic/chicksilog.jpg" },
        { id: 4, category: 'silog', name: 'Bangusilog', price: 3.99, desc: 'Spicy milkfish with garlic rice and fried egg', image: "/PROJECT/pic/bangussilog.jpg" },
        { id: 5, category: 'silog', name: 'Longsilog', price: 5.99, desc: 'Filipino sausage with garlic rice and fried egg', image: "/PROJECT/pic/tapsilog.jpg" },
        
        // Breakfast Items
        { id: 6, category: 'breakfast', name: 'Pancakes', price: 4.99, desc: 'Fluffy pancakes with maple syrup', image: "/PROJECT/pic/porksilog.jpg" },
        { id: 7, category: 'breakfast', name: 'French Toast', price: 5.99, desc: 'Classic french toast with berries', image: "/PROJECT/pic/chicksilog.jpg" },
        { id: 8, category: 'breakfast', name: 'Omelette', price: 6.99, desc: 'Three-egg omelette with veggies and cheese', image: "/PROJECT/pic/bangussilog.jpg" },
        
        // Beverages
        { id: 9, category: 'beverages', name: 'Coffee', price: 2.99, desc: 'Freshly brewed coffee', image: "/PROJECT/pic/tapsilog.jpg" },
        { id: 10, category: 'beverages', name: 'Fresh Juice', price: 3.99, desc: 'Freshly squeezed fruit juice', image: "/PROJECT/pic/porksilog.jpg" },
        { id: 11, category: 'beverages', name: 'Milk Tea', price: 4.99, desc: 'Brown sugar milk tea with pearls', image: "/PROJECT/pic/chicksilog.jpg" },
        
        // Desserts
        { id: 12, category: 'desserts', name: 'Halo-Halo', price: 5.99, desc: 'Filipino mixed dessert with ice cream', image: "/PROJECT/pic/bangussilog.jpg" },
        { id: 13, category: 'desserts', name: 'Leche Flan', price: 3.99, desc: 'Filipino caramel custard', image: "/PROJECT/pic/tapsilog.jpg" },
        { id: 14, category: 'desserts', name: 'Turon', price: 2.99, desc: 'Banana spring rolls with caramel', image: "/PROJECT/pic/porksilog.jpg" }
    ];

    // Initialize application
    initApp();

    function initApp() {
        // Initialize auth tabs
        initAuthTabs();
        
        // Add event listeners for auth forms
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('register-form').addEventListener('submit', handleRegister);
        
        // Check if user was previously logged in (in a real app, you'd use more secure methods)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = savedUser;
            showPOS();
        }
    }

    function initAuthTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
                document.getElementById(`${btn.dataset.tab}-form`).classList.remove('hidden');
            });
        });
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (users[username] && users[username].password === password) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            showPOS();
        } else {
            showAlert('Invalid username or password', 'error');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        if (users[username]) {
            showAlert('Username already exists', 'error');
            return;
        }
        
        users[username] = { email, password };
        localStorage.setItem('users', JSON.stringify(users));
        showAlert('Registration successful! Please login.', 'success');
        
        // Switch to login tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="login"]').classList.add('active');
        document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
        document.getElementById('login-form').classList.remove('hidden');
    }

    function logout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        cart = [];
        showView('auth');
    }

    function showView(view) {
        // Hide all containers
        authContainer.classList.add('hidden');
        menuContainer.classList.add('hidden');
        receiptContainer.classList.add('hidden');
        historyContainer.classList.add('hidden');
        
        // Show the requested container
        switch(view) {
            case 'auth':
                authContainer.classList.remove('hidden');
                break;
            case 'menu':
                menuContainer.classList.remove('hidden');
                break;
            case 'receipt':
                receiptContainer.classList.remove('hidden');
                break;
            case 'history':
                historyContainer.classList.remove('hidden');
                loadOrderHistory();
                break;
        }
    }

    function showPOS() {
        // Update menu container with POS layout
        menuContainer.innerHTML = generatePOSHTML();
        showView('menu');
        
        // Load menu items and attach event listeners
        loadMenuItems('all');
        attachPOSEventListeners();
        updateCart(); // Initialize empty cart view
    }

    function generatePOSHTML() {
        return `
            <div class="header">
                <h2>Silog Express </h2>
                <div class="header-buttons">
                    <button id="history-btn">Order History</button>
                    <button id="logout-btn">Logout</button>
                </div>
            </div>
            
            <div class="pos-container">
                <div class="menu-section">
                    <div class="category-tabs">
                        <button class="category-tab active" data-category="all">All Items</button>
                        ${menuCategories.map(cat => 
                            `<button class="category-tab" data-category="${cat.id}">${cat.name}</button>`
                        ).join('')}
                    </div>
                    <div id="menu-items" class="menu-grid"></div>
                </div>
                
                <div class="order-section">
                    <div class="order-header">
                        <h3>Current Order</h3>
                        <div class="order-customer">
                            <input type="text" id="customer-name" placeholder="Customer Name">
                            <input type="text" id="order-number" value="#${orderNumber + 1}" readonly>
                        </div>
                    </div>
                    
                    <div class="order-items" id="cart-items">
                        <!-- Cart items will be here -->
                    </div>
                    
                    <div class="order-summary">
                        <div class="subtotal">
                            <span>Subtotal:</span>
                            <span>₱<span id="subtotal">0.00</span></span>
                        </div>
                        <div class="tax">
                            <span>Tax (12%):</span>
                            <span>₱<span id="tax">0.00</span></span>
                        </div>
                        <div class="total">
                            <span>Total:</span>
                            <span>₱<span id="cart-total">0.00</span></span>
                        </div>
                        
                        <div class="checkout-actions">
                            <button id="clear-btn" class="clear-btn">Clear Order</button>
                            <button id="checkout-btn" class="checkout-btn">Payment</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function loadMenuItems(category) {
        const menuItemsContainer = document.getElementById('menu-items');
        menuItemsContainer.innerHTML = '';
        
        const itemsToShow = category === 'all' ? 
            menuItems : 
            menuItems.filter(item => item.category === category);
        
        const fragment = document.createDocumentFragment();
        
        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.dataset.id = item.id;
            div.innerHTML = `
                <div class="menu-item-img">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='/api/placeholder/180/120'">
                </div>
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="price">₱${item.price.toFixed(2)}</div>
                </div>
            `;
            fragment.appendChild(div);
        });
        
        menuItemsContainer.appendChild(fragment);
        
        // Add click event to menu items - use event delegation
        menuItemsContainer.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                const itemId = parseInt(menuItem.dataset.id);
                addToCart(itemId);
            }
        });
    }

    function attachPOSEventListeners() {
        // Attach events to categories using event delegation
        const categoryTabs = document.querySelector('.category-tabs');
        if (categoryTabs) {
            categoryTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('category-tab')) {
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    loadMenuItems(e.target.dataset.category);
                }
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Order History button
        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => showView('history'));
        }
        
        // Clear Order button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (cart.length > 0) {
                    if (confirm('Are you sure you want to clear the current order?')) {
                        cart = [];
                        updateCart();
                    }
                }
            });
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', processCheckout);
        }
        
        // Cart item actions - using event delegation
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            cartItems.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) {
                    const index = parseInt(e.target.dataset.index);
                    removeFromCart(index);
                } else if (e.target.classList.contains('plus-btn')) {
                    const index = parseInt(e.target.dataset.index);
                    updateQuantity(index, 1);
                } else if (e.target.classList.contains('minus-btn')) {
                    const index = parseInt(e.target.dataset.index);
                    updateQuantity(index, -1);
                }
            });
        }
        
        // Back to menu button in history view
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => showView('menu'));
        }
        
        // New order button in receipt view
        const newOrderBtn = document.getElementById('new-order-btn');
        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => showView('menu'));
        }
    }

    function addToCart(itemId) {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(i => i.id === itemId);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        
        updateCart();
        
    }

    function updateQuantity(index, change) {
        if (index < 0 || index >= cart.length) return;
        
        const newQty = cart[index].quantity + change;
        
        if (newQty <= 0) {
            removeFromCart(index);
        } else {
            cart[index].quantity = newQty;
            updateCart();
        }
    }

    function removeFromCart(index) {
        if (index < 0 || index >= cart.length) return;
        
        const removedItem = cart[index];
        cart.splice(index, 1);
        updateCart();
        showAlert(`${removedItem.name} removed from cart`, 'info');
    }

    function updateCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('cart-total');
        
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">No items in order</div>';
            if (subtotalElement) subtotalElement.textContent = '0.00';
            if (taxElement) taxElement.textContent = '0.00';
            if (totalElement) totalElement.textContent = '0.00';
            return;
        }
        
        let subtotal = 0;
        const fragment = document.createDocumentFragment();
        
        cart.forEach((item, index) => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₱${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                </div>
                <div class="cart-item-subtotal">
                    ₱${itemSubtotal.toFixed(2)}
                    <button class="remove-btn" data-index="${index}">×</button>
                </div>
            `;
            fragment.appendChild(div);
        });
        
        cartItemsContainer.appendChild(fragment);
        
        // Calculate tax and total
        const tax = subtotal * 0.12;
        const total = subtotal + tax;
        
        if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
        if (taxElement) taxElement.textContent = tax.toFixed(2);
        if (totalElement) totalElement.textContent = total.toFixed(2);
    }

    function processCheckout() {
        if (cart.length === 0) {
            showAlert('Cart is empty!', 'error');
            return;
        }
        
        const customerName = document.getElementById('customer-name').value || 'Guest';
        
        // Increment order number
        orderNumber++;
        localStorage.setItem('lastOrderNumber', orderNumber);
        
        // Create order data
        const orderDate = new Date();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.12;
        const total = subtotal + tax;
        
        const order = {
            id: orderNumber,
            customer: customerName,
            date: orderDate.toLocaleString(),
            items: [...cart],
            subtotal: subtotal,
            tax: tax,
            total: total,
            paymentMethod: 'Cash' // Default payment method
        };
        
        // Save to order history
        if (!orderHistory[currentUser]) {
            orderHistory[currentUser] = [];
        }
        orderHistory[currentUser].push(order);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        
        // Generate receipt
        generateReceipt(order);
        
        // Clear cart for next order
        cart = [];
        
        // Show receipt view
        showView('receipt');
    }

    function generateReceipt(order) {
        const receiptContent = document.getElementById('receipt-content');
        if (!receiptContent) return;
        
        receiptContent.innerHTML = `
            <div class="receipt-header">
                <h2>Silog Express</h2>
                <p>Your Filipino Breakfast Destination</p>
            </div>
            
            <div class="receipt-date">
                <p>Order #${order.id}</p>
                <p>Date: ${order.date}</p>
                <p>Customer: ${order.customer}</p>
            </div>
            
            <div class="receipt-items">
                ${order.items.map(item => `
                    <div class="receipt-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="receipt-summary">
                <div class="receipt-subtotal">
                    <span>Subtotal:</span>
                    <span>₱${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="receipt-tax">
                    <span>Tax (12%):</span>
                    <span>₱${order.tax.toFixed(2)}</span>
                </div>
                <div class="receipt-total">
                    <span>Total:</span>
                    <span>₱${order.total.toFixed(2)}</span>
                </div>
                <div class="receipt-payment">
                    <span>Payment Method:</span>
                    <span>${order.paymentMethod}</span>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p>Thank you for your order!</p>
                <p>Silog Express - Serving Filipino Breakfast Classics</p>
            </div>
        `;
        
        // Add actions for receipt
        const receiptContainer = document.getElementById('receipt-container');
        if (receiptContainer) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'receipt-actions';
            actionsDiv.innerHTML = `
                <button id="print-receipt-btn">Print Receipt</button>
                <button id="new-order-btn">New Order</button>
            `;
            receiptContainer.appendChild(actionsDiv);
            
            // Add event listener for print button
            const printBtn = document.getElementById('print-receipt-btn');
            if (printBtn) {
                printBtn.addEventListener('click', () => {
                    window.print();
                });
            }
            
            // Add event listener for new order button
            const newOrderBtn = document.getElementById('new-order-btn');
            if (newOrderBtn) {
                newOrderBtn.addEventListener('click', () => {
                    showView('menu');
                    updateCart();
                });
            }
        }
    }

    function loadOrderHistory() {
        const historyItems = document.getElementById('history-items');
        if (!historyItems) {
            historyContainer.innerHTML = `
                <div class="header">
                    <h2>Order History</h2>
                    <button id="back-to-menu-btn">Back to Menu</button>
                </div>
                <div id="history-items"></div>
            `;
            // Reattach event listeners
            attachPOSEventListeners();
            // Re-get the history items container
            loadOrderHistory();
            return;
        }
        
        historyItems.innerHTML = '';
        
        if (!orderHistory[currentUser] || orderHistory[currentUser].length === 0) {
            historyItems.innerHTML = '<div class="empty-history">No order history found</div>';
            return;
        }
        
        // Sort orders by date (newest first)
        const userOrders = [...orderHistory[currentUser]].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        const fragment = document.createDocumentFragment();
        
        userOrders.forEach(order => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-date">
                    <p>Order #${order.id} - ${order.date}</p>
                    <p>Customer: ${order.customer}</p>
                </div>
                <ul class="history-items">
                    ${order.items.map(item => `
                        <li>
                            <span>${item.name} x${item.quantity}</span>
                            <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    `).join('')}
                </ul>
                <div class="history-total">
                    <p>Total: ₱${order.total.toFixed(2)}</p>
                </div>
            `;
            fragment.appendChild(div);
        });
        
        historyItems.appendChild(fragment);
    }

    function showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Add to document
        document.body.appendChild(alertDiv);
        
        // Animation
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 300);
        }, 3000);
    }
});