import React from 'react';

const Timeline = () => {
  return (
    <section className="pb-32 px-8 overflow-hidden bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto bg-primary rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden shadow-2xl">
            {/* Visual Decor */}
            <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none translate-x-1/4">
                <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M44.7,-76.4C58.1,-69.2,69.5,-57.4,77.3,-43.6C85.1,-29.8,89.2,-14.9,87.6,-0.9C86,13.1,78.6,26.1,69.1,36.8C59.6,47.5,47.9,55.8,35.4,62.8C22.9,69.8,9.5,75.4,-4.1,82.4C-17.7,89.5,-35.4,98,-49.6,94.1C-63.7,90.2,-74.3,73.9,-81.1,57.7C-87.9,41.4,-90.8,25.2,-89.9,9.4C-89,-6.4,-84.3,-21.8,-76.8,-35.3C-69.3,-48.8,-59,-60.4,-46.4,-68C-33.8,-75.6,-18.9,-79.2,-2.1,-75.6C14.7,-72,29.4,-61.2,44.7,-76.4Z"
                        fill="#FFFFFF" transform="translate(100 100)"></path>
                </svg>
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">Master Your Schedule
                        with <br />Smart Timeline</h2>
                    <p className="text-primary-fixed/80 text-xl mb-12 leading-relaxed font-medium">A unified chronological
                        view of your entire academic semester, merging deadlines, events, and exams into one intuitive
                        interface.</p>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10 flex-1">
                            <div className="text-white font-black text-3xl mb-1">99.9%</div>
                            <div className="text-primary-fixed/60 text-xs uppercase tracking-[0.2em] font-bold">Sync
                                Accuracy</div>
                        </div>
                        <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10 flex-1">
                            <div className="text-white font-black text-3xl mb-1">Instant</div>
                            <div className="text-primary-fixed/60 text-xs uppercase tracking-[0.2em] font-bold">Mobile
                                Alerts</div>
                        </div>
                    </div>
                </div>
                <div className="space-y-5">
                    <div
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex gap-6 items-start transform translate-x-8 hover:translate-x-4 transition-transform duration-500">
                        <div
                            className="w-3 h-3 rounded-full bg-green-400 mt-2.5 shadow-[0_0_15px_rgba(74,222,128,0.5)] animate-pulse">
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg mb-1">Computer Science Colloquium</div>
                            <div className="text-primary-fixed/60 text-sm font-medium">Tomorrow, 10:00 AM • Great Hall</div>
                        </div>
                    </div>
                    <div
                        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 flex gap-6 items-start shadow-2xl relative z-20">
                        <div className="w-3 h-3 rounded-full bg-blue-400 mt-2.5 shadow-[0_0_15px_rgba(96,165,250,0.5)]">
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg mb-1">Thesis Submission Deadline</div>
                            <div className="text-primary-fixed/60 text-sm font-medium">Friday, 11:59 PM • Digital Portal
                            </div>
                        </div>
                    </div>
                    <div
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex gap-6 items-start translate-x-12 opacity-70">
                        <div className="w-3 h-3 rounded-full bg-slate-400 mt-2.5"></div>
                        <div>
                            <div className="text-white font-bold text-lg mb-1">Course Registration Phase 2</div>
                            <div className="text-primary-fixed/60 text-sm font-medium">Starts in 4 Days</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Timeline;
