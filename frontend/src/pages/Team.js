import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTeams();
  }, [searchParams]);

  useEffect(() => {
    const yearParam = searchParams.get('year');
    if (yearParam && teams.length > 0) {
      const teamExists = teams.find((team) => team.year === yearParam);
      if (teamExists) setSelectedYear(yearParam);
    }
  }, [searchParams, teams]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/api/teams`);
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const years = teams.map((team) => team.year);
  const selectedTeam = teams.find((team) => team.year === selectedYear);

  const nextYear = () => setCurrentYearIndex((prev) => (prev + 1) % years.length);
  const prevYear = () => setCurrentYearIndex((prev) => (prev - 1 + years.length) % years.length);

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkBackground />

      <section className="pt-28 pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="fade-in-section mb-stack-md">
          <h1 className="font-display text-3xl md:text-display-sm text-primary uppercase tracking-tight mb-2">
            The Crew
          </h1>
          <span className="h-[2px] w-24 bg-accent-red block" />
        </div>

        {loading ? (
          <p className="font-body text-on-surface-variant text-center py-20">Loading crew...</p>
        ) : teams.length === 0 ? (
          <p className="font-body text-on-surface-variant text-center py-20">No teams found.</p>
        ) : selectedYear && selectedTeam ? (
          <div className="fade-in-section">
            <button
              type="button"
              onClick={() => {
                setSelectedYear(null);
                navigate('/team');
              }}
              className="mb-8 flex items-center gap-2 font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red transition-colors"
            >
              <FiArrowLeft size={18} /> Back to All Years
            </button>

            <h2 className="font-display text-headline-lg text-primary uppercase mb-8 text-center">{selectedYear}</h2>

            {selectedTeam.teamPhoto && (
              <div className="mb-12 border border-white/10 overflow-hidden max-w-3xl mx-auto">
                <img
                  src={selectedTeam.teamPhoto}
                  alt={`Team ${selectedYear}`}
                  className="w-full object-contain max-h-[500px] filter grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {selectedTeam.leads?.map((lead, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="team-portrait-card group"
                >
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-surface border border-white/5">
                    <img
                      src={lead.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
                      alt={lead.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-body text-body-lg text-primary uppercase font-bold">{lead.name}</h3>
                  <p className="font-mono text-mono-technical text-accent-red mt-1">{lead.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="fade-in-section py-12">
            <div className="flex items-center justify-center gap-6">
              <button type="button" onClick={prevYear} className="text-primary hover:text-accent-red text-3xl transition-colors" aria-label="Previous year">
                ←
              </button>

              <motion.div
                key={currentYearIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 max-w-xl cursor-pointer group"
                onClick={() => navigate(`/team?year=${years[currentYearIndex]}`)}
              >
                <div className="relative aspect-[4/3] overflow-hidden border border-white/10 team-portrait-card">
                  <img
                    src={teams[currentYearIndex]?.teamPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'}
                    alt={`Team ${years[currentYearIndex]}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <h3 className="font-display text-headline-lg text-primary uppercase">{years[currentYearIndex]}</h3>
                    <p className="font-label text-label-caps text-accent-red mt-2 uppercase">View Crew →</p>
                  </div>
                </div>
              </motion.div>

              <button type="button" onClick={nextYear} className="text-primary hover:text-accent-red text-3xl transition-colors" aria-label="Next year">
                →
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-12">
              {years.map((year) => (
                <Link
                  key={year}
                  to={`/team?year=${year}`}
                  className="frosted-glass px-5 py-2 font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red hover:border-accent-red/30 transition-all"
                >
                  {year}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Team;
