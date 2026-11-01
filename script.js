'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'https://auraic-future-store.onrender.com/api/products';

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const cartButton = document.getElementById('cartButton');
    const cartPanel = document.getElementById('cartPanel');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const cartCount = document.getElementById('cartCount');
    const year = document.getElementById('year');
    const productGrid = document.getElementById('productGrid');

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Mobile menu
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const opened = navLinks.classList.toggle('show');
            menuToggle.textContent = opened ? '✕' : '☰';
            menuToggle.setAttribute('aria-expanded', String(opened));
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                menuToggle.textContent = '☰';
            });
        });
    }

    // Shopping cart panel
    function openCart() {
        if (!cartPanel || !overlay) return;
        cartPanel.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeCartPanel() {
        if (!cartPanel || !overlay) return;
        cartPanel.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    cartButton?.addEventListener('click', openCart);
    closeCart?.addEventListener('click', closeCartPanel);
    overlay?.addEventListener('click', closeCartPanel);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeCartPanel();
            navLinks?.classList.remove('show');
            if (menuToggle) menuToggle.textContent = '☰';
        }
    });

    // Load products from database
    async function loadProducts() {

        if (!productGrid) return;

        productGrid.innerHTML =
            '<p style="color:#46a6ff;padding:20px">Loading AURAIC collection...</p>';

        try {

            const response = await fetch(API_URL, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error('Product server error');
            }

            const data = await response.json();

            const products = (data.products || []).filter(product =>
                product.active === true &&
                Number(product.stock) > 0
            );

            productGrid.innerHTML = '';

            if (products.length === 0) {
                productGrid.innerHTML =
                    '<p style="color:white;padding:20px">No products available right now.</p>';
                return;
            }

            products.forEach((product, index) => {

                const card = document.createElement('article');
                card.className = 'product-card';

                const front = product.image || '';
                const back = product.back_image || '';

                card.innerHTML = `
                    <div class="product-image"
                         style="display:flex;flex-direction:column;gap:8px;padding:8px">

                        <span>A/${String(index + 1).padStart(2, '0')}</span>

                        <img
                            src="${escapeAttribute(front)}"
                            alt="${escapeAttribute(product.name)} front"
                            style="width:100%;height:220px;object-fit:contain"
                            onerror="this.style.display='none'">

                        ${back ? `
                        <img
                            src="${escapeAttribute(back)}"
                            alt="${escapeAttribute(product.name)} back"
                            style="width:100%;height:180px;object-fit:contain"
                            onerror="this.style.display='none'">
                        ` : ''}

                    </div>

                    <div class="product-info">
                        <div>
                            <h3>${escapeHTML(product.name)}</h3>
                            <p>${escapeHTML(product.color || 'AURAIC Collection')}</p>
                        </div>

                        <strong>₹${Number(product.price).toLocaleString('en-IN')}</strong>
                    </div>

                    <p class="coming-soon">
                        ${product.stock} AVAILABLE
                    </p>
                `;

                productGrid.appendChild(card);

            });

            const note = document.querySelector('.demo-note');
            if (note) note.style.display = 'none';

            console.log('AURAIC products loaded:', products.length);

        } catch (error) {

            console.error('AURAIC product error:', error);

            productGrid.innerHTML = `
                <p style="color:#ff7777;padding:20px">
                    Unable to load products. Please refresh the page.
                </p>
            `;
        }
    }

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }

    loadProducts();

    console.log('AURAIC Future Store loaded');

});
