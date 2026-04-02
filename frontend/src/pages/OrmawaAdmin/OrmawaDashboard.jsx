import React from 'react';

const OrmawaDashboard = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* SideNavBar Anchor */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 flex flex-col p-4 z-50">
        <div className="mb-8 px-4 py-2">
          <h1 className="text-xl font-bold text-blue-900 font-headline">Admin Ormawa</h1>
          <p className="text-xs text-secondary font-medium tracking-wide">BKU University</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 bg-blue-900 text-white rounded-lg transition-all font-plus-jakarta text-sm font-medium opacity-90" href="#">
            <span className="material-symbols-outlined">corporate_fare</span>
            Organization Profile
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
            <span className="material-symbols-outlined">event_available</span>
            Event Management
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
            <span className="material-symbols-outlined">group</span>
            Member Directory
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Budget/Finance
          </a>
        </nav>
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </a>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 min-h-screen">
        {/* TopNavBar Anchor */}
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

        {/* Dashboard Content */}
        <div className="pt-24 pb-12 px-8">
          {/* Welcome Header Section */}
          <section className="relative h-64 rounded-xl overflow-hidden mb-8 group">
            <img 
              alt="BKU Campus" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5VmDy-9bnXSXSb18M4_ZIhoz_0jYWRe-0AYvDYhPt6iSfnNmlGqvPOq3FTG-TZ2CQVyP0zwU9PguDpTt8Qu9Ub6jlnlbkJuDEwQcBh8M1qhwpuN_tiAQomoh3uRO90y74ZctzxwV7_A8kDrKMhOSXYtlWNEssHP5quxgMZ11SrW1f7OMLiwRkyaccP7orrcYDCkVhKoCjZD4Jjcof_9ZmnB-vitZ6ec13rA_SUmFbqoscKI-ArR0D3yQbVF55pgrha4J9zISBJozQ" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent flex items-center px-12">
              <div className="text-white max-w-lg">
                <h2 className="text-3xl font-extrabold font-headline leading-tight mb-2">Welcome back, BEM Faculty Administrator</h2>
                <p className="text-primary-fixed opacity-90 font-body">Manage your organization's academic and social initiatives with precision and flair.</p>
              </div>
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Organization Snapshot & Trackers */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Organization Snapshot (Bento Grid Style) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between">
                  <span className="material-symbols-outlined text-primary mb-4">group</span>
                  <div>
                    <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">Active Members</p>
                    <h3 className="text-2xl font-bold text-primary font-headline">1,240</h3>
                    <p className="text-xs text-emerald-600 mt-2 flex items-center font-medium">
                      <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> +12% this month
                    </p>
                  </div>
                </div>
                <div className="md:col-span-1 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between">
                  <span className="material-symbols-outlined text-primary mb-4">calendar_today</span>
                  <div>
                    <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">Approved Events</p>
                    <h3 className="text-2xl font-bold text-primary font-headline">14</h3>
                    <p className="text-xs text-on-surface-variant mt-2 font-medium">Target: 20 per Sem</p>
                  </div>
                </div>
                <div className="md:col-span-2 p-6 rounded-xl bg-primary-container text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs text-primary-fixed opacity-80 font-label uppercase tracking-widest mb-1">Remaining Budget</p>
                    <h3 className="text-3xl font-bold font-headline">Rp 42.500.000</h3>
                    <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white opacity-10 text-9xl">payments</span>
                </div>
              </div>

              {/* Event & Proposal Tracker */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
                <div className="p-6 flex justify-between items-center bg-surface-container-low/30">
                  <h3 className="text-lg font-bold font-headline text-primary">Event &amp; Proposal Tracker</h3>
                  <button className="text-sm font-semibold text-primary hover:underline transition-all">View Full Log</button>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Item 1 */}
                    <div className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface font-headline">National Seminar</h4>
                          <p className="text-xs text-on-surface-variant font-body">Due: Oct 24, 2023</p>
                        </div>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <div className="flex justify-between text-xs mb-1 font-label">
                          <span className="text-emerald-700 font-bold uppercase tracking-tight">Approved</span>
                          <span className="text-on-surface-variant">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <button className="text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>

                    {/* Item 2 */}
                    <div className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                          <span className="material-symbols-outlined">pending</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface font-headline">Faculty Sports Week</h4>
                          <p className="text-xs text-on-surface-variant font-body">Due: Nov 15, 2023</p>
                        </div>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <div className="flex justify-between text-xs mb-1 font-label">
                          <span className="text-orange-700 font-bold uppercase tracking-tight">Reviewing</span>
                          <span className="text-on-surface-variant">65%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full">
                          <div className="bg-orange-400 h-full rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      <button className="text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>

                    {/* Item 3 */}
                    <div className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                          <span className="material-symbols-outlined">draw</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface font-headline">Community Service</h4>
                          <p className="text-xs text-on-surface-variant font-body">Due: Dec 01, 2023</p>
                        </div>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <div className="flex justify-between text-xs mb-1 font-label">
                          <span className="text-blue-700 font-bold uppercase tracking-tight">Planning</span>
                          <span className="text-on-surface-variant">25%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      <button className="text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Quick Actions */}
              <div className="bg-surface-container-highest/30 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold font-label text-secondary uppercase tracking-widest">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center gap-3 w-full bg-primary text-white px-4 py-4 rounded-xl font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform text-left">
                    <span className="material-symbols-outlined">add_circle</span>
                    <div>
                      <p className="text-sm">New Event Proposal</p>
                      <p className="text-[10px] opacity-70 font-normal">Start a new draft for approval</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 w-full bg-surface-container-lowest text-primary border border-outline-variant/20 px-4 py-4 rounded-xl font-semibold hover:bg-surface transition-colors text-left">
                    <span className="material-symbols-outlined">download</span>
                    <div>
                      <p className="text-sm">Download Financial Report</p>
                      <p className="text-[10px] text-on-surface-variant font-normal">Export Q3 balance sheet</p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Member Activity Feed */}
              <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl flex flex-col max-h-[600px]">
                <div className="p-6 border-b border-surface-container">
                  <h3 className="text-lg font-bold font-headline text-primary">Activity Feed</h3>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                  {/* Feed Item */}
                  <div className="relative pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-[-24px] before:w-px before:bg-outline-variant/30 last:before:hidden">
                    <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-primary">person_add</span>
                    </div>
                    <p className="text-sm font-body leading-relaxed">
                      <span className="font-bold text-on-surface">Andi</span> joined the <span className="text-primary font-medium">Humanities committee</span>
                    </p>
                    <span className="text-[11px] text-on-surface-variant uppercase font-label">2 hours ago</span>
                  </div>
                  
                  {/* Feed Item */}
                  <div className="relative pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-[-24px] before:w-px before:bg-outline-variant/30 last:before:hidden">
                    <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-orange-700">request_quote</span>
                    </div>
                    <p className="text-sm font-body leading-relaxed">
                      <span className="font-bold text-on-surface">Siti</span> submitted a <span className="text-primary font-medium">funding request</span> for Sports Week
                    </p>
                    <span className="text-[11px] text-on-surface-variant uppercase font-label">5 hours ago</span>
                  </div>
                  
                  {/* Feed Item */}
                  <div className="relative pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-[-24px] before:w-px before:bg-outline-variant/30 last:before:hidden">
                    <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-emerald-700">verified</span>
                    </div>
                    <p className="text-sm font-body leading-relaxed">
                      <span className="font-bold text-on-surface">Rian</span> approved the <span className="text-primary font-medium">National Seminar</span> logistics
                    </p>
                    <span className="text-[11px] text-on-surface-variant uppercase font-label">Yesterday</span>
                  </div>
                  
                  {/* Feed Item */}
                  <div className="relative pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-[-24px] before:w-px before:bg-outline-variant/30 last:before:hidden">
                    <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-slate-600">forum</span>
                    </div>
                    <p className="text-sm font-body leading-relaxed">
                      New discussion thread started in <span className="text-primary font-medium">Core Committee</span>
                    </p>
                    <span className="text-[11px] text-on-surface-variant uppercase font-label">Oct 12, 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrmawaDashboard;
