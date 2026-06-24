const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get Firestore database (will be initialized by server.js)
const getDb = () => {
  try {
    return admin.firestore();
  } catch (error) {
    throw new Error('Firebase Admin not initialized. Make sure server.js initializes Firebase first.');
  }
};

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Verifying user:', decodedToken.uid, decodedToken.email);
    
    const db = getDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const role = userData.role || 'client';
      console.log('User role found:', role, 'for user:', decodedToken.uid);
      res.json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: role,
      });
    } else {
      console.log('User document not found, creating with client role');
      // Create user document if it doesn't exist
      await db.collection('users').doc(decodedToken.uid).set({
        email: decodedToken.email,
        role: 'client',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: 'client',
      });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Set admin role (for initial setup)
router.post('/set-admin', async (req, res) => {
  try {
    const { uid, email } = req.body;
    // This should be protected in production - only for initial setup
    const db = getDb();
    await db.collection('users').doc(uid).set({
      email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Admin role set successfully' });
  } catch (error) {
    console.error('Error setting admin role:', error);
    res.status(500).json({ error: 'Failed to set admin role' });
  }
});

module.exports = router;

