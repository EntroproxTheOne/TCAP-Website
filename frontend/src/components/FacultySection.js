import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import axios from 'axios';

const FacultySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faculty`
      );
      setFaculty(response.data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 bg-gradient-to-b from-gray-900 to-gray-800" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="container mx-auto">
        <div className="flex flex-col gap-12">
          {/* Title */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2
              className="text-5xl md:text-7xl font-bold"
              style={{
                color: '#ff6b35',
              }}
            >
              Power Behind The Picture
            </h2>
          </motion.div>

          {/* Faculty Cards */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-white text-xl">Loading faculty...</div>
            </div>
          ) : faculty.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-white text-xl">No faculty members found.</div>
            </div>
          ) : (
            <div className="faculty-cards-simple-container">
              {faculty.map((member, index) => (
              <motion.div
                key={member.id || index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="faculty-card-simple"
              >
                {/* Full Image */}
                <div className="faculty-card-simple__image-container">
                  <img 
                    src={member.imageUrl || member.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'} 
                    alt={member.name}
                    className="faculty-card-simple__image"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                
                {/* Faculty Info */}
                <div className="faculty-card-simple__info">
                  <span className="faculty-card-simple__category">{member.role}</span>
                  <h3 className="faculty-card-simple__title">{member.name}</h3>
                  <p className="faculty-card-simple__description">{member.description}</p>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FacultySection;

