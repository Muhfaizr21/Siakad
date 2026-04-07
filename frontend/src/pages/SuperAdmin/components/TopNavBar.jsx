import React from 'react';

const TopNavBar = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 h-16 w-full flex justify-between items-center px-8 shadow-sm border-b border-slate-100">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-blue-900 font-headline">ScholarAdmin</span>
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">search</span>
          <input 
            className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
            placeholder="Search system logs..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 duration-150">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 duration-150">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-blue-900 leading-none">Dr. Alistair Vance</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Chief Administrator</p>
          </div>
          <img 
            alt="Admin profile avatar" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/10" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-QFz6DxL_6veniCvvqcgL0i3uU-goBPtcUdMnePhN0t9PuSycPNRucLWuv-y450n-dqR1cSA4JpPjvIGRAOtQ93RoFdjeeSzhcPj3lyWFjQRyhBm9Y5hDADLABdgpl7sYKxMjEf4OAyVSxS9629HgFL_v0y2E4aaqG_KAKeExdD3BYTPvF91n6RzNZCype0w4LY5NauYExImWLDF_UjoQU6LJqU2RqOXKH1yPjXsMSaCnn-92wzXSHzUxJ4P4oDloY370Lfi07bcF" 
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
