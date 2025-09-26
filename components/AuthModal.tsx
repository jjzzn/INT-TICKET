import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
    </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
)

const LoginTab = () => {
    const { login, setAuthModalTab, setAuthModalRole } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error: loginError } = await login(email, password);
            if (loginError) {
                setError(loginError.message || 'Login failed.');
            }
            // The modal will be closed by the useEffect in the parent component upon successful login
        } catch (err: any) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    }
    
    const handleCreateOrganizerAccount = () => {
        setAuthModalTab('register');
        setAuthModalRole(Role.ORGANIZER);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-text-secondary" htmlFor="email">Email <span className="text-red-500">*</span></label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
            </div>
            <div>
                <label className="text-sm font-medium text-text-secondary" htmlFor="password">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary">
                        {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition disabled:bg-primary/50">
                {loading ? 'Logging in...' : 'Sign In To Your Account'}
            </button>
            <div className="text-center text-sm text-text-secondary">Are you have any account?</div>
            <button type="button" onClick={handleCreateOrganizerAccount} className="w-full bg-surface border border-border font-bold py-3 rounded-md hover:bg-border transition">
                Create Account
            </button>
        </form>
    )
}

const RegisterTab = () => {
    const { register, authModalRole, setAuthModalRole, closeAuthModal, setAuthModalTab } = useAuth();
    const [formData, setFormData] = useState<any>({ country_code: '+66' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            const { error: regError, needsConfirmation } = await register(authModalRole, { ...formData, email: formData.email, password });
            if (regError) {
                setError(regError.message || 'Registration failed.');
            } else if (needsConfirmation) {
                closeAuthModal();
                alert('Registration successful! Please check your email to confirm your account.');
            }
            // If registration is successful with auto-confirmation, the parent component's
            // useEffect will detect the user change and close the modal.
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    }
    
    const requiredOrganizerFields = [
        'organizer_name', 'email', 'phone', 'business_type', 'company_name', 
        'tax_id', 'billing_address', 'contact_person', 'invoice_email'
    ];
    
    const filledOrganizerFields = requiredOrganizerFields.filter(field => !!formData[field]).length;
    const completedOrganizerFields = filledOrganizerFields + (password ? 1 : 0) + (confirmPassword ? 1 : 0);
    const totalOrganizerFields = requiredOrganizerFields.length + 2;

    const renderClientForm = () => (
        <>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                    <label className="text-sm font-medium text-text-secondary" htmlFor="prefix">Title <span className="text-red-500">*</span></label>
                    <select name="prefix" id="prefix" onChange={handleChange} required className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition">
                        <option value="">Ti-</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                    </select>
                </div>
                <div className="col-span-4">
                    <label className="text-sm font-medium text-text-secondary" htmlFor="first_name">First Name <span className="text-red-500">*</span></label>
                    <input name="first_name" id="first_name" onChange={handleChange} required placeholder="Enter first name" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                </div>
                <div className="col-span-5">
                    <label className="text-sm font-medium text-text-secondary" htmlFor="last_name">Last Name <span className="text-red-500">*</span></label>
                    <input name="last_name" id="last_name" onChange={handleChange} required placeholder="Enter last name" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-text-secondary" htmlFor="reg-email-client">Email <span className="text-red-500">*</span></label>
                <input id="reg-email-client" name="email" type="email" onChange={handleChange} required placeholder="Enter your email" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
            </div>

            <div>
                <label className="text-sm font-medium text-text-secondary">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex mt-1">
                    <select name="country_code" onChange={handleChange} defaultValue="+66" required className="bg-surface border border-r-0 border-border rounded-l-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition">
                        <option value="+66">🇹🇭 TH (+66)</option>
                        <option value="+1">🇺🇸 US (+1)</option>
                        <option value="+44">🇬🇧 UK (+44)</option>
                        <option value="+65">🇸🇬 SG (+65)</option>
                        <option value="+60">🇲🇾 MY (+60)</option>
                        <option value="+62">🇮🇩 ID (+62)</option>
                        <option value="+63">🇵🇭 PH (+63)</option>
                        <option value="+84">🇻🇳 VN (+84)</option>
                        <option value="+86">🇨🇳 CN (+86)</option>
                        <option value="+81">🇯🇵 JP (+81)</option>
                        <option value="+82">🇰🇷 KR (+82)</option>
                        <option value="+91">🇮🇳 IN (+91)</option>
                        <option value="+61">🇦🇺 AU (+61)</option>
                        <option value="+49">🇩🇪 DE (+49)</option>
                        <option value="+33">🇫🇷 FR (+33)</option>
                    </select>
                    <input name="phone" type="tel" onChange={handleChange} required placeholder="Enter phone number" className="w-full bg-surface border border-border rounded-r-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-text-secondary" htmlFor="gender">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" id="gender" onChange={handleChange} required className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary" htmlFor="birthday">Birthday <span className="text-red-500">*</span></label>
                    <input name="birthday" id="birthday" type="date" onChange={handleChange} required className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-text-secondary" htmlFor="id_number">ID Card / Passport Number <span className="text-red-500">*</span></label>
                <input name="id_number" id="id_number" onChange={handleChange} required placeholder="Enter ID card or passport number" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition" />
            </div>
        </>
    )
    
    const renderOrganizerForm = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-text-secondary">Organizer Name <span className="text-red-500">*</span></label>
                    <input name="organizer_name" onChange={handleChange} required placeholder="Enter organizer name" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Email <span className="text-red-500">*</span></label>
                    <input name="email" type="email" onChange={handleChange} required placeholder="Enter email address" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex mt-1">
                        <select name="country_code" onChange={handleChange} defaultValue="+66" required className="bg-surface border border-r-0 border-border rounded-l-md px-3 py-2 text-text-primary">
                            <option value="+66">🇹🇭 TH (+66)</option>
                            <option value="+1">🇺🇸 US (+1)</option>
                            <option value="+44">🇬🇧 UK (+44)</option>
                            <option value="+65">🇸🇬 SG (+65)</option>
                            <option value="+60">🇲🇾 MY (+60)</option>
                            <option value="+62">🇮🇩 ID (+62)</option>
                            <option value="+63">🇵🇭 PH (+63)</option>
                            <option value="+84">🇻🇳 VN (+84)</option>
                            <option value="+86">🇨🇳 CN (+86)</option>
                            <option value="+81">🇯🇵 JP (+81)</option>
                            <option value="+82">🇰🇷 KR (+82)</option>
                            <option value="+91">🇮🇳 IN (+91)</option>
                            <option value="+61">🇦🇺 AU (+61)</option>
                            <option value="+49">🇩🇪 DE (+49)</option>
                            <option value="+33">🇫🇷 FR (+33)</option>
                        </select>
                        <input name="phone" type="tel" onChange={handleChange} required placeholder="Enter phone number" className="w-full bg-surface border border-border rounded-r-md px-3 py-2 text-text-primary" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Business Type <span className="text-red-500">*</span></label>
                        <select name="business_type" onChange={handleChange} required className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary">
                            <option value="">Select Business Type</option>
                            <option value="Company">Company</option>
                            <option value="Individual">Individual</option>
                            <option value="Non-profit">Non-profit</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Google Maps Link (Optional)</label>
                        <input name="maps_link" onChange={handleChange} placeholder="https://maps.google.com/..." className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                    </div>
                </div>
            </div>
            
            <h3 className="text-lg font-semibold text-text-primary pt-4 border-t border-border">Invoice Details</h3>
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Company Name <span className="text-red-500">*</span></label>
                        <input name="company_name" onChange={handleChange} required placeholder="Enter company name" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Tax ID <span className="text-red-500">*</span></label>
                        <input name="tax_id" onChange={handleChange} required placeholder="Enter tax ID" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium text-text-secondary">Billing Address <span className="text-red-500">*</span></label>
                    <textarea name="billing_address" onChange={handleChange} required placeholder="Enter billing address" rows={3} className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Contact Person <span className="text-red-500">*</span></label>
                        <input name="contact_person" onChange={handleChange} required placeholder="Enter contact person name" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Invoice Email <span className="text-red-500">*</span></label>
                        <input name="invoice_email" type="email" onChange={handleChange} required placeholder="Enter invoice email" className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Additional Notes (Optional)</label>
                    <textarea name="additional_notes" onChange={handleChange} placeholder="Enter any additional notes" rows={3} className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary"></textarea>
                </div>
             </div>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Account Type <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                    <label className="flex-1">
                        <input type="radio" name="role" value={Role.CLIENT} checked={authModalRole === Role.CLIENT} onChange={() => setAuthModalRole(Role.CLIENT)} className="sr-only peer" />
                        <div className="p-3 text-center border rounded-md cursor-pointer peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white border-border text-text-secondary hover:border-primary/50 transition">
                            Client
                        </div>
                    </label>
                    <label className="flex-1">
                        <input type="radio" name="role" value={Role.ORGANIZER} checked={authModalRole === Role.ORGANIZER} onChange={() => setAuthModalRole(Role.ORGANIZER)} className="sr-only peer" />
                        <div className="p-3 text-center border rounded-md cursor-pointer peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white border-border text-text-secondary hover:border-primary/50 transition">
                            Organizer
                        </div>
                    </label>
                </div>
            </div>
        
            {authModalRole === Role.CLIENT ? renderClientForm() : renderOrganizerForm()}
            
            <h3 className="text-lg font-semibold text-text-primary pt-4 border-t border-border">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-text-secondary" htmlFor="reg-password">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary">
                            {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                        </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Must contain at least 8 characters</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary" htmlFor="reg-confirm-password">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input id="reg-confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary" />
                         <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary">
                            {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                        </button>
                    </div>
                </div>
            </div>
            
            {authModalRole === Role.ORGANIZER && (
                <div className="bg-yellow-100/50 border border-yellow-200/50 text-yellow-800 text-sm p-3 rounded-md flex items-center gap-2">
                    <span>⚠️</span>
                    Please fill in all required fields ({completedOrganizerFields}/{totalOrganizerFields} completed) to proceed with registration.
                </div>
            )}

            {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
            
            <div className="pt-2 space-y-2">
                 <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-bold py-3 rounded-md hover:bg-blue-600 transition disabled:bg-blue-300">
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="text-sm text-center text-text-secondary">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setAuthModalTab('login')} className="font-semibold text-blue-600 hover:underline">
                        Sign In to Your Account
                    </button>
                </p>
            </div>
        </form>
    );
};

const AuthModal = () => {
    const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, user } = useAuth();

    useEffect(() => {
        // If the modal is open and the user becomes authenticated, close the modal.
        // This handles cases where login or registration is successful, preventing a stuck UI.
        if (isAuthModalOpen && user) {
            closeAuthModal();
        }
    }, [user, isAuthModalOpen, closeAuthModal]);

    if (!isAuthModalOpen) return null;

    const isLogin = authModalTab === 'login';
    const isRegister = authModalTab === 'register';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={closeAuthModal}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 sm:p-8 relative">
                    <button onClick={closeAuthModal} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                    {isRegister ? (
                        <div>
                             <h2 className="text-2xl font-bold text-text-primary mb-6">
                                Create an Account
                            </h2>
                            <RegisterTab />
                        </div>
                    ) : (
                         <div>
                            <h2 className="text-2xl font-bold text-text-primary mb-6">
                                Sign In
                            </h2>
                            <LoginTab />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;