// AquaFlow Direct Storefront Controller

let allProducts = [];
let currentCategory = 'ALL';
let cart = JSON.parse(localStorage.getItem('aquaflow_cart') || '[]');

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const totalProductCount = document.getElementById('totalProductCount');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Modal Elements
const productDetailModal = document.getElementById('productDetailModal');
const productModalBackdrop = document.getElementById('productModalBackdrop');
const closeProductModalBtn = document.getElementById('closeProductModalBtn');
const modalProductImg = document.getElementById('modalProductImg');
const modalProductTitle = document.getElementById('modalProductTitle');
const modalProductBadge = document.getElementById('modalProductBadge');
const modalProductRating = document.getElementById('modalProductRating');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductCompare = document.getElementById('modalProductCompare');
const modalProductHook = document.getElementById('modalProductHook');
const modalProductBullets = document.getElementById('modalProductBullets');
const modalShippingTime = document.getElementById('modalShippingTime');
const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
let activeModalProduct = null;

// Chat Elements
const openChatBtn = document.getElementById('openChatBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Social Proof Elements
const socialProofToast = document.getElementById('socialProofToast');
const toastImg = document.getElementById('toastImg');
const toastName = document.getElementById('toastName');
const toastCity = document.getElementById('toastCity');
const toastAction = document.getElementById('toastAction');

// 1. Fetch & Render Catalog
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
    totalProductCount.innerText = allProducts.length;
    renderProducts();
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

function renderProducts() {
  const filtered = currentCategory === 'ALL' 
    ? allProducts 
    : allProducts.filter(p => p.category.toLowerCase().includes(currentCategory.toLowerCase()) || (p.tags && p.tags.some(t => t.toLowerCase().includes(currentCategory.toLowerCase()))));

  productsGrid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="card-badge">${p.badge || '🔥 VIRAL'}</div>
      <div class="card-image-wrap" onclick="openProductModal('${p.id}')">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3 class="card-title" onclick="openProductModal('${p.id}')">${p.title}</h3>
        <div class="card-rating">
          <i class="fa-solid fa-star"></i>
          <strong>${p.rating}</strong>
          <span>(${p.reviewCount} reviews)</span>
        </div>
        <div class="card-stock-alert">
          <i class="fa-solid fa-fire"></i> High Demand: Only ${p.stock || 12} left in stock
        </div>
        <div class="card-pricing">
          <span class="price-current">$${p.price.toFixed(2)}</span>
          <span class="price-compare">$${p.compareAtPrice.toFixed(2)}</span>
          <span class="price-save">SAVE 50%</span>
        </div>
        <div class="card-actions">
          <button class="btn-buy" onclick="addToCart('${p.id}')">
            <i class="fa-solid fa-cart-plus"></i> Quick Add to Bag
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 2. Filter tabs
document.querySelectorAll('.filter-chip, .filter-nav').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.filter-nav').forEach(c => c.classList.remove('active'));
    
    currentCategory = btn.getAttribute('data-category');
    btn.classList.add('active');
    renderProducts();
  });
});

// 3. Cart Management
function updateCartUI() {
  localStorage.setItem('aquaflow_cart', JSON.stringify(cart));
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCountBadge.innerText = count;
  document.getElementById('cartDrawerCount').innerText = count;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
  cartTotal.innerText = `$${subtotal.toFixed(2)}`;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
        <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; margin-bottom: 12px; color: #cbd5e1;"></i>
        <p style="font-weight: 600;">Your shopping bag is empty</p>
        <p style="font-size: 0.8rem; margin-top: 6px;">Add any viral innovation above to qualify for free express shipping!</p>
      </div>
    `;
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.5';
  } else {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
            <i class="fa-solid fa-trash-can"></i> Remove
          </button>
        </div>
      </div>
    `).join('');
  }
}

function addToCart(productId) {
  const prod = allProducts.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      cost: prod.supplierCost,
      image: prod.image,
      quantity: 1
    });
  }

  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
}

function openCart() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
}

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

// 4. Express Priority Checkout Modal Handling
const checkoutModal = document.getElementById('checkoutModal');
const checkoutModalBackdrop = document.getElementById('checkoutModalBackdrop');
const closeCheckoutModalBtn = document.getElementById('closeCheckoutModalBtn');
const customerCheckoutForm = document.getElementById('customerCheckoutForm');
const checkoutPayableAmount = document.getElementById('checkoutPayableAmount');
const submitOrderBtn = document.getElementById('submitOrderBtn');

const custPaymentMethod = document.getElementById('custPaymentMethod');
const upiPaymentCard = document.getElementById('upiPaymentCard');
const upiQrCodeImg = document.getElementById('upiQrCodeImg');
const upiAmountInr = document.getElementById('upiAmountInr');
const upiVpaDisplay = document.getElementById('upiVpaDisplay');
const copyUpiIdBtn = document.getElementById('copyUpiIdBtn');
const mobileUpiIntentBtn = document.getElementById('mobileUpiIntentBtn');
const custUtrNumber = document.getElementById('custUtrNumber');

