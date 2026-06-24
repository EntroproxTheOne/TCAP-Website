import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TeamSection = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/teams`
      );
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const years = teams.map(team => team.year);
  const selectedTeam = teams.find(team => team.year === selectedYear);

  const nextYear = () => {
    setCurrentYearIndex((prev) => (prev + 1) % years.length);
  };

  const prevYear = () => {
    setCurrentYearIndex((prev) => (prev - 1 + years.length) % years.length);
  };

  if (loading) {
    return (
      <section className="px-4 bg-gradient-to-b from-gray-900 to-gray-800" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container mx-auto">
          <div className="text-center text-white">Loading teams...</div>
        </div>
      </section>
    );
  }

  if (teams.length === 0) {
    return (
      <section className="px-4 bg-gradient-to-b from-gray-900 to-gray-800" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            Team of Capture
          </h2>
          <div className="text-center text-gray-300">No teams available.</div>
        </div>
      </section>
    );
  }

  return (
    <section id="team-section" className="px-4 bg-gradient-to-b from-gray-900 to-gray-800" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
            Team of Capture
          </h2>
        </div>

        {!selectedYear ? (
          <div className="relative">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevYear();
                }}
                className="text-4xl text-gray-600 hover:text-red-orange-500 transition-colors z-10"
              >
                ←
              </button>

              <motion.div
                key={currentYearIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 max-w-2xl"
              >
                <Link to={`/team?year=${encodeURIComponent(years[currentYearIndex])}`}>
                  <div className="holographic-card relative overflow-hidden" style={{ backgroundColor: '#f3f3f3', height: '500px', width: '100%' }}>
                    <div className="w-full h-full flex items-center justify-center relative" style={{ height: '100%', width: '100%' }}>
                      <img
                        src={teams[currentYearIndex]?.teamPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'}
                        alt={`Team ${years[currentYearIndex]}`}
                        className="w-full h-full object-contain"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-center" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' }}>
                        <h3 className="text-2xl font-bold text-white">
                          {years[currentYearIndex]}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextYear();
                }}
                className="text-4xl text-white hover:text-red-orange-500 transition-colors z-10"
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <button
              onClick={() => setSelectedYear(null)}
              className="mb-6 text-red-orange-500 hover:text-red-orange-600 font-semibold"
            >
              ← Back to Years
            </button>
            <div className="grid md:grid-cols-3 gap-6">
              {selectedTeam?.leads?.map((lead, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={lead.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'}
                    alt={lead.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-800">{lead.name}</h3>
                  <p className="text-red-orange-500">{lead.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;

