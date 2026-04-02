import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* SideNavBar (The Anchor) */}
      <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-slate-50 border-r border-slate-200/50 z-50 font-['Plus_Jakarta_Sans'] text-sm tracking-wide">
        <div className="flex flex-col h-full py-8 px-4">
          {/* Header Brand */}
          <div className="px-4 mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-blue-900 leading-tight">Super Admin</h1>
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">Institutional Control</p>
            </div>
          </div>
          
          {/* Primary Navigation */}
          <nav className="flex-1 space-y-1">
            {/* Analytics is Active by Intent */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">group</span>
              <span>User Management</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">gavel</span>
              <span>Content Moderation</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-r-4 border-blue-900 bg-blue-50/50 transition-all cursor-pointer">
              <span className="material-symbols-outlined">analytics</span>
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">settings_suggest</span>
              <span>System Settings</span>
            </div>
          </nav>

          {/* CTA */}
          <div className="mt-auto px-4 py-6">
            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform duration-200">
              <span className="material-symbols-outlined text-sm">description</span>
              Generate Report
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-slate-200/50 pt-4 space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">help</span>
              <span>Support</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="pl-72 flex flex-col min-h-screen w-full">
        {/* TopNavBar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 h-16 w-full flex justify-between items-center px-8 shadow-sm border-b border-slate-100">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-blue-900 font-headline">ScholarAdmin</span>
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
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

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Hero Header Section */}
          <section className="relative overflow-hidden rounded-[2rem] bg-primary-container p-10 text-white min-h-[240px] flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary-container to-blue-500 opacity-90"></div>
              <img 
                alt="Modern university campus architecture" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWvShfU8eSqXqkJevmLeexGBGf3fAl02W8EpBvWS_eZPf0ElkrxCAn4r-Snlqyn984GOXDa2ohX9QpHJft6UBKyvkqISJh8lbJADbXUOyj04qrT3WOQtQ1wlHkJNvcZULlC7ddtP6YrFWk-j9kAF0_frOHx5yfr2fCUYmth1Z_6s13O4nlsYROa_Ymg1lB-FD2SU9qlT9pIFPQmbjHSqoyRc_GRoXMUeMXz20dVOMGuTRHhfMZRUUDKgix8gm2aUaqLkulVDUW1wVT" 
              />
            </div>
            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline">Welcome Back, Registrar.</h2>
              <p className="text-on-primary-container text-lg font-body max-w-2xl opacity-90">The BKU Student Hub ecosystem is currently operating at optimal efficiency. Review your institutional insights below.</p>
            </div>
          </section>

          {/* Metrics Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1 */}
            <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between hover:bg-surface-container transition-colors group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-headline">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-headline">+12% Monthly</span>
              </div>
              <div className="mt-8 font-headline">
                <p className="text-sm font-medium text-secondary">Total Users</p>
                <h3 className="text-3xl font-extrabold text-primary">12,500</h3>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between hover:bg-surface-container transition-colors group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-headline">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-headline">Active Hubs</span>
              </div>
              <div className="mt-8 font-headline">
                <p className="text-sm font-medium text-secondary">Active Courses</p>
                <h3 className="text-3xl font-extrabold text-primary">450</h3>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between hover:bg-surface-container transition-colors group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform font-headline">
                  <span className="material-symbols-outlined font-headline">cloud_done</span>
                </div>
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="mt-8 font-headline">
                <p className="text-sm font-medium text-secondary">System Uptime</p>
                <h3 className="text-3xl font-extrabold text-primary">99.9%</h3>
              </div>
            </div>
          </section>

          {/* Dashboard Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Recent Activities & Stats (2/3 width) */}
            <div className="lg:col-span-2 space-y-8 font-headline">
              {/* User Growth Placeholder (Glassy Card) */}
              <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-primary">User Growth Analytics</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg">Week</button>
                    <button className="px-3 py-1 text-xs font-bold bg-surface-container-high text-secondary rounded-lg">Month</button>
                  </div>
                </div>
                <div className="h-64 w-full bg-surface-container-low rounded-xl relative overflow-hidden flex items-end">
                  {/* Visual representation of a chart */}
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    <div className="w-12 bg-primary/20 h-[30%] rounded-t-lg"></div>
                    <div className="w-12 bg-primary/20 h-[45%] rounded-t-lg"></div>
                    <div className="w-12 bg-primary/40 h-[40%] rounded-t-lg"></div>
                    <div className="w-12 bg-primary/20 h-[60%] rounded-t-lg"></div>
                    <div className="w-12 bg-primary/60 h-[75%] rounded-t-lg"></div>
                    <div className="w-12 bg-primary/30 h-[65%] rounded-t-lg"></div>
                    <div className="w-12 bg-primary h-[90%] rounded-t-lg"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                </div>
              </div>

              {/* Recent Activities Table */}
              <div className="bg-surface rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-surface-container">
                  <h3 className="text-lg font-bold text-primary">Administrative Audit Logs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-secondary">
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Administrator</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-primary">Global Security Patch V.4.2</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">System (Auto)</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <span className="w-1 h-1 rounded-full bg-emerald-700"></span> Success
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary">2 mins ago</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-primary">Bulk User Migration (CS-101)</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">J. Doe (Admin)</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <span className="w-1 h-1 rounded-full bg-blue-700"></span> Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary">15 mins ago</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-primary">Access Token Revocation</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">S. Miller (IAM)</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <span className="w-1 h-1 rounded-full bg-emerald-700"></span> Success
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary">1 hour ago</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Actions (1/3 width) */}
            <div className="space-y-6 font-headline">
              {/* Quick Access Links */}
              <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10">
                <h3 className="text-lg font-bold text-primary mb-6">Quick Controls</h3>
                <div className="space-y-3">
                  <button className="w-full group flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">manage_accounts</span>
                      </div>
                      <span className="font-bold text-primary text-sm">Manage Users</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                  <button className="w-full group flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">policy</span>
                      </div>
                      <span className="font-bold text-primary text-sm">Audit Logs</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                  <button className="w-full group flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">settings_input_component</span>
                      </div>
                      <span className="font-bold text-primary text-sm">Global Settings</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* System Health Status */}
              <div className="bg-tertiary-container text-white p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-tertiary-container">verified_user</span>
                  <h3 className="text-lg font-bold">Security Hub</h3>
                </div>
                <div className="space-y-4 font-body">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Database Integrity</span>
                    <span className="text-xs font-bold text-emerald-400">SECURE</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[95%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Cloud Storage</span>
                    <span className="text-xs font-bold text-emerald-400">82% CAPACITY</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 w-[82%]"></div>
                  </div>
                </div>
                <p className="text-xs text-on-tertiary-container leading-relaxed font-body">
                  No active threats detected in the last 72 hours. All institutional protocols are synchronized.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
