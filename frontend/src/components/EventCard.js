import React from 'react';
import { FiExternalLink } from 'react-icons/fi';

const EventCard = ({ event }) => {
  return (
    <div className="gallery-card-item">
      <div className="gallery-card-content">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400'}
          alt={event.eventName}
          className="gallery-card-image"
        />
        <div className="gallery-card-overlay"></div>
        {/* Event Date Display - Right Bottom Corner */}
        {event.eventDate && (() => {
          try {
            let date;
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
                <div className="gallery-card-date">
                  <span className="text-xs font-semibold text-white drop-shadow-lg">
                    📅 {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            }
          } catch (error) {
            console.error('Error formatting event date:', error);
          }
          return null;
        })()}
        <div className="gallery-card-info">
          <h2>{event.eventName}</h2>
          {event.organizingClub && (
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={`${process.env.PUBLIC_URL}/assets/tcet-capture-logo.png`}
                alt="Club Logo"
                className="w-5 h-5 object-contain opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-sm opacity-90">{event.organizingClub}</span>
            </div>
          )}
          <div className="gallery-card-buttons">
            {event.viewPhotosLink && (
              <a
                href={event.viewPhotosLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Photos</span>
                <FiExternalLink size={14} />
              </a>
            )}
            {event.worksLink && (
              <a
                href={event.worksLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Works</span>
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

