import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AcademicPortal = () => {
  const [isKrsOpen, setIsKrsOpen] = useState(true);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-headline">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Academic Time-Gate</h1>
              <p className="text-secondary mt-1">Global university phase synchronization and system-wide state control.</p>
            </div>
            <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <span className="material-symbols-outlined">restart_alt</span>
              Initialize Next Semester
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Active Phase Control */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border border-outline-variant/30 space-y-8 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-primary">Academic Master</h3>
                  <p className="text-xs text-secondary/70">Current global configuration for all institutional nodes.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-secondary/50 tracking-widest">Target Year</span>
                      <span className="font-extrabold text-primary">2023 / 2024</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary/30">calendar_today</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-secondary/50 tracking-widest">Global Term</span>
                      <span className="font-extrabold text-primary text-lg">Ganjil (Odd)</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary/30">import_export</span>
                  </div>
                </div>

                <div className="p-6 bg-secondary-container/30 rounded-3xl space-y-3 font-body border border-secondary/10">
                    <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Status: Execution Ready
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                        The current phase dictates access for 12,000+ students and 450+ courses. 
                        Changing this will trigger global data recalculations.
                    </p>
                </div>
              </div>

              {/* Infrastructure Stats Snippet */}
              <div className="bg-tertiary-container p-10 rounded-[3rem] text-white space-y-6 shadow-xl shadow-tertiary-container/20">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold">Physical Library</h3>
                    <span className="material-symbols-outlined text-on-tertiary-container opacity-50">analytics</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-sm opacity-80">Room Capacity</span>
                        <span className="font-bold">4,500 Mats</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-sm opacity-80">Faculty Slots</span>
                        <span className="font-bold">12 Defined</span>
                    </div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-on-tertiary-container opacity-60">Manage in Infrastructure Hub</p>
                </div>
              </div>
            </div>

            {/* Toggle Switches and Mass Controls */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white p-10 rounded-[3rem] border border-outline-variant/30 space-y-10 shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2 tracking-tight">System State Authorization</h3>
                    <p className="text-secondary text-sm">Control the flow of the university's digital existence.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Toggle Component */}
                    <div className="flex items-center justify-between p-8 bg-surface-container-low/50 rounded-[2.5rem] hover:bg-surface-container-low transition-all border border-outline-variant/10 group">
                        <div className="max-w-md space-y-2">
                            <h4 className="font-extrabold text-primary flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${isKrsOpen ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                                Masa KRS War (Student Registration)
                            </h4>
                            <p className="text-xs text-secondary leading-relaxed font-body">
                                When enabled, the "Enroll Course" button becomes active for all students. 
                                <span className="font-bold text-error block mt-1 uppercase text-[10px] tracking-widest italic font-headline opacity-0 group-hover:opacity-100 transition-opacity">Danger: High Concurrent Load Expected</span>
                            </p>
                        </div>
                        <div 
                          onClick={() => setIsKrsOpen(!isKrsOpen)}
                          className={`w-[72px] h-10 rounded-full cursor-pointer transition-all duration-500 relative p-1 ${isKrsOpen ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'}`}
                        >
                            <div className={`w-8 h-8 bg-white rounded-full transition-all duration-500 transform shadow-md flex items-center justify-center ${isKrsOpen ? 'translate-x-8' : 'translate-x-0'}`}>
                                <span className={`material-symbols-outlined text-sm ${isKrsOpen ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {isKrsOpen ? 'lock_open' : 'lock'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-8 bg-surface-container-low/50 rounded-[2.5rem] transition-all border border-outline-variant/10">
                        <div className="max-w-md space-y-2 opacity-50">
                            <h4 className="font-extrabold text-primary flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full bg-slate-300 tracking-widest`}></span>
                                Grading Period (Lecturer Input)
                            </h4>
                            <p className="text-xs text-secondary leading-relaxed font-body italic">
                                Feature currently locked based on the academic calendar timeline.
                            </p>
                        </div>
                        <div className="w-[72px] h-10 rounded-full bg-slate-100 cursor-not-allowed p-1">
                            <div className="w-8 h-8 bg-white/50 rounded-full"></div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-primary/[0.03] border border-primary/10 rounded-[2.5rem] flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">emergency_home</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-primary">Global Emergency Lockdown</h4>
                        <p className="text-xs text-secondary font-body">Instantly terminate all student and faculty sessions. Use only in case of data breach.</p>
                    </div>
                    <button className="px-6 py-3 bg-error text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-error/20 hover:scale-105 active:scale-95 transition-all">
                        Execute
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcademicPortal;
