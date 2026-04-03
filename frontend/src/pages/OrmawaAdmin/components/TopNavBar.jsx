import React from 'react';

const TopNavBar = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 h-16 border-b border-slate-100">
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
        <span className="material-symbols-outlined text-outline">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full font-body outline-none" 
          placeholder="Search proposals or members..." 
          type="text" 
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-blue-900 transition-colors focus:ring-2 ring-blue-500/20 p-2 rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-slate-500 hover:text-blue-900 transition-colors focus:ring-2 ring-blue-500/20 p-2 rounded-full">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          Quick Action
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <img 
            alt="User Profile Avatar" 
            className="w-8 h-8 rounded-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiPCwEWWnlnNUDfDC51erZYmEG8P2hzTo6mKzKcLAc8tX2qUbwkeb6-ttAIwipNlhMFFEW2_XP3zKjdkFjAFORIC35eW3YJTLw9kWtiW6E4YjqK_L5azb2DhXThVeoj7N2wvrzND0VF7DTl6X5Au9tSxWf4MIqAc2rSsDXkwUBV6UN7X4xcPW5n-Mw77HiB2nttkHODb39CxYvHp5BbQYH3M5b4A8NOZM44RCczSo3i1hpmyiCf0rHKmcDDgIAm0Sh8t9VkjuyVQbC" 
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
