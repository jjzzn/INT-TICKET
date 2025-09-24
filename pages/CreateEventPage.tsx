import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Role, Database } from '../types';
import { supabase } from '../lib/supabaseClient';

type SpeakerFormData = Omit<Database['public']['Tables']['speakers']['Insert'], 'event_id'>;

const isValidUrl = (urlString: string) => {
    if (!urlString) return true; // Optional fields are valid if empty
    try { 
        new URL(urlString); 
        return true;
    }
    catch(e){ 
        return false;
    }
};


// --- Reusable Form Field Components ---
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

// --- Step Indicator Component ---
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Details', 'Media', 'Tickets', 'Speakers', 'Review'];
    return (
        <div className="flex items-center justify-between mb-10">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300 ${currentStep > index + 1 ? 'bg-primary border-primary text-white' : currentStep === index + 1 ? 'border-primary text-primary' : 'border-border text-text-secondary'}`}>
                            {currentStep > index + 1 ? '✓' : index + 1}
                        </div>
                        <p className={`mt-2 text-xs font-semibold w-20 transition-colors duration-300 ${currentStep >= index + 1 ? 'text-primary' : 'text-text-secondary'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${currentStep > index + 1 ? 'bg-primary' : 'bg-border'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Main Create Event Page Component ---
const CreateEventPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'creating_event' | 'creating_tickets' | 'creating_speakers' | 'success'>('idle');
    
    const [formData, setFormData] = useState({
        event_name: '',
        event_start_datetime: '',
        event_end_datetime: '',
        venue: '',
        description: '',
        event_info: '',
        poster_url: `https://picsum.photos/seed/${Date.now()}/1200/600`,
        contact_email: user?.role === Role.ORGANIZER ? user.data.email : '',
        contact_phone: user?.role === Role.ORGANIZER ? user.data.phone : '',
        max_attendees: '1000',
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
    
    const [tiers, setTiers] = useState([{ name: 'General Admission', price: '50', quantity: '100' }]);
    const [speakers, setSpeakers] = useState<SpeakerFormData[]>([{ name: '', title: '', company: '', bio: '', image_url: `https://picsum.photos/seed/speaker1/400/400`, linkedin_url: '', twitter_url: '' }]);

    // Reset state on component mount to prevent stuck loading states
    useEffect(() => {
        setIsSubmitting(false);
        setSubmitStatus('idle');
        console.log('CreateEventPage mounted - state reset to idle');
    }, []);

    // Reset function to clean up state
    const resetSubmissionState = () => {
        setIsSubmitting(false);
        setSubmitStatus('idle');
        console.log('Submission state reset to idle');
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
        }
    };

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
    const addTier = () => setTiers([...tiers, { name: '', price: '', quantity: '' }]);
    const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));

    const handleSpeakerChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newSpeakers = [...speakers];
        const fieldName = e.target.name as keyof SpeakerFormData;
        // FIX: Use type assertion to handle dynamic property assignment.
        // The compiler cannot guarantee that e.g. a string value from an input
        // is assignable to all possible property types of SpeakerFormData (like 'order' which is a number).
        // Since we know only string-compatible fields are being updated here, this is safe.
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
    const addSpeaker = () => setSpeakers([...speakers, { name: '', title: '', company: '', bio: '', image_url: `https://picsum.photos/seed/speaker${speakers.length + 1}/400/400`, linkedin_url: '', twitter_url: '' }]);
    const removeSpeaker = (index: number) => setSpeakers(speakers.filter((_, i) => i !== index));

    const validateStep1 = () => {
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.contact_email.trim()) newErrors.contact_email = "Contact email is required.";
        if (!formData.contact_phone.trim()) newErrors.contact_phone = "Contact phone is required.";
        if (!isValidUrl(formData.poster_url)) newErrors.poster_url = "Please enter a valid URL for the poster.";
        if (!isValidUrl(formData.website_url)) newErrors.website_url = "Please enter a valid website URL.";
        if (!isValidUrl(formData.agenda_url)) newErrors.agenda_url = "Please enter a valid agenda URL.";
        if (!isValidUrl(formData.facebook_contact)) newErrors.facebook_contact = "Please enter a valid Facebook URL.";
        if (!isValidUrl(formData.instagram_contact)) newErrors.instagram_contact = "Please enter a valid Instagram URL.";
        if (!isValidUrl(formData.x_contact)) newErrors.x_contact = "Please enter a valid X/Twitter URL.";
        if (!isValidUrl(formData.tiktok_contact)) newErrors.tiktok_contact = "Please enter a valid TikTok URL.";
        if (!isValidUrl(formData.youtube_contact)) newErrors.youtube_contact = "Please enter a valid YouTube URL.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newTierErrors: any[] = [];
        let isValid = true;
        tiers.forEach((tier, index) => {
            const tierErrors: Record<string, string> = {};
            if (!tier.name.trim()) {
                tierErrors.name = "Tier name is required.";
                isValid = false;
            }
            if (!/^\d+(\.\d{1,2})?$/.test(tier.price) || parseFloat(tier.price) < 0) {
                tierErrors.price = "Price must be a valid number.";
                isValid = false;
            }
            if (!/^\d+$/.test(tier.quantity) || parseInt(tier.quantity, 10) <= 0) {
                tierErrors.quantity = "Quantity must be a positive whole number.";
                isValid = false;
            }
            newTierErrors[index] = tierErrors;
        });
        setErrors({ tiers: newTierErrors });
        return isValid;
    };

    const validateStep4 = () => {
        const newSpeakerErrors: any[] = [];
        let isValid = true;
        speakers.forEach((speaker, index) => {
            if (Object.values(speaker).some(val => val && String(val).trim() !== '')) { // Only validate if any field is filled
                const speakerErrors: Record<string, string> = {};
                if (!speaker.name.trim()) {
                    speakerErrors.name = "Speaker name is required.";
                    isValid = false;
                }
                if (!isValidUrl(speaker.image_url || '')) speakerErrors.image_url = "Please enter a valid image URL.";
                if (!isValidUrl(speaker.linkedin_url || '')) speakerErrors.linkedin_url = "Please enter a valid LinkedIn URL.";
                if (!isValidUrl(speaker.twitter_url || '')) speakerErrors.twitter_url = "Please enter a valid X/Twitter URL.";
                newSpeakerErrors[index] = speakerErrors;
            }
        });
        setErrors({ speakers: newSpeakerErrors });
        return isValid;
    };

    const nextStep = () => {
        let isValid = false;
        if (step === 1) isValid = validateStep1();
        else if (step === 2) isValid = validateStep2();
        else if (step === 3) isValid = validateStep3();
        else if (step === 4) isValid = validateStep4();
        else isValid = true;

        if (isValid) {
            setStep(prev => Math.min(prev + 1, 5));
        }
    };
    const prevStep = () => {
        setErrors({});
        resetSubmissionState(); // Reset submission state when navigating
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }
        
        // Validate all steps before submission
        const step1Valid = validateStep1();
        const step2Valid = validateStep2();
        const step3Valid = validateStep3();
        const step4Valid = validateStep4();
        
        if (!step1Valid || !step2Valid || !step3Valid || !step4Valid) {
            alert("Please fix the errors on all steps before submitting.");
            // Navigate to first invalid step
            if (!step1Valid) setStep(1);
            else if (!step2Valid) setStep(2);
            else if (!step3Valid) setStep(3);
            else if (!step4Valid) setStep(4);
            return;
        }

        if (!user || user.role !== Role.ORGANIZER) {
            alert('You must be logged in as an organizer to create an event.');
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus('creating_event');
        
        try {
            // Check if Supabase is properly configured
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                // Mock event creation when Supabase is not configured
                console.warn('Supabase not configured, simulating event creation');
                setSubmitStatus('creating_tickets');
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSubmitStatus('creating_speakers');
                await new Promise(resolve => setTimeout(resolve, 500));
                setSubmitStatus('success');
                
                // Show success message
                alert(`Event "${formData.event_name}" created successfully! (Demo Mode - Supabase not configured)\n\nTo enable real database functionality, please configure your Supabase credentials in .env.local file.`);
                
                // Navigate to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
                return;
            }

            // Create properly typed event payload according to DB schema
            const eventPayload: Database['public']['Tables']['events']['Insert'] = {
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
                organizer_id: user.data.id,
                // Optional fields - only include if not empty
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
                // Set default values for required fields that might be missing
                is_active: true,
                current_attendees: 0
            };

            const { data: eventData, error: eventError } = await supabase
              .from('events')
              .insert(eventPayload)
              .select()
              .single();

            if (eventError) throw eventError;
            if (!eventData) throw new Error("Event creation failed, no data returned.");
            
            setSubmitStatus('creating_tickets');

            const ticketTypesToInsert = tiers.map(tier => ({
                event_id: eventData.id,
                name: tier.name,
                price: parseFloat(tier.price) || 0,
                quantity: parseInt(tier.quantity, 10) || 0,
                currency: formData.currency,
            }));

            const speakersToInsert = speakers.filter(s => s.name.trim()).map(speaker => ({
                ...speaker,
                event_id: eventData.id,
            }));

            const promises = [];
            if (ticketTypesToInsert.length > 0) {
                promises.push(supabase.from('ticket_types').insert(ticketTypesToInsert));
            }
            if (speakersToInsert.length > 0) {
                // FIX: Cast to 'any' to resolve a TypeScript issue with spreading Omit<T, K> types.
                // The type `Omit<Insert, 'event_id'> & { event_id: number }` is not correctly
                // inferred as `Insert`, causing an error on the `event_id` property during creation.
                // The runtime object is valid for the insert operation.
                promises.push(supabase.from('speakers').insert(speakersToInsert as any));
            }
            // Execute ticket types and speakers insertion
            if (promises.length > 0) {
                setSubmitStatus('creating_speakers');
                const results = await Promise.all(promises);
                results.forEach((res, index) => { 
                    if (res.error) {
                        const context = index === 0 ? 'ticket types' : 'speakers';
                        throw new Error(`Failed to create ${context}: ${res.error.message}`);
                    }
                });
            }
            
            setSubmitStatus('success');
            
            // Show success message before navigation
            alert(`Event "${formData.event_name}" created successfully! Redirecting to dashboard...`);
            
            // Small delay to show success state
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error: any) {
            console.error("Failed to create event:", error);
            
            // Provide more specific error messages
            let errorMessage = 'An unexpected error occurred while creating the event.';
            
            if (error.code === '23505') {
                errorMessage = 'An event with this name already exists. Please choose a different name.';
            } else if (error.code === '23503') {
                errorMessage = 'Invalid organizer information. Please log out and log back in.';
            } else if (error.message?.includes('violates check constraint')) {
                errorMessage = 'Please check your input values. Some fields may have invalid data.';
            } else if (error.message?.includes('duplicate key')) {
                errorMessage = 'An event with similar details already exists.';
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            
            alert(errorMessage + ' Please try again.');
        } finally {
            setIsSubmitting(false);
            // Always reset to idle unless we're in success state and about to navigate
            if (submitStatus !== 'success') {
                setSubmitStatus('idle');
            }
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg border border-border">
            <StepIndicator currentStep={step} />
            <form onSubmit={handleSubmit} noValidate>
                
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-text-primary">Event Details</h2>
                        <InputField label="Event Name" type="text" name="event_name" value={formData.event_name} onChange={handleFormChange} required placeholder="e.g., Global AI Summit 2025" error={errors.event_name} />
                        <SelectField label="Event Type" name="event_type" value={formData.event_type} onChange={handleFormChange} required>
                            <option>Conference</option><option>Concert</option><option>Workshop</option><option>Festival</option><option>Webinar</option><option>Other</option>
                        </SelectField>
                        <TextAreaField label="Description" name="description" value={formData.description} onChange={handleFormChange} required placeholder="Tell attendees what your event is about." error={errors.description} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Start Date & Time" type="datetime-local" name="event_start_datetime" value={formData.event_start_datetime} onChange={handleFormChange} required error={errors.event_start_datetime} />
                            <InputField label="End Date & Time" type="datetime-local" name="event_end_datetime" value={formData.event_end_datetime} onChange={handleFormChange} required error={errors.event_end_datetime} />
                        </div>
                        <InputField label="Venue / Location" type="text" name="venue" value={formData.venue} onChange={handleFormChange} required placeholder="e.g., Metropolis Convention Center or Online" error={errors.venue} />
                        <InputField label="Google Maps Link (Optional)" type="url" name="google_map_link" value={formData.google_map_link} onChange={handleFormChange} placeholder="https://maps.app.goo.gl/..." error={errors.google_map_link} />
                        <TextAreaField label="Additional Info (Optional)" name="event_info" value={formData.event_info} onChange={handleFormChange} placeholder="Any extra information for attendees." />
                        <InputField label="Max Attendees" type="number" name="max_attendees" value={formData.max_attendees} onChange={handleFormChange} required error={errors.max_attendees} />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-text-primary">Media & Links</h2>
                        <InputField label="Contact Email" type="email" name="contact_email" value={formData.contact_email} onChange={handleFormChange} required placeholder="contact@example.com" error={errors.contact_email} />
                        <InputField label="Contact Phone" type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleFormChange} required placeholder="+1234567890" error={errors.contact_phone} />
                        <InputField label="Poster URL" type="url" name="poster_url" value={formData.poster_url} onChange={handleFormChange} placeholder="https://example.com/poster.jpg" error={errors.poster_url} />
                        <InputField label="Website URL (Optional)" type="url" name="website_url" value={formData.website_url} onChange={handleFormChange} placeholder="https://my-event.com" error={errors.website_url} />
                        <InputField label="Agenda URL (Optional)" type="url" name="agenda_url" value={formData.agenda_url} onChange={handleFormChange} placeholder="https://my-event.com/agenda" error={errors.agenda_url} />
                        <h3 className="text-lg font-semibold text-text-primary pt-4 border-t border-border">Social Media (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Facebook" type="url" name="facebook_contact" value={formData.facebook_contact} onChange={handleFormChange} placeholder="https://facebook.com/..." error={errors.facebook_contact} />
                            <InputField label="Instagram" type="url" name="instagram_contact" value={formData.instagram_contact} onChange={handleFormChange} placeholder="https://instagram.com/..." error={errors.instagram_contact} />
                            <InputField label="X (Twitter)" type="url" name="x_contact" value={formData.x_contact} onChange={handleFormChange} placeholder="https://x.com/..." error={errors.x_contact} />
                            <InputField label="TikTok" type="url" name="tiktok_contact" value={formData.tiktok_contact} onChange={handleFormChange} placeholder="https://tiktok.com/..." error={errors.tiktok_contact} />
                            <InputField label="YouTube" type="url" name="youtube_contact" value={formData.youtube_contact} onChange={handleFormChange} placeholder="https://youtube.com/..." error={errors.youtube_contact} />
                            <InputField label="Line" type="text" name="line_contact" value={formData.line_contact} onChange={handleFormChange} placeholder="Line ID or URL" />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-text-primary">Tickets</h2>
                        <SelectField label="Currency" name="currency" value={formData.currency} onChange={handleFormChange} required>
                            <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="THB">THB</option>
                        </SelectField>
                        <div className="space-y-4">
                            {tiers.map((tier, index) => (
                                <div key={index} className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 border border-border rounded-md bg-surface">
                                    <InputField label="Tier Name" type="text" name="name" value={tier.name} onChange={(e) => handleTierChange(index, e)} placeholder="e.g., Early Bird" className="flex-grow w-full" error={errors.tiers?.[index]?.name} />
                                    <InputField label={`Price (${formData.currency})`} type="text" name="price" value={tier.price} onChange={(e) => handleTierChange(index, e)} placeholder="e.g., 299" className="md:w-32" error={errors.tiers?.[index]?.price} />
                                    <InputField label="Quantity" type="text" name="quantity" value={tier.quantity} onChange={(e) => handleTierChange(index, e)} placeholder="e.g., 200" className="md:w-32" error={errors.tiers?.[index]?.quantity} />
                                    {tiers.length > 1 && (
                                        <button type="button" onClick={() => removeTier(index)} className="w-full md:w-auto px-3 py-2 text-sm text-red-500 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors">Remove</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addTier} className="mt-4 px-4 py-2 text-sm text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary/20 transition-colors">
                            + Add Tier
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-fade-in">
                         <h2 className="text-2xl font-bold text-text-primary">Speakers</h2>
                         <div className="space-y-6">
                            {speakers.map((speaker, index) => (
                                <div key={index} className="p-4 border border-border rounded-md bg-surface relative space-y-4">
                                    {speakers.length > 0 && (
                                         <button type="button" onClick={() => removeSpeaker(index)} className="absolute top-2 right-2 p-1 text-red-500 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                         </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Full Name" type="text" name="name" value={speaker.name || ''} onChange={(e) => handleSpeakerChange(index, e)} placeholder="e.g., Jane Doe" error={errors.speakers?.[index]?.name} />
                                        <InputField label="Title" type="text" name="title" value={speaker.title || ''} onChange={(e) => handleSpeakerChange(index, e)} placeholder="e.g., CEO" />
                                    </div>
                                    <InputField label="Company (Optional)" type="text" name="company" value={speaker.company || ''} onChange={(e) => handleSpeakerChange(index, e)} placeholder="e.g., Tech Innovations Inc." />
                                    <TextAreaField label="Bio (Optional)" name="bio" value={speaker.bio || ''} onChange={(e) => handleSpeakerChange(index, e)} rows={3} placeholder="A short bio about the speaker."/>
                                    <InputField label="Image URL (Optional)" type="url" name="image_url" value={speaker.image_url || ''} onChange={(e) => handleSpeakerChange(index, e)} placeholder="https://example.com/speaker.jpg" error={errors.speakers?.[index]?.image_url} />
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <InputField label="LinkedIn URL (Optional)" type="url" name="linkedin_url" value={speaker.linkedin_url || ''} onChange={(e) => handleSpeakerChange(index, e)} error={errors.speakers?.[index]?.linkedin_url} />
                                         <InputField label="X/Twitter URL (Optional)" type="url" name="twitter_url" value={speaker.twitter_url || ''} onChange={(e) => handleSpeakerChange(index, e)} error={errors.speakers?.[index]?.twitter_url} />
                                     </div>
                                </div>
                            ))}
                         </div>
                         <button type="button" onClick={addSpeaker} className="mt-4 px-4 py-2 text-sm text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary/20 transition-colors">
                            + Add Speaker
                        </button>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-text-primary">Review Your Event</h2>
                        <div className="space-y-4 text-sm bg-surface p-4 rounded-md border border-border">
                            <h3 className="font-bold text-base text-text-primary">Event Details</h3>
                            <p><strong className="text-text-secondary">Name:</strong> {formData.event_name}</p>
                            <p><strong className="text-text-secondary">Type:</strong> {formData.event_type}</p>
                            <p><strong className="text-text-secondary">Date:</strong> {new Date(formData.event_start_datetime).toLocaleString()} to {new Date(formData.event_end_datetime).toLocaleString()}</p>
                            <p><strong className="text-text-secondary">Venue:</strong> {formData.venue}</p>

                            <h3 className="font-bold text-base text-text-primary pt-2 border-t border-border/50">Tickets</h3>
                            <p><strong className="text-text-secondary">Currency:</strong> {formData.currency}</p>
                            <ul className="list-disc pl-5">
                                {tiers.map((t, i) => <li key={i}>{t.name}: {t.price} {formData.currency} ({t.quantity} available)</li>)}
                            </ul>

                            {speakers.filter(s => s.name.trim()).length > 0 && <>
                                <h3 className="font-bold text-base text-text-primary pt-2 border-t border-border/50">Speakers</h3>
                                <ul className="list-disc pl-5">
                                    {speakers.filter(s => s.name.trim()).map((s, i) => <li key={i}>{s.name} ({s.title})</li>)}
                                </ul>
                            </>}
                        </div>
                        <p className="text-xs text-text-secondary">By creating this event, you agree to our terms and conditions. Please review all details carefully before submitting.</p>
                    </div>
                )}
                
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="px-6 py-2 font-semibold text-text-primary bg-surface border border-border rounded-md hover:bg-border transition-colors">
                            Back
                        </button>
                    ) : <div></div>}
                    
                    {step < 5 ? (
                        <button type="button" onClick={nextStep} className="px-6 py-2 font-semibold text-white bg-primary rounded-md hover:bg-opacity-90 transition-colors">
                            Next
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            {/* Debug reset button - can be removed in production */}
                            {(isSubmitting || submitStatus !== 'idle') && (
                                <button type="button" onClick={resetSubmissionState} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                                    Reset
                                </button>
                            )}
                            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-semibold text-white bg-primary rounded-md hover:bg-opacity-90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {submitStatus === 'creating_event' && 'Creating Event...'}
                                        {submitStatus === 'creating_tickets' && 'Adding Tickets...'}
                                        {submitStatus === 'creating_speakers' && 'Adding Speakers...'}
                                        {submitStatus === 'success' && 'Success!'}
                                    </span>
                                ) : 'Confirm & Create Event'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateEventPage;