
import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const eventTime = new Date(event.event_start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link to={`/event/${event.id}`} className="block group">
      <div className="bg-card rounded-lg overflow-hidden border border-border group-hover:border-primary transition-all duration-300 transform group-hover:-translate-y-1 shadow-md hover:shadow-xl">
        <div className="relative">
          <img
            src={event.poster_url || 'https://picsum.photos/1200/600'}
            alt={event.event_name}
            className="w-full h-80 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-gradient-to-t from-primary/70 to-transparent transition-all duration-300"></div>
        </div>
        <div className="p-5 text-center">
          <h3 className="text-xl font-bold text-text-primary uppercase tracking-wider">{event.event_name}</h3>
          <p className="text-sm text-text-secondary mt-1">by {event.organizer_name || 'Unknown Organizer'}</p>
          <p className="text-sm text-secondary font-semibold mt-2">Mainstage</p>
          <p className="text-sm text-text-secondary mt-1">{eventTime}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;