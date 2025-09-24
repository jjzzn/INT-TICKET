import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventCard from '../../components/EventCard';
import { Event } from '../../types';

const mockEvent: Event = {
  id: 1,
  event_name: 'Test Event',
  description: 'Test Description',
  venue: 'Test Venue',
  event_start_datetime: '2024-12-15T09:00:00Z',
  event_end_datetime: '2024-12-15T17:00:00Z',
  poster_url: 'https://example.com/poster.jpg',
  organizer_id: 1,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  contact_email: 'test@example.com',
  contact_phone: '+1234567890',
  max_attendees: 100,
  event_type: 'Conference',
  currency: 'USD',
  current_attendees: 50,
  event_info: 'Test info',
  agenda_url: '',
  google_map_link: '',
  website_url: '',
  facebook_contact: '',
  instagram_contact: '',
  x_contact: '',
  tiktok_contact: '',
  youtube_contact: '',
  line_contact: '',
  organizer_name: 'Test Organizer'
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EventCard', () => {
  it('renders event information correctly', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('Test Organizer')).toBeInTheDocument();
  });

  it('displays event date correctly', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    // Check if date is displayed (format may vary)
    expect(screen.getByText(/Dec/i)).toBeInTheDocument();
  });

  it('shows attendance information', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    expect(screen.getByText(/50.*100/)).toBeInTheDocument();
  });

  it('has correct link to event page', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/event/1');
  });
});
