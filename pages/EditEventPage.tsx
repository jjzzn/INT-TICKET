import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Role, Database, EventStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

type SpeakerFormData = Omit<Database['public']['Tables']['speakers']['Insert'], 'event_id'> & { id?: number };
type TierData = { id?: number; name: string; price: string; quantity: string };

const isValidUrl = (urlString: string) => {
    if (!urlString) return true;
    try { 
        new URL(urlString); 
        return true;
    }
    catch(e){ 
        return false;
    }
};

// Reuse form components
const InputField: React.FC<{ 
    label: string; 
    type: string; 
    name: string; 
    value: any; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    required?: boolean; 
    placeholder?: string; 
    className?: string; 
    error?: string 
}> = ({ label, type, name, value, onChange, required, placeholder, className, error }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input 
            type={type} 
            name={name} 
            id={name} 
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`w-full bg-surface border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition ${error ? 'border-red-500' : 'border-border'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const TextAreaField: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
    required?: boolean; 
    rows?: number; 
    placeholder?: string; 
    error?: string 
}> = ({ label, name, value, onChange, required, rows = 4, placeholder, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <textarea 
            name={name} 
            id={name} 
            value={value}
            onChange={onChange}
            required={required}
            rows={rows}
            placeholder={placeholder}
            className={`w-full bg-surface border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition ${error ? 'border-red-500' : 'border-border'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const SelectField: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
    children: React.ReactNode; 
    required?: boolean; 
    error?: string 
}> = ({ label, name, value, onChange, children, required, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select 
            name={name} 
            id={name} 
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full bg-surface border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition ${error ? 'border-red-500' : 'border-border'}`}
        >
            {children}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const EditEventPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'updating' | 'success'>('idle');
    
    const [formData, setFormData] = useState({
        event_name: '',
        event_start_datetime: '',
        event_end_datetime: '',
        venue: '',
        description: '',
        event_info: '',
        poster_url: '',
        contact_email: '',
        contact_phone: '',
        max_attendees: '',
        event_type: 'Conference',
        currency: 'USD',
        google_map_link: '',
        agenda_url: '',
        website_url: '',
        facebook_contact: '',
        instagram_contact: '',
        x_contact: '',
        tiktok_contact: '',
        youtube_contact: '',
        line_contact: '',
        status: EventStatus.DRAFT,
    });

    const [tiers, setTiers] = useState<TierData[]>([{ id: undefined, name: 'General Admission', price: '50', quantity: '100' }]);
    const [speakers, setSpeakers] = useState<SpeakerFormData[]>([{ 
        id: undefined, 
        name: '', 
        title: '', 
        company: '', 
        bio: '', 
        image_url: `https://picsum.photos/seed/speaker1/400/400`, 
        linkedin_url: '', 
        twitter_url: '' 
    }]);

    // Ticket and Speaker handlers
    const handleTierChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newTiers = [...tiers];
        newTiers[index] = { ...newTiers[index], [e.target.name]: e.target.value };
        setTiers(newTiers);
        if (errors.tiers?.[index]?.[e.target.name]) {
            const newTierErrors = [...(errors.tiers || [])];
            if (newTierErrors[index]) {
                newTierErrors[index][e.target.name] = undefined;
            }
            setErrors(prev => ({ ...prev, tiers: newTierErrors }));
        }
    };

    const addTier = () => setTiers([...tiers, { id: undefined, name: '', price: '', quantity: '' }]);
    
    const removeTier = (index: number) => {
        if (tiers.length > 1) {
            setTiers(tiers.filter((_, i) => i !== index));
        }
    };

    const handleSpeakerChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newSpeakers = [...speakers];
        const fieldName = e.target.name as keyof SpeakerFormData;
        (newSpeakers[index] as any)[fieldName] = e.target.value;
        setSpeakers(newSpeakers);
        if (errors.speakers?.[index]?.[fieldName]) {
            const newSpeakerErrors = [...(errors.speakers || [])];
            if (newSpeakerErrors[index]) {
                newSpeakerErrors[index][fieldName] = undefined;
            }
            setErrors(prev => ({ ...prev, speakers: newSpeakerErrors }));
        }
    };

    const addSpeaker = () => setSpeakers([...speakers, { 
        id: undefined, 
        name: '', 
        title: '', 
        company: '', 
        bio: '', 
        image_url: `https://picsum.photos/seed/speaker${speakers.length + 1}/400/400`, 
        linkedin_url: '', 
        twitter_url: '' 
    }]);
    
    const removeSpeaker = (index: number) => setSpeakers(speakers.filter((_, i) => i !== index));

    // Reset submission state function
    const resetSubmissionState = () => {
        setIsSubmitting(false);
        setSubmitStatus('idle');
    };

    // Load event data
    useEffect(() => {
        const loadEventData = async () => {
            if (!id || !user || user.role !== Role.ORGANIZER) {
                navigate('/dashboard');
                return;
            }

            setLoading(true);
            
            // Check if Supabase is configured
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                // Mock data for demo
                const mockEvent = {
                    id: 1,
                    event_name: 'Demo Tech Conference 2024',
                    description: 'A demo tech conference for testing purposes',
                    venue: 'Demo Convention Center',
                    event_start_datetime: '2024-12-15T09:00:00',
                    event_end_datetime: '2024-12-15T17:00:00',
                    poster_url: 'https://picsum.photos/800/600?random=demo1',
                    contact_email: 'demo@organizer.com',
                    contact_phone: '+1234567890',
                    max_attendees: 500,
                    event_type: 'Conference',
                    currency: 'USD',
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
                    status: EventStatus.DRAFT,
                };

                // Mock tickets and speakers
                const mockTiers = [
                    { id: 1, name: 'Early Bird', price: '99', quantity: '100' },
                    { id: 2, name: 'Regular', price: '149', quantity: '200' }
                ];
                
                const mockSpeakers = [
                    { 
                        id: 1, 
                        name: 'Dr. Jane Smith', 
                        title: 'AI Research Director', 
                        company: 'Tech Innovations Inc.', 
                        bio: 'Leading expert in artificial intelligence with 15+ years of experience', 
                        image_url: 'https://picsum.photos/seed/speaker1/400/400', 
                        linkedin_url: 'https://linkedin.com/in/janesmith', 
                        twitter_url: 'https://x.com/janesmith' 
                    }
                ];
                
                setFormData({
                    ...mockEvent,
                    max_attendees: mockEvent.max_attendees.toString(),
                });
                setTiers(mockTiers);
                setSpeakers(mockSpeakers);
                setLoading(false);
                return;
            }

            try {
                // Load event data with tickets and speakers
                const { data: eventData, error: eventError } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .eq('organizer_id', user.data.id)
                    .single();

                if (eventError) throw eventError;
                if (!eventData) throw new Error('Event not found');

                // Load tickets
                const { data: ticketsData, error: ticketsError } = await supabase
                    .from('ticket_types')
                    .select('*')
                    .eq('event_id', id);

                if (ticketsError) throw ticketsError;

                // Load speakers
                const { data: speakersData, error: speakersError } = await supabase
                    .from('speakers')
                    .select('*')
                    .eq('event_id', id);

                if (speakersError) throw speakersError;

                // Set form data
                setFormData({
                    event_name: eventData.event_name || '',
                    event_start_datetime: eventData.event_start_datetime ? new Date(eventData.event_start_datetime).toISOString().slice(0, 16) : '',
                    event_end_datetime: eventData.event_end_datetime ? new Date(eventData.event_end_datetime).toISOString().slice(0, 16) : '',
                    venue: eventData.venue || '',
                    description: eventData.description || '',
                    event_info: eventData.event_info || '',
                    poster_url: eventData.poster_url || '',
                    contact_email: eventData.contact_email || '',
                    contact_phone: eventData.contact_phone || '',
                    max_attendees: eventData.max_attendees?.toString() || '',
                    event_type: eventData.event_type || 'Conference',
                    currency: eventData.currency || 'USD',
                    google_map_link: eventData.google_map_link || '',
                    agenda_url: eventData.agenda_url || '',
                    website_url: eventData.website_url || '',
                    facebook_contact: eventData.facebook_contact || '',
                    instagram_contact: eventData.instagram_contact || '',
                    x_contact: eventData.x_contact || '',
                    tiktok_contact: eventData.tiktok_contact || '',
                    youtube_contact: eventData.youtube_contact || '',
                    line_contact: eventData.line_contact || '',
                    status: eventData.status || EventStatus.DRAFT,
                });

                // Set tickets data (if any, otherwise use default)
                if (ticketsData && ticketsData.length > 0) {
                    setTiers(ticketsData.map(ticket => ({
                        id: ticket.id,
                        name: ticket.name,
                        price: ticket.price.toString(),
                        quantity: ticket.quantity.toString()
                    })));
                }

                // Set speakers data (if any, otherwise use default empty speaker)
                if (speakersData && speakersData.length > 0) {
                    setSpeakers(speakersData.map(speaker => ({
                        id: speaker.id,
                        name: speaker.name || '',
                        title: speaker.title || '',
                        company: speaker.company || '',
                        bio: speaker.bio || '',
                        image_url: speaker.image_url || '',
                        linkedin_url: speaker.linkedin_url || '',
                        twitter_url: speaker.twitter_url || ''
                    })));
                } else {
                    setSpeakers([{ 
                        id: undefined, 
                        name: '', 
                        title: '', 
                        company: '', 
                        bio: '', 
                        image_url: `https://picsum.photos/seed/speaker1/400/400`, 
                        linkedin_url: '', 
                        twitter_url: '' 
                    }]);
                }
            } catch (error: any) {
                console.error('Error loading event:', error);
                alert('Failed to load event data: ' + error.message);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadEventData();
    }, [id, user, navigate]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, any> = {};
        
        // Basic required fields
        if (!formData.event_name.trim()) newErrors.event_name = "Event name is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.event_start_datetime) newErrors.event_start_datetime = "Start date and time are required.";
        if (!formData.event_end_datetime) newErrors.event_end_datetime = "End date and time are required.";
        
        // Date validation
        if (formData.event_start_datetime && formData.event_end_datetime && new Date(formData.event_start_datetime) >= new Date(formData.event_end_datetime)) {
            newErrors.event_end_datetime = "End date must be after the start date.";
        }
        
        if (!formData.venue.trim()) newErrors.venue = "Venue is required.";
        
        // Max attendees validation
        if (!/^\d+$/.test(formData.max_attendees) || parseInt(formData.max_attendees, 10) <= 0) {
            newErrors.max_attendees = "Max attendees must be a positive number.";
        }
        
        // Contact information validation
        if (!formData.contact_email.trim()) newErrors.contact_email = "Contact email is required.";
        if (!formData.contact_phone.trim()) newErrors.contact_phone = "Contact phone is required.";
        
        // URL validations - only validate if not empty
        if (formData.poster_url.trim() && !isValidUrl(formData.poster_url)) newErrors.poster_url = "Please enter a valid URL for the poster.";
        if (formData.website_url.trim() && !isValidUrl(formData.website_url)) newErrors.website_url = "Please enter a valid website URL.";
        if (formData.agenda_url.trim() && !isValidUrl(formData.agenda_url)) newErrors.agenda_url = "Please enter a valid agenda URL.";
        if (formData.google_map_link.trim() && !isValidUrl(formData.google_map_link)) newErrors.google_map_link = "Please enter a valid Google Maps URL.";
        
        // Social media URL validations - only validate if not empty
        if (formData.facebook_contact.trim() && !isValidUrl(formData.facebook_contact)) newErrors.facebook_contact = "Please enter a valid Facebook URL.";
        if (formData.instagram_contact.trim() && !isValidUrl(formData.instagram_contact)) newErrors.instagram_contact = "Please enter a valid Instagram URL.";
        if (formData.x_contact.trim() && !isValidUrl(formData.x_contact)) newErrors.x_contact = "Please enter a valid X/Twitter URL.";
        if (formData.tiktok_contact.trim() && !isValidUrl(formData.tiktok_contact)) newErrors.tiktok_contact = "Please enter a valid TikTok URL.";
        if (formData.youtube_contact.trim() && !isValidUrl(formData.youtube_contact)) newErrors.youtube_contact = "Please enter a valid YouTube URL.";

        // Tickets validation
        const newTierErrors: any[] = [];
        let hasValidTier = false;
        let hasTicketErrors = false;
        
        tiers.forEach((tier, index) => {
            const tierErrors: Record<string, string> = {};
            if (tier.name.trim()) { // Only validate if tier has a name
                hasValidTier = true;
                if (!/^\d+(\.\d{1,2})?$/.test(tier.price) || parseFloat(tier.price) < 0) {
                    tierErrors.price = "Price must be a valid number.";
                    hasTicketErrors = true;
                }
                if (!/^\d+$/.test(tier.quantity) || parseInt(tier.quantity, 10) <= 0) {
                    tierErrors.quantity = "Quantity must be a positive whole number.";
                    hasTicketErrors = true;
                }
            }
            newTierErrors[index] = tierErrors;
        });
        
        if (!hasValidTier) {
            newErrors.tickets = "At least one ticket type is required.";
        } else if (hasTicketErrors) {
            newErrors.tiers = newTierErrors;
        }

        // Speakers validation - more lenient
        const newSpeakerErrors: any[] = [];
        let hasSpeakerErrors = false;
        
        speakers.forEach((speaker, index) => {
            if (speaker.name?.trim()) { // Only validate if speaker has a name
                const speakerErrors: Record<string, string> = {};
                if (speaker.image_url?.trim() && !isValidUrl(speaker.image_url)) {
                    speakerErrors.image_url = "Please enter a valid image URL.";
                    hasSpeakerErrors = true;
                }
                if (speaker.linkedin_url?.trim() && !isValidUrl(speaker.linkedin_url)) {
                    speakerErrors.linkedin_url = "Please enter a valid LinkedIn URL.";
                    hasSpeakerErrors = true;
                }
                if (speaker.twitter_url?.trim() && !isValidUrl(speaker.twitter_url)) {
                    speakerErrors.twitter_url = "Please enter a valid X/Twitter URL.";
                    hasSpeakerErrors = true;
                }
                newSpeakerErrors[index] = speakerErrors;
            }
        });
        
        if (hasSpeakerErrors) {
            newErrors.speakers = newSpeakerErrors;
        }
        
        // Debug logging
        console.log('Validation errors found:', newErrors);
        console.log('Error count:', Object.keys(newErrors).length);
        
        setErrors(newErrors);
        
        // Clean check for validation
        const hasErrors = Object.keys(newErrors).length > 0;
        console.log('Form is valid:', !hasErrors);
        
        return !hasErrors;
    };

    const handleSubmit = async (eventStatus: EventStatus) => {
        // Log to debug
        console.log('handleSubmit called with status:', eventStatus);
        console.log('Current isSubmitting state:', isSubmitting);
        
        // Prevent submission if already submitting or validation fails
        if (isSubmitting) {
            console.log('Already submitting, returning early');
            return;
        }
        
        // Validate form first
        console.log('Validating form...');
        const isValid = validateForm();
        if (!isValid) {
            console.log('Form validation failed:', errors);
            return;
        }

        console.log('Form is valid, starting submission process');
        setIsSubmitting(true);
        setSubmitStatus('updating');

        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                // Mock update for demo
                console.log('Running in demo mode');
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSubmitStatus('success');
                const statusText = eventStatus === EventStatus.PUBLIC ? 'published publicly' : 'saved as draft';
                const validTiers = tiers.filter(t => t.name.trim()).length;
                const validSpeakers = speakers.filter(s => s.name?.trim()).length;
                alert(`Event "${formData.event_name}" updated and ${statusText} successfully! (Demo Mode - includes ${validTiers} ticket types and ${validSpeakers} speakers)`);
                setTimeout(() => navigate('/dashboard'), 1000);
                return;
            }

            // Update event data
            const eventPayload = {
                event_name: formData.event_name,
                event_start_datetime: formData.event_start_datetime,
                event_end_datetime: formData.event_end_datetime,
                venue: formData.venue,
                description: formData.description,
                contact_email: formData.contact_email,
                contact_phone: formData.contact_phone,
                max_attendees: parseInt(formData.max_attendees, 10),
                event_type: formData.event_type,
                currency: formData.currency,
                status: eventStatus,
                ...(formData.event_info && { event_info: formData.event_info }),
                ...(formData.poster_url && { poster_url: formData.poster_url }),
                ...(formData.google_map_link && { google_map_link: formData.google_map_link }),
                ...(formData.agenda_url && { agenda_url: formData.agenda_url }),
                ...(formData.website_url && { website_url: formData.website_url }),
                ...(formData.facebook_contact && { facebook_contact: formData.facebook_contact }),
                ...(formData.instagram_contact && { instagram_contact: formData.instagram_contact }),
                ...(formData.x_contact && { x_contact: formData.x_contact }),
                ...(formData.tiktok_contact && { tiktok_contact: formData.tiktok_contact }),
                ...(formData.youtube_contact && { youtube_contact: formData.youtube_contact }),
                ...(formData.line_contact && { line_contact: formData.line_contact })
            };

            const { error: eventError } = await supabase
                .from('events')
                .update(eventPayload)
                .eq('id', id)
                .eq('organizer_id', user?.data.id);

            if (eventError) throw eventError;

            // Handle tickets
            const validTiers = tiers.filter(tier => tier.name.trim());
            
            // Delete existing tickets
            const { error: deleteTicketsError } = await supabase
                .from('ticket_types')
                .delete()
                .eq('event_id', id);

            if (deleteTicketsError) throw deleteTicketsError;

            // Insert new tickets
            if (validTiers.length > 0) {
                const ticketInserts = validTiers.map(tier => ({
                    event_id: parseInt(id!),
                    name: tier.name,
                    price: parseFloat(tier.price) || 0,
                    quantity: parseInt(tier.quantity, 10) || 0,
                    currency: formData.currency,
                }));

                const { error: ticketsError } = await supabase
                    .from('ticket_types')
                    .insert(ticketInserts);

                if (ticketsError) throw ticketsError;
            }

            // Handle speakers
            const validSpeakers = speakers.filter(speaker => speaker.name?.trim());
            
            // Delete existing speakers
            const { error: deleteSpeakersError } = await supabase
                .from('speakers')
                .delete()
                .eq('event_id', id);

            if (deleteSpeakersError) throw deleteSpeakersError;

            // Insert new speakers
            if (validSpeakers.length > 0) {
                const speakerInserts = validSpeakers.map(speaker => ({
                    event_id: parseInt(id!),
                    name: speaker.name,
                    title: speaker.title || null,
                    company: speaker.company || null,
                    bio: speaker.bio || null,
                    image_url: speaker.image_url || null,
                    linkedin_url: speaker.linkedin_url || null,
                    twitter_url: speaker.twitter_url || null,
                }));

                const { error: speakersError } = await supabase
                    .from('speakers')
                    .insert(speakerInserts);

                if (speakersError) throw speakersError;
            }

            setSubmitStatus('success');
            const statusText = eventStatus === EventStatus.PUBLIC ? 'published publicly' : 'saved as draft';
            alert(`Event "${formData.event_name}" updated and ${statusText} successfully!`);
            setTimeout(() => navigate('/dashboard'), 1000);
            
        } catch (error: any) {
            console.error('Failed to update event:', error);
            alert('Failed to update event: ' + error.message);
            setSubmitStatus('idle');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-text-secondary">Loading event data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg border border-border">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Edit Event</h1>
                <p className="text-text-secondary mt-1">Update your event details</p>
                
                {/* Current Status Display */}
                <div className="mt-3 inline-flex items-center">
                    <span className="text-sm text-text-secondary mr-2">Current Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        formData.status === EventStatus.PUBLIC 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {formData.status === EventStatus.PUBLIC ? 'Public' : 'Draft'}
                    </span>
                </div>
                
                {/* Debug info - remove in production */}
                <div className="mt-2 text-xs text-gray-500">
                    Debug: isSubmitting={isSubmitting.toString()}, submitStatus={submitStatus}
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Event Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Event Name" 
                        type="text" 
                        name="event_name" 
                        value={formData.event_name} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.event_name}
                        placeholder="e.g., Global AI Summit 2025" 
                    />
                    <SelectField 
                        label="Event Type" 
                        name="event_type" 
                        value={formData.event_type} 
                        onChange={handleFormChange} 
                        required
                    >
                        <option>Conference</option>
                        <option>Concert</option>
                        <option>Workshop</option>
                        <option>Festival</option>
                        <option>Webinar</option>
                        <option>Other</option>
                    </SelectField>
                </div>

                <TextAreaField 
                    label="Description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleFormChange} 
                    required 
                    error={errors.description}
                    placeholder="Tell attendees what your event is about."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Start Date & Time" 
                        type="datetime-local" 
                        name="event_start_datetime" 
                        value={formData.event_start_datetime} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.event_start_datetime} 
                    />
                    <InputField 
                        label="End Date & Time" 
                        type="datetime-local" 
                        name="event_end_datetime" 
                        value={formData.event_end_datetime} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.event_end_datetime} 
                    />
                </div>

                <InputField 
                    label="Venue / Location" 
                    type="text" 
                    name="venue" 
                    value={formData.venue} 
                    onChange={handleFormChange} 
                    required 
                    error={errors.venue}
                    placeholder="e.g., Metropolis Convention Center or Online"
                />

                <InputField 
                    label="Google Maps Link (Optional)" 
                    type="url" 
                    name="google_map_link" 
                    value={formData.google_map_link} 
                    onChange={handleFormChange}
                    placeholder="https://maps.app.goo.gl/..."
                    error={errors.google_map_link}
                />

                <TextAreaField 
                    label="Additional Info (Optional)" 
                    name="event_info" 
                    value={formData.event_info} 
                    onChange={handleFormChange}
                    placeholder="Any extra information for attendees."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Max Attendees" 
                        type="number" 
                        name="max_attendees" 
                        value={formData.max_attendees} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.max_attendees} 
                    />
                    <SelectField 
                        label="Currency" 
                        name="currency" 
                        value={formData.currency} 
                        onChange={handleFormChange} 
                        required
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="THB">THB</option>
                    </SelectField>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label="Contact Email" 
                            type="email" 
                            name="contact_email" 
                            value={formData.contact_email} 
                            onChange={handleFormChange} 
                            required 
                            error={errors.contact_email}
                            placeholder="contact@example.com"
                        />
                        <InputField 
                            label="Contact Phone" 
                            type="tel" 
                            name="contact_phone" 
                            value={formData.contact_phone} 
                            onChange={handleFormChange} 
                            required 
                            error={errors.contact_phone}
                            placeholder="+1234567890"
                        />
                    </div>
                </div>

                {/* Media & Links Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Media & Links</h3>
                    <InputField 
                        label="Poster URL" 
                        type="url" 
                        name="poster_url" 
                        value={formData.poster_url} 
                        onChange={handleFormChange}
                        placeholder="https://example.com/poster.jpg"
                        error={errors.poster_url}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label="Website URL (Optional)" 
                            type="url" 
                            name="website_url" 
                            value={formData.website_url} 
                            onChange={handleFormChange}
                            placeholder="https://my-event.com"
                            error={errors.website_url}
                        />
                        <InputField 
                            label="Agenda URL (Optional)" 
                            type="url" 
                            name="agenda_url" 
                            value={formData.agenda_url} 
                            onChange={handleFormChange}
                            placeholder="https://my-event.com/agenda"
                            error={errors.agenda_url}
                        />
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Social Media (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label="Facebook" 
                            type="url" 
                            name="facebook_contact" 
                            value={formData.facebook_contact} 
                            onChange={handleFormChange}
                            placeholder="https://facebook.com/..."
                            error={errors.facebook_contact}
                        />
                        <InputField 
                            label="Instagram" 
                            type="url" 
                            name="instagram_contact" 
                            value={formData.instagram_contact} 
                            onChange={handleFormChange}
                            placeholder="https://instagram.com/..."
                            error={errors.instagram_contact}
                        />
                        <InputField 
                            label="X (Twitter)" 
                            type="url" 
                            name="x_contact" 
                            value={formData.x_contact} 
                            onChange={handleFormChange}
                            placeholder="https://x.com/..."
                            error={errors.x_contact}
                        />
                        <InputField 
                            label="TikTok" 
                            type="url" 
                            name="tiktok_contact" 
                            value={formData.tiktok_contact} 
                            onChange={handleFormChange}
                            placeholder="https://tiktok.com/..."
                            error={errors.tiktok_contact}
                        />
                        <InputField 
                            label="YouTube" 
                            type="url" 
                            name="youtube_contact" 
                            value={formData.youtube_contact} 
                            onChange={handleFormChange}
                            placeholder="https://youtube.com/..."
                            error={errors.youtube_contact}
                        />
                        <InputField 
                            label="Line" 
                            type="text" 
                            name="line_contact" 
                            value={formData.line_contact} 
                            onChange={handleFormChange}
                            placeholder="Line ID or URL"
                        />
                    </div>
                </div>

                {/* Tickets Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Ticket Types</h3>
                    {errors.tickets && <p className="text-red-500 text-sm">{errors.tickets}</p>}
                    <div className="space-y-4">
                        {tiers.map((tier, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 border border-border rounded-md bg-surface">
                                <InputField 
                                    label="Tier Name" 
                                    type="text" 
                                    name="name" 
                                    value={tier.name} 
                                    onChange={(e) => handleTierChange(index, e)} 
                                    placeholder="e.g., Early Bird" 
                                    className="flex-grow w-full" 
                                    error={errors.tiers?.[index]?.name} 
                                />
                                <InputField 
                                    label={`Price (${formData.currency})`} 
                                    type="text" 
                                    name="price" 
                                    value={tier.price} 
                                    onChange={(e) => handleTierChange(index, e)} 
                                    placeholder="e.g., 299" 
                                    className="md:w-32" 
                                    error={errors.tiers?.[index]?.price} 
                                />
                                <InputField 
                                    label="Quantity" 
                                    type="text" 
                                    name="quantity" 
                                    value={tier.quantity} 
                                    onChange={(e) => handleTierChange(index, e)} 
                                    placeholder="e.g., 200" 
                                    className="md:w-32" 
                                    error={errors.tiers?.[index]?.quantity} 
                                />
                                {tiers.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeTier(index)} 
                                        className="w-full md:w-auto px-3 py-2 text-sm text-red-500 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button 
                        type="button" 
                        onClick={addTier} 
                        className="mt-4 px-4 py-2 text-sm text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary/20 transition-colors"
                    >
                        + Add Ticket Tier
                    </button>
                </div>

                {/* Speakers Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Speakers (Optional)</h3>
                    <div className="space-y-6">
                        {speakers.map((speaker, index) => (
                            <div key={index} className="p-4 border border-border rounded-md bg-surface relative space-y-4">
                                {speakers.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeSpeaker(index)} 
                                        className="absolute top-2 right-2 p-1 text-red-500 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField 
                                        label="Full Name" 
                                        type="text" 
                                        name="name" 
                                        value={speaker.name || ''} 
                                        onChange={(e) => handleSpeakerChange(index, e)} 
                                        placeholder="e.g., Jane Doe" 
                                        error={errors.speakers?.[index]?.name} 
                                    />
                                    <InputField 
                                        label="Title" 
                                        type="text" 
                                        name="title" 
                                        value={speaker.title || ''} 
                                        onChange={(e) => handleSpeakerChange(index, e)} 
                                        placeholder="e.g., CEO" 
                                    />
                                </div>
                                <InputField 
                                    label="Company (Optional)" 
                                    type="text" 
                                    name="company" 
                                    value={speaker.company || ''} 
                                    onChange={(e) => handleSpeakerChange(index, e)} 
                                    placeholder="e.g., Tech Innovations Inc." 
                                />
                                <TextAreaField 
                                    label="Bio (Optional)" 
                                    name="bio" 
                                    value={speaker.bio || ''} 
                                    onChange={(e) => handleSpeakerChange(index, e)} 
                                    rows={3} 
                                    placeholder="A short bio about the speaker." 
                                />
                                <InputField 
                                    label="Image URL (Optional)" 
                                    type="url" 
                                    name="image_url" 
                                    value={speaker.image_url || ''} 
                                    onChange={(e) => handleSpeakerChange(index, e)} 
                                    placeholder="https://example.com/speaker.jpg" 
                                    error={errors.speakers?.[index]?.image_url} 
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField 
                                        label="LinkedIn URL (Optional)" 
                                        type="url" 
                                        name="linkedin_url" 
                                        value={speaker.linkedin_url || ''} 
                                        onChange={(e) => handleSpeakerChange(index, e)} 
                                        error={errors.speakers?.[index]?.linkedin_url} 
                                    />
                                    <InputField 
                                        label="X/Twitter URL (Optional)" 
                                        type="url" 
                                        name="twitter_url" 
                                        value={speaker.twitter_url || ''} 
                                        onChange={(e) => handleSpeakerChange(index, e)} 
                                        error={errors.speakers?.[index]?.twitter_url} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        type="button" 
                        onClick={addSpeaker} 
                        className="mt-4 px-4 py-2 text-sm text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary/20 transition-colors"
                    >
                        + Add Speaker
                    </button>
                </div>

                {/* Status Change Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Update Publication Status</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Save as Draft:</strong> Keep your event hidden from public. You can edit and publish it later.</p>
                        <p><strong>Publish Event:</strong> Make your event visible to the public and allow attendees to register.</p>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-border">
                    <button 
                        type="button" 
                        onClick={() => navigate('/dashboard')} 
                        className="px-6 py-2 font-semibold text-text-primary bg-surface border border-border rounded-md hover:bg-border transition-colors"
                    >
                        Cancel
                    </button>
                    
                    <div className="flex gap-3">
                        {/* Debug reset button - can be removed in production */}
                        {(isSubmitting || submitStatus !== 'idle') && (
                            <button 
                                type="button" 
                                onClick={resetSubmissionState} 
                                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                            >
                                Reset
                            </button>
                        )}
                        
                        {/* Save as Draft Button */}
                        <button 
                            type="button" 
                            onClick={(e) => {
                                console.log('Save as Draft clicked');
                                e.preventDefault();
                                handleSubmit(EventStatus.DRAFT);
                            }}
                            disabled={isSubmitting} 
                            className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting && submitStatus === 'updating' ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save as Draft'}
                        </button>

                        {/* Publish Event Button */}
                        <button 
                            type="button" 
                            onClick={(e) => {
                                console.log('Publish Event clicked');
                                e.preventDefault();
                                handleSubmit(EventStatus.PUBLIC);
                            }}
                            disabled={isSubmitting} 
                            className="px-6 py-3 font-semibold text-white bg-primary rounded-md hover:bg-opacity-90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting && submitStatus === 'updating' ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Publishing...
                                </span>
                            ) : 'Publish Event'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEventPage;