import React from 'react';

const Features = () => {
  return (
    <section className="py-32 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
                <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tighter mb-8">Ecosystem Built
                        for <br />Modern Academic Life</h2>
                    <p className="text-xl text-on-surface-variant leading-relaxed">We deliver high-end digital experiences
                        that match the prestige of our institution, ensuring every interaction is smooth and intuitive.
                    </p>
                </div>
                <div className="hidden md:block h-1 w-48 bg-primary/20 rounded-full mb-4 overflow-hidden">
                    <div className="h-full w-1/2 bg-primary rounded-full"></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="flex flex-col gap-6">
                    <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">library_books</span>
                    </div>
                    <h4 className="text-2xl font-bold text-primary">Global Library Access</h4>
                    <p className="text-on-surface-variant leading-relaxed font-medium">Digital access to over 2 million
                        journals and archives, accessible anywhere in the world with your student credentials.</p>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">trending_up</span>
                    </div>
                    <h4 className="text-2xl font-bold text-primary">Intelligent Progress</h4>
                    <p className="text-on-surface-variant leading-relaxed font-medium">Predictive GPA modeling and automated
                        degree audit tools that help you stay on the path to graduation.</p>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">video_chat</span>
                    </div>
                    <h4 className="text-2xl font-bold text-primary">Collaborative Spaces</h4>
                    <p className="text-on-surface-variant leading-relaxed font-medium">High-fidelity virtual lecture halls
                        and private research pods integrated directly into your course dashboard.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Features;
