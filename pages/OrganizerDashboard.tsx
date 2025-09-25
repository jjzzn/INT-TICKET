import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EventWithTickets, Role, EventStatus } from '../types';
import { supabase } from '../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<EventWithTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{[eventId: number]: boolean}>({});

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
        if (!user || user.role !== Role.ORGANIZER) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase not configured, using mock organizer events');
            // Mock events data for demo
            const mockEvents: EventWithTickets[] = [
                {
                    id: 1,
                    event_name: 'Demo Tech Conference 2024',
                    description: 'A demo tech conference for testing purposes',
                    venue: 'Demo Convention Center',
                    event_start_datetime: '2024-12-15T09:00:00Z',
                    event_end_datetime: '2024-12-15T17:00:00Z',
                    poster_url: 'https://picsum.photos/800/600?random=demo1',
                    organizer_id: 1,
                    is_active: true,
                    created_at: '2024-01-01T00:00:00Z',
                    contact_email: 'demo@organizer.com',
                    contact_phone: '+1234567890',
                    max_attendees: 500,
                    event_type: 'Conference',
                    currency: 'USD',
                    current_attendees: 150,
                    event_info: 'Demo event info',
                    agenda_url: '',
                    google_map_link: '',
                    website_url: '',
                    facebook_contact: '',
                    instagram_contact: '',
                    x_contact: '',
                    tiktok_contact: '',
                    youtube_contact: '',
                    line_contact: '',
                    status: EventStatus.PUBLIC,
                    ticket_types: [
                        {
                            id: 1,
                            event_id: 1,
                            name: 'Early Bird',
                            price: 99,
                            quantity: 100,
                            sold_quantity: 75,
                            currency: 'USD',
                            created_at: '2024-01-01T00:00:00Z',
                            benefits: 'Early access, welcome kit',
                            description: 'Early bird pricing for early registrants',
                            is_active: true,
                            max_per_order: 5,
                            min_per_order: 1,
                            sale_end_date: '2024-12-14T23:59:59Z',
                            sale_start_date: '2024-01-01T00:00:00Z'
                        },
                        {
                            id: 2,
                            event_id: 1,
                            name: 'Regular',
                            price: 149,
                            quantity: 200,
                            sold_quantity: 75,
                            currency: 'USD',
                            created_at: '2024-01-01T00:00:00Z',
                            benefits: 'Standard access',
                            description: 'Regular pricing for general admission',
                            is_active: true,
                            max_per_order: 10,
                            min_per_order: 1,
                            sale_end_date: '2024-12-15T08:00:00Z',
                            sale_start_date: '2024-02-01T00:00:00Z'
                        }
                    ]
                }
            ];
            setMyEvents(mockEvents);
            setLoading(false);
            return;
        }

        const { data, error: dbError } = await supabase
            .from('events')
            .select('*, ticket_types(*)')
            .eq('organizer_id', user.data.id);

        if (dbError) {
            console.error("Error fetching organizer events:", JSON.stringify(dbError, null, 2));
            setError(`Could not load your events. [${dbError.message}]`);
        } else {
            setMyEvents(data as EventWithTickets[] || []);
        }
        setLoading(false);
    }
    
    fetchOrganizerEvents();

  }, [user]);

  const handleStatusChange = async (eventId: number, newStatus: EventStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [eventId]: true }));

    try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            // Mock update for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update local state
            setMyEvents(prev => prev.map(event => 
                event.id === eventId 
                    ? { ...event, status: newStatus }
                    : event
            ));

            const statusText = newStatus === EventStatus.PUBLIC ? 'published publicly' : 'saved as draft';
            const eventName = myEvents.find(e => e.id === eventId)?.event_name || 'Event';
            alert(`${eventName} ${statusText} successfully! (Demo Mode)`);
            return;
        }

        const { error } = await supabase
            .from('events')
            .update({ status: newStatus })
            .eq('id', eventId)
            .eq('organizer_id', user?.data.id);

        if (error) throw error;

        // Update local state
        setMyEvents(prev => prev.map(event => 
            event.id === eventId 
                ? { ...event, status: newStatus }
                : event
        ));

        const statusText = newStatus === EventStatus.PUBLIC ? 'published publicly' : 'saved as draft';
        const eventName = myEvents.find(e => e.id === eventId)?.event_name || 'Event';
        alert(`${eventName} ${statusText} successfully!`);

    } catch (error: any) {
        console.error('Failed to update event status:', error);
        alert('Failed to update event status: ' + error.message);
    } finally {
        setUpdatingStatus(prev => ({ ...prev, [eventId]: false }));
    }
  };
  
  const totalRevenue = useMemo(() => {
      return myEvents.reduce((total, event) => {
          const eventRevenue = event.ticket_types.reduce((sum, tier) => sum + ((tier.sold_quantity || 0) * tier.price), 0);
          return total + eventRevenue;
      }, 0);
  }, [myEvents]);
  
  const totalTicketsSold = useMemo(() => {
      return myEvents.reduce((total, event) => {
          const eventTickets = event.ticket_types.reduce((sum, tier) => sum + (tier.sold_quantity || 0), 0);
          return total + eventTickets;
      }, 0);
  }, [myEvents]);

  const chartData = useMemo(() => {
      return myEvents.map(event => {
          const revenue = event.ticket_types.reduce((sum, tier) => sum + ((tier.sold_quantity || 0) * tier.price), 0);
          return { name: event.event_name.slice(0, 15) + '...', revenue };
      });
  }, [myEvents]);

  const StatusDropdown: React.FC<{ event: EventWithTickets }> = ({ event }) => {
    const isUpdating = updatingStatus[event.id];
    const currentStatus = event.status || EventStatus.DRAFT;

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as EventStatus;
        if (newStatus !== currentStatus) {
            handleStatusChange(event.id, newStatus);
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            <span className={`px-2 py-1 rounded text-xs font-medium text-center ${
                currentStatus === EventStatus.PUBLIC ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {currentStatus === EventStatus.PUBLIC ? 'Public' : 'Draft'}
            </span>
            
            <div className="relative">
                {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded z-10">
                        <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <select
                    value={currentStatus}
                    onChange={handleDropdownChange}
                    disabled={isUpdating}
                    className="w-full text-xs bg-white border border-border rounded px-2 py-1 text-text-primary focus:ring-primary focus:border-primary transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value={EventStatus.DRAFT}>Draft</option>
                    <option value={EventStatus.PUBLIC}>Public</option>
                </select>
            </div>
        </div>
    );
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-text-secondary">Loading your events...</p>
            </div>
        </div>
    );
  }

  if (error) {
      return (
        <div className="text-center py-10 px-6 bg-red-500/10 rounded-lg border border-red-500/20">
            <h3 className="text-lg font-medium text-red-600">Could not load your dashboard</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      );
  }

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Tickets Sold</h3>
                <p className="text-3xl font-bold text-primary mt-1">{totalTicketsSold.toLocaleString()}</p>
            </div>
             <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Active Events</h3>
                <p className="text-3xl font-bold text-primary mt-1">{myEvents.length}</p>
            </div>
        </div>
        
        {myEvents.length > 0 && (
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">Revenue by Event</h3>
                <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(160, 32, 240, 0.1)' }}
                                contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    color: '#111827'
                                }}
                                labelStyle={{ color: '#111827' }}
                            />
                            <Bar dataKey="revenue" fill="#A020F0" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-text-primary">My Events</h2>
                <Link to="/create-event" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-opacity-90 transition-colors">
                    Create New Event
                </Link>
            </div>

            {myEvents.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="h-16 w-16 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m6-8a2 2 0 11-4 0 2 2 0 014 0zM3 15a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-text-primary mb-2">No events yet</h3>
                        <p className="text-text-secondary mb-6">Start by creating your first event to manage attendees and track revenue.</p>
                        <Link to="/create-event" className="inline-flex items-center px-6 py-3 font-semibold text-white bg-primary rounded-md hover:bg-opacity-90 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Your First Event
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-surface/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Event</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tickets Sold</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Revenue</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {myEvents.map(event => {
                                    const ticketsSold = event.ticket_types.reduce((sum, tier) => sum + (tier.sold_quantity || 0), 0);
                                    const revenue = event.ticket_types.reduce((sum, tier) => sum + ((tier.sold_quantity || 0) * tier.price), 0);
                                    return (
                                        <tr key={event.id} className="hover:bg-surface/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-primary">{event.event_name}</div>
                                                <div className="text-xs text-text-secondary">{event.venue}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                <StatusDropdown event={event} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {new Date(event.event_start_datetime).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                <div className="font-medium">{ticketsSold}</div>
                                                <div className="text-xs text-text-secondary">of {event.max_attendees} max</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                <div className="font-medium">${revenue.toLocaleString()}</div>
                                                <div className="text-xs text-text-secondary">{event.currency}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                <div className="flex space-x-2">
                                                    <Link 
                                                        to={`/edit-event/${event.id}`}
                                                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>
                                                    <Link 
                                                        to={`/event/${event.id}`}
                                                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default OrganizerDashboard;