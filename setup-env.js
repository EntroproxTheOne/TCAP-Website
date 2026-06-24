#!/usr/bin/env node

/**
 * Helper script to create .env files for TCET Capture
 * This script will prompt you for Firebase credentials and create the .env files
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n=== TCET Capture - Environment Setup ===\n');
  console.log('This script will help you create .env files for backend and frontend.\n');
  console.log('You can find these values in Firebase Console:\n');
  console.log('1. For Frontend: Project Settings > Your apps > Web app config');
  console.log('2. For Backend: Project Settings > Service accounts > Generate new private key\n');

  // Frontend variables
  console.log('--- Frontend Configuration ---');
  const frontendVars = {
    apiKey: await question('REACT_APP_FIREBASE_API_KEY: '),
    authDomain: await question('REACT_APP_FIREBASE_AUTH_DOMAIN: '),
    projectId: await question('REACT_APP_FIREBASE_PROJECT_ID: '),
    storageBucket: await question('REACT_APP_FIREBASE_STORAGE_BUCKET: '),
    messagingSenderId: await question('REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '),
    appId: await question('REACT_APP_FIREBASE_APP_ID: '),
  };

  // Backend variables
  console.log('\n--- Backend Configuration ---');
  const backendVars = {
    projectId: await question('FIREBASE_PROJECT_ID: '),
    clientEmail: await question('FIREBASE_CLIENT_EMAIL: '),
    privateKey: await question('FIREBASE_PRIVATE_KEY (paste the full key including BEGIN/END lines): '),
    storageBucket: await question('FIREBASE_STORAGE_BUCKET: '),
    port: await question('PORT (default: 5000): ') || '5000',
  };

  // Create frontend .env
  const frontendEnv = `REACT_APP_FIREBASE_API_KEY=${frontendVars.apiKey}
REACT_APP_FIREBASE_AUTH_DOMAIN=${frontendVars.authDomain}
REACT_APP_FIREBASE_PROJECT_ID=${frontendVars.projectId}
REACT_APP_FIREBASE_STORAGE_BUCKET=${frontendVars.storageBucket}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${frontendVars.messagingSenderId}
REACT_APP_FIREBASE_APP_ID=${frontendVars.appId}
REACT_APP_API_URL=http://localhost:5000
`;

  // Create backend .env
  // Format private key properly
  let formattedPrivateKey = backendVars.privateKey;
  if (!formattedPrivateKey.includes('\\n')) {
    // Replace actual newlines with \n if user pasted with real newlines
    formattedPrivateKey = formattedPrivateKey.replace(/\n/g, '\\n');
  }
  if (!formattedPrivateKey.startsWith('"')) {
    formattedPrivateKey = `"${formattedPrivateKey}"`;
  }

  const backendEnv = `FIREBASE_PROJECT_ID=${backendVars.projectId}
FIREBASE_CLIENT_EMAIL=${backendVars.clientEmail}
FIREBASE_PRIVATE_KEY=${formattedPrivateKey}
FIREBASE_STORAGE_BUCKET=${backendVars.storageBucket}
PORT=${backendVars.port}
`;

  // Write files
  const frontendPath = path.join(__dirname, 'frontend', '.env');
  const backendPath = path.join(__dirname, 'backend', '.env');

  fs.writeFileSync(frontendPath, frontendEnv);
  fs.writeFileSync(backendPath, backendEnv);

  console.log('\n✅ .env files created successfully!');
  console.log(`   Frontend: ${frontendPath}`);
  console.log(`   Backend: ${backendPath}`);
  console.log('\n⚠️  Make sure these files are in .gitignore (they should be)');
  console.log('\nNext steps:');
  console.log('1. Verify the values in the .env files');
  console.log('2. Create admin user in Firebase Authentication');
  console.log('3. Add admin role in Firestore (users collection)');
  console.log('4. Run: npm run dev');
  console.log('\n');

  rl.close();
}

setup().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});


