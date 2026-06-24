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
  console.log('Cloudinary initialized for teams');
} else {
  console.warn('Cloudinary not configured for teams. Image uploads will fail.');
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
        folder: 'tcet-capture/teams',
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
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
    fileSize: 20 * 1024 * 1024, // 20MB limit (increased for high-res photos)
  },
});

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      console.error('No token provided in team request');
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

// Get all teams
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const teamsSnapshot = await db.collection('teams').orderBy('year', 'desc').get();
    
    const teams = [];
    teamsSnapshot.forEach((doc) => {
      const teamData = serializeFirestoreData(doc.data());
      teams.push({ id: doc.id, ...teamData });
    });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const teamDoc = await db.collection('teams').doc(req.params.id).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }
    const teamData = serializeFirestoreData(teamDoc.data());
    res.json({ id: teamDoc.id, ...teamData });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create new team (Admin only)
router.post('/', verifyAdmin, (req, res, next) => {
  upload.fields([
    { name: 'teamPhoto', maxCount: 1 },
    { name: 'leadPhotos', maxCount: 10 }
  ])(req, res, (err) => {
    if (err) {
      if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File too large',
          details: 'The uploaded file exceeds the 20MB limit. Please compress your images or use smaller files.'
        });
      }
      return res.status(400).json({ 
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('=== Team Creation Request ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    if (req.files) {
      console.log('Team photo:', req.files.teamPhoto ? 'Present' : 'Missing');
      console.log('Lead photos:', req.files.leadPhotos ? req.files.leadPhotos.length : 0);
    }
    
    const { year, leads } = req.body;
    
    if (!year) {
      console.error('Year is missing');
      return res.status(400).json({ error: 'Year is required' });
    }
    
    let teamPhotoUrl = '';
    let leadsArray = [];
    
    try {
      leadsArray = JSON.parse(leads || '[]');
      console.log('Parsed leads array:', leadsArray.length, 'leads');
    } catch (parseError) {
      console.error('Error parsing leads JSON:', parseError);
      console.error('Leads string:', leads);
      return res.status(400).json({ error: 'Invalid leads data format', details: parseError.message });
    }

    // Upload team photo
    if (req.files && req.files.teamPhoto && req.files.teamPhoto[0]) {
      try {
        const fileName = `${uuidv4()}_${req.files.teamPhoto[0].originalname}`;
        teamPhotoUrl = await uploadToCloudinary(req.files.teamPhoto[0].buffer, fileName, req.files.teamPhoto[0].mimetype);
        console.log('Team photo uploaded to Cloudinary:', teamPhotoUrl);
      } catch (error) {
        console.error('Error uploading team photo:', error.message || error);
        return res.status(500).json({ 
          error: 'Failed to upload team photo', 
          details: error.message || 'Please check your Cloudinary configuration.' 
        });
      }
    }

    // Upload lead photos
    const leadPhotos = req.files && req.files.leadPhotos ? req.files.leadPhotos : [];
    let photoIndex = 0;
    
    // Match lead photos to leads that have hasNewPhoto flag
    for (let i = 0; i < leadsArray.length; i++) {
      if (leadsArray[i].hasNewPhoto && photoIndex < leadPhotos.length) {
        try {
          const fileName = `${uuidv4()}_${leadPhotos[photoIndex].originalname}`;
          const photoUrl = await uploadToCloudinary(leadPhotos[photoIndex].buffer, fileName, leadPhotos[photoIndex].mimetype);
          leadsArray[i].photo = photoUrl;
          console.log(`Lead ${i + 1} photo uploaded:`, photoUrl);
          photoIndex++;
        } catch (error) {
          console.error(`Error uploading lead ${i + 1} photo:`, error);
          // Set placeholder if upload fails
          leadsArray[i].photo = leadsArray[i].photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
          photoIndex++;
        }
      } else if (!leadsArray[i].photo) {
        // If no photo provided and no existing photo, use placeholder
        leadsArray[i].photo = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
      }
      // Remove hasNewPhoto flag before saving
      delete leadsArray[i].hasNewPhoto;
    }

    const db = getDb();
    const teamData = {
      year,
      teamPhoto: teamPhotoUrl,
      leads: leadsArray,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log('Creating team with data:', { year, teamPhotoUrl, leadsCount: leadsArray.length });
    const docRef = await db.collection('teams').add(teamData);
    console.log('Team created successfully with ID:', docRef.id);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await docRef.get();
    const createdTeamData = serializeFirestoreData(createdDoc.data());
    res.status(201).json({ id: docRef.id, ...createdTeamData });
  } catch (error) {
    console.error('Error creating team:', error);
    console.error('Error stack:', error.stack);
    // Check if it's a multer error (file too large)
    if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        details: 'The uploaded file exceeds the 20MB limit. Please compress your images or use smaller files.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create team',
      details: error.message || 'An unexpected error occurred. Please check the server logs.'
    });
  }
});

