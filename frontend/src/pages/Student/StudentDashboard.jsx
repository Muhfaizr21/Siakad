import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const StudentDashboard = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* TopNavBar */}
      <TopNavBar />

      {/* SideNavBar */}
      <Sidebar />


      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-20 px-6 pb-12">
        {/* Personalized Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl mb-8 group h-64 flex items-center">
          <div className="absolute inset-0 bg-primary-container z-0">
            <img 
              alt="University Campus Banner" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHAROtt4y_unsM6PwetGzvJHcKdd0q-PcrrzEl134_ooCuVYawiWIdNLavxuKfGbNVS4RGW_qPj9D0i-PDCtuNHOXuCln4tO-AHo8HqF-BfYBSwMgVN5DcmNJmYvpT0lQUf_5B6EbryoYol-E5XUawxybe146AYXKkB6BdNgLWfh5R1ODj-IXOsrHVRB_QYSRUDmoZozivae-c2MoIOOF_8bLIxD81y-E1-YrWDxmT1o_FpfYRQeI_grAGaWsW2SggARoLW1JFA0LG" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
          </div>
          <div className="relative z-10 px-10">
            <h1 className="text-4xl font-extrabold text-white font-headline mb-3 tracking-tight">Welcome back, Alex!</h1>
            <p className="text-on-primary-container text-lg font-medium max-w-md">You have 3 upcoming assignments and 1 class today. Stay focused!</p>
            <div className="mt-6 flex gap-4">
              <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
                View Today's Tasks
              </button>
              <button className="bg-primary/20 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/40 transition-all">
                Library Access
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Stats - Col 4 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-6 font-headline">Academic Progress</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-on-surface-variant font-medium">GPA</span>
                    <span className="text-2xl font-black text-primary font-headline">3.75</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[93%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-on-surface-variant font-medium">Credits</span>
                    <span className="text-2xl font-black text-primary font-headline">96 / 144</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[66%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-on-surface-variant font-medium">Attendance</span>
                    <span className="text-2xl font-black text-primary font-headline">95%</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary-fixed-variant w-[95%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Schedule Widget */}
            <div className="bg-secondary-container/30 p-6 rounded-3xl border border-secondary-container">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-on-secondary-container font-headline">Today's Class</h3>
                <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-secondary">LIVE NOW</span>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">architecture</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-lg">Modern Architecture II</h4>
                  <p className="text-on-secondary-container text-sm font-medium">Prof. Julian Vane</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-secondary gap-2">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>14:00 - 15:30</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary gap-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>Hall 4B, Humanities Building</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">
                Join Online Session
              </button>
            </div>
          </div>

          {/* Deadlines and Grades - Col 8 */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button className="group flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-3xl hover:bg-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">local_library</span>
                <span className="text-sm font-bold font-headline">Library</span>
              </button>
              <button className="group flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-3xl hover:bg-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">computer</span>
                <span className="text-sm font-bold font-headline">E-Learning</span>
              </button>
              <button className="group flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-3xl hover:bg-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">support_agent</span>
                <span className="text-sm font-bold font-headline">Services</span>
              </button>
              <button className="group flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-3xl hover:bg-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">account_balance_wallet</span>
                <span className="text-sm font-bold font-headline">Finance</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Upcoming Deadlines */}
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-primary font-headline">Upcoming Deadlines</h3>
                  <button className="text-primary text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                    <div className="bg-error/10 text-error p-2 rounded-lg">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-on-surface">Final Dissertation Draft</h5>
                      <p className="text-xs text-on-surface-variant">Architecture History</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-error">In 2 days</p>
                      <p className="text-[10px] text-outline">Oct 24</p>
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                    <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-on-surface">Case Study Analysis</h5>
                      <p className="text-xs text-on-surface-variant">Urban Design</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-on-surface">In 5 days</p>
                      <p className="text-[10px] text-outline">Oct 27</p>
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                    <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
                      <span className="material-symbols-outlined">quiz</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-on-surface">Mid-term Quiz</h5>
                      <p className="text-xs text-on-surface-variant">Structural Engineering</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-on-surface">In 1 week</p>
                      <p className="text-[10px] text-outline">Oct 30</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Grades */}
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-primary font-headline">Recent Grades</h3>
                  <button className="text-primary text-sm font-bold hover:underline">Full Report</button>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
                    <div>
                      <h5 className="font-bold text-sm text-on-surface">Environmental Physics Quiz</h5>
                      <p className="text-xs text-on-surface-variant">Physics for Architects</p>
                    </div>
                    <div className="bg-primary/5 px-3 py-1 rounded-full">
                      <span className="text-sm font-black text-primary">A-</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
                    <div>
                      <h5 className="font-bold text-sm text-on-surface">CAD Modelling Project</h5>
                      <p className="text-xs text-on-surface-variant">Digital Design</p>
                    </div>
                    <div className="bg-primary/5 px-3 py-1 rounded-full">
                      <span className="text-sm font-black text-primary">A+</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-on-surface">Sociology Essay</h5>
                      <p className="text-xs text-on-surface-variant">Urban Sociology</p>
                    </div>
                    <div className="bg-primary/5 px-3 py-1 rounded-full">
                      <span className="text-sm font-black text-primary">B+</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 relative h-32 bg-primary/5 rounded-2xl p-4 overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-16 flex items-end px-4 gap-1">
                    <div className="flex-1 bg-primary/20 h-[60%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary/20 h-[75%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary/40 h-[90%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary/20 h-[70%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary/60 h-[85%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary h-[95%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary/30 h-[80%] rounded-t-sm"></div>
                  </div>
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">Academic Performance Trend</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Advisor Mini-Card */}
        <div className="mt-12 p-8 bg-surface-container-high rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                alt="Advisor Avatar" 
                className="w-16 h-16 rounded-full object-cover grayscale" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuSvaDQPSo1_7hV-u2sB0gXjwHuEQwUnqcoiqNNbok8CtrtQLsLlixmjbuhm46CxA_VYLQ9CjYl7QY9IeCeZFkIxMqJ3uUNyIO0EyQCDJ9dOdmx7Ed5F15td_Y-mCUH8ZWd8Oy746YcJDGWbqXLs9E_pPW4bDBTYleoZUiJl-2npU6TMaUdlCB9ChxIPKTC_40tpDl8qoWo6wax5L_ra3YsthP2wM1LrwAJou0ZtFBkm7SafjB6zXNB-x-7FAgEv2kYMndZmPJt2uM" 
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-surface-container-high rounded-full"></div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary font-headline">Need guidance?</h4>
              <p className="text-on-surface-variant">Your advisor, Dr. Sarah Mitchell, is currently online and available for quick chat.</p>
            </div>
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">
            Schedule a Meeting
          </button>
        </div>
      </main>

      {/* Mobile Bottom NavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around items-center h-16 px-4 z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="text-[10px] font-bold">Courses</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[10px] font-bold">Schedule</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined">grade</span>
          <span className="text-[10px] font-bold">Grades</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Floating Action Button - Only on Dashboards */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group transition-all active:scale-90 md:bottom-12 md:right-12 z-40">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  );
};

export default StudentDashboard;
