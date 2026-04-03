import React from 'react';
import { useNavigate } from 'react-router-dom';

const Gateways = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-white relative overflow-hidden">
        <div
            className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent">
        </div>
        <div className="max-w-7xl mx-auto px-8">
            <div className="mb-20 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-4">Dedicated Community Gateways</h2>
                <p className="text-lg text-on-surface-variant leading-relaxed">Tailored environments built for the unique
                    needs of every BKU member, providing seamless access to essential tools and records.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* For Students */}
                <div
                    className="group relative bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/20 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,35,111,0.1)] transition-all duration-500">
                    <div
                        className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <span className="material-symbols-outlined text-3xl font-light">school</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-4">Students</h3>
                    <p className="text-on-surface-variant mb-8 leading-relaxed">Your personal academic hub for class
                        schedules, real-time grades, and interactive e-learning modules.</p>
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined text-xl text-primary/40">check_circle</span> Automated Grade Tracking
                        </li>
                        <li className="flex items-center gap-3 text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined text-xl text-primary/40">check_circle</span> Smart Course Enrollment
                        </li>
                    </ul>
                    <button
                        onClick={() => navigate('/student')}
                        className="w-full py-3.5 rounded-xl border-2 border-primary/10 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300">
                        Student Login <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                {/* For Faculty */}
                <div
                    className="group relative bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/20 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,35,111,0.1)] transition-all duration-500">
                    <div
                        className="w-16 h-16 bg-secondary-fixed rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                        <span className="material-symbols-outlined text-3xl font-light">assignment_ind</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-4">Faculty</h3>
                    <p className="text-on-surface-variant mb-8 leading-relaxed">Advanced tools for dynamic course
                        management, research collaboration, and grading automation.</p>
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined text-xl text-primary/40">check_circle</span> Integrated LMS Control
                        </li>
                        <li className="flex items-center gap-3 text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined text-xl text-primary/40">check_circle</span> Research Grant Portals
                        </li>
                    </ul>
                    <button
                        onClick={() => navigate('/faculty')}
                        className="w-full py-3.5 rounded-xl border-2 border-primary/10 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300">
                        Faculty Dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                {/* For Admins */}
                <div
                    className="group relative bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/20 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,35,111,0.1)] transition-all duration-500">
                    <div
                        className="w-16 h-16 bg-tertiary-fixed rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <span className="material-symbols-outlined text-3xl font-light">admin_panel_settings</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-4">Administration</h3>
                    <p className="text-on-surface-variant mb-8 leading-relaxed">A central command for student records,
                        campus security configurations, and institutional reporting.</p>
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined text-xl text-primary/40">check_circle</span> Registry Management
                        </li>
                        <li className="flex items-center gap-3 text-sm font-semibold text-secondary">
                            <span className="material-symbols-outlined text-xl text-primary/40">check_circle</span> Security Protocol Suite
                        </li>
                    </ul>
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full py-3.5 rounded-xl border-2 border-primary/10 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300">
                        Admin Console <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Gateways;
