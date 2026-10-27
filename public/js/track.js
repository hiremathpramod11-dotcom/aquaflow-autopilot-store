// Order Tracking Controller

const trackForm = document.getElementById('trackForm');
const trackInput = document.getElementById('trackInput');
const resultCard = document.getElementById('resultCard');
const resOrderId = document.getElementById('resOrderId');
const resCustomer = document.getElementById('resCustomer');
const resStatusBadge = document.getElementById('resStatusBadge');
const resCarrier = document.getElementById('resCarrier');
const resTrackingNum = document.getElementById('resTrackingNum');
const resTimeline = document.getElementById('resTimeline');

// Check URL param ?id=AQF-98241
const urlParams = new URLSearchParams(window.location.search);
const initialId = urlParams.get('id') || urlParams.get('track');
if (initialId) {
  trackInput.value = initialId;
  doSearch(initialId);
}

trackForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = trackInput.value.trim();
  if (query) {
    doSearch(query);
  }
});

async function doSearch(query) {
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
    if (!res.ok) {
      alert(`No shipment found matching "${query}". Please verify your Order Number (e.g. AQF-98241).`);
      return;
    }
    const order = await res.json();
    renderResult(order);
  } catch (err) {
    alert("Tracking query failed: " + err.message);
  }
}

function renderResult(order) {
  resOrderId.innerText = `Order #${order.orderId}`;
  resCustomer.innerText = `Recipient: ${order.customer.name} (${order.customer.city})`;
  resCarrier.innerText = `Carrier: ${order.carrier}`;
  resTrackingNum.innerText = order.trackingNumber;

  resStatusBadge.className = `status-badge status-${order.fulfillmentStatus}`;
  resStatusBadge.innerText = order.fulfillmentStatus.replace('_', ' ');

  const timeline = order.timeline || [];
  resTimeline.innerHTML = timeline.map((t, idx) => `
    <div class="timeline-item">
      <div class="timeline-dot ${idx === timeline.length - 1 ? 'active' : ''}"></div>
      <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem;">${t.status}</div>
      <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${t.time} • Scanned by Logistics Partner</div>
    </div>
  `).join('');

  resultCard.style.display = 'block';
  resultCard.scrollIntoView({ behavior: 'smooth' });
}
