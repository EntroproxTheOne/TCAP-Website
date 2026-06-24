import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import MinimalNavbar from '../components/MinimalNavbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminDashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'teams', or 'faculty'
  const [showModal, setShowModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    organizingClub: '',
    viewPhotosLink: '',
    tags: [],
    eventTypes: [],
    eventDate: null,
    image: null,
  });
  
  // Available tag options
  const tagOptions = ['PROFESSIONAL BODIES', 'SOCIAL BODIES', 'CLUBS'];
  const eventTypeOptions = ['SPORTS', 'CULTURAL', 'TECH', 'SEMINAR'];
  const [teamFormData, setTeamFormData] = useState({
    year: '',
    teamPhoto: null,
    leads: [{ name: '', role: '', photo: null }],
  });
  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    role: '',
    description: '',
    image: null,
    imageUrl: '',
  });

  useEffect(() => {
    if (!currentUser) {
      // User not logged in - show message but don't redirect immediately
      setLoading(false);
      return;
    }
    if (userRole !== 'admin') {
      // User is logged in but not admin - show message
      setLoading(false);
      return;
    }
    fetchEvents();
    fetchTeams();
    fetchFaculty();
  }, [currentUser, userRole, navigate]);

  const fetchEvents = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response) {
        console.error('Backend error:', error.response.data);
      } else if (error.request) {
        console.error('No response from backend. Is the server running?');
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/teams`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const fetchFaculty = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faculty`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFaculty(response.data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setFaculty([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const formDataToSend = new FormData();
      formDataToSend.append('eventName', formData.eventName);
      formDataToSend.append('organizingClub', formData.organizingClub);
      formDataToSend.append('viewPhotosLink', formData.viewPhotosLink);
      
      // Add tags as JSON string
      if (formData.tags && formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
      
      // Add event types as JSON string
      if (formData.eventTypes && formData.eventTypes.length > 0) {
        formDataToSend.append('eventTypes', JSON.stringify(formData.eventTypes));
      }
      
      // Add event date
      if (formData.eventDate) {
        formDataToSend.append('eventDate', formData.eventDate.toISOString());
      }
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingEvent) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${editingEvent.id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        eventName: '',
        organizingClub: '',
        viewPhotosLink: '',
        tags: [],
        eventTypes: [],
        eventDate: null,
        image: null,
      });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || 'Failed to save event';
        const errorDetails = error.response.data?.details || '';
        alert(`Error: ${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
      } else if (error.request) {
        alert('Error: Backend server is not running. Please start the backend server.');
      } else {
        alert('Error saving event. Please check console for details.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  // Helper function to safely parse dates from Firestore
  const parseEventDate = (eventDate) => {
    if (!eventDate) return null;
    
    try {
      let date;
      
      // Handle Firestore Timestamp object (when using Firestore SDK)
      if (eventDate.toDate && typeof eventDate.toDate === 'function') {
        date = eventDate.toDate();
      }
      // Handle serialized Firestore timestamp (from API)
      else if (eventDate.seconds && typeof eventDate.seconds === 'number') {
        date = new Date(eventDate.seconds * 1000);
      }
      // Handle ISO string
      else if (typeof eventDate === 'string') {
        date = new Date(eventDate);
      }
      // Handle Date object
      else if (eventDate instanceof Date) {
        date = eventDate;
      }
      // Try to create Date from value
      else {
        date = new Date(eventDate);
      }
      
      // Validate the date
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing event date:', error);
      return null;
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    
    // Parse eventDate from Firestore timestamp
    const parsedDate = parseEventDate(event.eventDate);
    
    // Normalize tags to new format (strings)
    let normalizedTags = [];
    if (event.tags && Array.isArray(event.tags)) {
      normalizedTags = event.tags.map(tag => {
        // Handle both old format {type, value} and new format (string)
        return typeof tag === 'string' ? tag : tag.value || tag;
      });
    }
    
    // Normalize event types
    let normalizedEventTypes = [];
    if (event.eventTypes && Array.isArray(event.eventTypes)) {
      normalizedEventTypes = event.eventTypes.map(type => {
        return typeof type === 'string' ? type : type.value || type;
      });
    }
    
    setFormData({
      eventName: event.eventName,
      organizingClub: event.organizingClub,
      viewPhotosLink: event.viewPhotosLink || '',
      tags: normalizedTags,
      eventTypes: normalizedEventTypes,
      eventDate: parsedDate,
      image: null,
    });
    setShowModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Team management handlers
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const formDataToSend = new FormData();
      formDataToSend.append('year', teamFormData.year);
      
      // Map leads and track which ones have new photos
      const leadsToSend = teamFormData.leads.map(lead => {
        const hasNewPhoto = lead.photo instanceof File;
        return {
          name: lead.name,
          role: lead.role,
          photo: hasNewPhoto ? null : lead.photo, // Keep existing photo URL if not a file
          hasNewPhoto: hasNewPhoto,
        };
      });
      
      formDataToSend.append('leads', JSON.stringify(leadsToSend));

      if (teamFormData.teamPhoto) {
        formDataToSend.append('teamPhoto', teamFormData.teamPhoto);
      }

      // Add lead photos in the same order as leads with hasNewPhoto=true
      teamFormData.leads.forEach((lead) => {
        if (lead.photo && lead.photo instanceof File) {
          formDataToSend.append('leadPhotos', lead.photo);
        }
      });

      console.log('Sending team data:', {
        year: teamFormData.year,
        leadsCount: teamFormData.leads.length,
        hasTeamPhoto: !!teamFormData.teamPhoto,
        leadPhotosCount: teamFormData.leads.filter(l => l.photo instanceof File).length,
      });

      if (editingTeam) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/teams/${editingTeam.id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type - let axios set it with boundary
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/teams`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type - let axios set it with boundary
            },
          }
        );
      }

      setShowTeamModal(false);
      setEditingTeam(null);
      setTeamFormData({
        year: '',
        teamPhoto: null,
        leads: [{ name: '', role: '', photo: null }],
      });
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 'Failed to save team';
        const errorDetails = error.response.data?.details || error.response.data?.message || '';
        alert(`Error: ${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
      } else if (error.request) {
        alert('Error: Backend server is not responding. Please make sure the backend server is running.');
      } else {
        alert(`Error: ${error.message || 'An unexpected error occurred. Please check console for details.'}`);
      }
    }
  };

  const handleTeamDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/teams/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team. Please try again.');
    }
  };

  const handleTeamEdit = (team) => {
    setEditingTeam(team);
    setTeamFormData({
      year: team.year,
      teamPhoto: null,
      leads: team.leads || [{ name: '', role: '', photo: null }],
    });
    setShowTeamModal(true);
  };

  const addLead = () => {
    setTeamFormData({
      ...teamFormData,
      leads: [...teamFormData.leads, { name: '', role: '', photo: null }],
    });
  };

  const removeLead = (index) => {
    const newLeads = teamFormData.leads.filter((_, i) => i !== index);
    setTeamFormData({ ...teamFormData, leads: newLeads });
  };

  const updateLead = (index, field, value) => {
    const newLeads = [...teamFormData.leads];
    newLeads[index] = { ...newLeads[index], [field]: value };
    setTeamFormData({ ...teamFormData, leads: newLeads });
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', facultyFormData.name);
      formDataToSend.append('role', facultyFormData.role);
      formDataToSend.append('description', facultyFormData.description);
      
      if (facultyFormData.image) {
        formDataToSend.append('image', facultyFormData.image);
      } else if (facultyFormData.imageUrl && !facultyFormData.image) {
        formDataToSend.append('imageUrl', facultyFormData.imageUrl);
      }

      if (editingFaculty) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faculty/${editingFaculty.id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faculty`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setShowFacultyModal(false);
      setEditingFaculty(null);
      setFacultyFormData({
        name: '',
        role: '',
        description: '',
        image: null,
        imageUrl: '',
      });
      fetchFaculty();
    } catch (error) {
      console.error('Error saving faculty:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || 'Failed to save faculty member';
        const errorDetails = error.response.data?.details || error.response.data?.message || '';
        alert(`Error: ${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
      } else if (error.request) {
        alert('Error: Backend server is not responding. Please make sure the backend server is running.');
      } else {
        alert(`Error: ${error.message || 'An unexpected error occurred.'}`);
      }
    }
  };

  const handleFacultyDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faculty/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchFaculty();
    } catch (error) {
      console.error('Error deleting faculty member:', error);
      alert('Error deleting faculty member. Please try again.');
    }
  };

  const handleFacultyEdit = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setFacultyFormData({
      name: facultyMember.name || '',
      role: facultyMember.role || '',
      description: facultyMember.description || '',
      image: null,
      imageUrl: facultyMember.imageUrl || '',
    });
    setShowFacultyModal(true);
  };

  // Show error if not logged in or not admin
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <MinimalNavbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <motion.div 
            className="frosted-glass border-l-4 border-accent-red text-on-surface p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
            <p className="mb-4">Please log in as an admin to access the dashboard.</p>
            <motion.button
              onClick={() => navigate('/')}
              className="text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
              style={{ backgroundColor: '#2a8f88' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#237a74'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2a8f88'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Login
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <MinimalNavbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <motion.div 
            className="frosted-glass border-l-4 border-accent-red text-on-surface p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="mb-2">You are logged in, but you don't have admin privileges.</p>
            <p className="mb-4 font-semibold">
              To fix this:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-6 bg-white/10 p-4 rounded-lg">
              <li>Go to Firebase Console → Firestore Database</li>
              <li>Find the <code className="bg-white/20 px-2 py-1 rounded">users</code> collection</li>
              <li>Find your user document (User UID: <code className="bg-white/20 px-2 py-1 rounded">{currentUser.uid}</code>)</li>
              <li>Make sure it has a field: <code className="bg-white/20 px-2 py-1 rounded">role</code> = <code className="bg-white/20 px-2 py-1 rounded">"admin"</code></li>
              <li>If the document doesn't exist, create it with your User UID as the document ID</li>
              <li>Refresh this page after updating</li>
            </ol>
            <div className="flex space-x-4">
              <motion.button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                style={{ backgroundColor: '#616161' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#424242'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
              <motion.button
                onClick={() => window.location.reload()}
                className="text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                style={{ backgroundColor: '#2a8f88' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#237a74'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2a8f88'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh Page
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MinimalNavbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <div className="text-white text-xl font-semibold">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MinimalNavbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="font-display text-display-sm text-primary uppercase tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Admin Dashboard
          </motion.h1>
        </div>

        {/* Tabs */}
        <div className="frosted-glass flex flex-wrap gap-2 mb-8 p-2">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-label text-label-caps uppercase transition-all ${
              activeTab === 'events'
                ? 'bg-accent-red text-white'
                : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 font-label text-label-caps uppercase transition-all ${
              activeTab === 'teams'
                ? 'bg-accent-red text-white'
                : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-6 py-3 font-label text-label-caps uppercase transition-all ${
              activeTab === 'faculty'
                ? 'bg-accent-red text-white'
                : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
            }`}
          >
            Faculty
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            <motion.button
              onClick={() => {
                setEditingEvent(null);
            setFormData({
              eventName: '',
              organizingClub: '',
              viewPhotosLink: '',
              tags: [],
              eventTypes: [],
              eventDate: null,
              image: null,
            });
                setShowModal(true);
              }}
              className="mb-8 flex items-center gap-2 bg-primary text-background px-8 py-4 font-label text-label-caps uppercase hover:bg-accent-red hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus size={24} />
              <span>Add New Event</span>
            </motion.button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden border border-white/10 hover:border-accent-red/30 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400'}
                      alt={event.eventName}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">
                        {event.eventName}
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-md">{event.organizingClub}</p>
                    </div>
                  </div>
                  <div className="p-5" style={{ backgroundColor: '#f5f5f5' }}>
                    {/* Event Date Display */}
                    {event.eventDate && (() => {
                      let date;
                      try {
                        if (event.eventDate.toDate && typeof event.eventDate.toDate === 'function') {
                          date = event.eventDate.toDate();
                        } else if (event.eventDate.seconds && typeof event.eventDate.seconds === 'number') {
                          date = new Date(event.eventDate.seconds * 1000);
                        } else if (typeof event.eventDate === 'string') {
                          date = new Date(event.eventDate);
                        } else if (event.eventDate instanceof Date) {
                          date = event.eventDate;
                        } else {
                          date = new Date(event.eventDate);
                        }
                        
                        if (date instanceof Date && !isNaN(date.getTime())) {
                          return (
                            <div className="mb-3 text-right">
                              <span className="text-sm text-gray-600 font-semibold">
                                {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          );
                        }
                      } catch (error) {
                        console.error('Error formatting event date:', error);
                      }
                      return null;
                    })()}
                    
                    {/* Tags Display */}
                    {(event.tags && Array.isArray(event.tags) && event.tags.length > 0) || 
                     (event.eventTypes && Array.isArray(event.eventTypes) && event.eventTypes.length > 0) ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {event.tags && Array.isArray(event.tags) && event.tags.map((tag, idx) => {
                          // Handle both old format {type, value} and new format (string)
                          const tagValue = typeof tag === 'string' ? tag : tag.value || tag;
                          return (
                            <span
                              key={`tag-${idx}`}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full font-medium"
                            >
                              {tagValue}
                            </span>
                          );
                        })}
                        {event.eventTypes && Array.isArray(event.eventTypes) && event.eventTypes.map((type, idx) => {
                          const typeValue = typeof type === 'string' ? type : type.value || type;
                          return (
                            <span
                              key={`type-${idx}`}
                              className="px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded-full font-medium"
                            >
                              {typeValue}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                    
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() => handleEdit(event)}
                        className="flex-1 text-white py-3 px-4 rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#2a8f88' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#237a74'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2a8f88'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiEdit />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 text-white py-3 px-4 rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#d32f2f' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiTrash2 />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {events.length === 0 && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="backdrop-blur-md rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <p className="text-white text-xl font-semibold">
                    No events found. Click "Add New Event" to create one.
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <>
            <motion.button
              onClick={() => {
                setEditingTeam(null);
                setTeamFormData({
                  year: '',
                  teamPhoto: null,
                  leads: [{ name: '', role: '', photo: null }],
                });
                setShowTeamModal(true);
              }}
              className="mb-8 flex items-center gap-2 bg-primary text-background px-8 py-4 font-label text-label-caps uppercase hover:bg-accent-red hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus size={24} />
              <span>Add New Team</span>
            </motion.button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden border border-white/10 hover:border-accent-red/30 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={team.teamPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'}
                      alt={`Team ${team.year}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">
                        {team.year}
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-md">
                        {team.leads?.length || 0} Team Lead{team.leads?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="p-5" style={{ backgroundColor: '#f5f5f5' }}>
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() => handleTeamEdit(team)}
                        className="flex-1 text-white py-3 px-4 rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#2a8f88' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#237a74'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2a8f88'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiEdit />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleTeamDelete(team.id)}
                        className="flex-1 text-white py-3 px-4 rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#d32f2f' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiTrash2 />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {teams.length === 0 && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="backdrop-blur-md rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <p className="text-white text-xl font-semibold">
                    No teams found. Click "Add New Team" to create one.
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <>
            <motion.button
              onClick={() => {
                setEditingFaculty(null);
                setFacultyFormData({
                  name: '',
                  role: '',
                  description: '',
                  image: null,
                  imageUrl: '',
                });
                setShowFacultyModal(true);
              }}
              className="mb-8 flex items-center gap-2 bg-primary text-background px-8 py-4 font-label text-label-caps uppercase hover:bg-accent-red hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus size={24} />
              <span>Add New Faculty Member</span>
            </motion.button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map((facultyMember, index) => (
                <motion.div
                  key={facultyMember.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden border border-white/10 hover:border-accent-red/30 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={facultyMember.imageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
                      alt={facultyMember.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">
                        {facultyMember.name}
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-md">{facultyMember.role}</p>
                    </div>
                  </div>
                  <div className="p-5" style={{ backgroundColor: '#f5f5f5' }}>
                    {facultyMember.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {facultyMember.description}
                      </p>
                    )}
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() => handleFacultyEdit(facultyMember)}
                        className="flex-1 text-white py-3 px-4 rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#2a8f88' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#237a74'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2a8f88'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiEdit />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleFacultyDelete(facultyMember.id)}
                        className="flex-1 text-white py-3 px-4 rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#d32f2f' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiTrash2 />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {faculty.length === 0 && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="backdrop-blur-md rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <p className="text-white text-xl font-semibold">
                    No faculty members found. Click "Add New Faculty Member" to create one.
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <EventModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingEvent(null);
            setFormData({
              eventName: '',
              organizingClub: '',
              viewPhotosLink: '',
              tags: [],
              eventTypes: [],
              eventDate: null,
              image: null,
            });
          }}
          editingEvent={editingEvent}
          tagOptions={tagOptions}
          eventTypeOptions={eventTypeOptions}
        />
      )}

      {showTeamModal && (
        <TeamModal
          teamFormData={teamFormData}
          setTeamFormData={setTeamFormData}
          onSubmit={handleTeamSubmit}
          onClose={() => {
            setShowTeamModal(false);
            setEditingTeam(null);
            setTeamFormData({
              year: '',
              teamPhoto: null,
              leads: [{ name: '', role: '', photo: null }],
            });
          }}
          editingTeam={editingTeam}
          addLead={addLead}
          removeLead={removeLead}
          updateLead={updateLead}
        />
      )}

      {showFacultyModal && (
        <FacultyModal
          facultyFormData={facultyFormData}
          setFacultyFormData={setFacultyFormData}
          onSubmit={handleFacultySubmit}
          onClose={() => {
            setShowFacultyModal(false);
            setEditingFaculty(null);
            setFacultyFormData({
              name: '',
              role: '',
              description: '',
              image: null,
              imageUrl: '',
            });
          }}
          editingFaculty={editingFaculty}
        />
      )}
    </div>
  );
};

const EventModal = ({ formData, setFormData, onSubmit, onClose, editingEvent, tagOptions, eventTypeOptions }) => {
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleTagToggle = (tagValue) => {
    const currentTags = formData.tags || [];
    const tagIndex = currentTags.findIndex(tag => tag === tagValue);
    
    if (tagIndex >= 0) {
      // Remove tag
      setFormData({
        ...formData,
        tags: currentTags.filter((_, idx) => idx !== tagIndex)
      });
    } else {
      // Add tag
      setFormData({
        ...formData,
        tags: [...currentTags, tagValue]
      });
    }
  };
  
  const handleEventTypeToggle = (typeValue) => {
    const currentTypes = formData.eventTypes || [];
    const typeIndex = currentTypes.findIndex(type => type === typeValue);
    
    if (typeIndex >= 0) {
      // Remove type
      setFormData({
        ...formData,
        eventTypes: currentTypes.filter((_, idx) => idx !== typeIndex)
      });
    } else {
      // Add type
      setFormData({
        ...formData,
        eventTypes: [...currentTypes, typeValue]
      });
    }
  };
  
  const isTagSelected = (tagValue) => {
    return formData.tags?.includes(tagValue) || false;
  };
  
  const isEventTypeSelected = (typeValue) => {
    return formData.eventTypes?.includes(typeValue) || false;
  };

  useEffect(() => {
    if (formData.image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(formData.image);
    } else if (editingEvent?.imageUrl) {
      setImagePreview(editingEvent.imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [formData.image, editingEvent]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-bold mb-4">
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizing Club
            </label>
            <input
              type="text"
              value={formData.organizingClub}
              onChange={(e) => setFormData({ ...formData, organizingClub: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Photos Link
            </label>
            <input
              type="url"
              value={formData.viewPhotosLink}
              onChange={(e) => setFormData({ ...formData, viewPhotosLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <DatePicker
              selected={formData.eventDate && formData.eventDate instanceof Date && !isNaN(formData.eventDate.getTime()) ? formData.eventDate : null}
              onChange={(date) => setFormData({ ...formData, eventDate: date })}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select event date"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
              wrapperClassName="w-full"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {tagOptions.map(tag => (
                <label
                  key={tag}
                  className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    isTagSelected(tag)
                      ? 'bg-red-orange-500 text-white border-red-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-orange-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isTagSelected(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypeOptions.map(type => (
                <label
                  key={type}
                  className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    isEventTypeSelected(type)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isEventTypeSelected(type)}
                    onChange={() => handleEventTypeToggle(type)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-4 w-full h-48 object-cover rounded"
              />
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-red-orange-500 text-white py-2 px-4 rounded hover:bg-red-orange-600 transition-colors"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const TeamModal = ({ teamFormData, setTeamFormData, onSubmit, onClose, editingTeam, addLead, removeLead, updateLead }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year (e.g., 2024-2025)
                </label>
                <input
                  type="text"
                  value={teamFormData.year}
                  onChange={(e) => setTeamFormData({ ...teamFormData, year: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Team Photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTeamFormData({ ...teamFormData, teamPhoto: e.target.files[0] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {editingTeam && editingTeam.teamPhoto && !teamFormData.teamPhoto && (
                  <img
                    src={editingTeam.teamPhoto}
                    alt="Current team photo"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Team Leads */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Team Leads
                  </label>
                  <button
                    type="button"
                    onClick={addLead}
                    className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
                  >
                    + Add Lead
                  </button>
                </div>
                <div className="space-y-4">
                  {teamFormData.leads.map((lead, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-gray-600">Lead {index + 1}</span>
                        {teamFormData.leads.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLead(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={lead.name}
                            onChange={(e) => updateLead(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Role
                          </label>
                          <input
                            type="text"
                            value={lead.role}
                            onChange={(e) => updateLead(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Photo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => updateLead(index, 'photo', e.target.files[0])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        {editingTeam && editingTeam.leads?.[index]?.photo && !(lead.photo instanceof File) && (
                          <img
                            src={editingTeam.leads[index].photo}
                            alt="Current lead photo"
                            className="mt-2 w-20 h-20 object-cover rounded-full"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold"
              >
                {editingTeam ? 'Update Team' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const FacultyModal = ({ facultyFormData, setFacultyFormData, onSubmit, onClose, editingFaculty }) => {
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (facultyFormData.image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(facultyFormData.image);
    } else if (facultyFormData.imageUrl) {
      setImagePreview(facultyFormData.imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [facultyFormData.image, facultyFormData.imageUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFacultyFormData({ ...facultyFormData, image: file, imageUrl: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={facultyFormData.name}
                  onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={facultyFormData.role}
                  onChange={(e) => setFacultyFormData({ ...facultyFormData, role: e.target.value })}
                  placeholder="e.g., Faculty In-Charge"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={facultyFormData.description}
                  onChange={(e) => setFacultyFormData({ ...facultyFormData, description: e.target.value })}
                  rows={4}
                  placeholder="e.g., Passionate about photography and mentoring students."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Image URL or Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Faculty Photo
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <div className="text-sm text-gray-500 text-center">
                    OR
                  </div>
                  <input
                    type="url"
                    value={facultyFormData.imageUrl}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, imageUrl: e.target.value, image: null })}
                    placeholder="Image URL (if not uploading file)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
              >
                {editingFaculty ? 'Update Faculty Member' : 'Create Faculty Member'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

