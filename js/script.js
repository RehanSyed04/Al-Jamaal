/**
 * AL JAMAAL OFFICIAL — Main JavaScript
 * Handles: Shopping cart, mobile menu, toast notifications
 */

/* ── Launch Banner ── */
(function() {
  if (sessionStorage.getItem('launch_banner_dismissed')) return;
  var banner = document.createElement('div');
  banner.style.cssText = 'background:#C9A84C;color:#fff;text-align:center;padding:10px 48px 10px 16px;font-size:14px;line-height:1.5;position:relative;z-index:999;';
  banner.innerHTML =
    'We\'ve just launched! Stock is still being confirmed — please ' +
    '<a href="https://wa.me/27603023555" target="_blank" rel="noopener" ' +
    'style="color:#fff;font-weight:700;text-decoration:underline;">check with us on WhatsApp</a> ' +
    'before placing your order.' +
    '<button onclick="this.parentElement.remove();sessionStorage.setItem(\'launch_banner_dismissed\',\'1\')" ' +
    'style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;" ' +
    'aria-label="Dismiss">&times;</button>';
  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('nav');
    if (nav) nav.insertAdjacentElement('afterend', banner);
    else document.body.prepend(banner);
  });
})();

/* ============================================================
   CART MANAGER
   Cart data is saved in the browser's localStorage so it
   persists when the user navigates between pages.
   ============================================================ */
const CartManager = {

  /** Get the current cart array from localStorage — clears if older than 30 min */
  getCart() {
    const expiry = localStorage.getItem('aljamaal_cart_expiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem('aljamaal_cart');
      localStorage.removeItem('aljamaal_cart_expiry');
      return [];
    }
    const data = localStorage.getItem('aljamaal_cart');
    return data ? JSON.parse(data) : [];
  },

  /** Save the cart array to localStorage and reset the 30-min expiry */
  saveCart(cart) {
    localStorage.setItem('aljamaal_cart', JSON.stringify(cart));
    localStorage.setItem('aljamaal_cart_expiry', Date.now() + 30 * 60 * 1000);
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
    const cart = this.getCart().filter(item => String(item.id) !== String(id));
    this.saveCart(cart);
    updateCartBadge();
  },

  /** Update the quantity of a cart item. Removes the item if qty drops to 0. */
  updateQty(id, newQty) {
    const cart = this.getCart();
    const item = cart.find(i => String(i.id) === String(id));
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
    localStorage.removeItem('aljamaal_cart_expiry');
    updateCartBadge();
  }
};

/* ============================================================
   CART BADGE — updates the little number on the cart icon
   ============================================================ */
function updateCartBadge() {
  const count = CartManager.getCount();
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
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

  // Inject mobile cart icon next to hamburger (mobile only)
  const navbarInner = document.querySelector('.navbar-inner');
  if (navbarInner) {
    const mobileCart = document.createElement('a');
    mobileCart.href = 'cart.html';
    mobileCart.className = 'mobile-cart-link';
    mobileCart.innerHTML = '🛒 <span class="cart-badge" style="display:none;">0</span>';
    navbarInner.insertBefore(mobileCart, hamburger);
    updateCartBadge();
  }

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
   PRODUCT CARDS — render product cards from D1
   Called on index.html (featured) and products.html (full grid)
   ============================================================ */

/**
 * Creates the HTML for a single product card.
 * @param {Object} product - A product object from D1
 * @returns {string} HTML string
 */
function createProductCardHTML(product) {
  const badge = product.badge
    ? `<span class="product-card-badge">${product.badge}</span>`
    : '';

  const sizePrices = product.sizes && product.sizes.length > 0 ? product.sizes.map(s => s.price) : [];
  const priceDisplay = sizePrices.length > 0
    ? `From R ${Math.min(...sizePrices).toFixed(2)}`
    : product.price > 0 ? `R ${product.price.toFixed(2)}` : 'Price on request';

  // Normalize images to {url, label} — handles both old string format and new object format
  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image && !product.image.includes('placeholder') ? [product.image] : []);
  const allImages = rawImages.map(img =>
    typeof img === 'string' ? { url: img, label: '' } : { url: img.url || img, label: img.label || '' }
  );

  let imgHTML;
  if (allImages.length > 1) {
    const slides = allImages.map((img, i) => {
      const isVideo = img.url.match(/\.(mp4|webm|mov)$/i);
      const media = isVideo
        ? `<video controls controlsList="nodownload" disablePictureInPicture style="width:100%;height:100%;object-fit:cover;"><source src="${img.url}" type="video/mp4"></video>`
        : `<img src="${img.url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`;
      const label = img.label ? `<span class="color-label">${img.label}</span>` : '';
      return `<div class="slide${i === 0 ? ' active' : ''}">${media}${label}</div>`;
    }).join('');
    imgHTML = `
      <div class="card-slider" data-current="0">
        ${slides}
        <button class="card-slider-btn card-slider-prev" onclick="event.preventDefault();cardSlide(this,-1)">&#8249;</button>
        <button class="card-slider-btn card-slider-next" onclick="event.preventDefault();cardSlide(this,1)">&#8250;</button>
        <div class="slider-dots">${allImages.map((_, i) => `<span class="dot${i===0?' active':''}" onclick="event.preventDefault();cardGoTo(this,${i})"></span>`).join('')}</div>
      </div>`;
  } else if (allImages.length === 1) {
    const label = allImages[0].label ? `<span class="color-label">${allImages[0].label}</span>` : '';
    imgHTML = `<img src="${allImages[0].url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">${label}`;
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
        <button class="add-to-cart-btn" onclick="window.location.href='product.html?id=${product.id}'">
          View Product
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
   PRODUCTS PAGE — search + category filter
   ============================================================ */
function getFilteredProducts() {
  var searchInput = document.getElementById('product-search');
  var term = searchInput ? searchInput.value.toLowerCase().trim() : '';
  var activeBtn = document.querySelector('.filter-btn.active');
  var category = activeBtn ? activeBtn.dataset.filter : 'All';

  return products.filter(function(p) {
    var matchesCategory = category === 'All' || p.category === category;
    var matchesSearch = !term ||
      (p.name && p.name.toLowerCase().indexOf(term) !== -1) ||
      (p.description && p.description.toLowerCase().indexOf(term) !== -1);
    return matchesCategory && matchesSearch;
  });
}

function applyProductFilters() {
  var filtered = getFilteredProducts();
  renderProductGrid('products-grid', filtered);
  initCardSliderTouch(document.getElementById('products-grid'));

  var noResults = document.getElementById('products-no-results');
  if (noResults) noResults.style.display = filtered.length === 0 ? 'block' : 'none';
}

function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyProductFilters();
    });
  });
}

