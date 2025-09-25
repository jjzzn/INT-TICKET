
import React, { useState, useEffect, useMemo } from 'react';
import EventCard from '../components/EventCard';
import SearchFilter from '../components/SearchFilter';
import Loading, { EventCardSkeleton } from '../components/Loading';
import { Event, EventStatus } from '../types';
import { supabase } from '../lib/supabaseClient';
// import { usePerformance } from '../hooks/usePerformance';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  // const { measureRender } = usePerformance('HomePage');

  const bannerEvents = useMemo(() => events.slice(0, 3), [events]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Supabase not configured, using mock data');
          // Use mock data when Supabase is not configured
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          
          const mockEvents: Event[] = [
            {
              id: 1,
              event_name: 'Today\'s Music Festival',
              description: 'Join us for an amazing music festival happening today!',
              venue: 'Central Park',
              event_start_datetime: today.toISOString(),
              event_end_datetime: new Date(today.getTime() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours later
              poster_url: 'https://picsum.photos/800/600?random=1',
              organizer_id: 1,
              organizer_name: 'Music Events Co.',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              // Required fields from the database schema
              agenda_url: '',
              contact_email: 'contact@musicevents.com',
              contact_phone: '+1234567890',
              currency: 'USD',
              current_attendees: 150,
              event_info: 'Amazing summer music festival',
              event_type: 'Music Festival',
              facebook_contact: '',
              google_map_link: '',
              instagram_contact: '',
              line_contact: '',
              max_attendees: 5000,
              tiktok_contact: '',
              website_url: '',
              x_contact: '',
              youtube_contact: '',
              status: EventStatus.PUBLIC
            },
            {
              id: 2,
              event_name: 'Tomorrow\'s Tech Conference',
              description: 'The biggest tech conference happening tomorrow with industry leaders and innovators.',
              venue: 'Convention Center',
              event_start_datetime: tomorrow.toISOString(),
              event_end_datetime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
              poster_url: 'https://picsum.photos/800/600?random=2',
              organizer_id: 2,
              organizer_name: 'Tech Events Ltd.',
              is_active: true,
              created_at: '2024-01-02T00:00:00Z',
              // Required fields from the database schema
              agenda_url: '',
              contact_email: 'info@techevents.com',
              contact_phone: '+1234567891',
              currency: 'USD',
              current_attendees: 200,
              event_info: 'Premier tech conference',
              event_type: 'Conference',
              facebook_contact: '',
              google_map_link: '',
              instagram_contact: '',
              line_contact: '',
              max_attendees: 1000,
              tiktok_contact: '',
              website_url: '',
              x_contact: '',
              youtube_contact: '',
              status: EventStatus.PUBLIC
            },
            {
              id: 3,
              event_name: 'Next Week Food & Wine Festival',
              description: 'Experience the finest cuisine and wines from local and international chefs next week.',
              venue: 'Waterfront Plaza',
              event_start_datetime: nextWeek.toISOString(),
              event_end_datetime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days later
              poster_url: 'https://picsum.photos/800/600?random=3',
              organizer_id: 3,
              organizer_name: 'Culinary Events',
              is_active: true,
              created_at: '2024-01-03T00:00:00Z',
              // Required fields from the database schema
              agenda_url: '',
              contact_email: 'hello@culinaryevents.com',
              contact_phone: '+1234567892',
              currency: 'USD',
              current_attendees: 300,
              event_info: 'Food and wine extravaganza',
              event_type: 'Food Festival',
              facebook_contact: '',
              google_map_link: '',
              instagram_contact: '',
              line_contact: '',
              max_attendees: 2000,
              tiktok_contact: '',
              website_url: '',
              x_contact: '',
              youtube_contact: '',
              status: EventStatus.PUBLIC
            }
          ];
          setEvents(mockEvents);
          setLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from('events')
          .select(`
            *,
            organizers ( organizer_name )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbError) {
          console.error('Error fetching events:', JSON.stringify(dbError, null, 2));
          setError(`Failed to fetch events. [${dbError.message}]`);
          setEvents([]);
          return;
        }

        const safeData = Array.isArray(data) ? data : [];
        const formattedData = safeData.map((event: any) => ({
          ...event,
          organizer_name: (event.organizers as any)?.organizer_name || 'Unknown Organizer',
          status: event.status || EventStatus.DRAFT // Default to draft if no status
        })) as Event[];
        
        // Filter to only show public events
        const publicEvents = formattedData.filter(event => event.status === EventStatus.PUBLIC);
        setEvents(publicEvents);
        setFilteredEvents(publicEvents);
      } catch (err: any) {
        console.error('Unexpected error fetching events:', err);
        setError('An unexpected error occurred while fetching events. Please try again later.');
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Initialize filtered events when events change
  useEffect(() => {
    if (events.length > 0) {
      setFilteredEvents(events);
    }
  }, [events]);

  const handleFilteredEvents = (filtered: Event[]) => {
    setFilteredEvents(filtered);
  };

  useEffect(() => {
    if (bannerEvents.length === 0) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerEvents.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [bannerEvents.length]);
  
  const currentEvent = bannerEvents[currentSlide];

  if (loading) {
    return (
      <div>
        {/* Loading Banner */}
        <div className="h-96 bg-border animate-pulse" />
        
        {/* Loading Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 bg-border rounded w-1/3 mx-auto mb-8 animate-pulse" />
          
          {/* Loading Search */}
          <div className="mb-8">
            <div className="h-12 bg-border rounded animate-pulse" />
          </div>
          
          {/* Loading Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-text-secondary mt-2">We couldn't load the events. Please try again later.</p>
            <p className="text-sm text-gray-500 mt-4 bg-surface p-4 rounded-md border border-border">{error}</p>
        </div>
    );
  }

  return (
    <div>
      {/* Section 1: Banner Carousel */}
      <section className="relative h-[70vh] md:h-[90vh] w-full overflow-hidden">
        {bannerEvents.map((event, index) => (
          <div
            key={event.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={event.poster_url || 'https://picsum.photos/1200/900'} alt={event.event_name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}
        {currentEvent && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-wider animate-fade-in-down">
                    {new Date(currentEvent.event_start_datetime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })} - {new Date(currentEvent.event_end_datetime).toLocaleDateString('en-US', { day: '2-digit' })}
                </h1>
                <h2 className="text-3xl md:text-6xl font-extrabold uppercase mt-2 animate-fade-in-up">
                    {currentEvent.venue}
                </h2>
                <p className="text-xl md:text-3xl font-bold mt-4 animate-fade-in-up animation-delay-300">
                    {bannerEvents.length} ACTS
                </p>
            </div>
        )}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerEvents.map((_, index) => (
                <button 
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white'}`}
                    aria-label={`Go to slide ${index + 1}`}
                ></button>
            ))}
        </div>
      </section>

      {/* Section 2: Line-up / General Info */}
      <section className="py-20 px-4 bg-surface text-center">
        <div className="container mx-auto">
            <h3 className="text-lg font-semibold tracking-widest text-text-secondary">LINE-UP 2024</h3>
            <div className="mt-8 space-y-4 max-w-4xl mx-auto text-2xl md:text-4xl font-bold tracking-wider">
                <p className="text-primary">DONEC ID LOREM <span className="text-secondary">UK</span></p>
                <p className="text-text-primary">NISI PELLENTUE <span className="primary">USA</span> CURABITUR EFFICI <span className="text-secondary">TURCA</span></p>
                <p className="text-text-primary">VENENATIS EGET <span className="text-secondary">UK</span> LIGULA ID MASSA <span className="text-primary">AU</span> COMMODO ULLAM <span className="text-secondary">UK</span></p>
                <p className="text-text-secondary">PRAESENT SIT AMET <span className="text-primary">USA</span> EROS UT RISUS COMMODO <span className="text-secondary">NL</span></p>
                <p className="text-gray-400">NULLAM VELIT ANTE <span className="text-secondary">UK</span> SUSCIPIT TRISTIQUE <span className="text-primary">BE</span></p>
            </div>
            <button className="mt-12 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-md hover:opacity-90 transition-opacity">
                BUY TICKETS
            </button>
        </div>
      </section>
      
      {/* Section 3: Search and Events */}
      <section className="py-20 px-4 container mx-auto">
        <h2 className="text-center text-3xl font-bold uppercase tracking-wider text-text-primary mb-4">
          DISCOVER EVENTS
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12"></div>
        
        {/* Search and Filter */}
        <div className="mb-12">
          <SearchFilter 
            events={events} 
            onFilteredEvents={handleFilteredEvents}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No events found</h3>
            <p className="text-text-secondary">
              Try adjusting your search criteria or browse all events.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
