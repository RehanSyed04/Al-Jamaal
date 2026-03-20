/**
 * ALJAMAAL OFFICIAL — Main JavaScript
 * Handles: Shopping cart, mobile menu, toast notifications
 */

/* ============================================================
   CART MANAGER
   Cart data is saved in the browser's localStorage so it
   persists when the user navigates between pages.
   ============================================================ */
const CartManager = {

  /** Get the current cart array from localStorage */
  getCart() {
    const data = localStorage.getItem('aljamaal_cart');
    return data ? JSON.parse(data) : [];
  },

  /** Save the cart array to localStorage */
  saveCart(cart) {
    localStorage.setItem('aljamaal_cart', JSON.stringify(cart));
  },

  /** Add a product to the cart (or increase its quantity if already there) */
  addItem(product) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }

    this.saveCart(cart);
    updateCartBadge();
    showToast(`"${product.name}" added to cart`);
  },

  /** Remove a product from the cart by its id */
  removeItem(id) {
    const cart = this.getCart().filter(item => item.id !== id);
    this.saveCart(cart);
    updateCartBadge();
  },

  /** Update the quantity of a cart item. Removes the item if qty drops to 0. */
  updateQty(id, newQty) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (newQty <= 0) {
      this.removeItem(id);
    } else {
      item.qty = newQty;
      this.saveCart(cart);
      updateCartBadge();
    }
  },

  /** Get the total price of all items in the cart */
  getTotal() {
    return this.getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  /** Get the total number of individual items in the cart */
  getCount() {
    return this.getCart().reduce((sum, item) => sum + item.qty, 0);
  },

  /** Empty the entire cart (called after successful payment) */
  clear() {
    localStorage.removeItem('aljamaal_cart');
    updateCartBadge();
  }
};

/* ============================================================
   CART BADGE — updates the little number on the cart icon
   ============================================================ */
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  const count = CartManager.getCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ============================================================
   TOAST NOTIFICATION — small popup at the bottom-right
   ============================================================ */
