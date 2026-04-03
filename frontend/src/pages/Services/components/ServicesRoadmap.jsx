import React from 'react';

const ServicesRoadmap = () => {
  return (
    <section className="mt-24">
        <div className="flex items-end justify-between mb-12">
            <div>
                <h2 className="text-3xl font-headline font-bold text-primary mb-2">Service Roadmap</h2>
                <p className="text-secondary">Key milestones for student service availability throughout the semester.
                </p>
            </div>
        </div>
        <div className="relative pl-12">
            {/* Timeline Track */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-primary-fixed"></div>
            {/* Node 1 */}
            <div className="relative mb-12">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-primary ring-8 ring-primary-fixed/30"></div>
                <div className="bg-surface-container-low rounded-xl p-6">
                    <span
                        className="text-xs font-bold text-primary-container bg-primary-fixed px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Orientation
                        Week</span>
                    <h4 className="text-xl font-headline font-bold text-primary mb-2">Digital ID Issuance</h4>
                    <p className="text-secondary text-sm">All new students must register for their biometrics and
                        digital smart cards at the Hub.</p>
                </div>
            </div>
            {/* Node 2 */}
            <div className="relative mb-12">
                <div
                    className="absolute -left-8 w-4 h-4 rounded-full bg-surface-container-highest ring-4 ring-background">
                </div>
                <div className="bg-surface-container-low rounded-xl p-6 opacity-80">
                    <span
                        className="text-xs font-bold text-secondary bg-surface-container-highest px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Mid-Term</span>
                    <h4 className="text-xl font-headline font-bold text-primary mb-2">Career Fair Spring 2024</h4>
                    <p className="text-secondary text-sm">Major tech and business partners visiting for internship
                        recruitment drives.</p>
                </div>
            </div>
            {/* Node 3 */}
            <div className="relative">
                <div
                    className="absolute -left-8 w-4 h-4 rounded-full bg-surface-container-highest ring-4 ring-background">
                </div>
                <div className="bg-surface-container-low rounded-xl p-6 opacity-80">
                    <span
                        className="text-xs font-bold text-secondary bg-surface-container-highest px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Finals</span>
                    <h4 className="text-xl font-headline font-bold text-primary mb-2">24/7 Library Access</h4>
                    <p className="text-secondary text-sm">Extended library hours and additional mental health support
                        stations during exam periods.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default ServicesRoadmap;