// Update team (Admin only)
router.put('/:id', verifyAdmin, (req, res, next) => {
  upload.fields([
    { name: 'teamPhoto', maxCount: 1 },
    { name: 'leadPhotos', maxCount: 10 }
  ])(req, res, (err) => {
    if (err) {
      if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File too large',
          details: 'The uploaded file exceeds the 20MB limit. Please compress your images or use smaller files.'
        });
      }
      return res.status(400).json({ 
        error: 'File upload error',
        details: err.message
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { year, leads } = req.body;
    const db = getDb();
    const teamRef = db.collection('teams').doc(req.params.id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const updateData = {
      year,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const leadsArray = JSON.parse(leads || '[]');

    // Upload new team photo if provided
    if (req.files && req.files.teamPhoto && req.files.teamPhoto[0]) {
      try {
        const fileName = `${uuidv4()}_${req.files.teamPhoto[0].originalname}`;
        updateData.teamPhoto = await uploadToCloudinary(req.files.teamPhoto[0].buffer, fileName, req.files.teamPhoto[0].mimetype);
        
        // Delete old team photo from Cloudinary if exists
        const oldTeamPhoto = teamDoc.data().teamPhoto;
        if (oldTeamPhoto && oldTeamPhoto.includes('cloudinary.com')) {
          try {
            const publicId = oldTeamPhoto.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting old team photo:', err);
          }
        }
      } catch (error) {
        console.error('Error uploading team photo:', error);
        return res.status(500).json({ error: 'Failed to upload team photo' });
      }
    } else {
      // Keep existing team photo
      updateData.teamPhoto = teamDoc.data().teamPhoto;
    }

    // Handle lead photos
    const leadPhotos = req.files && req.files.leadPhotos ? req.files.leadPhotos : [];
    let photoIndex = 0;
    
    for (let i = 0; i < leadsArray.length; i++) {
      // If a new photo is provided for this lead, upload it
      if (photoIndex < leadPhotos.length && leadsArray[i].hasNewPhoto) {
        try {
          const fileName = `${uuidv4()}_${leadPhotos[photoIndex].originalname}`;
          leadsArray[i].photo = await uploadToCloudinary(leadPhotos[photoIndex].buffer, fileName, leadPhotos[photoIndex].mimetype);
          photoIndex++;
        } catch (error) {
          console.error('Error uploading lead photo:', error);
        }
      } else if (!leadsArray[i].photo) {
        // If no photo provided and no existing photo, use placeholder
        leadsArray[i].photo = leadsArray[i].photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
      }
    }

    updateData.leads = leadsArray;

    await teamRef.update(updateData);
    const updatedDoc = await teamRef.get();
    const updatedTeamData = serializeFirestoreData(updatedDoc.data());
    res.json({ id: updatedDoc.id, ...updatedTeamData });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const teamRef = db.collection('teams').doc(req.params.id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete images from Cloudinary
    const teamData = teamDoc.data();
    
    // Delete team photo
    if (teamData.teamPhoto && teamData.teamPhoto.includes('cloudinary.com')) {
      try {
        const publicId = teamData.teamPhoto.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting team photo:', err);
      }
    }

    // Delete lead photos
    if (teamData.leads && Array.isArray(teamData.leads)) {
      for (const lead of teamData.leads) {
        if (lead.photo && lead.photo.includes('cloudinary.com')) {
          try {
            const publicId = lead.photo.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting lead photo:', err);
          }
        }
      }
    }

    await teamRef.delete();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;

