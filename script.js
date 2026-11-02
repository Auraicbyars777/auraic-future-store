'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const API = 'https://auraic-future-store.onrender.com';
    const API_URL = API + '/api/products';

    const UPI_ID = '9633718879@fam';
    const WHATSAPP = '919633718879';

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const cartButton = document.getElementById('cartButton');
    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    const cartCount = document.getElementById('cartCount');
    const productGrid = document.getElementById('productGrid');

    let products = [];
    let cart = JSON.parse(localStorage.getItem('auraic_cart') || '[]');

    const money = amount =>
        '₹' + Number(amount).toLocaleString('en-IN');

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }

    function saveCart() {
        localStorage.setItem('auraic_cart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        if (cartCount) {
            cartCount.textContent = cart.reduce(
                (sum, item) => sum + item.quantity, 0
            );
        }
    }

    function openCart() {
        cartPanel?.classList.add('open');
        overlay?.classList.add('show');
        document.body.style.overflow = 'hidden';
        renderCart();
    }

    function closeCart() {
        cartPanel?.classList.remove('open');
        overlay?.classList.remove('show');
        document.body.style.overflow = '';
    }

    cartButton?.addEventListener('click', openCart);

    overlay?.addEventListener('click', closeCart);

    document.getElementById('closeCart')?.addEventListener(
        'click', closeCart
    );

    menuToggle?.addEventListener('click', () => {
        const opened = navLinks.classList.toggle('show');
        menuToggle.textContent = opened ? '✕' : '☰';
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeCart();
    });

    document.getElementById('year').textContent =
        new Date().getFullYear();

    function addToCart(id) {
        const product = products.find(p => Number(p.id) === Number(id));

        if (!product) return;

        const existing = cart.find(
            item => Number(item.id) === Number(id)
        );

        if (existing) {
            if (existing.quantity >= Number(product.stock)) {
                alert('Maximum available stock reached.');
                return;
            }
            existing.quantity++;
        } else {
            cart.push({
                id: product.id,
                quantity: 1
            });
        }

        saveCart();
        alert('Product added to your AURAIC cart!');
    }

    function changeQuantity(id, change) {
        const item = cart.find(
            p => Number(p.id) === Number(id)
        );

        const product = products.find(
            p => Number(p.id) === Number(id)
        );

        if (!item || !product) return;

        const next = item.quantity + change;

        if (next < 1) {
            cart = cart.filter(p => Number(p.id) !== Number(id));
        } else if (next <= Number(product.stock)) {
            item.quantity = next;
        } else {
            alert('Only ' + product.stock + ' available.');
        }

        saveCart();
        renderCart();
    }

    function renderCart() {
        if (!cartPanel) return;

        const items = cart.map(item => {
            const product = products.find(
                p => Number(p.id) === Number(item.id)
            );

            return product ? { ...product, quantity: item.quantity } : null;
        }).filter(Boolean);

        const total = items.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity, 0
        );

        cartPanel.innerHTML = `
            <button id="closeCart" class="close-cart">×</button>

            <p class="eyebrow">YOUR SELECTION</p>
            <h2>YOUR CART<span>.</span></h2>

            ${items.length ? items.map(item => `
                <div style="border-bottom:1px solid #555;padding:15px 0">
                    <h3>${escapeHTML(item.name)}</h3>
                    <p>${money(item.price)} each</p>

                    <button data-minus="${item.id}">−</button>
                    <strong style="padding:12px">${item.quantity}</strong>
                    <button data-plus="${item.id}">+</button>

                    <button data-remove="${item.id}"
                        style="margin-left:12px">Remove</button>

                    <p>Subtotal: ${money(item.price * item.quantity)}</p>
                </div>
            `).join('') : '<p>Your cart is empty.</p>'}

            <div class="cart-total">
                TOTAL <strong>${money(total)}</strong>
            </div>

            ${items.length ? `
                <h3 style="margin-top:25px">DELIVERY ADDRESS</h3>

                <form id="checkoutForm">

                    <input name="name" placeholder="Full Name"
                        maxlength="120" required>

                    <input name="phone" placeholder="Mobile Number"
                        type="tel" maxlength="20" required>

                    <input name="house" placeholder="House Name / Number"
                        maxlength="150" required>

                    <input name="street" placeholder="Street / Place"
                        maxlength="150" required>

                    <input name="post" placeholder="Post Office"
                        maxlength="100" required>

                    <input name="pin" placeholder="PIN Code"
                        inputmode="numeric" pattern="[0-9]{6}" required>

                    <input name="district" placeholder="District"
                        maxlength="100" required>

                    <input name="state" placeholder="State"
                        value="Kerala" required>

                    <input name="landmark" placeholder="Landmark (Optional)"
                        maxlength="150">

                    <h3>PAYMENT METHOD</h3>

                    <label>
                        <input type="radio" name="payment"
                            value="UPI" required>
                        UPI – FAM / PhonePe / GPay
                    </label>

                    <br><br>

                    <label>
                        <input type="radio" name="payment"
                            value="COD" required>
                        Cash on Delivery
                    </label>

                    <button type="submit"
                        class="primary-button"
                        style="width:100%;margin-top:20px">
                        PLACE ORDER
                    </button>
                </form>
            ` : ''}

        `;

        cartPanel.querySelector('#closeCart')
            ?.addEventListener('click', closeCart);

        cartPanel.querySelectorAll('[data-minus]').forEach(btn => {
            btn.addEventListener('click', () =>
                changeQuantity(btn.dataset.minus, -1)
            );
        });

        cartPanel.querySelectorAll('[data-plus]').forEach(btn => {
            btn.addEventListener('click', () =>
                changeQuantity(btn.dataset.plus, 1)
            );
        });

        cartPanel.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', () => {
                cart = cart.filter(
                    p => Number(p.id) !== Number(btn.dataset.remove)
                );
                saveCart();
                renderCart();
            });
        });

        cartPanel.querySelector('#checkoutForm')
            ?.addEventListener('submit', placeOrder);
    }

    async function placeOrder(event) {
        event.preventDefault();

        const form = event.target;
        const data = new FormData(form);

        const name = data.get('name').trim();
        const phone = data.get('phone').trim();
        const payment = data.get('payment');

        const address = [
            data.get('house'),
            data.get('street'),
            data.get('post'),
            data.get('pin'),
            data.get('district'),
            data.get('state'),
            data.get('landmark')
        ].filter(Boolean).join(', ');

        const items = cart.map(item => ({
            product_id: Number(item.id),
            quantity: Number(item.quantity)
        }));

        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'PROCESSING...';

        try {
            const response = await fetch(API + '/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_name: name,
                    phone,
                    address,
                    payment_method: payment,
                    items
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Order failed.');
            }

            const message = `
AURAIC NEW ORDER

Order ID: ${result.order_code}
Name: ${name}
Phone: ${phone}

Address:
${address}

Products:
${items.map(item => {
    const p = products.find(x => Number(x.id) === item.product_id);
    return p.name + ' x ' + item.quantity;
}).join('\n')}

Total: ${money(result.total)}
Payment: ${payment}
Payment Status: PENDING
            `.trim();

            cart = [];
            saveCart();

            if (payment === 'UPI') {
                const upiLink =
                    'upi://pay?pa=' + encodeURIComponent(UPI_ID) +
                    '&pn=' + encodeURIComponent('AURAIC') +
                    '&am=' + result.total +
                    '&cu=INR' +
                    '&tn=' + encodeURIComponent(result.order_code);

                window.open(upiLink, '_blank');
            }

            alert(
                'Order received! Your Order ID is ' +
                result.order_code +
                '. Payment status is pending.'
            );

            window.open(
                'https://wa.me/' + WHATSAPP +
                '?text=' + encodeURIComponent(message),
                '_blank'
            );

            renderCart();

        } catch (error) {
            alert(error.message);
            submit.disabled = false;
            submit.textContent = 'PLACE ORDER';
        }
    }

    async function loadProducts() {
        try {
            const response = await fetch(API_URL, {
                cache: 'no-store'
            });

            if (!response.ok) throw new Error('Product loading failed');

            const data = await response.json();

            products = (data.products || []).filter(product =>
                product.active === true &&
                Number(product.stock) > 0
            );

            productGrid.innerHTML = '';

            if (!products.length) {
                productGrid.innerHTML =
                    '<p>No products available right now.</p>';
                return;
            }

            products.forEach((product, index) => {
                const card = document.createElement('article');
                card.className = 'product-card';

                card.innerHTML = `
                    <div class="product-image"
                        style="padding:10px">

                        <span>A/${String(index + 1).padStart(2, '0')}</span>

                        <img src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                            style="width:100%;height:220px;object-fit:contain"
                            onerror="this.style.display='none'">

                        ${product.back_image ? `
                            <img src="${escapeHTML(product.back_image)}"
                                alt="Back view"
                                style="width:100%;height:180px;object-fit:contain"
                                onerror="this.style.display='none'">
                        ` : ''}
                    </div>

                    <div class="product-info">
                        <div>
                            <h3>${escapeHTML(product.name)}</h3>
                            <p>${escapeHTML(product.color || '')}</p>
                        </div>

                        <strong>${money(product.price)}</strong>
                    </div>

                    <p style="padding:0 12px;line-height:1.6">
                        ${escapeHTML(product.description || 'AURAIC Collection')}
                    </p>

                    <p style="padding:0 12px">
                        ${Number(product.stock)} AVAILABLE
                    </p>

                    <button class="primary-button"
                        data-add="${product.id}"
                        style="margin:12px;width:calc(100% - 24px)">
                        ADD TO CART
                    </button>
                `;

                productGrid.appendChild(card);
            });

            productGrid.querySelectorAll('[data-add]').forEach(btn => {
                btn.addEventListener('click', () =>
                    addToCart(btn.dataset.add)
                );
            });

            document.querySelector('.demo-note')?.remove();

        } catch (error) {
            console.error(error);
            productGrid.innerHTML =
                '<p>Unable to load products. Please refresh.</p>';
        }
    }

    updateCartCount();
    loadProducts();

    console.log('AURAIC shopping system loaded.');

});
