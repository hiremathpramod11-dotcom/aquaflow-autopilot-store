// Executive Autopilot Admin Controller

let settings = {};
let analytics = {};
let products = [];
let orders = [];
let ads = [];

// DOM Elements
const autopilotStatusBadge = document.getElementById('autopilotStatusBadge');
const autopilotStatusText = document.getElementById('autopilotStatusText');
const autopilotBeacon = document.getElementById('autopilotBeacon');
const toggleAutopilotBtn = document.getElementById('toggleAutopilotBtn');
const triggerCycleBtn = document.getElementById('triggerCycleBtn');
const terminalLogs = document.getElementById('terminalLogs');

// KPIs
const kpiRevenue = document.getElementById('kpiRevenue');
const kpiProfit = document.getElementById('kpiProfit');
const kpiRoas = document.getElementById('kpiRoas');
const kpiOrders = document.getElementById('kpiOrders');
const kpiVisitors = document.getElementById('kpiVisitors');

// Tables & Lists
const productsTableBody = document.getElementById('productsTableBody');
const ordersTableBody = document.getElementById('ordersTableBody');
const adCampaignsContainer = document.getElementById('adCampaignsContainer');
const huntNowBtn = document.getElementById('huntNowBtn');

// Settings Form
const settingsForm = document.getElementById('settingsForm');
const settingInterval = document.getElementById('settingInterval');
const settingMultiplier = document.getElementById('settingMultiplier');
const settingSupplier = document.getElementById('settingSupplier');
const settingSimulatedTraffic = document.getElementById('settingSimulatedTraffic');

// Tab Switching
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');

    tab.classList.add('active');
    const targetId = tab.getAttribute('data-tab');
    document.getElementById(targetId).style.display = 'block';
  });
});

// Fetch All Initial Data
async function loadAllData() {
  try {
    const [resSet, resAna, resProd, resOrd, resAds] = await Promise.all([
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/ads').then(r => r.json())
    ]);

    settings = resSet;
    analytics = resAna;
    products = resProd;
    orders = resOrd;
    ads = resAds;

    updateUI();
  } catch (err) {
    console.error('Failed to load admin data', err);
  }
}

function updateUI() {
  // Autopilot Status
  if (settings.autopilotActive) {
    autopilotStatusText.innerText = "AUTOPILOT: ACTIVE (CYCLE RUNNING)";
    autopilotStatusBadge.style.color = "#34d399";
    autopilotStatusBadge.style.background = "rgba(16, 185, 129, 0.12)";
    autopilotStatusBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";
    autopilotBeacon.style.background = "#10b981";
  } else {
    autopilotStatusText.innerText = "AUTOPILOT: PAUSED";
    autopilotStatusBadge.style.color = "#94a3b8";
    autopilotStatusBadge.style.background = "rgba(148, 163, 184, 0.12)";
    autopilotStatusBadge.style.borderColor = "rgba(148, 163, 184, 0.4)";
    autopilotBeacon.style.background = "#94a3b8";
  }

  // KPIs
  kpiRevenue.innerText = `$${(analytics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  kpiProfit.innerText = `$${(analytics.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  kpiRoas.innerText = `${(analytics.blendedRoas || 3.4).toFixed(2)}x`;
  kpiOrders.innerText = (analytics.totalOrders || orders.length);
  kpiVisitors.innerText = (analytics.activeVisitorsNow || 48);

  // Products Table
  productsTableBody.innerHTML = products.map(p => `
    <tr>
      <td style="display: flex; align-items: center; gap: 10px;">
        <img src="${p.image}" style="width: 38px; height: 38px; border-radius: 6px; object-fit: cover;">
        <div>
          <div style="font-weight: 700;">${p.title}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${p.badge || 'HOT'}</div>
        </div>
      </td>
      <td>${p.category}</td>
      <td>
        <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 800; padding: 4px 8px; border-radius: 6px;">
          ${p.trendingScore || 92}/100
        </span>
      </td>
      <td style="font-weight: 700;">$${p.price.toFixed(2)}</td>
      <td style="color: #94a3b8;">$${p.supplierCost.toFixed(2)}</td>
      <td style="color: #34d399; font-weight: 700;">${p.marginPercent}%</td>
      <td style="color: #34d399; font-weight: 800;">+$${p.profitPerUnit.toFixed(2)}</td>
      <td>${p.stock || 15} units</td>
    </tr>
  `).join('');

  // Orders Table
  ordersTableBody.innerHTML = orders.map(o => `
    <tr>
      <td style="font-weight: 700; color: #38bdf8;">${o.orderId}</td>
      <td>
        <div>${o.customer.name}</div>
        <div style="font-size: 0.75rem; color: #64748b;">${o.customer.city}</div>
      </td>
      <td>${(o.items && o.items[0]) ? o.items[0].title.slice(0, 30) + '...' : 'Product Pack'}</td>
      <td style="font-weight: 700;">$${o.total.toFixed(2)}</td>
      <td style="color: #34d399; font-weight: 700;">+$${o.profit.toFixed(2)}</td>
      <td>
        <span class="status-badge status-${o.fulfillmentStatus}">
          ${o.fulfillmentStatus.replace('_', ' ')}
        </span>
      </td>
      <td style="font-family: monospace; font-size: 0.8rem; color: #94a3b8;">${o.trackingNumber || 'PENDING'}</td>
      <td>${o.carrier || 'USPS Priority'}</td>
    </tr>
  `).join('');

  // Ads
  adCampaignsContainer.innerHTML = ads.map(ad => `
    <div class="ad-card">
      <div class="ad-card-header">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">${ad.platform}</span>
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-top: 2px;">${ad.productTitle}</h3>
        </div>
        <div class="ad-roas-badge">Target ROAS: ${ad.roas}x</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: #111827; padding: 14px; border-radius: 8px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #e2e8f0; margin-bottom: 8px;">
            <i class="fa-brands fa-tiktok"></i> 3-Second Viral TikTok Hooks:
          </h4>
          <ul style="list-style: none; font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 6px;">
            ${(ad.hooks || []).map((h, i) => `<li><strong>#${i + 1}:</strong> "${h}"</li>`).join('')}
          </ul>

          <h4 style="font-size: 0.85rem; font-weight: 700; color: #e2e8f0; margin-top: 14px; margin-bottom: 8px;">
            <i class="fa-solid fa-clapperboard"></i> 28s Script Storyboard:
          </h4>
          <div style="font-size: 0.75rem; color: #94a3b8; display: flex; flex-direction: column; gap: 6px;">
            ${(ad.videoScript && ad.videoScript.scenes) ? ad.videoScript.scenes.map(s => `
              <div style="border-left: 2px solid #0284c7; padding-left: 8px;">
                <span style="color: #38bdf8; font-weight: 700;">[${s.time}]</span> <em>${s.audio}</em>
              </div>
            `).join('') : ''}
          </div>
        </div>

        <div style="background: #111827; padding: 14px; border-radius: 8px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #e2e8f0; margin-bottom: 8px;">
            <i class="fa-brands fa-meta"></i> Meta High-CTR Primary Copy:
          </h4>
          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.8rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 12px;">${ad.metaAdCopy ? ad.metaAdCopy.primaryText : ''}</pre>

          <h4 style="font-size: 0.85rem; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">
            <i class="fa-solid fa-crosshairs"></i> Target Audience Stacking:
          </h4>
          <div style="font-size: 0.8rem; color: #94a3b8;">
            Interests: ${(ad.audienceTargeting && ad.audienceTargeting.interests) ? ad.audienceTargeting.interests.join(', ') : 'Viral gadgets'}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Form
  settingInterval.value = settings.autopilotIntervalSeconds || 45;
  settingMultiplier.value = settings.defaultMarginMultiplier || 3.2;
  settingSupplier.value = settings.supplierPreference || "CJ_DROPSHIPPING_FAST";
  settingSimulatedTraffic.checked = settings.simulatedTrafficActive !== false;

  // Populate Traffic Product Selector
  if (trafficProductSelect && products.length > 0) {
    const currentVal = trafficProductSelect.value;
    trafficProductSelect.innerHTML = products.map(p => `
      <option value="${p.id}">${p.title.slice(0, 34)}... ($${p.price.toFixed(2)})</option>
    `).join('');
    if (currentVal) trafficProductSelect.value = currentVal;
    if (!activeTrafficPack) {
      loadTrafficPack(products[0].id);
    }
  }
}

// Log Appender
function appendLog(level, time, msg) {
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `
    <span class="log-time">[${time}]</span>
    <span class="log-msg-${level}">${msg}</span>
  `;
  terminalLogs.appendChild(line);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

// WebSocket Connection
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'LOG') {
        appendLog(data.level, data.timestamp, data.message);
      } else if (data.type === 'NEW_ORDER' || data.type === 'CYCLE_COMPLETE' || data.type === 'NEW_PRODUCT') {
        loadAllData();
      }
    } catch (e) {}
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 4000);
  };
}

// Button Events
toggleAutopilotBtn.addEventListener('click', async () => {
  const newStatus = !settings.autopilotActive;
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autopilotActive: newStatus })
  });
  const data = await res.json();
  settings = data.settings;
  updateUI();
  appendLog('INFO', new Date().toLocaleTimeString(), `Master Autopilot status toggled: ${newStatus ? 'ACTIVE' : 'PAUSED'}`);
});

