import React from 'react';

const MissionVision = () => {
  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-7">
                <div className="space-y-12">
                    <div>
                        <h2 className="text-4xl font-bold text-primary mb-6">Our Mission</h2>
                        <p className="text-lg text-secondary leading-relaxed">To cultivate a dynamic learning ecosystem
                            that empowers diverse scholars to challenge the status quo, advance global knowledge,
                            and lead with integrity in an ever-evolving digital landscape.</p>
                    </div>
                    <div className="pl-12 border-l-2 border-primary-fixed">
                        <h2 className="text-4xl font-bold text-primary mb-6">Our Vision</h2>
                        <p className="text-lg text-secondary leading-relaxed">To be recognized as the premier
                            institution where traditional academic rigor seamlessly integrates with cutting-edge
                            technology to solve complex global challenges.</p>
                    </div>
                </div>
            </div>
            <div className="md:col-span-5 relative">
                <div className="bg-surface-container-low p-4 rounded-xl transform rotate-3">
                    <img className="rounded-lg shadow-xl grayscale hover:grayscale-0 transition-all duration-700"
                        alt="collaborative student workspace with modern wooden tables and large windows overlooking a green campus courtyard"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9yMz3qRsa8LHEHdCXX68-cHBq-w5JUeJAZupNdsHn9dTx13e3mwOOxe7oyuacsjCmx5-zmTAVc0wILWP8BIX2ibzOqNNtcniOHlMLDfwHvQtzTir4W-_VAl26zGMF4tTGxmnDu2vn0BP3ut_M8r2T-szM1rdGkIk_lzlsxx1nOKgKJv9QrEd96fEQRiNAjLBF_JXuaxd2Li90wb2f5u_CSywV6TSP47jhgCwpSjPIKT3_DwwvcjJ1QcIYtKyljy7_zZ_D3atph04T" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl">
                </div>
            </div>
        </div>
    </section>
  );
};

export default MissionVision;
