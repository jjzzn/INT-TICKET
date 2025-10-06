
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ForOrganizersPage: React.FC = () => {
    const { user, openAuthModal } = useAuth();
    const navigate = useNavigate();

    const handleCTAClick = () => {
        if (user) {
            if (user.current_role === Role.ORGANIZER) {
                navigate('/create-event');
            } else {
                alert('You are currently logged in as a client. Please log out and register as an organizer to create events.');
            }
        } else {
            openAuthModal('register', Role.ORGANIZER);
        }
    };

    const features = [
        'Effortless event setup and management',
        'Customizable ticket tiers and pricing',
        'Real-time sales analytics dashboard',
        'Secure payment processing',
        'Direct communication with attendees',
        'Powerful promotional tools'
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <section className="text-center py-16 px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary">
                    Host Your Best Event Yet
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
                    INT TICKET provides all the tools you need to create, manage, and grow your events. From small workshops to large-scale conferences, we've got you covered.
                </p>
                <button
                    onClick={handleCTAClick}
                    className="mt-8 px-10 py-4 text-lg font-semibold text-white bg-primary rounded-lg shadow-lg hover:bg-primary-dark transition-transform transform hover:scale-105"
                >
                    Create Your Event
                </button>
            </section>

            <section className="py-16">
                <h2 className="text-3xl font-bold text-center text-text-primary mb-12">Why Choose INT TICKET?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <CheckIcon />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">{feature}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ForOrganizersPage;