triggerCycleBtn.addEventListener('click', async () => {
  triggerCycleBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Running Cycle...`;
  triggerCycleBtn.disabled = true;

  try {
    await fetch('/api/autopilot/trigger', { method: 'POST' });
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      triggerCycleBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> <span>Trigger Autopilot Cycle</span>`;
      triggerCycleBtn.disabled = false;
      loadAllData();
    }, 1500);
  }
});

huntNowBtn.addEventListener('click', async () => {
  huntNowBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Hunting Trend...`;
  huntNowBtn.disabled = true;

  try {
    const res = await fetch('/api/products/hunt', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      appendLog('SUCCESS', new Date().toLocaleTimeString(), `🎯 Manually hunted new viral product: "${data.product.title}"`);
      loadAllData();
    }
  } catch (err) {
    console.error(err);
  } finally {
    huntNowBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass-plus"></i> Hunt Next Winning Product Now`;
    huntNowBtn.disabled = false;
  }
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const updatedSettings = {
    autopilotIntervalSeconds: parseInt(settingInterval.value, 10),
    defaultMarginMultiplier: parseFloat(settingMultiplier.value),
    supplierPreference: settingSupplier.value,
    simulatedTrafficActive: settingSimulatedTraffic.checked
  };

  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSettings)
  });
  const data = await res.json();
  settings = data.settings;
  appendLog('SUCCESS', new Date().toLocaleTimeString(), `⚙️ Autopilot parameters updated and saved to disk.`);
  alert("Autopilot Settings Successfully Saved!");
});

// AI Viral Traffic Machine Controller
const trafficProductSelect = document.getElementById('trafficProductSelect');
const generateTrafficPackBtn = document.getElementById('generateTrafficPackBtn');
const trafficTikTokContent = document.getElementById('trafficTikTokContent');
const trafficWhatsAppContent = document.getElementById('trafficWhatsAppContent');
const trafficInfluencerContent = document.getElementById('trafficInfluencerContent');
const trafficStoryboardContent = document.getElementById('trafficStoryboardContent');
const copyTikTokBtn = document.getElementById('copyTikTokBtn');
const launchWhatsAppBroadcastBtn = document.getElementById('launchWhatsAppBroadcastBtn');
const copyInfluencerDmBtn = document.getElementById('copyInfluencerDmBtn');

let activeTrafficPack = null;

async function loadTrafficPack(productId) {
  try {
    const id = productId || (products[0] ? products[0].id : 'hero');
    const res = await fetch(`/api/traffic/pack/${id}`);
    activeTrafficPack = await res.json();

    if (trafficTikTokContent && activeTrafficPack.tiktokReels) {
      trafficTikTokContent.innerText = `${activeTrafficPack.tiktokReels.onScreenHookText}\n\n${activeTrafficPack.tiktokReels.caption}\n\n${activeTrafficPack.tiktokReels.hashtags}`;
    }

    if (trafficWhatsAppContent) {
      trafficWhatsAppContent.innerText = activeTrafficPack.whatsappViralBlast;
    }

    if (trafficInfluencerContent) {
      trafficInfluencerContent.innerText = activeTrafficPack.influencerDmPitch;
    }

    if (trafficStoryboardContent && activeTrafficPack.tiktokReels) {
      trafficStoryboardContent.innerHTML = activeTrafficPack.tiktokReels.videoDirectives.map(d => `
        <div style="border-left: 2px solid #eab308; padding-left: 8px;">${d}</div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load traffic pack', err);
  }
}

if (generateTrafficPackBtn) {
  generateTrafficPackBtn.addEventListener('click', () => {
    loadTrafficPack(trafficProductSelect.value);
  });
}

if (copyTikTokBtn) {
  copyTikTokBtn.addEventListener('click', () => {
    if (activeTrafficPack && activeTrafficPack.tiktokReels) {
      const text = `${activeTrafficPack.tiktokReels.onScreenHookText}\n\n${activeTrafficPack.tiktokReels.caption}\n\n${activeTrafficPack.tiktokReels.hashtags}`;
      navigator.clipboard.writeText(text);
      alert("✅ TikTok Caption & Hashtags copied! Ready to paste into TikTok/Instagram!");
    }
  });
}

if (launchWhatsAppBroadcastBtn) {
  launchWhatsAppBroadcastBtn.addEventListener('click', () => {
    if (activeTrafficPack && activeTrafficPack.whatsappViralBlast) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(activeTrafficPack.whatsappViralBlast)}`, '_blank');
    }
  });
}

if (copyInfluencerDmBtn) {
  copyInfluencerDmBtn.addEventListener('click', () => {
    if (activeTrafficPack && activeTrafficPack.influencerDmPitch) {
      navigator.clipboard.writeText(activeTrafficPack.influencerDmPitch);
      alert("✅ Influencer DM Pitch copied! Ready to send to creators!");
    }
  });
}

// Boot up
loadAllData();
connectWebSocket();
