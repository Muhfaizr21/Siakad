import React from 'react';

const Calendar = () => {
  return (
    <section className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Academic Calendar 2024
                </h2>
                <p className="text-secondary mt-4">Stay informed about key dates and academic milestones.</p>
            </div>
            <div className="relative">
                {/* Timeline Track */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-fixed"></div>
                <div className="space-y-12">
                    {/* Node 1 */}
                    <div className="relative flex items-center justify-center md:justify-between w-full">
                        <div className="hidden md:block w-5/12 text-right pr-12">
                            <span className="text-primary font-bold text-lg">September 02</span>
                            <h4 className="font-headline font-bold text-xl">Fall Semester Start</h4>
                            <p className="text-secondary text-sm">Official commencement of lectures for all
                                undergraduate programs.</p>
                        </div>
                        <div
                            className="z-10 w-12 h-12 rounded-full bg-surface-container-highest border-4 border-primary flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-primary text-xl">event</span>
                        </div>
                        <div className="md:w-5/12 pl-12 text-left">
                            <div className="md:hidden">
                                <span className="text-primary font-bold text-lg">September 02</span>
                                <h4 className="font-headline font-bold text-xl">Fall Semester Start</h4>
                            </div>
                            <span
                                className="bg-primary-fixed text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Registration
                                Required</span>
                        </div>
                    </div>
                    {/* Node 2 */}
                    <div className="relative flex items-center justify-center md:justify-between w-full">
                        <div className="md:w-5/12 text-right pr-12">
                            <span
                                className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Crucial</span>
                        </div>
                        <div
                            className="z-10 w-12 h-12 rounded-full bg-surface-container-highest border-4 border-primary flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-primary text-xl">description</span>
                        </div>
                        <div className="hidden md:block w-5/12 pl-12">
                            <span className="text-primary font-bold text-lg">October 15</span>
                            <h4 className="font-headline font-bold text-xl">Research Proposals Due</h4>
                            <p className="text-secondary text-sm">Submission deadline for postgraduate thesis topics and
                                funding applications.</p>
                        </div>
                    </div>
                    {/* Node 3 */}
                    <div className="relative flex items-center justify-center md:justify-between w-full">
                        <div className="hidden md:block w-5/12 text-right pr-12">
                            <span className="text-primary font-bold text-lg">December 12</span>
                            <h4 className="font-headline font-bold text-xl">Winter Break</h4>
                            <p className="text-secondary text-sm">Campus facilities remain open for research staff and
                                doctoral candidates.</p>
                        </div>
                        <div
                            className="z-10 w-12 h-12 rounded-full bg-surface-container-highest border-4 border-primary flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-primary text-xl">ac_unit</span>
                        </div>
                        <div className="md:w-5/12 pl-12 text-left">
                            <div className="md:hidden">
                                <span className="text-primary font-bold text-lg">December 12</span>
                                <h4 className="font-headline font-bold text-xl">Winter Break</h4>
                            </div>
                            <span
                                className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Holiday</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Calendar;
