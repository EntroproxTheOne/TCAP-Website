import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import useScrollReveal from '../hooks/useScrollReveal';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiSearch, FiX } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Gallery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/api/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueClubs = useMemo(() => {
    const clubs = new Set();
    events.forEach((event) => {
      if (event.organizingClub) clubs.add(event.organizingClub);
    });
    return Array.from(clubs).sort();
  }, [events]);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    events.forEach((event) => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach((tag) => {
          const tagValue = typeof tag === 'string' ? tag : tag.value || tag;
          if (tagValue) tags.add(tagValue);
        });
      }
    });
    return Array.from(tags).sort();
  }, [events]);

  const uniqueEventTypes = useMemo(() => {
    const types = new Set();
    events.forEach((event) => {
      if (event.eventTypes && Array.isArray(event.eventTypes)) {
        event.eventTypes.forEach((type) => {
          const typeValue = typeof type === 'string' ? type : type.value || type;
          if (typeValue) types.add(typeValue);
        });
      }
    });
    return Array.from(types).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesEventName = event.eventName?.toLowerCase().includes(query);
        const matchesClubName = event.organizingClub?.toLowerCase().includes(query);
        const matchesTag = event.tags?.some((tag) => {
          const tagValue = typeof tag === 'string' ? tag : tag.value || tag;
          return tagValue?.toLowerCase().includes(query);
        });
        const matchesEventType = event.eventTypes?.some((type) => {
          const typeValue = typeof type === 'string' ? type : type.value || type;
          return typeValue?.toLowerCase().includes(query);
        });
        if (!matchesEventName && !matchesClubName && !matchesTag && !matchesEventType) return false;
      }
      if (selectedClub && event.organizingClub !== selectedClub) return false;
      if (selectedTag) {
        const matchesTag = event.tags?.some((tag) => {
          const tagValue = typeof tag === 'string' ? tag : tag.value || tag;
          return tagValue === selectedTag;
        });
        if (!matchesTag) return false;
      }
      if (selectedEventType) {
        const matchesType = event.eventTypes?.some((type) => {
          const typeValue = typeof type === 'string' ? type : type.value || type;
          return typeValue === selectedEventType;
        });
        if (!matchesType) return false;
      }
      if (selectedDate) {
        if (!event.eventDate) return false;
        try {
          let eventDate;
          if (event.eventDate.toDate) eventDate = event.eventDate.toDate();
          else if (event.eventDate.seconds) eventDate = new Date(event.eventDate.seconds * 1000);
          else eventDate = new Date(event.eventDate);
          if (isNaN(eventDate.getTime())) return false;
          if (eventDate.toDateString() !== selectedDate.toDateString()) return false;
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [events, searchQuery, selectedClub, selectedTag, selectedEventType, selectedDate]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClub('');
    setSelectedTag('');
    setSelectedEventType('');
    setSelectedDate(null);
  };

  const hasActiveFilters = searchQuery || selectedClub || selectedTag || selectedEventType || selectedDate;

  const filterTabs = ['All', ...uniqueEventTypes.slice(0, 4)];

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkBackground />

      <section className="pt-28 pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="fade-in-section mb-stack-md">
          <h1 className="font-display text-3xl md:text-display-sm text-primary uppercase tracking-tight mb-2">
            Archives
          </h1>
          <span className="h-[2px] w-24 bg-accent-red block" />
        </div>

        {/* Filter bar */}
        <div className="frosted-glass p-4 md:p-6 mb-stack-md fade-in-section">
          <div className="flex flex-wrap gap-2 mb-6">
            {filterTabs.map((tab) => {
              const isAll = tab === 'All';
              const active = isAll ? !selectedEventType : selectedEventType === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedEventType(isAll ? '' : tab)}
                  className={`font-label text-label-caps uppercase px-4 py-2 transition-all ${
                    active
                      ? 'bg-accent-red text-white'
                      : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="relative mb-6">
            <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              type="text"
              placeholder="Search events, clubs, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ghost-input pl-8"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-primary">
                <FiX size={18} />
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-4">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="ghost-input cursor-pointer"
            >
              <option value="">All Clubs</option>
              {uniqueClubs.map((club) => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="ghost-input cursor-pointer"
            >
              <option value="">All Tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMM dd, yyyy"
              placeholderText="Filter by date"
              className="ghost-input w-full"
              isClearable
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 font-label text-label-caps uppercase text-accent-red hover:text-white hover:bg-accent-red px-4 py-2 border border-accent-red transition-all"
            >
              <FiX size={16} /> Clear Filters
            </button>
          )}

          <p className="mt-4 font-mono text-mono-technical text-outline text-sm">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <p className="font-body text-on-surface-variant">Loading archives...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <p className="font-body text-on-surface-variant">
              {hasActiveFilters ? 'No events match your filters.' : 'No events found.'}
            </p>
          </div>
        ) : (
          <div className="gallery-container fade-in-section">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
