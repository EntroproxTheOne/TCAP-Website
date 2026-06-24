import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Default fallback images
const defaultImages = [
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
];

// Helper function to shuffle array randomly
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState(defaultImages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch events from the API
    const fetchEventImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events`
        );
        
        // Extract image URLs from events
        const eventImages = response.data
          .filter(event => event.imageUrl) // Only events with images
          .map(event => event.imageUrl);
        
        if (eventImages.length > 0) {
          // Shuffle and take up to 4 random images
          const shuffled = shuffleArray(eventImages);
          const selectedImages = shuffled.slice(0, 4);
          
          // If we have less than 4, pad with default images
          if (selectedImages.length < 4) {
            const needed = 4 - selectedImages.length;
            selectedImages.push(...defaultImages.slice(0, needed));
          }
          
          setImages(selectedImages);
        } else {
          // No events with images, use default images
          setImages(defaultImages);
        }
      } catch (error) {
        console.error('Error fetching event images:', error);
        // Use default images on error
        setImages(defaultImages);
      } finally {
        setLoading(false);
      }
    };

    fetchEventImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [images]);

  if (loading) {
    return (
      <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          onError={(e) => {
            // If image fails to load, use default image
            e.target.src = defaultImages[currentIndex % defaultImages.length];
          }}
        />
      </AnimatePresence>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;