let storeSettings = null;

async function fetchStoreSettings() {
  if (storeSettings) return storeSettings;
  try {
    const res = await fetch('/api/settings');
    storeSettings = await res.json();
    return storeSettings;
  } catch (e) {
    return {
      activeIntegrations: {
        upi: { vpa: "hiremathpramod@upi", payeeName: "AquaFlow Store", currencyRate: 86.5 }
      }
    };
  }
}

async function updateUpiDisplay(subtotalUsd) {
  const settings = await fetchStoreSettings();
  const upiConfig = settings?.activeIntegrations?.upi || settings?.upi || {
    vpa: "hiremathpramod@upi",
    payeeName: "AquaFlow Store",
    currencyRate: 86.5
  };

  const vpa = upiConfig.vpa || "hiremathpramod@upi";
  const payeeName = upiConfig.payeeName || "AquaFlow Store";
  const rate = upiConfig.currencyRate || 86.5;
  const inrAmount = Math.max(99, Math.round(subtotalUsd * rate));

  if (upiVpaDisplay) upiVpaDisplay.innerText = vpa;
  if (upiAmountInr) upiAmountInr.innerText = `₹${inrAmount.toLocaleString('en-IN')}`;

  // Standard NPCI UPI URI Scheme
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${inrAmount}&cu=INR&tn=AquaFlow-Order`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentUri)}`;

  if (upiQrCodeImg) upiQrCodeImg.src = qrApiUrl;
  if (mobileUpiIntentBtn) mobileUpiIntentBtn.href = upiIntentUri;
}

if (custPaymentMethod && upiPaymentCard) {
  custPaymentMethod.addEventListener('change', () => {
    if (custPaymentMethod.value === 'UPI') {
      upiPaymentCard.style.display = 'block';
    } else {
      upiPaymentCard.style.display = 'none';
    }
  });
}

if (copyUpiIdBtn && upiVpaDisplay) {
  copyUpiIdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(upiVpaDisplay.innerText);
    copyUpiIdBtn.innerText = "Copied!";
    setTimeout(() => { copyUpiIdBtn.innerText = "Copy"; }, 2000);
  });
}

function openCheckoutModal() {
  if (cart.length === 0) return;
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  if (checkoutPayableAmount) checkoutPayableAmount.innerText = `$${subtotal.toFixed(2)}`;
  updateUpiDisplay(subtotal);
  if (checkoutModal) checkoutModal.style.display = 'flex';
  if (checkoutModalBackdrop) checkoutModalBackdrop.style.display = 'block';
  closeCart();
}

function closeCheckoutModal() {
  if (checkoutModal) checkoutModal.style.display = 'none';
  if (checkoutModalBackdrop) checkoutModalBackdrop.style.display = 'none';
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', openCheckoutModal);
}

if (closeCheckoutModalBtn) {
  closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);
}

if (checkoutModalBackdrop) {
  checkoutModalBackdrop.addEventListener('click', closeCheckoutModal);
}

