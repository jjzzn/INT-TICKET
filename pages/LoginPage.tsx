import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
                <h1 className="text-2xl font-bold text-center text-text-primary mb-6">Log in to INT TICKET</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
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

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                </form>
                 <p className="text-center text-sm text-text-secondary mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
