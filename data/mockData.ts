

import { Event, PurchasedTicket, User, EventWithTickets } from '../types';
import { USERS } from '../constants';
import { MOCK_API_DELAY } from '../constants';

// fix: Update mock data to align with Supabase types. Using EventWithTickets for mockEvents.
export let mockEvents: EventWithTickets[] = [
  {
    id: 1,
    event_name: 'Global AI Summit 2024',
    organizer_id: 1,
    organizer_name: 'TechConferences Inc.',
    event_start_datetime: '2024-10-26T09:00:00Z',
    event_end_datetime: '2024-10-26T17:00:00Z',
    venue: 'Metropolis Convention Center',
    description: 'Join the world\'s leading minds in Artificial Intelligence to discuss the latest trends, breakthroughs, and ethical considerations. A must-attend for professionals, researchers, and enthusiasts.',
    poster_url: 'https://picsum.photos/seed/ai/1200/600',
    contact_email: 'contact@techconf.inc',
    contact_phone: '123-456-7890',
    currency: 'USD',
    max_attendees: 800,
    event_type: 'Conference',
    agenda_url: '',
    // FIX: Added missing created_at property to satisfy EventWithTickets type
    created_at: '2024-05-01T10:00:00Z',
    current_attendees: 430,
    event_info: '',
    facebook_contact: '',
    google_map_link: '',
    instagram_contact: '',
    is_active: true,
    line_contact: '',
    tiktok_contact: '',
    website_url: '',
    x_contact: '',
    youtube_contact: '',
    ticket_types: [
      { id: 11, event_id: 1, name: 'Early Bird General', price: 299, quantity: 200, sold_quantity: 150, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
      { id: 12, event_id: 1, name: 'General Admission', price: 499, quantity: 500, sold_quantity: 250, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
      { id: 13, event_id: 1, name: 'VIP Access', price: 899, quantity: 100, sold_quantity: 30, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
    ],
  },
  {
    id: 2,
    event_name: 'Frontend Masters Live',
    organizer_id: 1,
    organizer_name: 'DevWorld',
    event_start_datetime: '2024-11-15T10:00:00Z',
    event_end_datetime: '2024-11-15T16:00:00Z',
    venue: 'Online / Virtual',
    description: 'An immersive one-day virtual conference dedicated to the art and science of frontend development. Featuring workshops, live coding sessions, and talks from industry pioneers.',
    poster_url: 'https://picsum.photos/seed/frontend/1200/600',
    contact_email: 'contact@devworld.com',
    contact_phone: '123-456-7890',
    currency: 'USD',
    max_attendees: 1500,
    event_type: 'Conference',
    agenda_url: '',
    // FIX: Added missing created_at property to satisfy EventWithTickets type
    created_at: '2024-05-15T10:00:00Z',
    current_attendees: 1150,
    event_info: '',
    facebook_contact: '',
    google_map_link: '',
    instagram_contact: '',
    is_active: true,
    line_contact: '',
    tiktok_contact: '',
    website_url: '',
    x_contact: '',
    youtube_contact: '',
    ticket_types: [
      { id: 21, event_id: 2, name: 'Virtual Pass', price: 99, quantity: 1000, sold_quantity: 850, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
      { id: 22, event_id: 2, name: 'All-Access Pass (with recordings)', price: 149, quantity: 500, sold_quantity: 300, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
    ],
  },
  {
    id: 3,
    event_name: 'UX/UI Design & Innovation',
    organizer_id: 2,
    organizer_name: 'Creative Minds',
    event_start_datetime: '2024-12-05T09:30:00Z',
    event_end_datetime: '2024-12-05T18:00:00Z',
    venue: 'The Design Institute, New York',
    description: 'Explore the future of digital experiences. This conference brings together designers, product managers, and innovators to share insights on creating user-centric and beautiful products.',
    poster_url: 'https://picsum.photos/seed/design/1200/600',
    contact_email: 'contact@creativeminds.com',
    contact_phone: '123-456-7890',
    currency: 'USD',
    max_attendees: 500,
    event_type: 'Conference',
    agenda_url: '',
    // FIX: Added missing created_at property to satisfy EventWithTickets type
    created_at: '2024-06-01T10:00:00Z',
    current_attendees: 305,
    event_info: '',
    facebook_contact: '',
    google_map_link: '',
    instagram_contact: '',
    is_active: true,
    line_contact: '',
    tiktok_contact: '',
    website_url: '',
    x_contact: '',
    youtube_contact: '',
    ticket_types: [
      { id: 31, event_id: 3, name: 'Student Pass', price: 150, quantity: 100, sold_quantity: 95, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
      { id: 32, event_id: 3, name: 'Professional Pass', price: 350, quantity: 400, sold_quantity: 210, benefits: null, created_at: null, currency: 'USD', description: null, is_active: true, max_per_order: null, min_per_order: null, sale_end_date: null, sale_start_date: null },
    ],
  },
];

export let mockPurchasedTickets: PurchasedTicket[] = [];

export const mockUsers: User[] = Object.values(USERS);

export const addMockEvent = (newEventData: Omit<Event, 'id'>): Promise<Event> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent: Event = {
        id: Date.now(),
        ...newEventData,
      };
      // This is not EventWithTickets, so it will not have ticket_types.
      // Casting to any to avoid further type errors in this unused function.
      mockEvents.unshift(newEvent as any);
      resolve(newEvent);
    }, MOCK_API_DELAY);
  });
};

export const addPurchasedTicket = (ticketData: { customerId: number; eventId: number; ticketTypeId: number; }): Promise<PurchasedTicket> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.id === ticketData.eventId);
      if (!event) {
        return reject(new Error('Event not found'));
      }
      const tier = event.ticket_types.find(t => t.id === ticketData.ticketTypeId);
      if (!tier) {
        return reject(new Error('Ticket tier not found'));
      }
      if ((tier.sold_quantity || 0) >= tier.quantity) {
        return reject(new Error('Ticket is sold out'));
      }

      // Increment sold count
      tier.sold_quantity = (tier.sold_quantity || 0) + 1;

      const ticketNumber = `pt-${Date.now()}`;
      const newTicket: PurchasedTicket = {
        id: Date.now(),
        customer_id: ticketData.customerId,
        event_id: ticketData.eventId,
        ticket_type_id: ticketData.ticketTypeId,
        created_at: new Date().toISOString(),
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=INT-TICKET-${Date.now()}`,
        events: event,
        ticket_types: tier,
        checked_in_at: null,
        currency: tier.currency,
        price: tier.price,
        qr_code: `QR-${ticketNumber}`,
        status: 'active',
        ticket_number: ticketNumber,
      };

      mockPurchasedTickets.push(newTicket);
      resolve(newTicket);
    }, MOCK_API_DELAY);
  });
};