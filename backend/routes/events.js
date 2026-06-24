const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Get Firestore database (will be initialized by server.js)
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
  console.log('Cloudinary configured successfully');
} else {
  console.log('Cloudinary not configured - image uploads will require Cloudinary credentials');
}

// Get Firebase Storage bucket (optional - only if configured)
const getBucket = () => {
  try {
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      return admin.storage().bucket();
    }
    return null;
  } catch (error) {
    console.log('Firebase Storage not configured, using Cloudinary only');
    return null;
  }
};

// Configure multer for file uploads (using memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (increased for high-res photos)
  },
});

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

// Helper function to upload image to Cloudinary (FREE tier)
const uploadToCloudinary = async (fileBuffer, fileName, mimeType) => {
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Please add Cloudinary credentials to .env file.');
  }

  return new Promise((resolve, reject) => {
    // Create a readable stream from buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'tcet-capture/events',
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' }, // Limit size
          { quality: 'auto' }, // Auto optimize quality
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // Returns the image URL
        }
      }
    );
    
    // Pipe buffer stream to upload stream
    bufferStream.pipe(uploadStream);
  });
};

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    // Check if user is admin (you can customize this check based on your admin logic)
    const db = getDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all events
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    let eventsSnapshot;
    try {
      // Try to order by createdAt
      eventsSnapshot = await db.collection('events').orderBy('createdAt', 'desc').get();
    } catch (error) {
      // If ordering fails (e.g., no index), just get all events
      console.warn('Could not order by createdAt, fetching all events:', error.message);
      eventsSnapshot = await db.collection('events').get();
    }
    
    const events = [];
    eventsSnapshot.forEach((doc) => {
      const eventData = serializeFirestoreData(doc.data());
      events.push({ id: doc.id, ...eventData });
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const eventDoc = await db.collection('events').doc(req.params.id).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventData = serializeFirestoreData(eventDoc.data());
    res.json({ id: eventDoc.id, ...eventData });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event (Admin only)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { eventName, organizingClub, viewPhotosLink, worksLink, imageUrl: existingImageUrl, tags, eventTypes, eventDate } = req.body;
    let imageUrl = existingImageUrl || '';
    
    // Parse tags if it's a string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = Array.isArray(tags) ? tags : [];
      }
    }
    
    // Parse eventTypes if it's a string
    let parsedEventTypes = [];
    if (eventTypes) {
      try {
        parsedEventTypes = typeof eventTypes === 'string' ? JSON.parse(eventTypes) : eventTypes;
      } catch (e) {
        parsedEventTypes = Array.isArray(eventTypes) ? eventTypes : [];
      }
    }
    
    // Parse eventDate
    let parsedEventDate = null;
    if (eventDate) {
      parsedEventDate = admin.firestore.Timestamp.fromDate(new Date(eventDate));
    }

    // Upload image to Cloudinary (FREE tier) if provided
    if (req.file) {
      try {
        const fileName = `${uuidv4()}_${req.file.originalname}`;
        imageUrl = await uploadToCloudinary(req.file.buffer, fileName, req.file.mimetype);
        console.log('Image uploaded to Cloudinary:', imageUrl);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message || error);
        // Fallback to Firebase Storage if available
        const bucket = getBucket();
        if (bucket) {
          try {
            const fileName = `events/${uuidv4()}_${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, {
              metadata: {
                contentType: req.file.mimetype,
              },
            });
            await file.makePublic();
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.log('Image uploaded to Firebase Storage:', imageUrl);
          } catch (storageError) {
            console.error('Error uploading to Firebase Storage:', storageError.message || storageError);
            return res.status(500).json({ 
              error: 'Failed to upload image', 
              details: error.message || 'Please check your Cloudinary or Firebase Storage configuration.' 
            });
          }
        } else {
          return res.status(500).json({ 
            error: 'Failed to upload image', 
            details: error.message || 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file. See CLOUDINARY_QUICK_SETUP.md for instructions.' 
          });
        }
      }
    }

    const db = getDb();
    const eventData = {
      eventName,
      organizingClub,
      imageUrl,
      viewPhotosLink: viewPhotosLink || '',
      worksLink: worksLink || '', // Keep for backward compatibility
      tags: parsedTags,
      eventTypes: parsedEventTypes,
      eventDate: parsedEventDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('events').add(eventData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await docRef.get();
    const createdEventData = serializeFirestoreData(createdDoc.data());
    res.status(201).json({ id: docRef.id, ...createdEventData });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (Admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { eventName, organizingClub, viewPhotosLink, worksLink, tags, eventTypes, eventDate } = req.body;
    const db = getDb();
    const eventRef = db.collection('events').doc(req.params.id);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Parse tags if it's a string
    let parsedTags = [];
    if (tags !== undefined) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = Array.isArray(tags) ? tags : [];
      }
    }
    
    // Parse eventTypes if it's a string
    let parsedEventTypes = [];
    if (eventTypes !== undefined) {
      try {
        parsedEventTypes = typeof eventTypes === 'string' ? JSON.parse(eventTypes) : eventTypes;
      } catch (e) {
        parsedEventTypes = Array.isArray(eventTypes) ? eventTypes : [];
      }
    }
    
    // Parse eventDate
    let parsedEventDate = null;
    if (eventDate) {
      parsedEventDate = admin.firestore.Timestamp.fromDate(new Date(eventDate));
    }

    const updateData = {
      eventName,
      organizingClub,
      viewPhotosLink: viewPhotosLink || '',
      worksLink: worksLink || '', // Keep for backward compatibility
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // Only update tags, eventTypes, and eventDate if provided
    if (tags !== undefined) {
      updateData.tags = parsedTags;
    }
    if (eventTypes !== undefined) {
      updateData.eventTypes = parsedEventTypes;
    }
    if (eventDate !== undefined) {
      updateData.eventDate = parsedEventDate;
    }

    // Upload new image if provided
    if (req.file) {
      try {
        const fileName = `${uuidv4()}_${req.file.originalname}`;
        updateData.imageUrl = await uploadToCloudinary(req.file.buffer, fileName, req.file.mimetype);
        console.log('Image uploaded to Cloudinary:', updateData.imageUrl);
        
        // Delete old image from Cloudinary if it exists
        const oldImageUrl = eventDoc.data().imageUrl;
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
        // Fallback to Firebase Storage if available
        const bucket = getBucket();
        if (bucket) {
          try {
            const fileName = `events/${uuidv4()}_${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, {
              metadata: {
                contentType: req.file.mimetype,
              },
            });
            await file.makePublic();
            updateData.imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            // Delete old image from Firebase Storage if exists
            const oldImageUrl = eventDoc.data().imageUrl;
            if (oldImageUrl && oldImageUrl.includes('storage.googleapis.com')) {
              try {
                const oldFileName = oldImageUrl.split('/').pop().split('?')[0];
                await bucket.file(`events/${oldFileName}`).delete();
              } catch (err) {
                console.error('Error deleting old image from Firebase Storage:', err);
              }
            }
          } catch (storageError) {
            console.error('Error uploading to Firebase Storage:', storageError.message || storageError);
            return res.status(500).json({ 
              error: 'Failed to upload image', 
              details: error.message || 'Please check your Cloudinary or Firebase Storage configuration.' 
            });
          }
        } else {
          return res.status(500).json({ 
            error: 'Failed to upload image', 
            details: error.message || 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file. See CLOUDINARY_QUICK_SETUP.md for instructions.' 
          });
        }
      }
    }

    await eventRef.update(updateData);
    const updatedDoc = await eventRef.get();
    const updatedEventData = serializeFirestoreData(updatedDoc.data());
    res.json({ id: updatedDoc.id, ...updatedEventData });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const eventRef = db.collection('events').doc(req.params.id);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete image from Cloudinary or Firebase Storage
    const imageUrl = eventDoc.data().imageUrl;
    if (imageUrl) {
      try {
        if (imageUrl.includes('cloudinary.com')) {
          // Delete from Cloudinary
          const publicId = imageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
          console.log('Image deleted from Cloudinary');
        } else if (imageUrl.includes('storage.googleapis.com')) {
          // Delete from Firebase Storage
          const bucket = getBucket();
          if (bucket) {
            const fileName = imageUrl.split('/').pop().split('?')[0];
            await bucket.file(`events/${fileName}`).delete();
            console.log('Image deleted from Firebase Storage');
          }
        }
      } catch (err) {
        console.error('Error deleting image:', err);
        // Continue even if deletion fails
      }
    }

    await eventRef.delete();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;

