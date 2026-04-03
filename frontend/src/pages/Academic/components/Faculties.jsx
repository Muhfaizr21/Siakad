import React from 'react';

const Faculties = () => {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col mb-16">
            <span className="text-primary font-headline font-bold tracking-widest text-xs uppercase mb-2">Our
                Departments</span>
            <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Academic Faculties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Health Faculty */}
            <div
                className="md:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between group hover:bg-secondary-container transition-all duration-500">
                <div>
                    <span className="material-symbols-outlined text-4xl text-primary mb-6">medical_services</span>
                    <h3 className="text-3xl font-headline font-bold mb-4">Faculty of Health</h3>
                    <p className="text-secondary max-w-lg mb-8">Pioneering clinical research and medical education. Our
                        students work alongside top health professionals in state-of-the-art simulation labs.</p>
                    <div className="flex flex-wrap gap-3">
                        <span
                            className="bg-surface-container-lowest px-4 py-2 rounded-full text-xs font-semibold text-primary">Medicine</span>
                        <span
                            className="bg-surface-container-lowest px-4 py-2 rounded-full text-xs font-semibold text-primary">Nursing</span>
                        <span
                            className="bg-surface-container-lowest px-4 py-2 rounded-full text-xs font-semibold text-primary">Public
                            Health</span>
                    </div>
                </div>
            </div>
            {/* Science Faculty */}
            <div
                className="md:col-span-4 bg-primary text-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <span className="material-symbols-outlined text-4xl text-primary-fixed mb-6">science</span>
                    <h3 className="text-2xl font-headline font-bold mb-4">Faculty of Science</h3>
                    <p className="text-primary-fixed-dim text-sm leading-relaxed">Exploring the boundaries of the known
                        universe through physics, chemistry, and biology.</p>
                </div>
                <button
                    className="relative z-10 mt-8 flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all">
                    View Programs <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <div className="absolute -right-10 -bottom-10 opacity-10 scale-150">
                    <span className="material-symbols-outlined text-9xl">biotech</span>
                </div>
            </div>
            {/* Humanities Faculty */}
            <div className="md:col-span-4 bg-surface-container-highest rounded-xl p-8 flex flex-col">
                <span className="material-symbols-outlined text-4xl text-secondary mb-6">menu_book</span>
                <h3 className="text-2xl font-headline font-bold mb-4 text-on-surface">Humanities</h3>
                <p className="text-on-surface-variant text-sm mb-6">Understanding human culture and social structures to
                    build a more equitable future.</p>
                <ul className="space-y-3 mt-auto">
                    <li className="flex items-center gap-2 text-sm font-medium"><span
                            className="w-1.5 h-1.5 bg-primary rounded-full"></span> Philosophy</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><span
                            className="w-1.5 h-1.5 bg-primary rounded-full"></span> Sociology</li>
                    <li className="flex items-center gap-2 text-sm font-medium"><span
                            className="w-1.5 h-1.5 bg-primary rounded-full"></span> Literature</li>
                </ul>
            </div>
            {/* Degree Programs */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 border-l-4 border-primary">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-headline font-bold text-xl mb-4">Undergraduate</h4>
                        <p className="text-secondary text-sm mb-4">Foundational degrees designed to launch your career
                            with practical skills and theoretical depth.</p>
                        <a className="text-primary font-bold text-sm underline decoration-primary-fixed decoration-4 underline-offset-4"
                            href="#">Browse Degrees</a>
                    </div>
                    <div>
                        <h4 className="font-headline font-bold text-xl mb-4">Postgraduate</h4>
                        <p className="text-secondary text-sm mb-4">Master's and Doctorate programs focused on
                            specialized expertise and advanced research.</p>
                        <a className="text-primary font-bold text-sm underline decoration-primary-fixed decoration-4 underline-offset-4"
                            href="#">Graduate Admissions</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Faculties;