if (customerCheckoutForm) {
  customerCheckoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const name = document.getElementById('custName')?.value.trim() || "Valued Customer";
    const phone = document.getElementById('custPhone')?.value.trim() || "";
    const email = document.getElementById('custEmail')?.value.trim() || (phone ? `${phone}@delivery.aquaflow.com` : "customer@example.com");
    const address = document.getElementById('custAddress')?.value.trim() || "Priority Express Address";
    const city = document.getElementById('custCity')?.value.trim() || "Global Delivery";
    const paymentMethod = document.getElementById('custPaymentMethod')?.value || "COD";

    submitOrderBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing & Dispatching...`;
    submitOrderBtn.disabled = true;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          address: address,
          city: city,
          paymentMethod: paymentMethod,
          utrNumber: custUtrNumber?.value.trim() || "",
          paymentStatus: paymentMethod === 'COD' ? "PENDING_CASH_ON_DELIVERY" : (paymentMethod === 'UPI' ? "PAID_DIRECT_UPI" : "PAID"),
          country: "India",
          subtotal: subtotal,
          shipping: 0.00,
          total: subtotal,
          items: cart
        })
      });

      const data = await res.json();
      if (data.success) {
        cart = [];
        updateCartUI();
        closeCheckoutModal();
        
        let confirmMsg = `🎉 ORDER CONFIRMED!\n\nThank you ${name}!\nOrder #${data.order.orderId} has been confirmed.`;
        if (paymentMethod === 'UPI') {
          confirmMsg += `\n\n💰 Payment Method: Direct UPI (Instant Bank Deposit)\nStatus: Confirmed and verifying UTR!`;
        }
        confirmMsg += `\n\nFulfillment Status: Dispatching via CJ Global Express\nLive Tracking Number: ${data.order.trackingNumber}\n\nRedirecting to tracking portal...`;
        
        alert(confirmMsg);
        window.location.href = `/track?id=${data.order.orderId}`;
      } else {
        alert("Order placement failed: " + (data.error || "Please try again"));
      }
    } catch (err) {
      alert("Checkout error: " + err.message);
    } finally {
      submitOrderBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Place Order Now (Free Delivery)`;
      submitOrderBtn.disabled = false;
    }
  });
}

// 5. Product Modal
function openProductModal(productId) {
  const prod = allProducts.find(p => p.id === productId);
  if (!prod) return;
  activeModalProduct = prod;

  modalProductBadge.innerText = prod.badge || 'HOT TREND';
  modalProductImg.src = prod.image;
  modalProductTitle.innerText = prod.title;
  modalProductRating.innerHTML = `<i class="fa-solid fa-star"></i> ${prod.rating} (${prod.reviewCount} verified reviews)`;
  modalProductPrice.innerText = `$${prod.price.toFixed(2)}`;
  modalProductCompare.innerText = `$${prod.compareAtPrice.toFixed(2)}`;
  modalProductHook.innerText = `"${prod.hook || prod.description}"`;
  modalShippingTime.innerText = prod.shippingTime || '3-6 Days Priority Delivery';

  modalProductBullets.innerHTML = (prod.bullets || []).map(b => `
    <li>${b}</li>
  `).join('');

  productDetailModal.style.display = 'flex';
  productModalBackdrop.classList.add('open');
}

function closeProductModal() {
  productDetailModal.style.display = 'none';
  productModalBackdrop.classList.remove('open');
}

closeProductModalBtn.addEventListener('click', closeProductModal);
productModalBackdrop.addEventListener('click', closeProductModal);
modalAddToCartBtn.addEventListener('click', () => {
  if (activeModalProduct) {
    addToCart(activeModalProduct.id);
    closeProductModal();
  }
});

const modalShareWhatsAppBtn = document.getElementById('modalShareWhatsAppBtn');
const modalCopyLinkBtn = document.getElementById('modalCopyLinkBtn');

if (modalShareWhatsAppBtn) {
  modalShareWhatsAppBtn.addEventListener('click', () => {
    if (!activeModalProduct) return;
    const currentUrl = window.location.origin;
    const text = `🔥 Check out this viral ${activeModalProduct.title}! It's on 50% OFF Flash Sale with Free Priority Shipping:\n\n👉 ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  });
}

if (modalCopyLinkBtn) {
  modalCopyLinkBtn.addEventListener('click', () => {
    if (!activeModalProduct) return;
    const currentUrl = window.location.origin;
    const link = `${currentUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        alert("✅ Deal link copied to clipboard! Send this to friends or paste into your social bio!");
      });
    } else {
      prompt("Copy your deal link:", link);
    }
  });
}

// 6. Social Proof Popup
const buyerNamesList = [
  { name: "Sophia M.", city: "New York, NY" },
  { name: "David L.", city: "Austin, TX" },
  { name: "Chloe T.", city: "Miami, FL" },
  { name: "Alexander K.", city: "Seattle, WA" },
  { name: "Olivia P.", city: "Chicago, IL" },
  { name: "Daniel W.", city: "Denver, CO" }
];

function triggerSocialProof() {
  if (allProducts.length === 0) return;
  const buyer = buyerNamesList[Math.floor(Math.random() * buyerNamesList.length)];
  const prod = allProducts[Math.floor(Math.random() * allProducts.length)];
  const minsAgo = Math.floor(Math.random() * 8) + 1;

  toastImg.src = prod.image;
  toastName.innerText = buyer.name;
  toastCity.innerText = buyer.city;
  toastAction.innerText = `Purchased ${prod.title.slice(0, 32)}...`;
  toastTime.innerText = `${minsAgo} minutes ago • Verified Buyer`;

  socialProofToast.classList.add('show');
  setTimeout(() => {
    socialProofToast.classList.remove('show');
  }, 5000);
}

setInterval(triggerSocialProof, 18000);
setTimeout(triggerSocialProof, 3500);

// 7. 24/7 AI Chat Widget
openChatBtn.addEventListener('click', () => {
  chatBox.classList.toggle('open');
  if (chatBox.classList.contains('open')) {
    chatInput.focus();
  }
});

closeChatBtn.addEventListener('click', () => {
  chatBox.classList.remove('open');
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  // Add User Bubble
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user';
  userDiv.innerText = text;
  chatMessages.appendChild(userDiv);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Show typing
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot';
  typingDiv.innerText = 'Typing...';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    typingDiv.innerHTML = data.reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  } catch (err) {
    typingDiv.innerText = "Support assistant is momentarily refreshing. Please check back in a few seconds!";
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// 8. Real-Time WebSocket Updates
function setupWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_PRODUCT') {
        fetchProducts(); // Refresh live catalog
      }
    } catch (e) {}
  };

  ws.onclose = () => {
    setTimeout(setupWebSocket, 4000);
  };
}

// Initial Load
fetchProducts();
updateCartUI();
setupWebSocket();
