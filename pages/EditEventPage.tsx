import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Role, Database } from '../types';
import { supabase } from '../lib/supabaseClient';

type SpeakerFormData = Omit<Database['public']['Tables']['speakers']['Insert'], 'event_id'>;

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

// Reuse form components from CreateEventPage
const InputField: React.FC<{ label: string; type: string; name: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; placeholder?: string, className?: string; error?: string }> = 
({ label, type, name, value, onChange, required, placeholder, className, error }) => (
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

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; required?: boolean; rows?: number, placeholder?: string; error?: string }> = 
({ label, name, value, onChange, required, rows = 4, placeholder, error }) => (
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

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; required?: boolean, error?: string }> = 
({ label, name, value, onChange, children, required, error }) => (
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
    });

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
                };
                
                setFormData({
                    ...mockEvent,
                    max_attendees: mockEvent.max_attendees.toString(),
                });
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .eq('organizer_id', user.data.id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Event not found');

                setFormData({
                    event_name: data.event_name || '',
                    event_start_datetime: data.event_start_datetime ? new Date(data.event_start_datetime).toISOString().slice(0, 16) : '',
                    event_end_datetime: data.event_end_datetime ? new Date(data.event_end_datetime).toISOString().slice(0, 16) : '',
                    venue: data.venue || '',
                    description: data.description || '',
                    event_info: data.event_info || '',
                    poster_url: data.poster_url || '',
                    contact_email: data.contact_email || '',
                    contact_phone: data.contact_phone || '',
                    max_attendees: data.max_attendees?.toString() || '',
                    event_type: data.event_type || 'Conference',
                    currency: data.currency || 'USD',
                    google_map_link: data.google_map_link || '',
                    agenda_url: data.agenda_url || '',
                    website_url: data.website_url || '',
                    facebook_contact: data.facebook_contact || '',
                    instagram_contact: data.instagram_contact || '',
                    x_contact: data.x_contact || '',
                    tiktok_contact: data.tiktok_contact || '',
                    youtube_contact: data.youtube_contact || '',
                    line_contact: data.line_contact || '',
                });
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
        const newErrors: Record<string, string> = {};
        if (!formData.event_name.trim()) newErrors.event_name = "Event name is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.event_start_datetime) newErrors.event_start_datetime = "Start date and time are required.";
        if (!formData.event_end_datetime) newErrors.event_end_datetime = "End date and time are required.";
        if (formData.event_start_datetime && formData.event_end_datetime && new Date(formData.event_start_datetime) >= new Date(formData.event_end_datetime)) {
            newErrors.event_end_datetime = "End date must be after the start date.";
        }
        if (!formData.venue.trim()) newErrors.venue = "Venue is required.";
        if (!/^\d+$/.test(formData.max_attendees) || parseInt(formData.max_attendees, 10) <= 0) {
            newErrors.max_attendees = "Max attendees must be a positive number.";
        }
        if (!formData.contact_email.trim()) newErrors.contact_email = "Contact email is required.";
        if (!formData.contact_phone.trim()) newErrors.contact_phone = "Contact phone is required.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || !validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('updating');

        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                // Mock update for demo
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSubmitStatus('success');
                alert(`Event "${formData.event_name}" updated successfully! (Demo Mode)`);
                setTimeout(() => navigate('/dashboard'), 1000);
                return;
            }

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
                ...(formData.line_contact && { line_contact: formData.line_contact }),
            };

            const { error } = await supabase
                .from('events')
                .update(eventPayload)
                .eq('id', id)
                .eq('organizer_id', user?.data.id);

            if (error) throw error;

            setSubmitStatus('success');
            alert(`Event "${formData.event_name}" updated successfully!`);
            setTimeout(() => navigate('/dashboard'), 1000);
            
        } catch (error: any) {
            console.error('Failed to update event:', error);
            alert('Failed to update event: ' + error.message);
        } finally {
            setIsSubmitting(false);
            if (submitStatus !== 'success') {
                setSubmitStatus('idle');
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg border border-border">
                <p className="text-center">Loading event data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg border border-border">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Edit Event</h1>
                <p className="text-text-secondary mt-1">Update your event details</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Event Name" 
                        type="text" 
                        name="event_name" 
                        value={formData.event_name} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.event_name} 
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
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Contact Email" 
                        type="email" 
                        name="contact_email" 
                        value={formData.contact_email} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.contact_email} 
                    />
                    <InputField 
                        label="Contact Phone" 
                        type="tel" 
                        name="contact_phone" 
                        value={formData.contact_phone} 
                        onChange={handleFormChange} 
                        required 
                        error={errors.contact_phone} 
                    />
                </div>

                <InputField 
                    label="Max Attendees" 
                    type="number" 
                    name="max_attendees" 
                    value={formData.max_attendees} 
                    onChange={handleFormChange} 
                    required 
                    error={errors.max_attendees} 
                />

                <InputField 
                    label="Poster URL" 
                    type="url" 
                    name="poster_url" 
                    value={formData.poster_url} 
                    onChange={handleFormChange} 
                />

                <TextAreaField 
                    label="Additional Info" 
                    name="event_info" 
                    value={formData.event_info} 
                    onChange={handleFormChange} 
                />

                <div className="flex justify-between pt-6 border-t border-border">
                    <button 
                        type="button" 
                        onClick={() => navigate('/dashboard')} 
                        className="px-6 py-2 font-semibold text-text-primary bg-surface border border-border rounded-md hover:bg-border transition-colors"
                    >
                        Cancel
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="px-8 py-3 font-semibold text-white bg-primary rounded-md hover:bg-opacity-90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {submitStatus === 'updating' && 'Updating Event...'}
                                {submitStatus === 'success' && 'Success!'}
                            </span>
                        ) : 'Update Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditEventPage;
