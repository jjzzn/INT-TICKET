
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Event, Role, TicketType } from '../types';
import { supabase } from '../lib/supabaseClient';

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const BuyTicketPage: React.FC = () => {
    const { id: eventId, tierId } = useParams<{ id: string, tierId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [tier, setTier] = useState<TicketType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [loadingError, setLoadingError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!eventId || !tierId) {
                setLoading(false);
                setLoadingError('Event or Tier ID is missing.');
                return;
            }
            setLoading(true);
            setLoadingError('');
            
            try {
                // FIX: Argument of type 'string' is not assignable to parameter of type 'number'.
                const eventReq = supabase.from('events').select('*').eq('id', parseInt(eventId, 10)).single();
                // FIX: Argument of type 'string' is not assignable to parameter of type 'number'.
                const tierReq = supabase.from('ticket_types').select('*').eq('id', parseInt(tierId, 10)).single();

                const [{ data: eventData, error: eventError }, { data: tierData, error: tierError }] = await Promise.all([eventReq, tierReq]);

                if (eventError) throw eventError;
                if (tierError) throw tierError;

                setEvent(eventData);
                setTier(tierData);

            } catch (err: any) {
                console.error("Error fetching purchase details:", JSON.stringify(err, null, 2));
                const friendlyMessage = `Could not load checkout details. [${err.message}]`;
                setLoadingError(friendlyMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [eventId, tierId]);

    const handlePurchase = async () => {
        if (!user || user.current_role !== Role.CLIENT || !eventId || !tierId || !tier) {
            setPurchaseError('An unexpected error occurred. Please log in as a client and try again.');
            return;
        }
        setIsPurchasing(true);
        setPurchaseError('');
        try {
            // In a real app, this should be a single transaction or an RPC call in Supabase.
            // For simplicity here, we'll do it in two steps.

            // 1. Create the ticket
            const ticketNumber = `TICKET-${Date.now()}`;
            const { error: ticketInsertError } = await supabase.from('tickets').insert({
                customer_id: user.data.id,
                event_id: parseInt(eventId, 10),
                ticket_type_id: parseInt(tierId, 10),
                price: tier.price,
                currency: tier.currency,
                ticket_number: ticketNumber,
                qr_code: `QR-${ticketNumber}`, // Placeholder
                qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketNumber}` // Placeholder
            });

            if (ticketInsertError) throw ticketInsertError;

            // 2. Increment the sold quantity
            const newSoldCount = (tier.sold_quantity || 0) + 1;
            const { error: tierUpdateError } = await supabase
                .from('ticket_types')
                .update({ sold_quantity: newSoldCount })
                // FIX: Argument of type 'string' is not assignable to parameter of type 'number'.
                .eq('id', parseInt(tierId, 10));

            if (tierUpdateError) throw tierUpdateError;

            navigate('/dashboard');
        } catch (err: any) {
            setPurchaseError(err.message || 'Failed to purchase ticket.');
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) return <div className="text-center p-10">Loading checkout...</div>;
    if (loadingError) return <div className="text-center p-10 text-red-500">{loadingError}</div>;
    if (!event || !tier) return <div className="text-center p-10 text-red-500">Event or ticket details not found.</div>;
    if (user?.current_role !== Role.CLIENT) return <div className="text-center p-10 text-red-500">Only clients can purchase tickets.</div>;


    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Complete Your Purchase</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 bg-card p-8 rounded-lg border border-border space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">Buyer Information</h2>
                        <div className="bg-surface p-4 rounded-md border border-border">
                            <p className="text-text-primary">{user.data.first_name} {user.data.last_name}</p>
                            <p className="text-sm text-text-secondary">{user.data.email}</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">Payment Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Card Number</label>
                                <input type="text" placeholder="•••• •••• •••• 4242" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Expiration Date</label>
                                    <input type="text" placeholder="MM / YY" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">CVC</label>
                                    <input type="text" placeholder="123" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-lg shadow-lg border border-border sticky top-24">
                        <h3 className="text-lg font-bold mb-4 text-text-primary border-b border-border pb-3">Order Summary</h3>
                        <div className="flex items-center gap-4">
                            <img src={event.poster_url} alt={event.event_name} className="w-24 h-16 object-cover rounded-md" />
                            <div>
                                <h4 className="font-semibold text-text-primary">{event.event_name}</h4>
                                <div className="flex items-center text-xs text-text-secondary mt-1">
                                    <CalendarIcon />
                                    <span>{new Date(event.event_start_datetime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-xs text-text-secondary mt-1">
                                    <LocationIcon />
                                    <span>{event.venue}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                             <div className="flex justify-between">
                                <span className="text-text-secondary">{tier.name} (x1)</span>
                                <span className="text-text-primary font-medium">${tier.price.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-text-secondary">Fees</span>
                                <span className="text-text-primary font-medium">$0.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                                <span className="text-text-primary">Total</span>
                                <span className="text-primary">${tier.price.toFixed(2)}</span>
                            </div>
                        </div>
                        {purchaseError && <p className="text-red-500 text-sm mt-4 text-center">{purchaseError}</p>}
                        <button 
                            onClick={handlePurchase} 
                            disabled={isPurchasing}
                            className="w-full mt-4 px-6 py-3 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                        >
                            {isPurchasing ? 'Purchasing...' : 'Confirm Purchase'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyTicketPage;
