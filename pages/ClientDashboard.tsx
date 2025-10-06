
import React, { useState, useEffect } from 'react';
import { PurchasedTicket, Role } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const TicketCard: React.FC<{ ticket: PurchasedTicket }> = ({ ticket }) => {
    if (!ticket.events) return null;
    
    const eventDate = new Date(ticket.events.event_start_datetime);
    const isPast = eventDate < new Date();

    return (
        <div className={`bg-card rounded-lg shadow-md border border-border overflow-hidden flex flex-col md:flex-row items-center transition-opacity ${isPast ? 'opacity-50' : ''}`}>
            <img src={ticket.events.poster_url} alt={ticket.events.event_name} className="w-full md:w-1/3 h-48 md:h-full object-cover"/>
            <div className="p-5 flex-grow">
                {isPast && <span className="text-xs font-bold uppercase text-yellow-400">Past Event</span>}
                <h3 className="text-xl font-bold text-text-primary">{ticket.events.event_name}</h3>
                {/* <p className="text-sm text-text-secondary mt-1">{ticket.events.organizerName}</p> */}
                <div className="mt-4 text-sm text-text-secondary space-y-1">
                    <p><strong>Date:</strong> {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Location:</strong> {ticket.events.venue}</p>
                    <p><strong>Ticket Type:</strong> {ticket.ticket_types?.name}</p>
                </div>
            </div>
            <div className="p-5 border-t md:border-t-0 md:border-l border-border flex flex-col items-center justify-center bg-surface">
                <img src={ticket.qr_code_url || ''} alt="Ticket QR Code" className="w-24 h-24 rounded-md" />
                <p className="text-xs text-text-secondary mt-2">Scan at entry</p>
            </div>
        </div>
    )
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
        if (!user || user.current_role !== Role.CLIENT) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        const { data, error: dbError } = await supabase
            .from('tickets')
            .select(`
                *,
                events(*),
                ticket_types(*)
            `)
            .eq('customer_id', user.data.id);
        
        if (dbError) {
            console.error("Error fetching tickets:", JSON.stringify(dbError, null, 2));
            setError(`Could not load your tickets. [${dbError.message}]`);
        } else {
            // Cast to any because Supabase generated types for relations are complex
            setTickets(data as any[] || []);
        }
        setLoading(false);
    }
    
    fetchTickets();
  }, [user]);
  
  const renderContent = () => {
    if (loading) {
      return <p>Loading your tickets...</p>;
    }
    if (error) {
      return (
        <div className="text-center py-10 px-6 bg-red-500/10 rounded-lg border border-red-500/20">
            <h3 className="text-lg font-medium text-red-600">Could not load your tickets</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      );
    }
    if (tickets.length > 0) {
      return (
        <div className="space-y-6">
          {tickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
        </div>
      );
    }
    return (
      <div className="text-center py-10 px-6 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-medium text-text-primary">No tickets yet!</h3>
          <p className="mt-1 text-sm text-text-secondary">
              You haven't purchased any tickets. Browse events to find your next experience.
          </p>
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-text-primary">My Tickets</h2>
      {renderContent()}
    </div>
  );
};

export default ClientDashboard;
