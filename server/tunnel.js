const localtunnel = require('localtunnel');
const http = require('http');
const https = require('https');
const { exec } = require('child_process');

function getTunnelPassword() {
  return new Promise((resolve) => {
    https.get('https://loca.lt/mytunnelpassword', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', () => {
      resolve('Check your public IP');
    });
  });
}

(async () => {
  console.log('================================================================');
  console.log('🌊 AQUAFLOW DIRECT - INITIALIZING WORLDWIDE PUBLIC LINK...');
  console.log('================================================================');
  console.log('Connecting to global secure gateway on Port 3000 (Please wait 3 seconds)...');

  try {
    const password = await getTunnelPassword();
    const tunnel = await localtunnel({ port: 3000 });

    console.log('\n================================================================');
    console.log('🎉 YOUR STORE IS NOW LIVE WORLDWIDE ON THE INTERNET!');
    console.log('================================================================');
    console.log(`🌐 PUBLIC STORE LINK:   ${tunnel.url}`);
    console.log(`⚡ PUBLIC ADMIN PANEL:  ${tunnel.url}/admin`);
    console.log(`📦 PUBLIC TRACKING:     ${tunnel.url}/track`);
    console.log('----------------------------------------------------------------');
    console.log(`🔑 PASSWORD IF PROMPTED (Endpoint IP): ${password}`);
    console.log('   (If loca.lt asks for "Tunnel Password", simply paste the IP above!)');
    console.log('================================================================\n');
    console.log('Opening your live link in your web browser now...\n');

    // Automatically open browser
    const startCmd = process.platform === 'win32' ? `start ${tunnel.url}` : `open ${tunnel.url}`;
    exec(startCmd);

    // Keep tunnel process running continuously
    console.log('Tunnel is active and listening for incoming traffic... (Press Ctrl+C to stop)');
    setInterval(() => {}, 1000 * 60 * 60);

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
      process.exit(0);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel Error:', err);
    });

  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
  }
})();