function showToast(message) {
  // Create toast element if it doesn't already exist
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  // Hide it after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================================
   MOBILE MENU — hamburger button toggle
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ============================================================
   PRODUCT CARDS — render product cards from products-data.js
   Called on index.html (featured) and products.html (full grid)
   ============================================================ */

/**
 * Creates the HTML for a single product card.
 * @param {Object} product - A product object from products-data.js
 * @returns {string} HTML string
 */
function createProductCardHTML(product) {
  const badge = product.badge
    ? `<span class="product-card-badge">${product.badge}</span>`
    : '';

  const priceDisplay = product.price > 0
    ? `R ${product.price.toFixed(2)}`
    : 'Price on request';

  const allImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image && !product.image.includes('placeholder') ? [product.image] : []);

  let imgHTML;
  if (allImages.length > 1) {
    const slides = allImages.map((src, i) =>
      `<div class="slide${i === 0 ? ' active' : ''}"><img src="${src}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;"></div>`
    ).join('');
    imgHTML = `
      <div class="card-slider" data-current="0">
        ${slides}
        <button class="card-slider-btn card-slider-prev" onclick="event.preventDefault();cardSlide(this,-1)">&#8249;</button>
        <button class="card-slider-btn card-slider-next" onclick="event.preventDefault();cardSlide(this,1)">&#8250;</button>
        <div class="slider-dots">${allImages.map((_, i) => `<span class="dot${i===0?' active':''}" onclick="event.preventDefault();cardGoTo(this,${i})"></span>`).join('')}</div>
      </div>`;
  } else if (allImages.length === 1) {
    imgHTML = `<img src="${allImages[0]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    imgHTML = `<div class="img-placeholder"><span>Photo<br>Coming Soon</span></div>`;
  }

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <a href="product.html?id=${product.id}" class="product-card-img">
        ${badge}
        ${imgHTML}
      </a>
      <div class="product-card-info">
        <p class="category">${product.category}</p>
        <a href="product.html?id=${product.id}"><h3>${product.name}</h3></a>
        <p class="price">${priceDisplay}</p>
        <button class="add-to-cart-btn" onclick="CartManager.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function cardSlide(btn, dir) {
  const slider = btn.closest('.card-slider');
  const slides = slider.querySelectorAll('.slide');
  const dots = slider.querySelectorAll('.dot');
  let current = parseInt(slider.dataset.current);
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (current + dir + slides.length) % slides.length;
  slider.dataset.current = current;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

function cardGoTo(dot, index) {
  const slider = dot.closest('.card-slider');
  const slides = slider.querySelectorAll('.slide');
  const dots = slider.querySelectorAll('.dot');
  let current = parseInt(slider.dataset.current);
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  slider.dataset.current = index;
  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

/**
 * Adds touch/swipe support to all .card-slider elements inside a container.
 * Call this after rendering product grids.
 */
function initCardSliderTouch(container) {
  container.querySelectorAll('.card-slider').forEach(slider => {
    let startX = 0;
    slider.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        const fakeBtn = { closest: () => slider };
        cardSlide(fakeBtn, dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  });
}

/**
 * Renders a set of products into a grid container.
 * @param {string} containerId - The id of the grid element
 * @param {Array} productList - Array of product objects to render
 */
function renderProductGrid(containerId, productList) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = productList.map(createProductCardHTML).join('');
}

/* ============================================================
   PRODUCTS PAGE — category filter
   ============================================================ */
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button style
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.filter;
      const filtered = selected === 'All'
        ? products
        : products.filter(p => p.category === selected);

      renderProductGrid('products-grid', filtered);
      initCardSliderTouch(document.getElementById('products-grid'));
    });
  });
}

/* ============================================================
   CART PAGE — render cart items
   ============================================================ */
function renderCart() {
  const cart = CartManager.getCart();
  const tableBody = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('empty-cart');
  const cartContent = document.getElementById('cart-content');

  if (!tableBody) return;

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }

  if (cartContent) cartContent.style.display = 'grid';
  if (emptyMsg) emptyMsg.style.display = 'none';

  tableBody.innerHTML = cart.map(item => `
    <tr>
      <td>
        <div class="cart-item-info">
          <div class="cart-item-img img-placeholder" style="width:70px;min-width:70px;height:85px;">
            <span style="font-size:10px;text-align:center;">Photo</span>
          </div>
          <div>
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-cat">${item.category}</p>
          </div>
        </div>
      </td>
      <td>R ${item.price.toFixed(2)}</td>
      <td>
        <div class="qty-control">
          <button onclick="changeQty(${item.id}, -1)">&#8722;</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">&#43;</button>
        </div>
      </td>
      <td>R ${(item.price * item.qty).toFixed(2)}</td>
      <td>
        <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">&#10005;</button>
      </td>
    </tr>
  `).join('');

  updateCartSummary();
}

function changeQty(id, delta) {
  const cart = CartManager.getCart();
  const item = cart.find(i => i.id === id);
  if (item) CartManager.updateQty(id, item.qty + delta);
  renderCart();
}

function removeFromCart(id) {
  CartManager.removeItem(id);
  renderCart();
}

function updateCartSummary() {
  const total = CartManager.getTotal();
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (subtotalEl) subtotalEl.textContent = `R ${total.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `R ${total.toFixed(2)}`;
}

/* ============================================================
   CHECKOUT PAGE — populate order summary + PayFast form
   ============================================================ */
function renderCheckoutSummary() {
  const cart = CartManager.getCart();
  const summaryList = document.getElementById('checkout-order-items');
  const totalEl = document.getElementById('checkout-total');
  const payfastAmount = document.getElementById('payfast-amount');

  if (!summaryList) return;

  if (cart.length === 0) {
    // If cart is empty, redirect back to products
    window.location.href = 'products.html';
    return;
  }

  summaryList.innerHTML = cart.map(item => `
    <div class="order-item">
      <span class="order-item-name">${item.name} &times; ${item.qty}</span>
      <span>R ${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  const total = CartManager.getTotal();
  if (totalEl) totalEl.textContent = `R ${total.toFixed(2)}`;
  if (payfastAmount) payfastAmount.value = total.toFixed(2);
}

/* ============================================================
   ACTIVE NAV LINK — highlight the current page in the nav
   ============================================================ */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   CONTACT FORM — simple validation + confirmation
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We will get back to you soon.');
    form.reset();
  });
}

/* ============================================================
   PAGE INIT — runs when the page loads
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initMobileMenu();
  setActiveNavLink();
  initContactForm();

  // Home page: render 4 featured products
  if (document.getElementById('featured-products')) {
    renderProductGrid('featured-products', products.slice(0, 4));
    initCardSliderTouch(document.getElementById('featured-products'));
  }

  // Products page: render all products + init filter
  if (document.getElementById('products-grid')) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    let productsToShow = products;
    if (category && category !== 'All') {
      productsToShow = products.filter(p => p.category === category);
    }
    renderProductGrid('products-grid', productsToShow);
    initCardSliderTouch(document.getElementById('products-grid'));
    initCategoryFilter();
    // Set active button based on category parameter
    if (category) {
      const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
      if (btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
  }

  // Cart page
  if (document.getElementById('cart-items')) {
    renderCart();
  }

  // Checkout page
  if (document.getElementById('checkout-order-items')) {
    renderCheckoutSummary();
  }
});
