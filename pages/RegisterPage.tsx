import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '../types';

const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.CLIENT);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            // FIX: The 'register' function expects role and data as separate arguments.
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ');
            await register(role, {
                firstName,
                lastName,
                email,
                password,
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
                <h1 className="text-2xl font-bold text-center text-text-primary mb-6">Create an Account</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">I am a...</label>
                        <div className="flex gap-4">
                            <label className="flex-1">
                                <input type="radio" name="role" value={Role.CLIENT} checked={role === Role.CLIENT} onChange={() => setRole(Role.CLIENT)} className="sr-only peer" />
                                <div className="p-3 text-center border rounded-md cursor-pointer peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white border-border text-text-secondary hover:border-primary/50 transition">
                                    Client
                                </div>
                            </label>
                            <label className="flex-1">
                                <input type="radio" name="role" value={Role.ORGANIZER} checked={role === Role.ORGANIZER} onChange={() => setRole(Role.ORGANIZER)} className="sr-only peer" />
                                <div className="p-3 text-center border rounded-md cursor-pointer peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white border-border text-text-secondary hover:border-primary/50 transition">
                                    Organizer
                                </div>
                            </label>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
                 <p className="text-center text-sm text-text-secondary mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;