import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventWithTickets, TicketType, Speaker } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';


// Icon Components
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const OrganizerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0115 15v3h1zM4.75 12.094A5.973 5.973 0 004 15v3H3v-3a3.005 3.005 0 011.25-2.294z"/>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>
);

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
    </svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

// Social Media Icon Component
const SocialMediaLinks: React.FC<{ event: any }> = ({ event }) => {
    const socialLinks = [
        { url: event.facebook_contact, name: 'Facebook', color: 'text-blue-600 hover:text-blue-800' },
        { url: event.instagram_contact, name: 'Instagram', color: 'text-pink-600 hover:text-pink-800' },
        { url: event.x_contact, name: 'X (Twitter)', color: 'text-gray-600 hover:text-gray-800' },
        { url: event.tiktok_contact, name: 'TikTok', color: 'text-black hover:text-gray-800' },
        { url: event.youtube_contact, name: 'YouTube', color: 'text-red-600 hover:text-red-800' },
        { url: event.line_contact, name: 'Line', color: 'text-green-600 hover:text-green-800' }
    ].filter(link => link.url);

    if (socialLinks.length === 0) return null;

    return (
        <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary transition-all duration-200 ${link.color}`}
                    >
                        {link.name}
                    </a>
                ))}
            </div>
        </div>
    );
};

const SpeakerCard: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
    return (
        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-200">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {speaker.image_url ? (
                        <img 
                            src={speaker.image_url} 
                            alt={speaker.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {speaker.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-text-primary mb-1">{speaker.name}</h4>
                    {speaker.title && (
                        <p className="text-sm font-medium text-primary mb-1">{speaker.title}</p>
                    )}
                    {speaker.company && (
                        <p className="text-sm text-text-secondary mb-3">{speaker.company}</p>
                    )}
                    {speaker.bio && (
                        <p className="text-sm text-text-secondary leading-relaxed mb-4">
                            {speaker.bio}
                        </p>
                    )}
                    {(speaker.linkedin_url || speaker.twitter_url) && (
                        <div className="flex items-center gap-3">
                            {speaker.linkedin_url && (
                                <a 
                                    href={speaker.linkedin_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="LinkedIn Profile"
                                >
                                    <LinkedInIcon />
                                </a>
                            )}
                            {speaker.twitter_url && (
                                <a 
                                    href={speaker.twitter_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                    title="Twitter Profile"
                                >
                                    <TwitterIcon />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TicketTierCard: React.FC<{ tier: TicketType, onSelect: () => void }> = ({ tier, onSelect }) => {
    const sold = tier.sold_quantity || 0;
    const total = tier.quantity;
    const isSoldOut = sold >= total;
    const availablePercentage = ((total - sold) / total) * 100;
    
    return (
        <div className={`p-6 border rounded-xl transition-all duration-200 ${isSoldOut ? 'bg-surface/50 border-border opacity-60' : 'bg-card border-border hover:border-primary hover:shadow-lg cursor-pointer'}`} onClick={!isSoldOut ? onSelect : undefined}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h4 className={`text-lg font-bold mb-1 ${isSoldOut ? 'text-text-secondary' : 'text-text-primary'}`}>{tier.name}</h4>
                    <p className={`text-2xl font-bold ${isSoldOut ? 'text-text-secondary' : 'text-primary'}`}>
                        ${tier.price}
                        <span className="text-sm font-normal text-text-secondary ml-1">{tier.currency}</span>
                    </p>
                    {tier.description && (
                        <p className="text-sm text-text-secondary mt-2">{tier.description}</p>
                    )}
                </div>
                <div className="ml-4">
                    {isSoldOut ? (
                        <span className="inline-flex items-center px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full">
                            Sold Out
                        </span>
                    ) : (
                        <button 
                            onClick={onSelect} 
                            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Select Ticket
                        </button>
                    )}
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Available</span>
                    <span className={`font-medium ${availablePercentage < 20 ? 'text-orange-600' : 'text-text-primary'}`}>
                        {total - sold} of {total} tickets
                    </span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                            availablePercentage < 20 ? 'bg-orange-500' : 
                            availablePercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${availablePercentage}%` }}
                    ></div>
                </div>
                {tier.benefits && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-text-secondary font-medium mb-1">Includes:</p>
                        <p className="text-xs text-text-secondary">{tier.benefits}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [event, setEvent] = useState<(EventWithTickets & { organizer_name: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        // Mock event data for demo
        const mockEvent = {
          id: parseInt(id, 10),
          event_name: 'Demo Tech Conference 2024',
          description: 'Join us for an exciting tech conference featuring the latest innovations in AI, blockchain, and web development. Network with industry leaders, attend hands-on workshops, and discover the future of technology.\n\nThis comprehensive event includes keynote speeches from renowned tech leaders, interactive workshops, networking sessions, and an exhibition showcasing cutting-edge technologies.',
          venue: 'Bangkok International Trade & Exhibition Centre (BITEC)',
          event_start_datetime: '2024-12-15T09:00:00Z',
          event_end_datetime: '2024-12-15T18:00:00Z',
          poster_url: 'https://picsum.photos/1200/600?random=tech-conf',
          organizer_id: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          contact_email: 'info@techconf2024.com',
          contact_phone: '+66-2-123-4567',
          max_attendees: 1000,
          current_attendees: 450,
          event_type: 'Conference',
          currency: 'THB',
          event_info: 'Please bring your laptop for hands-on workshops. Lunch and refreshments will be provided. Parking is available on-site. Registration starts at 8:30 AM.',
          agenda_url: 'https://techconf2024.com/agenda',
          google_map_link: 'https://maps.app.goo.gl/example',
          website_url: 'https://techconf2024.com',
          facebook_contact: 'https://facebook.com/techconf2024',
          instagram_contact: 'https://instagram.com/techconf2024',
          x_contact: 'https://x.com/techconf2024',
          tiktok_contact: 'https://tiktok.com/@techconf2024',
          youtube_contact: 'https://youtube.com/@techconf2024',
          line_contact: '@techconf2024',
          organizer_name: 'Tech Events Thailand',
          ticket_types: [
            {
              id: 1,
              event_id: parseInt(id, 10),
              name: 'Early Bird',
              price: 2500,
              quantity: 200,
              sold_quantity: 150,
              currency: 'THB',
              description: 'Limited time offer with exclusive perks',
              benefits: 'Welcome kit, priority seating, networking lunch, workshop materials',
              is_active: true,
              sale_start_date: '2024-01-01T00:00:00Z',
              sale_end_date: '2024-11-30T23:59:59Z'
            },
            {
              id: 2,
              event_id: parseInt(id, 10),
              name: 'Regular',
              price: 3500,
              quantity: 500,
              sold_quantity: 200,
              currency: 'THB',
              description: 'Standard conference access',
              benefits: 'Conference access, lunch, workshop materials',
              is_active: true,
              sale_start_date: '2024-01-01T00:00:00Z',
              sale_end_date: '2024-12-14T23:59:59Z'
            },
            {
              id: 3,
              event_id: parseInt(id, 10),
              name: 'VIP',
              price: 5500,
              quantity: 100,
              sold_quantity: 75,
              currency: 'THB',
              description: 'Premium experience with exclusive access',
              benefits: 'VIP lounge access, premium seating, exclusive networking dinner, signed books, one-on-one mentor session',
              is_active: true,
              sale_start_date: '2024-01-01T00:00:00Z',
              sale_end_date: '2024-12-14T23:59:59Z'
            }
          ],
          speakers: [
            {
              id: 1,
              event_id: parseInt(id, 10),
              name: 'Dr. Sarah Chen',
              title: 'Chief AI Officer',
              company: 'TechVision AI',
              bio: 'Dr. Sarah Chen is a leading expert in artificial intelligence and machine learning with over 15 years of experience. She has published numerous papers on neural networks and has been instrumental in developing AI solutions for Fortune 500 companies.',
              image_url: 'https://picsum.photos/200/200?random=speaker1',
              linkedin_url: 'https://linkedin.com/in/sarahchen',
              twitter_url: 'https://twitter.com/sarahchen_ai',
              order: 1,
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              event_id: parseInt(id, 10),
              name: 'Marcus Rodriguez',
              title: 'Blockchain Architect',
              company: 'CryptoInnovate',
              bio: 'Marcus is a blockchain pioneer who has been working with distributed ledger technologies since 2009. He has architected blockchain solutions for major financial institutions and is a frequent speaker at international conferences.',
              image_url: 'https://picsum.photos/200/200?random=speaker2',
              linkedin_url: 'https://linkedin.com/in/marcusrodriguez',
              twitter_url: 'https://twitter.com/marcus_crypto',
              order: 2,
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: 3,
              event_id: parseInt(id, 10),
              name: 'Emily Watson',
              title: 'Senior Full-Stack Developer',
              company: 'WebCraft Studios',
              bio: 'Emily is a passionate full-stack developer with expertise in React, Node.js, and cloud technologies. She has built scalable web applications for startups and enterprises, and is an advocate for clean code and best practices.',
              image_url: 'https://picsum.photos/200/200?random=speaker3',
              linkedin_url: 'https://linkedin.com/in/emilywatson',
              twitter_url: null,
              order: 3,
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: 4,
              event_id: parseInt(id, 10),
              name: 'David Kim',
              title: 'DevOps Engineer',
              company: 'CloudScale Solutions',
              bio: 'David specializes in DevOps practices, container orchestration, and cloud infrastructure. He has helped numerous organizations transition to cloud-native architectures and implement CI/CD pipelines.',
              image_url: null,
              linkedin_url: 'https://linkedin.com/in/davidkim',
              twitter_url: 'https://twitter.com/david_devops',
              order: 4,
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        };
        
        setEvent(mockEvent as any);
        setLoading(false);
        return;
      }

      const { data, error: dbError } = await supabase
        .from('events')
        .select(`
            *,
            ticket_types(*),
            speakers(*),
            organizers ( organizer_name )
        `)
        .eq('id', parseInt(id, 10))
        .single();
      
      if (dbError || !data) {
        console.error('Error fetching event:', JSON.stringify(dbError, null, 2));
        const friendlyMessage = dbError ? `Could not load event. [${dbError.message}]` : 'The event could not be found.';
        setError(friendlyMessage);
        setEvent(null);
      } else {
        const eventData = data as any;
        setEvent({
            ...eventData,
            ticket_types: eventData.ticket_types || [],
            speakers: eventData.speakers || [],
            organizer_name: eventData.organizers?.organizer_name || 'Unknown Organizer'
        });
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleTicketSelect = (tierId: number) => {
    if (user) {
        navigate(`/event/${id}/buy/${tierId}`);
    } else {
        openAuthModal('login');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h2 className="text-2xl font-bold text-red-600">Event Not Found</h2>
            <p className="text-text-secondary mt-2">We couldn't find the event you're looking for.</p>
            <p className="text-sm text-gray-500 mt-4 bg-surface p-4 rounded-md border border-border">{error}</p>
        </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const startDate = formatDate(event.event_start_datetime);
  const endDate = formatDate(event.event_end_datetime);
  const attendanceRate = ((event.current_attendees || 0) / event.max_attendees) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={event.poster_url} 
          alt={event.event_name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                {event.event_type}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.event_name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span className="font-medium">{startDate.day}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon />
                <span className="font-medium">{startDate.time} - {endDate.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span className="font-medium">{event.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <div className="bg-card p-8 rounded-xl border border-border">
              <h2 className="text-2xl font-bold text-text-primary mb-6">About This Event</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-lg">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organizer Info */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <OrganizerIcon />
                  Organizer
                </h3>
                <div className="space-y-3">
                  <p className="font-semibold text-text-primary">{event.organizer_name}</p>
                  {event.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <EmailIcon />
                      <a href={`mailto:${event.contact_email}`} className="hover:text-primary transition-colors">
                        {event.contact_email}
                      </a>
                    </div>
                  )}
                  {event.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <PhoneIcon />
                      <a href={`tel:${event.contact_phone}`} className="hover:text-primary transition-colors">
                        {event.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Stats */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <UsersIcon />
                  Attendance
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">Current Attendees</span>
                      <span className="font-medium text-text-primary">
                        {event.current_attendees || 0} / {event.max_attendees}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-3">
                      <div 
                        className="h-3 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {attendanceRate >= 80 ? 'Almost full! ' : attendanceRate >= 50 ? 'Filling up fast! ' : ''}
                    {Math.round(100 - attendanceRate)}% spots remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            {event.event_info && (
              <div className="bg-card p-8 rounded-xl border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <InfoIcon />
                  Important Information
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {event.event_info}
                  </p>
                </div>
              </div>
            )}

            {/* Event Agenda Section */}
            {event.agenda_url && (
              <div className="bg-card p-8 rounded-xl border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <DocumentIcon />
                  Event Agenda
                </h3>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img 
                      src={event.agenda_url} 
                      alt="Event Agenda"
                      className="w-full h-auto object-contain max-h-[800px]"
                      onError={(e) => {
                        // Fallback to link if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackDiv = target.nextElementSibling as HTMLDivElement;
                        if (fallbackDiv) {
                          fallbackDiv.style.display = 'block';
                        }
                      }}
                    />
                    <div 
                      className="hidden p-6 text-center bg-surface"
                      style={{ display: 'none' }}
                    >
                      <p className="text-text-secondary mb-4">Unable to display agenda image</p>
                      <a 
                        href={event.agenda_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <DocumentIcon />
                        View Agenda
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <a 
                      href={event.agenda_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <LinkIcon />
                      Open full-size agenda
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Event Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {event.website_url && (
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <GlobeIcon />
                    Official Website
                  </h3>
                  <a 
                    href={event.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <LinkIcon />
                    Visit Website
                  </a>
                  <p className="text-sm text-text-secondary mt-2">
                    Get more details and updates about the event
                  </p>
                </div>
              )}

              {event.google_map_link && (
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <LocationIcon />
                    Venue Location
                  </h3>
                  <a 
                    href={event.google_map_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <LocationIcon />
                    Get Directions
                  </a>
                  <p className="text-sm text-text-secondary mt-2">
                    Navigate to {event.venue}
                  </p>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <SocialMediaLinks event={event} />

            {/* Speakers Section */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-card p-8 rounded-xl border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <MicrophoneIcon />
                  Featured Speakers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(speaker => (
                      <SpeakerCard key={speaker.id} speaker={speaker} />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Info Card */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4">Event Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CalendarIcon />
                    <div>
                      <p className="font-semibold text-text-primary">{startDate.day}</p>
                      <p className="text-text-secondary">{startDate.time} - {endDate.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <LocationIcon />
                    <div>
                      <p className="font-semibold text-text-primary">{event.venue}</p>
                      {event.google_map_link && (
                        <a 
                          href={event.google_map_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          View on map
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <OrganizerIcon />
                    <div>
                      <p className="font-semibold text-text-primary">{event.organizer_name}</p>
                      <p className="text-text-secondary">Organizer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets Section */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold text-text-primary mb-6">Select Your Ticket</h3>
                <div className="space-y-4">
                  {event.ticket_types.map(tier => (
                    <TicketTierCard 
                      key={tier.id} 
                      tier={tier}
                      onSelect={() => handleTicketSelect(tier.id)}
                    />
                  ))}
                </div>
                
                {!user && (
                  <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
                    <p className="text-sm text-text-secondary text-center">
                      <button 
                        onClick={() => openAuthModal('login')}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </button>
                      {' '}to purchase tickets
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;