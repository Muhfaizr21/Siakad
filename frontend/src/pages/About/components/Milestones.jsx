import React from 'react';

const Milestones = () => {
  return (
    <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-4xl font-extrabold text-primary mb-20 text-center">Institutional Milestones</h2>
            <div className="relative max-w-4xl mx-auto">
                {/* Vertical Track */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-primary-fixed"></div>
                <div className="space-y-24 relative">
                    {/* Node 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2 md:text-right">
                            <h3 className="text-3xl font-bold text-primary">1924</h3>
                            <p className="text-secondary">Foundation of BKU as a College of Arts &amp; Sciences.</p>
                        </div>
                        <div
                            className="w-4 h-4 bg-primary rounded-full z-10 border-4 border-surface ring-4 ring-primary-fixed/30">
                        </div>
                        <div className="md:w-1/2"></div>
                    </div>
                    {/* Node 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="md:w-1/2 md:text-left">
                            <h3 className="text-3xl font-bold text-primary">1968</h3>
                            <p className="text-secondary">Expansion into Research &amp; Graduate Studies with our North
                                Campus.</p>
                        </div>
                        <div
                            className="w-4 h-4 bg-primary rounded-full z-10 border-4 border-surface ring-4 ring-primary-fixed/30">
                        </div>
                        <div className="md:w-1/2"></div>
                    </div>
                    {/* Node 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2 md:text-right">
                            <h3 className="text-3xl font-bold text-primary">2010</h3>
                            <p className="text-secondary">Inauguration of the Digital Learning Center &amp; Student Hub.
                            </p>
                        </div>
                        <div
                            className="w-4 h-4 bg-primary rounded-full z-10 border-4 border-surface ring-4 ring-primary-fixed/30">
                        </div>
                        <div className="md:w-1/2"></div>
                    </div>
                    {/* Node 4 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="md:w-1/2 md:text-left">
                            <h3 className="text-3xl font-bold text-primary">2024</h3>
                            <p className="text-secondary">Centennial Celebration and Launch of the Global Sustainability
                                Initiative.</p>
                        </div>
                        <div
                            className="w-4 h-4 bg-primary rounded-full z-10 border-4 border-surface ring-4 ring-primary-fixed/30">
                        </div>
                        <div className="md:w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Milestones;
