import React from 'react';

const ServicesRoadmap = () => {
  return (
    <section className="mt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <div className="flex items-end justify-between mb-12">
            <div>
                <h2 className="text-3xl font-headline font-bold" style={{ color: 'var(--theme-text)' }}>Service Roadmap</h2>
                <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Key milestones for student service availability throughout the semester.</p>
            </div>
        </div>
        <div className="relative pl-12" style={{ borderLeft: '1px solid var(--theme-border)' }}>
            {/* Node 1 */}
            <div className="relative mb-12">
                <div
                    className="absolute -left-8 w-4 h-4 rounded-full ring-8"
                    style={{ backgroundColor: 'var(--theme-primary)', border: '4px solid var(--theme-bg)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--theme-border) 30%, transparent)' }}
                />
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                    <span
                        className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block"
                        style={{ color: 'var(--theme-secondary)', backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)' }}>Orientation Week</span>
                    <h4 className="text-xl font-headline font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Digital ID Issuance</h4>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>All new students must register for their biometrics and digital smart cards at the Hub.</p>
                </div>
            </div>
            {/* Node 2 */}
            <div className="relative mb-12">
                <div
                    className="absolute -left-8 w-4 h-4 rounded-full ring-4"
                    style={{ backgroundColor: 'var(--theme-surface)', border: '4px solid var(--theme-bg)', boxShadow: '0 0 0 4px var(--theme-bg)' }}
                />
                <div className="rounded-xl p-6 opacity-80" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                    <span
                        className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block"
                        style={{ color: 'var(--theme-text-muted)', backgroundColor: 'var(--theme-border)' }}>Mid-Term</span>
                    <h4 className="text-xl font-headline font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Career Fair Spring 2024</h4>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Major tech and business partners visiting for internship recruitment drives.</p>
                </div>
            </div>
            {/* Node 3 */}
            <div className="relative">
                <div
                    className="absolute -left-8 w-4 h-4 rounded-full ring-4"
                    style={{ backgroundColor: 'var(--theme-surface)', border: '4px solid var(--theme-bg)', boxShadow: '0 0 0 4px var(--theme-bg)' }}
                />
                <div className="rounded-xl p-6 opacity-80" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                    <span
                        className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block"
                        style={{ color: 'var(--theme-text-muted)', backgroundColor: 'var(--theme-border)' }}>Finals</span>
                    <h4 className="text-xl font-headline font-bold mb-2" style={{ color: 'var(--theme-text)' }}>24/7 Library Access</h4>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Extended library hours and additional mental health support stations during exam periods.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default ServicesRoadmap;