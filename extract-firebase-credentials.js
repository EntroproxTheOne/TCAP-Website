#!/usr/bin/env node

/**
 * Helper script to extract Firebase credentials from service account JSON
 * Usage: node extract-firebase-credentials.js path/to/serviceAccountKey.json
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.log('Usage: node extract-firebase-credentials.js <path-to-service-account-json>');
  console.log('\nExample:');
  console.log('  node extract-firebase-credentials.js ./serviceAccountKey.json');
  process.exit(1);
}

const jsonPath = process.argv[2];

if (!fs.existsSync(jsonPath)) {
  console.error(`Error: File not found: ${jsonPath}`);
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const projectId = serviceAccount.project_id;
  const clientEmail = serviceAccount.client_email;
  const privateKey = serviceAccount.private_key;
  const storageBucket = `${projectId}.appspot.com`;

  console.log('\n=== Backend .env Configuration ===\n');
  console.log('Add these to backend/.env:\n');
  console.log(`FIREBASE_PROJECT_ID=${projectId}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${clientEmail}`);
  console.log(`FIREBASE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`);
  console.log(`FIREBASE_STORAGE_BUCKET=${storageBucket}`);
  console.log('PORT=5000');
  
  console.log('\n=== Copy the above to backend/.env ===\n');
  
  // Also create a formatted version
  const backendEnv = `FIREBASE_PROJECT_ID=${projectId}
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"
FIREBASE_STORAGE_BUCKET=${storageBucket}
PORT=5000
`;

  const outputPath = path.join(__dirname, 'backend', '.env.backend');
  fs.writeFileSync(outputPath, backendEnv);
  console.log(`✅ Backend config saved to: ${outputPath}`);
  console.log('   Rename it to .env after adding frontend config\n');
  
} catch (error) {
  console.error('Error reading service account file:', error.message);
  process.exit(1);
}


