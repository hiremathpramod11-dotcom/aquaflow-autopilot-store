const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

const DATA_PATH = path.join(__dirname, 'data');
const CLOUDFLARED_PATH = path.join(__dirname, '..', 'cloudflared.exe');
const LIVE_URL_FILE = path.join(DATA_PATH, 'live_url.txt');

console.log('================================================================');
console.log('🌊 AQUAFLOW DIRECT - INITIALIZING WORLDWIDE PUBLIC LINK...');
console.log('================================================================');

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/health', (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function saveLiveUrl(url) {
  try {
    fs.writeFileSync(LIVE_URL_FILE, url, 'utf8');
    const settingsPath = path.join(DATA_PATH, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const s = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      s.publicLiveUrl = url;
      fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2), 'utf8');
    }
  } catch (e) {}
}

async function start() {
  const isServerRunning = await checkServer();
  if (!isServerRunning) {
    console.log('⚡ Server not running on Port 3000. Launching AquaFlow backend now...');
    const serverProc = spawn('node', [path.join(__dirname, 'index.js')], {
      stdio: 'inherit',
      detached: false
    });
    // Give server 2 seconds to initialize
    await new Promise(r => setTimeout(r, 2000));
  } else {
    console.log('✅ AquaFlow Server already active on Port 3000.');
  }

  if (fs.existsSync(CLOUDFLARED_PATH)) {
    console.log('⚡ Launching high-speed Cloudflare Edge Tunnel (No Password Required)...');

    const cf = spawn(CLOUDFLARED_PATH, ['tunnel', '--url', 'http://localhost:3000']);
    let detectedUrl = null;

    cf.stderr.on('data', (data) => {
      const text = data.toString();
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && !detectedUrl) {
        detectedUrl = match[0];
        saveLiveUrl(detectedUrl);

        console.log('\n================================================================');
        console.log('🎉 YOUR STORE IS LIVE WORLDWIDE (CLOUDFLARE SECURE EDGE)!');
        console.log('================================================================');
        console.log(`🌐 PUBLIC STOREFRONT:    ${detectedUrl}`);
        console.log(`⚡ ADMIN COMMAND CENTER: ${detectedUrl}/admin`);
        console.log(`📦 CUSTOMER TRACKING:    ${detectedUrl}/track`);
        console.log('----------------------------------------------------------------');
        console.log('✨ 100% Free Public HTTPS URL - No password needed for visitors!');
        console.log('📲 Send this link on WhatsApp, Instagram, TikTok & Facebook!');
        console.log('================================================================\n');

        const startCmd = process.platform === 'win32' ? `start ${detectedUrl}` : `open ${detectedUrl}`;
        exec(startCmd);
      }
    });

    cf.on('close', (code) => {
      console.log(`Cloudflare tunnel exited with code ${code}`);
    });

  } else {
    console.log('Using localtunnel fallback...');
    const localtunnel = require('localtunnel');
    localtunnel({ port: 3000 }).then(tunnel => {
      saveLiveUrl(tunnel.url);
      console.log(`🌐 PUBLIC STORE LINK: ${tunnel.url}`);
      const startCmd = process.platform === 'win32' ? `start ${tunnel.url}` : `open ${tunnel.url}`;
      exec(startCmd);
    }).catch(err => {
      console.error('Tunnel error:', err.message);
    });
  }
}

start();

// Keep active
setInterval(() => {}, 1000 * 60 * 60);
