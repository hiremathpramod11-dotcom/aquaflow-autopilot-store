const path = require('path');
const fs = require('fs');
const AutoUploadService = require('../services/autoUploadService');

const DATA_PATH = path.join(__dirname, '..', 'data');
const autoUpload = new AutoUploadService(DATA_PATH, null, (event) => {
  if (event.message) console.log(`[EVENT] ${event.message}`);
});

async function run() {
  console.log("======================================================================");
  console.log("📸 AQUAFLOW DIRECT -- AUTONOMOUS AUTO-UPLOADER CLI");
  console.log("======================================================================");

  // Read settings
  const settingsPath = path.join(DATA_PATH, 'settings.json');
  let username = 'kevin_369';
  let password = process.env.IG_PASSWORD || '';
  let simulate = false;

  if (fs.existsSync(settingsPath)) {
    try {
      const s = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (s.activeIntegrations?.instagram?.username) {
        username = s.activeIntegrations.instagram.username;
      }
      if (s.activeIntegrations?.instagram?.password) {
        password = s.activeIntegrations.instagram.password;
      }
    } catch (e) {}
  }

  // Parse CLI args
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) username = args[++i];
    if (args[i] === '--password' && args[i + 1]) password = args[++i];
    if (args[i] === '--simulate' || args[i] === '-s') simulate = true;
  }

  console.log(`Target Instagram Account: @${username}`);
  console.log(`Mode: ${simulate || !password ? 'Simulation Verification Mode (Safe / Instant)' : 'Live Instagram Mode'}`);

  const products = autoUpload.getProducts();
  const targetProduct = products[0];

  console.log(`Selected Winning Product: "${targetProduct.title}" ($${targetProduct.price.toFixed(2)})`);
  console.log("Dispatching Auto-Upload...");

  const result = await autoUpload.uploadPost({
    productId: targetProduct.id,
    username,
    password,
    simulate: simulate || !password
  });

  console.log("----------------------------------------------------------------------");
  if (result.success) {
    console.log(`✅ UPLOAD SUCCESSFUL!`);
    console.log(`Account:       @${result.account}`);
    console.log(`Post Code:     ${result.postCode}`);
    console.log(`Post URL:      ${result.postUrl}`);
    console.log(`Mode:          ${result.mode}`);
    console.log(`Timestamp:     ${result.timestamp}`);
  } else {
    console.log(`❌ Upload failed: ${result.error}`);
    if (result.tip) console.log(`Tip: ${result.tip}`);
  }
  console.log("======================================================================");
}

run().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
