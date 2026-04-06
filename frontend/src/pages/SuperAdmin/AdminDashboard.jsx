import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AdminDashboard = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* SideNavBar (The Anchor) */}
      <Sidebar />

      {/* Main Canvas Area */}
      <main className="pl-80 flex flex-col min-h-screen w-full">
        {/* TopNavBar */}
        <TopNavBar />


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
