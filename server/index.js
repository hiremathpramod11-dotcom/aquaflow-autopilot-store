const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

// Import services
const ViralHunterService = require('./services/viralHunterService');
const AiCopywriterService = require('./services/aiCopywriterService');
const AdCreativeService = require('./services/adCreativeService');
const FulfillmentService = require('./services/fulfillmentService');
const CustomerSupportAi = require('./services/customerSupportAi');
const AutopilotEngine = require('./services/autopilotEngine');
const SocialTrafficService = require('./services/socialTrafficService');
const AutoUploadService = require('./services/autoUploadService');
const SalesAutomationService = require('./services/salesAutomationService');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Broadcast to all connected WebSocket clients
function broadcast(payload) {
  const data = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Initialize services
const viralHunter = new ViralHunterService(DATA_PATH);
const aiCopywriter = new AiCopywriterService();
const adCreative = new AdCreativeService(DATA_PATH);
const fulfillment = new FulfillmentService(DATA_PATH);
const customerSupport = new CustomerSupportAi(fulfillment);
const socialTraffic = new SocialTrafficService();
const autoUpload = new AutoUploadService(DATA_PATH, null, (event) => broadcast(event));
const salesAccelerator = new SalesAutomationService(DATA_PATH, fulfillment, (event) => broadcast(event));

const autopilot = new AutopilotEngine(
  DATA_PATH,
  { viralHunter, aiCopywriter, adCreative, fulfillment, autoUpload },
  (event) => broadcast(event)
);

// Start autonomous engines
autopilot.start();
salesAccelerator.startOvernightSalesPipeline();

// ==================== REST API ROUTES ====================

// Products
app.get('/api/products', (req, res) => {
  res.json(viralHunter.getProducts());
});

app.get('/api/products/:id', (req, res) => {
  const products = viralHunter.getProducts();
  const prod = products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!prod) return res.status(404).json({ error: "Product not found" });
  res.json(prod);
});

app.post('/api/products/hunt', (req, res) => {
  const product = viralHunter.huntWinningProduct();
  broadcast({
    type: "NEW_PRODUCT",
    product,
    message: `New product hunted: ${product.title}`
  });
  res.json({ success: true, product });
});

// Orders & Fulfillment
app.get('/api/orders', (req, res) => {
  res.json(fulfillment.getOrders());
});

app.post('/api/orders', (req, res) => {
  const order = fulfillment.createOrder(req.body);
  broadcast({
    type: "NEW_ORDER",
    order,
    message: `Order #${order.orderId} placed for $${order.total.toFixed(2)}`
  });
  res.json({ success: true, order });
});

app.get('/api/orders/track/:query', (req, res) => {
  const order = fulfillment.trackOrder(req.params.query);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post('/api/orders/:id/fulfill', (req, res) => {
  const order = fulfillment.autoFulfillOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  broadcast({
    type: "ORDER_FULFILLED",
    order,
    message: `Order #${order.orderId} dispatched to supplier`
  });
  res.json({ success: true, order });
});

// Analytics
app.get('/api/analytics', (req, res) => {
  res.json(fulfillment.getAnalytics());
});

// Ad Campaigns & Creative Studio
app.get('/api/ads', (req, res) => {
  res.json(adCreative.getCampaigns());
});

app.post('/api/ads/generate', (req, res) => {
  const products = viralHunter.getProducts();
  const product = products.find(p => p.id === req.body.productId) || products[0];
  const campaign = adCreative.generateAdPackage(product);
  broadcast({
    type: "NEW_AD_CAMPAIGN",
    campaign,
    message: `New viral ad campaign generated for ${product.title}`
  });
  res.json({ success: true, campaign });
});

// Viral Traffic & Social Content Machine
app.get('/api/traffic/pack/:id', (req, res) => {
  const products = viralHunter.getProducts();
  const prod = products.find(p => p.id === req.params.id || p.slug === req.params.id) || products[0];
  const pack = socialTraffic.generateSocialPack(prod);
  res.json(pack);
});

// Auto-Upload Routes (Instagram & Socials)
app.get('/api/traffic/upload/history', (req, res) => {
  res.json(autoUpload.getHistory());
});

app.post('/api/sales/accelerate', (req, res) => {
  const result = salesAccelerator.startOvernightSalesPipeline();
  res.json(result);
});

app.post('/api/traffic/upload', async (req, res) => {
  try {
    const { productId, username, password, caption, simulate } = req.body;
    const result = await autoUpload.uploadPost({
      productId,
      username,
      password,
      caption,
      simulate: simulate === true || simulate === 'true'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Customer Support
app.post('/api/support/chat', (req, res) => {
  const { message, context } = req.body;
  const reply = customerSupport.processMessage(message, context);
  res.json(reply);
});

// Settings & Autopilot Controls
app.get('/api/settings', (req, res) => {
  res.json(autopilot.getSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = autopilot.updateSettings(req.body);
  if (updated.autopilotActive) {
    autopilot.start();
  } else {
    autopilot.stop();
  }
  broadcast({
    type: "SETTINGS_UPDATED",
    settings: updated,
    message: `Autopilot settings updated. Status: ${updated.autopilotActive ? 'ACTIVE' : 'PAUSED'}`
  });
  res.json({ success: true, settings: updated });
});

app.post('/api/autopilot/trigger', async (req, res) => {
  res.json({ success: true, message: "Autopilot cycle triggered manually" });
  await autopilot.runCycle();
});

// Page Routing Shortcuts
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

app.get('/track', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'track.html'));
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: "CONNECTED",
    message: "Connected to AquaFlow Autopilot Live Engine",
    timestamp: new Date().toLocaleTimeString()
  }));
});

// Health check for Render / Cloud deployment
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`🌊 AQUAFLOW AUTOPILOT DROPSHIPPING SYSTEM IS LIVE`);
  console.log(`----------------------------------------------------------------`);
  console.log(`🛒 Storefront URL:        http://localhost:${PORT}`);
  console.log(`⚡ Command Center Admin:  http://localhost:${PORT}/admin`);
  console.log(`📦 Order Tracking:        http://localhost:${PORT}/track`);
  console.log(`----------------------------------------------------------------`);
  console.log(`🤖 Autopilot Engine:      ONLINE (Running autonomously)`);
  console.log(`================================================================`);
});
