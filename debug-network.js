// Debug script to test Metro bundler connection
const http = require('http');
const https = require('https');

console.log('Testing Metro bundler connection...\n');

// Test local Metro bundler
const testLocalMetro = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/status',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Local Metro bundler is running on http://localhost:8081');
        resolve(true);
      } else {
        console.log('❌ Local Metro bundler returned status:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('❌ Cannot connect to local Metro bundler:', error.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Connection to local Metro bundler timed out');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// Test Expo tunnel
const testExpoTunnel = (tunnelUrl) => {
  return new Promise((resolve) => {
    const url = new URL(tunnelUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`\n📡 Expo tunnel status: ${res.statusCode}`);
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log('✅ Expo tunnel is accessible');
        resolve(true);
      } else {
        console.log('❌ Expo tunnel returned error status');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('❌ Cannot connect to Expo tunnel:', error.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Connection to Expo tunnel timed out');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// Run tests
async function runTests() {
  await testLocalMetro();
  
  // Test the problematic URL from the error
  const tunnelUrl = 'https://qa8-lya-saylekxd-8081.exp.direct/index.bundle?platform=ios&dev=true';
  await testExpoTunnel(tunnelUrl);
  
  console.log('\n💡 Recommendations:');
  console.log('1. Make sure Metro bundler is running: npx expo start');
  console.log('2. If using tunnel, run: npx expo start --tunnel');
  console.log('3. Clear Metro cache: npx expo start -c');
  console.log('4. Rebuild the iOS app: npx expo run:ios --device');
}

runTests();
