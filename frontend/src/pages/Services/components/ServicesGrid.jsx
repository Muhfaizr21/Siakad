import React from 'react';

const ServicesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        {/* Counseling Service (Featured) */}
        <div
            className="md:col-span-8 bg-surface-container-low rounded-xl p-8 relative overflow-hidden group hover:bg-surface-container transition-all duration-300">
            <div className="relative z-10">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6 text-on-primary">
                    <span className="material-symbols-outlined">psychology</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary mb-3">Student Counseling</h3>
                <p className="text-secondary mb-6 max-w-md">Confidential mental health support, workshops, and
                    one-on-one sessions with licensed professionals.</p>
                <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                    <span>Book a session</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
            <div
                className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl group-hover:scale-125 transition-transform">
            </div>
        </div>
        {/* Library Access */}
        <div
            className="md:col-span-4 bg-primary-container rounded-xl p-8 text-on-primary flex flex-col justify-between">
            <div>
                <span className="material-symbols-outlined text-4xl mb-6">local_library</span>
                <h3 className="text-xl font-headline font-bold mb-2">Digital Library</h3>
                <p className="text-on-primary-container text-sm leading-relaxed">Access 2M+ digital journals, ebooks,
                    and research databases anywhere in the world.</p>
            </div>
            <button
                className="mt-8 bg-surface-container-lowest text-primary py-3 px-4 rounded-lg font-headline font-bold text-center hover:bg-on-primary-container transition-colors">
                Access Portal
            </button>
        </div>
        {/* IT Support */}
        <div
            className="md:col-span-4 bg-surface-container-low rounded-xl p-8 hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">support</span>
            <h3 className="text-lg font-headline font-bold text-primary mb-2">IT &amp; Tech Support</h3>
            <p className="text-secondary text-sm mb-6">VPN setup, software licensing, and hardware troubleshooting for
                student devices.</p>
            <div className="flex flex-col gap-2">
                <div
                    className="flex items-center gap-3 text-xs font-semibold text-primary py-2 px-3 bg-white rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Chat Online
                </div>
            </div>
        </div>
        {/* Career Center */}
        <div
            className="md:col-span-4 bg-white border border-outline-variant/15 rounded-xl p-8 hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">work_history</span>
            <h3 className="text-lg font-headline font-bold text-primary mb-2">Career Center</h3>
            <p className="text-secondary text-sm mb-6">Internship placements, resume reviews, and networking events with
                global industry leaders.</p>
            <a className="text-primary text-sm font-bold underline decoration-2 underline-offset-4" href="#">Browse
                Opportunities</a>
        </div>
        {/* Campus Facilities */}
        <div className="md:col-span-4 bg-surface-container-highest rounded-xl p-8 relative overflow-hidden group">
            <img className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500"
                alt="Modern university campus architecture with sleek glass buildings and sustainable green gardens at sunrise"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvWLR3dW8jf8ZKqZ6IhaKe8q5Z1ed7rf7vdb5NlE8Ic3aWYsn40euOZDNgEFW56p0XRGk5qILRE61-ylr5WIbGh8d_PQohAIxF6j8i9QeCEf8BpDP4KPiVeJGgQkp57j1Mf7Y32wDAPH7n4U7Wbaj5_VY54-J_cFpotI_zKXWEGP263AGmhWjiU6T9SD7sZFbdL6mDh8JRBGWuzB3IdQG8uUQFxuTRcaKMeKF48KAyUXBReIF6iG82zq17LzHWRlG2Fou9g9Oa-zvP" />
            <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">apartment</span>
                <h3 className="text-lg font-headline font-bold text-primary mb-2">Campus Facilities</h3>
                <p className="text-secondary text-sm">Room bookings, gym memberships, and on-campus housing management.
                </p>
            </div>
        </div>
    </div>
  );
};

export default ServicesGrid;
