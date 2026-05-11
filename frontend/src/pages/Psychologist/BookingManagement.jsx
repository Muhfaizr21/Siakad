import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  Search, Filter, Calendar, Clock, 
  CheckCircle2, XCircle, ChevronRight,
  ClipboardList, AlertCircle, Users
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function BookingManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const tabs = ['Semua', 'Menunggu', 'Dikonfirmasi', 'Selesai', 'Ditolak'];

  const initialBookings = [
    {
      id: 1,
      name: 'Ahmad Rizki Pratama',
      nim: '2021310001',
      date: '12 Mei 2026',
      time: '09:00',
      issue: 'Stres Akademik',
      status: 'Menunggu',
      avatar: 'AR',
    },
    {
      id: 2,
      name: 'Siti Rahayu Putri',
      nim: '2022310042',
      date: '12 Mei 2026',
      time: '10:30',
      issue: 'Anxiety',
      status: 'Dikonfirmasi',
      avatar: 'SR',
    },
  ];

  const [bookings, setBookings] = useState(initialBookings);

  const filteredBookings = bookings.filter(b => {
    const matchesTab = selectedTab === 'Semua' || b.status === selectedTab;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.nim.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const handleAction = (id, newStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Compact Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-black text-primary uppercase tracking-tight">Janji Temu</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola permintaan sesi konseling</p>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 w-full md:w-48"
                  />
               </div>
               <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary shadow-sm">
                  <Filter className="size-4" />
               </button>
            </div>
          </div>

          {/* Compact Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`
                  px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all
                  ${selectedTab === tab 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-white text-slate-400 hover:text-primary border border-slate-100'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Compact Rows (Like Student Portal) */}
          <div className="space-y-2">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id} 
                onClick={() => navigate(`/psychologist/bookings/${booking.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                  {booking.avatar}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h5 className="font-bold text-sm text-on-surface">{booking.name}</h5>
                  <p className="text-[10px] text-on-surface-variant">NIM: {booking.nim} • {booking.issue}</p>
                </div>

                <div className="flex gap-6 text-center md:text-right px-4 border-x border-slate-50 md:border-y-0 py-2 md:py-0">
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Waktu</p>
                    <p className="text-[10px] font-bold text-on-surface">{booking.date}</p>
                    <p className="text-[9px] text-slate-400">{booking.time}</p>
                  </div>
                  <div className="flex items-center">
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-500`}>
                        {booking.status}
                     </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {booking.status === 'Menunggu' ? (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Ditolak'); }}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                      >
                        <XCircle size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(booking.id, 'Dikonfirmasi'); }}
                        className="p-2 bg-primary text-white rounded-lg hover:shadow-md transition-all"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="p-2 text-slate-300 group-hover:text-primary transition-all">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
