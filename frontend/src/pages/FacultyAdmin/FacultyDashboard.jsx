import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const FacultyDashboard = () => {
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      {/* SideNavBar (Shared Component) */}
      <Sidebar />

      {/* TopNavBar (Shared Component) */}
      <TopNavBar />


      {/* Main Content Canvas */}
      <main className="ml-64 p-8 min-h-screen bg-surface">
        {/* Welcome Banner Section */}
        <section className="mb-10 relative overflow-hidden rounded-3xl bg-primary-container p-10 text-white min-h-[240px] flex items-end">
          <div className="absolute inset-0 z-0">
            <img 
              alt="University Architecture" 
              className="w-full h-full object-cover mix-blend-overlay opacity-30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfoCQw-CM0aC8B7b5ZfOhLkzG1nekbA6z1cDpdF3xvOU8gi8sbmqRLqTArV7Z7qmI1mBqFAaq2dtm3AdChssIq1Vy9OT0ymszetE6QJkpzJ2utV-C59nqqfuTMK4Tq5PwgKs7lDvF5WYbEpgGRGwh03epALxFxDVYms2P7HWy0QP2goJ-CeXVULdQupEAaFDbytYVH3VT4ciDpsrhfU9OIhAkxASkJfGVbaO27A_3pJwG3peJLouzI6DYVakL4WnPnVXFCUUUg0WvH" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 w-full flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-headline font-extrabold tracking-tight mb-2">Welcome back, Prof. Dr. Sarah Chen</h2>
              <p className="text-on-primary-container font-medium text-lg max-w-xl">The Fall 2024 Semester analytics are now updated. You have 3 pending departmental approvals and 2 faculty meetings scheduled for today.</p>
            </div>
            <button className="bg-surface text-primary px-8 py-3 rounded-xl font-bold font-headline text-sm shadow-xl hover:bg-primary-fixed-dim transition-all">
              View Schedule
            </button>
          </div>
        </section>

        {/* Bento Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-0 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary-fixed-dim bg-primary-container p-2 rounded-lg">group</span>
              <span className="text-emerald-600 text-xs font-bold">+12%</span>
            </div>
            <div>
              <p className="text-4xl font-headline font-extrabold text-primary">1,284</p>
              <p className="text-on-surface-variant text-sm font-medium">Enrolled Students</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-0 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary-container bg-secondary p-2 rounded-lg">menu_book</span>
            </div>
            <div>
              <p className="text-4xl font-headline font-extrabold text-primary">6</p>
              <p className="text-on-surface-variant text-sm font-medium">Faculty Course Load</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-0 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary p-2 rounded-lg">bar_chart</span>
              <span className="text-primary font-bold text-xs">GPA 3.4</span>
            </div>
            <div>
              <p className="text-4xl font-headline font-extrabold text-primary">B+</p>
              <p className="text-on-surface-variant text-sm font-medium">Average Grade</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-0 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-error-container bg-error p-2 rounded-lg">pending_actions</span>
              <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-4xl font-headline font-extrabold text-primary">24</p>
              <p className="text-on-surface-variant text-sm font-medium">Research Submissions</p>
            </div>
          </div>
        </section>

        {/* Main Workspace: Course Management & Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Center Column: Course Management */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-headline font-extrabold text-primary tracking-tight">Faculty Course Management</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Managing Semester: Autumn 2024</p>
                </div>
                <button className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                  View All Courses <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      <th className="px-4 pb-2">Course Name</th>
                      <th className="px-4 pb-2">Students</th>
                      <th className="px-4 pb-2">Status</th>
                      <th className="px-4 pb-2">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="bg-surface-container-low/40 rounded-xl overflow-hidden group hover:bg-surface-container transition-colors">
                      <td className="px-4 py-5 font-bold text-primary rounded-l-xl">
                        Advanced Macroeconomics
                        <span className="block text-[10px] text-slate-500 font-medium">ECON-402 • Room 302</span>
                      </td>
                      <td className="px-4 py-5 font-medium">142</td>
                      <td className="px-4 py-5">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">ACTIVE</span>
                      </td>
                      <td className="px-4 py-5 rounded-r-xl w-48">
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[85%]"></div>
                        </div>
                        <span className="text-[10px] mt-1 block font-bold text-slate-500">85% Grading Complete</span>
                      </td>
                    </tr>
                    <tr className="bg-surface-container-low/40 rounded-xl overflow-hidden group hover:bg-surface-container transition-colors">
                      <td className="px-4 py-5 font-bold text-primary rounded-l-xl">
                        Monetary Policy Theory
                        <span className="block text-[10px] text-slate-500 font-medium">ECON-510 • Seminar Hall A</span>
                      </td>
                      <td className="px-4 py-5 font-medium">45</td>
                      <td className="px-4 py-5">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold">PENDING</span>
                      </td>
                      <td className="px-4 py-5 rounded-r-xl w-48">
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full w-[40%]"></div>
                        </div>
                        <span className="text-[10px] mt-1 block font-bold text-slate-500">40% Syllabus Uploaded</span>
                      </td>
                    </tr>
                    <tr className="bg-surface-container-low/40 rounded-xl overflow-hidden group hover:bg-surface-container transition-colors">
                      <td className="px-4 py-5 font-bold text-primary rounded-l-xl">
                        Global Markets Analysis
                        <span className="block text-[10px] text-slate-500 font-medium">INT-202 • Virtual Hall</span>
                      </td>
                      <td className="px-4 py-5 font-medium">210</td>
                      <td className="px-4 py-5">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">ACTIVE</span>
                      </td>
                      <td className="px-4 py-5 rounded-r-xl w-48">
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[95%]"></div>
                        </div>
                        <span className="text-[10px] mt-1 block font-bold text-slate-500">95% Final Grades</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Timeline Component */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-headline font-extrabold text-primary mb-6">Upcoming Departmental Milestone</h3>
              <div className="relative pl-12 space-y-8">
                <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-primary-fixed"></div>
                
                <div className="relative">
                  <div className="absolute -left-[30px] top-0 w-4 h-4 rounded-full border-4 border-surface bg-primary z-10"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oct 12, 2024</p>
                    <h4 className="font-bold text-primary">Syllabus Review Committee</h4>
                    <p className="text-sm text-on-surface-variant">Central Board Room • 02:00 PM</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[30px] top-0 w-4 h-4 rounded-full border-4 border-surface bg-surface-container-highest z-10"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oct 15, 2024</p>
                    <h4 className="font-bold text-slate-600">Mid-term Research Proposals Due</h4>
                    <p className="text-sm text-slate-400">Electronic submission system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Widgets */}
          <div className="space-y-8">
            {/* Student Records Quick-Access Widget */}
            <div className="bg-surface-container-high rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-headline font-extrabold text-primary mb-6">Student Records</h3>
              <div className="relative mb-6">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">person_search</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                  placeholder="Quick find student..." 
                  type="text" 
                />
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
                
                <div className="flex items-center gap-4 group cursor-pointer">
                  <img 
                    alt="Student Profile" 
                    className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuArGEetsELlLC8Rdi_RTe1-I3LjSUIpETxLh8bE3dxo-tjFqoSXpjlsx59-L5un5RkhHqAeCYf6TTUFJUkgkV-LJidkY_RzkyS1goUiaaAYBJLPZh6HTtsbeP87NXkxct3jLRTAhn7Fo7omnNaDhqB3N2EKhd2d1rg5zjvGyOmbPFqHgXPE2ln8rENIPOSnEYIO7ziejn6wMJN96bAU7bfjLq6spqPNJxXyYMLpUCIhwZKSVjWPJ-Bss6o_RNVcElvw03N99X1tRy6W" 
                  />
                  <div>
                    <p className="text-sm font-bold text-primary">Leo Sterling</p>
                    <p className="text-[10px] text-slate-500 font-medium">Request: Transcript Approval</p>
                  </div>
                  <button className="ml-auto text-primary">
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-4 group cursor-pointer">
                  <img 
                    alt="Student Profile" 
                    className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu-UA6hSoBe9Xh7cmfNww3Eg1GPvBVeN9Y5FU9_xKF3CQfbyKQUlXKCcrqwRBlRWDEmmY1QeQ9WgScPskOcGO_bnipsJKKsStpuYsV8-LtYtrXrLfwDOdhh5AGjXobPz0_f9N6xuuk-mcD7nXW8u4oGh0tegTTweITvwFR3r_Y9yxrAvbjt04RGDTY8hvGdw2bfM8ms1Y_X-FWJZ3z0QjkvZZgaPBMv7tidZKnBeiKxEcoRjDF-xxnfabh_y8yG2gUElCbf3KxhpTz" 
                  />
                  <div>
                    <p className="text-sm font-bold text-primary">Maya Ito</p>
                    <p className="text-[10px] text-slate-500 font-medium">Graded: Research Paper B+</p>
                  </div>
                  <button className="ml-auto text-primary">
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                </div>
              </div>
              
              <button className="w-full mt-8 py-3 bg-primary text-white rounded-xl font-bold font-headline text-sm hover:bg-primary-container transition-all">
                Open Full Registry
              </button>
            </div>

            {/* Departmental Alerts Panel */}
            <div className="bg-tertiary-container text-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-on-tertiary-container">campaign</span>
                <h3 className="text-xl font-headline font-extrabold tracking-tight">Departmental Alerts</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-error px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">Urgent</span>
                    <span className="text-[10px] text-on-tertiary-container">10m ago</span>
                  </div>
                  <p className="text-sm font-medium">Budget Reconciliation meeting moved to 3:30 PM today.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-500 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">Update</span>
                    <span className="text-[10px] text-on-tertiary-container">2h ago</span>
                  </div>
                  <p className="text-sm font-medium">Faculty portal maintenance scheduled for Sunday midnight.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-emerald-500 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">Success</span>
                    <span className="text-[10px] text-on-tertiary-container">Yesterday</span>
                  </div>
                  <p className="text-sm font-medium">Annual Academic Grant report has been successfully filed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