function initSearch() {
  var input = document.getElementById('product-search');
  if (!input) return;
  input.addEventListener('input', applyProductFilters);
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

  tableBody.innerHTML = cart.map(item => {
    const safeId = String(item.id).replace(/"/g, '&quot;');
    return `
    <tr>
      <td>
        <div class="cart-item-info">
          <a href="product.html?id=${safeId}">
            ${item.image
              ? `<img src="${item.image}" alt="${item.name}" style="width:70px;min-width:70px;height:85px;object-fit:cover;border-radius:6px;">`
              : `<div class="cart-item-img img-placeholder" style="width:70px;min-width:70px;height:85px;"><span style="font-size:10px;text-align:center;">Photo</span></div>`
            }
          </a>
          <div>
            <a href="product.html?id=${safeId}" style="text-decoration:none; color:inherit;">
              <p class="cart-item-name">${item.name}</p>
            </a>
            <p class="cart-item-cat">${item.category}</p>
          </div>
        </div>
      </td>
      <td>R ${item.price.toFixed(2)}</td>
      <td>
        <div class="qty-control">
          <button onclick="changeQty('${safeId}', -1)">&#8722;</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${safeId}', 1)">&#43;</button>
        </div>
      </td>
      <td>R ${(item.price * item.qty).toFixed(2)}</td>
      <td>
        <button class="remove-btn" onclick="removeFromCart('${safeId}')" title="Remove item">&#10005;</button>
      </td>
    </tr>
  `;
  }).join('');

  updateCartSummary();
}

function getCartItemStock(item) {
  if (!products.length) return null;
  const productId = item.productId || parseInt(String(item.id).split('-')[0]);
  const product = products.find(p => p.id === productId);
  if (!product || !product.stock) return null;

  // Flat numeric stock
  if (typeof product.stock === 'number') return product.stock;

  // Use the stockKey and color stored on the cart item at add-to-cart time
  let stockKey = item.stockKey || null;
  const color = item.color || null;

  // Fallback for __simple__ products (no size selector, stock keyed under __simple__)
  if (!stockKey && product.stock.__simple__ !== undefined) stockKey = '__simple__';

  if (!stockKey) return null;
  const sizeStock = product.stock[stockKey];
  if (sizeStock === undefined || sizeStock === null) return null;

  // Worker returns a flat number for __simple__ products with no colour
  if (typeof sizeStock === 'number') return sizeStock;

  if (color) return sizeStock[color] !== undefined ? sizeStock[color] : 0;
  // No colour variant — grab the single entry
  const vals = Object.values(sizeStock);
  return vals.length ? vals[0] : null;
}

function changeQty(id, delta) {
  const cart = CartManager.getCart();
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;

  if (delta > 0) {
    const available = getCartItemStock(item);
    if (available !== null && item.qty >= available) {
      showToast('Only ' + available + ' available in this size and colour.');
      return;
    }
  }

  CartManager.updateQty(id, item.qty + delta);
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

  // Init EmailJS with public key
  emailjs.init('7SF-nob6cWJgKT8d1');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (form.message.value.length > 2000) {
      showToast('Message is too long. Please keep it under 2000 characters.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Map form fields to EmailJS template variables
    const params = {
      name:    form.name.value,
      email:   form.email.value,
      title:   form.subject.value,
      message: form.message.value
    };

    // Send contact notification to business (auto-reply handled by linked template)
    emailjs.send('service_c0nsybo', 'template_ysskhq2', params)
      .then(() => {
        showToast('Message sent! We will get back to you soon.');
        form.reset();
        btn.textContent = 'Send Message';
        btn.disabled = false;
      })
      .catch(() => {
        showToast('Something went wrong. Please try again.');
        btn.textContent = 'Send Message';
        btn.disabled = false;
      });
  });
}

/* ============================================================
   STT BTN — scroll-to-top btn, injected on every pg
   Shows after 300px scroll, smooth-scrolls back to top
   ============================================================ */
function initSTT() {
  const btn = document.createElement('button');
  btn.id = 'stt-btn';
  btn.title = 'Back to top';
  btn.innerHTML = '&#8679;';
  document.body.appendChild(btn);


  // Show after scrolling 300px, hide when back at top
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  // Smooth scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   REVIEWS — load and submit product reviews
   ============================================================ */
function renderReviewStars(rating) {
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<span style="color:' + (i <= rating ? '#C9A84C' : '#E8E2D7') + ';">★</span>';
  }
  return html;
}

function timeAgo(dateStr) {
  var diff = Math.floor((Date.now() - new Date(dateStr + 'Z').getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + (Math.floor(diff / 60) === 1 ? ' minute ago' : ' minutes ago');
  if (diff < 86400) return Math.floor(diff / 3600) + (Math.floor(diff / 3600) === 1 ? ' hour ago' : ' hours ago');
  if (diff < 604800) return Math.floor(diff / 86400) + (Math.floor(diff / 86400) === 1 ? ' day ago' : ' days ago');
  if (diff < 2592000) return Math.floor(diff / 604800) + (Math.floor(diff / 604800) === 1 ? ' week ago' : ' weeks ago');
  return Math.floor(diff / 2592000) + (Math.floor(diff / 2592000) === 1 ? ' month ago' : ' months ago');
}

var _reviewRating = 0;

function setReviewRating(val) {
  _reviewRating = val;
  document.getElementById('review-rating').value = val;
  document.querySelectorAll('#star-picker span').forEach(function(s) {
    s.style.color = parseInt(s.dataset.val) <= val ? '#C9A84C' : '#E8E2D7';
  });
}

async function loadProductReviews(productId) {
  var listEl = document.getElementById('reviews-list');
  var summaryEl = document.getElementById('reviews-summary');
  var headingEl = document.getElementById('reviews-heading');
  if (!listEl) return;

  try {
    var res = await fetch('https://aljamaal-shipping.syedsarmiento.workers.dev/get-reviews?product_id=' + productId);
    if (!res.ok) throw new Error('fetch failed');
    var reviews = await res.json();

    if (headingEl) headingEl.textContent = reviews.length ? reviews.length + ' Review' + (reviews.length !== 1 ? 's' : '') : 'Reviews';

    var topEl = document.getElementById('product-rating-summary');
    if (reviews.length === 0) {
      summaryEl.innerHTML = '';
      if (topEl) topEl.innerHTML = '';
      listEl.innerHTML = '<p style="color:#888;font-size:15px;padding:8px 0 24px;">No reviews yet — be the first to leave one below!</p>';
      return;
    }

    var avg = reviews.reduce(function(s, r) { return s + r.rating; }, 0) / reviews.length;

    if (topEl) {
      topEl.innerHTML = '<a href="#reviews-heading" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;">' +
        '<span style="font-size:16px;color:#C9A84C;">' + renderReviewStars(Math.round(avg)) + '</span>' +
        '<span style="font-size:14px;color:#888;">' + avg.toFixed(1) + ' · ' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') + '</span>' +
      '</a>';
    }

    var counts = [0, 0, 0, 0, 0];
    reviews.forEach(function(r) { counts[r.rating - 1]++; });
    var max = Math.max.apply(null, counts);

    var summaryHTML = '<div style="display:flex;align-items:center;gap:24px;margin-bottom:32px;flex-wrap:wrap;">' +
      '<div style="text-align:center;">' +
        '<div style="font-size:52px;font-weight:700;line-height:1;color:#1A1A1A;">' + avg.toFixed(1) + '</div>' +
        '<div style="font-size:20px;color:#C9A84C;margin:6px 0;">' + renderReviewStars(Math.round(avg)) + '</div>' +
        '<div style="font-size:13px;color:#888;">' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') + '</div>' +
      '</div>' +
      '<div style="flex:1;min-width:180px;">';
    for (var i = 5; i >= 1; i--) {
      var pct = max > 0 ? (counts[i - 1] / max) * 100 : 0;
      summaryHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
        '<span style="font-size:13px;color:#555;width:10px;text-align:right;">' + i + '</span>' +
        '<span style="color:#C9A84C;font-size:13px;">★</span>' +
        '<div style="flex:1;height:8px;background:#E8E2D7;border-radius:4px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;height:100%;background:#C9A84C;border-radius:4px;"></div>' +
        '</div>' +
        '<span style="font-size:13px;color:#888;width:18px;">' + counts[i - 1] + '</span>' +
      '</div>';
    }
    summaryHTML += '</div></div>';
    summaryEl.innerHTML = summaryHTML;

    listEl.innerHTML = reviews.map(function(r) {
      var safeName = r.reviewer_name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var safeBody = r.body.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<div style="padding:20px 0;border-top:1px solid #E8E2D7;">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">' +
          '<div style="font-size:15px;font-weight:700;">' + safeName + '</div>' +
          '<div style="font-size:16px;">' + renderReviewStars(r.rating) + '</div>' +
          '<div style="font-size:12px;color:#aaa;margin-left:auto;">' + timeAgo(r.created_at) + '</div>' +
        '</div>' +
        '<p style="font-size:15px;color:#444;line-height:1.7;margin:0;">' + safeBody + '</p>' +
      '</div>';
    }).join('');
  } catch(e) {
    if (listEl) listEl.innerHTML = '<p style="color:#888;font-size:14px;">Could not load reviews.</p>';
  }
}

async function submitReviewForm(e) {
  e.preventDefault();
  var name = document.getElementById('review-name').value.trim();
  var rating = parseInt(document.getElementById('review-rating').value);
  var body = document.getElementById('review-body').value.trim();
  var msgEl = document.getElementById('review-msg');
  var btn = document.getElementById('review-submit-btn');

  if (!rating) {
    msgEl.innerHTML = '<span style="color:#c0392b;">Please select a star rating.</span>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Submitting...';
  msgEl.innerHTML = '';

  try {
    var productId = parseInt(new URLSearchParams(window.location.search).get('id'));
    var res = await fetch('https://aljamaal-shipping.syedsarmiento.workers.dev/submit-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, reviewer_name: name, rating: rating, body: body })
    });
    if (!res.ok) throw new Error('failed');
    document.getElementById('review-form').reset();
    _reviewRating = 0;
    document.querySelectorAll('#star-picker span').forEach(function(s) { s.style.color = '#E8E2D7'; });
    msgEl.innerHTML = '<span style="color:#27ae60;">Thank you for your review! Reviews typically go live within 24 hours.</span>';
  } catch(e) {
    msgEl.innerHTML = '<span style="color:#c0392b;">Something went wrong. Please try again.</span>';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Review';
  }
}

/* ============================================================
   PAGE INIT — runs when the page loads
   ============================================================ */
function initAdminSession() {
  if (!localStorage.getItem('aljamaal_admin_key')) return;
  var activityTimer = null;
  function resetExpiry() {
    var mins = parseInt(localStorage.getItem('aljamaal_session_timeout') || '20');
    localStorage.setItem('aljamaal_admin_expiry', Date.now() + mins * 60 * 1000);
  }
  function onActivity() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(resetExpiry, 500);
  }
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(function(evt) {
    document.addEventListener(evt, onActivity, { passive: true });
  });
  resetExpiry();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.copyright-year').forEach(el => el.textContent = new Date().getFullYear());
  updateCartBadge();
  initMobileMenu();
  initSTT();
  setActiveNavLink();
  initContactForm();
  initAdminSession();

  // Home page: render 1 featured product from each category
  if (document.getElementById('featured-products')) {
    const categories = ['Men', 'Women', 'Kids', 'Home & Gifts', 'Perfumes'];
    const featured = categories.map(cat => products.find(p => p.category === cat && p.badge !== 'Sold Out') || products.find(p => p.category === cat)).filter(Boolean);
    renderProductGrid('featured-products', featured);
    initCardSliderTouch(document.getElementById('featured-products'));
  }

  // Products page: render all products + init filter + search
  if (document.getElementById('products-grid')) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      var searchInput = document.getElementById('product-search');
      if (searchInput) searchInput.value = searchQuery;
    }
    initCategoryFilter();
    initSearch();
    if (category) {
      const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
      if (btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
    applyProductFilters();
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
