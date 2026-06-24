const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Get Firestore database
const getDb = () => {
  try {
    return admin.firestore();
  } catch (error) {
    throw new Error('Firebase Admin not initialized. Make sure server.js initializes Firebase first.');
  }
};

// Initialize Cloudinary (FREE tier available!) - Optional
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary initialized for faculty');
} else {
  console.warn('Cloudinary not configured for faculty. Image uploads will fail.');
}

// Helper function to serialize Firestore data for JSON response
const serializeFirestoreData = (data) => {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Firestore Timestamp
  if (data.toDate && typeof data.toDate === 'function') {
    const date = data.toDate();
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
      _timestamp: true, // Flag to indicate this is a timestamp
    };
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const serialized = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        serialized[key] = serializeFirestoreData(data[key]);
      }
    }
    return serialized;
  }
  
  // Return primitives as-is
  return data;
};

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (fileBuffer, fileName, mimeType) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Please add Cloudinary credentials to .env file.');
  }

  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'tcet-capture/faculty',
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    bufferStream.pipe(uploadStream);
  });
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      console.error('No token provided in faculty request');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const db = getDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      console.error('User is not admin:', decodedToken.uid, userDoc.exists ? userDoc.data().role : 'user not found');
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying admin token:', error.message);
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};

// Get all faculty
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const facultySnapshot = await db.collection('faculty').orderBy('createdAt', 'desc').get();
    
    const faculty = [];
    facultySnapshot.forEach((doc) => {
      const facultyData = serializeFirestoreData(doc.data());
      faculty.push({ id: doc.id, ...facultyData });
    });
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    // If ordering fails, try without order
    try {
      const db = getDb();
      const facultySnapshot = await db.collection('faculty').get();
      const faculty = [];
      facultySnapshot.forEach((doc) => {
        const facultyData = serializeFirestoreData(doc.data());
        faculty.push({ id: doc.id, ...facultyData });
      });
      res.json(faculty);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch faculty' });
    }
  }
});

// Get single faculty member
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const facultyDoc = await db.collection('faculty').doc(req.params.id).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    const facultyData = serializeFirestoreData(facultyDoc.data());
    res.json({ id: facultyDoc.id, ...facultyData });
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    res.status(500).json({ error: 'Failed to fetch faculty member' });
  }
});

// Create new faculty member (Admin only)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, description, imageUrl: existingImageUrl } = req.body;
    let imageUrl = existingImageUrl || '';
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const fileName = `${uuidv4()}_${req.file.originalname}`;
        imageUrl = await uploadToCloudinary(req.file.buffer, fileName, req.file.mimetype);
        console.log('Faculty image uploaded to Cloudinary:', imageUrl);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message || error);
        return res.status(500).json({ 
          error: 'Failed to upload image', 
          details: error.message || 'Please check your Cloudinary configuration.' 
        });
      }
    }

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const db = getDb();
    const facultyData = {
      name,
      role,
      description: description || '',
      imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('faculty').add(facultyData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await docRef.get();
    const createdFacultyData = serializeFirestoreData(createdDoc.data());
    res.status(201).json({ id: docRef.id, ...createdFacultyData });
  } catch (error) {
    console.error('Error creating faculty member:', error);
    res.status(500).json({ error: 'Failed to create faculty member' });
  }
});

// Update faculty member (Admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, description } = req.body;
    const db = getDb();
    const facultyRef = db.collection('faculty').doc(req.params.id);
    const facultyDoc = await facultyRef.get();

    if (!facultyDoc.exists) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    const updateData = {
      name,
      role,
      description: description || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Upload new image if provided
    if (req.file) {
      try {
        const fileName = `${uuidv4()}_${req.file.originalname}`;
        updateData.imageUrl = await uploadToCloudinary(req.file.buffer, fileName, req.file.mimetype);
        console.log('Faculty image uploaded to Cloudinary:', updateData.imageUrl);
        
        // Delete old image from Cloudinary if it exists
        const oldImageUrl = facultyDoc.data().imageUrl;
        if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
          try {
            const publicId = oldImageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting old image from Cloudinary:', err);
          }
        }
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message || error);
        return res.status(500).json({ 
          error: 'Failed to upload image', 
          details: error.message || 'Please check your Cloudinary configuration.' 
        });
      }
    }

    await facultyRef.update(updateData);
    const updatedDoc = await facultyRef.get();
    const updatedFacultyData = serializeFirestoreData(updatedDoc.data());
    res.json({ id: updatedDoc.id, ...updatedFacultyData });
  } catch (error) {
    console.error('Error updating faculty member:', error);
    res.status(500).json({ error: 'Failed to update faculty member' });
  }
});

// Delete faculty member (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const facultyRef = db.collection('faculty').doc(req.params.id);
    const facultyDoc = await facultyRef.get();

    if (!facultyDoc.exists) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    // Delete image from Cloudinary
    const imageUrl = facultyDoc.data().imageUrl;
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
        console.log('Faculty image deleted from Cloudinary');
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
        // Continue even if deletion fails
      }
    }

    await facultyRef.delete();
    res.json({ message: 'Faculty member deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty member:', error);
    res.status(500).json({ error: 'Failed to delete faculty member' });
  }
});

module.exports = router;

