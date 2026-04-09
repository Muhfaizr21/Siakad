import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const JadwalKegiatan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // New state for custom picker
  const [editingId, setEditingId] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [currDate, setCurrDate] = useState(new Date()); // New state for navigation
  const [formData, setFormData] = useState({
    title: '', date: '', startTime: '', endTime: '', location: '', type: 'internal', reminder: false
  });

  const openAddModal = (initialDate = null) => {
    setFormData({
      title: '', 
      date: initialDate || '', 
      startTime: '', 
      endTime: '', 
      location: '', 
      type: 'internal', 
      reminder: false
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchEvents();
  }, [ormawaId]);

  const fetchEvents = async () => {
    try {
      const data = await ormawaService.getEvents(ormawaId);
      if (data.status === 'success') setEvents(data.data || []);
    } catch (e) { console.error(e); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Hapus permanen kegiatan ini?")) return;
    try {
       await ormawaService.deleteEvent(id);
       fetchEvents();
    } catch (e) { console.error(e); }
  };

  const loadEventForEdit = (ev) => {
    setEditingId(ev.ID);
    setFormData({
      title: ev.Judul,
      date: ev.TanggalMulai ? ev.TanggalMulai.split('T')[0] : '',
      startTime: ev.TanggalMulai ? new Date(ev.TanggalMulai).toTimeString().slice(0,5) : '',
      endTime: ev.TanggalSelesai ? new Date(ev.TanggalSelesai).toTimeString().slice(0,5) : '',
      location: ev.Lokasi,
      type: ev.Deskripsi || 'internal',
      reminder: false
    });
    setIsModalOpen(true);
  };

  const getDayGrid = () => {
    const year = currDate.getFullYear();
    const month = currDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let grid = [];
    // Padding from prev month
    for(let i = 0; i < firstDay; i++) {
       grid.push({ type: 'empty', id: `empty-${i}` });
    }
    // Days in current month
    for(let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      grid.push({ type: 'day', dateStr, dayNum: i });
    }
    return grid;
  };

  const days = getDayGrid();

  const changeMonth = (offset) => {
    setCurrDate(new Date(currDate.getFullYear(), currDate.getMonth() + offset, 1));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setConflictWarning(null); 
  };

  const checkConflict = () => {
    const conflict = (events || []).find(ev => ev.TanggalMulai && ev.TanggalMulai.startsWith(formData.date) && ev.Status === 'terjadwal');
    if(conflict) {
      setConflictWarning(`Peringatan Konflik! Sudah ada kegiatan: "${conflict.Judul}" pada lokasi ${conflict.Lokasi} di hari yang sama.`);
      return true;
    }
    return false;
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    if(checkConflict() && !conflictWarning) return; 
    
    try {
      // Fix time formatting if user uses "." instead of ":"
      const startTime = formData.startTime.replace('.', ':');
      const endTime = formData.endTime.replace('.', ':');

      if (!formData.date || !startTime || !endTime) {
         throw new Error("Tanggal dan Jam wajib diisi dengan benar.");
      }

      const payload = {
        Judul: formData.title,
        Deskripsi: formData.type,
        TanggalMulai: new Date(`${formData.date}T${startTime}`).toISOString(),
        TanggalSelesai: new Date(`${formData.date}T${endTime}`).toISOString(),
        Lokasi: formData.location,
        OrmawaID: Number(ormawaId),
        Status: 'terjadwal'
      };

      if (editingId) {
        await ormawaService.updateEvent(editingId, payload);
      } else {
        await ormawaService.createEvent(payload);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', date: '', startTime: '', endTime: '', location: '', type: 'internal', reminder: false });
      fetchEvents();
      alert("✅ Jadwal berhasil disimpan!");
    } catch (e) { 
      console.error("Save error:", e);
      alert(`⚠️ Gagal menyimpan: ${e.message}. Pastikan format jam benar (HH:mm)`);
    }
  };

  const cancelEvent = async (id) => {
    if (!window.confirm("Hapus kegiatan ini?")) return;
    try {
      await ormawaService.updateEvent(id, { Status: 'dibatalkan' });
      fetchEvents();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-20 px-4 lg:px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="max-w-xl">
              <h1 className="text-xl lg:text-2xl font-extrabold font-headline mb-1 text-on-surface">Jadwal & Kalender</h1>
              <p className="text-on-surface-variant text-[12px] font-medium leading-relaxed">Manajemen operasional dan blokir jadwal demi kelancaran kegiatan.</p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/20 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${viewMode === 'calendar' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  Kalender
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">view_list</span>
                  Daftar
                </button>
            </div>
          </div>

          <div className="mb-6 flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/20 shadow-sm gap-4">
             <div className="flex items-center justify-between xl:justify-start gap-1">
                <button onClick={() => changeMonth(-1)} className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                
                <button 
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="px-4 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center gap-2 text-primary border border-outline-variant/10 flex-1 xl:flex-none transition-colors"
                >
                    <span className="material-symbols-outlined text-primary text-[18px]">event_note</span>
                    <span className="text-sm font-black font-headline tracking-tight whitespace-nowrap">
                      {currDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="material-symbols-outlined text-outline text-[16px]">expand_more</span>
                </button>

                <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>

                {/* Custom Date Picker Popup */}
                {isDatePickerOpen && (
                  <div className="absolute top-[3.5rem] left-0 z-[100] bg-white border border-outline-variant/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-6 animate-in fade-in slide-in-from-top-2 duration-300 min-w-[340px] backdrop-blur-md">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/10">
                      <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest">Pilih Waktu</h3>
                      <button onClick={() => setIsDatePickerOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((m, i) => (
                        <button 
                          key={m}
                          onClick={() => {
                            setCurrDate(new Date(currDate.getFullYear(), i, 1));
                            setIsDatePickerOpen(false);
                          }}
                          className={`py-3 rounded-xl text-xs font-bold transition-all ${currDate.getMonth() === i ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'hover:bg-surface-container text-on-surface-variant'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 border-t border-outline-variant/10 pt-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 100 }, (_, i) => 2000 + i).map(y => (
                        <button 
                          key={y}
                          id={y === currDate.getFullYear() ? 'selected-year' : ''}
                          onClick={() => {
                            setCurrDate(new Date(y, currDate.getMonth(), 1));
                            setIsDatePickerOpen(false);
                          }}
                          className={`py-3 rounded-xl text-xs font-bold transition-all ${currDate.getFullYear() === y ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'hover:bg-surface-container text-on-surface-variant'}`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <div className="flex gap-3">
                <button 
                  onClick={() => setCurrDate(new Date())}
                  className="px-4 py-2 bg-surface-container-high text-on-surface-variant font-bold rounded-xl border border-outline-variant/20 transition-all hover:bg-surface-container-highest active:scale-95 flex items-center gap-2 text-[11px] uppercase tracking-wider"
                >
                  Hari Ini
                </button>
                <button 
                   onClick={() => openAddModal()}
                   className="px-4 py-2 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 text-[11px] uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span> Tambah Kegiatan
                </button>
             </div>
          </div>

           {/* Render Calendar View */}
          {viewMode === 'calendar' && (
            <div className="overflow-x-auto no-scrollbar pb-6">
              <div className="min-w-[800px] grid grid-cols-7 gap-px bg-outline-variant/20 border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="bg-surface-container-low text-center py-3 font-bold text-[11px] text-secondary uppercase tracking-[0.2em]">{day}</div>
              ))}
              
              {days.map(item => {
                 if (item.type === 'empty') return <div key={item.id} className="bg-surface-container-low/20 h-24 border-t border-outline-variant/10"></div>;
                 
                 const dateStr = item.dateStr;
                 const dayEvents = (events || []).filter(e => e.TanggalMulai && e.TanggalMulai.startsWith(dateStr));
                 return (
                   <div 
                     key={dateStr} 
                     onClick={() => openAddModal(dateStr)}
                     className="bg-surface p-2 h-24 hover:bg-surface-container-lowest transition-all relative border-t border-outline-variant/10 overflow-y-auto cursor-pointer group/day"
                   >
                     <div className="flex justify-between items-start mb-1">
                       <span className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant group-hover/day:bg-primary group-hover/day:text-white transition-colors">
                         {item.dayNum}
                       </span>
                       <span className="material-symbols-outlined text-[14px] opacity-0 group-hover/day:opacity-100 text-primary transition-opacity">add</span>
                     </div>
                     <div className="flex flex-col gap-1">
                       {dayEvents.map(ev => (
                         <div 
                           key={ev.ID} 
                           onClick={(e) => e.stopPropagation()} // Prevent opening modal when clicking on event
                           className="px-2 py-1 flex flex-col rounded-md text-[10px] font-semibold border-l-2 leading-tight bg-blue-50 border-blue-500 text-blue-700"
                         >
                           <span className="truncate">{ev.TanggalMulai ? new Date(ev.TanggalMulai).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''} {ev.Judul}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )
              })}
            </div>
          </div>
          )}

          {/* Render List View */}
          {viewMode === 'list' && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                 <thead className="bg-surface-container-low/50 text-[10px] uppercase text-on-surface-variant font-black tracking-widest border-b border-outline-variant/20">
                   <tr>
                     <th className="px-5 py-3.5">Informasi Kegiatan</th>
                     <th className="px-5 py-3.5">Waktu & Tempat</th>
                     <th className="px-5 py-3.5 text-center">Status</th>
                     <th className="px-5 py-3.5 text-right">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-outline-variant/10">
                    {(events || []).map((ev) => (
                      <tr key={ev.ID} className="hover:bg-surface-container-low/30 group">
                        <td className="px-6 py-4">
                          <div className="font-bold font-headline text-base text-primary mb-1">{ev.Judul}</div>
                          <div className="text-xs font-semibold text-on-surface-variant flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md ${ev.Deskripsi === 'internal' ? 'bg-blue-100 text-blue-700' : ev.Deskripsi === 'eksternal' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {ev.Deskripsi ? ev.Deskripsi.toUpperCase() : 'EVENT'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">{new Date(ev.TanggalMulai).toLocaleDateString()}</div>
                          <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {new Date(ev.TanggalMulai).toLocaleTimeString()} - {new Date(ev.TanggalSelesai).toLocaleTimeString()}</div>
                          <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {ev.Lokasi}</div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {ev.Status === 'terjadwal' ? (
                            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">Terjadwal</span>
                          ) : (
                            <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider line-through">{ev.Status || 'Selesai'}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => loadEventForEdit(ev)} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                            <button onClick={() => deleteEvent(ev.ID)} className="p-1.5 text-on-surface-variant hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            {ev.Status === 'terjadwal' && (
                              <button onClick={() => cancelEvent(ev.ID)} className="p-1.5 text-on-surface-variant hover:text-amber-600 transition-colors" title="Batalkan Kegiatan"><span className="material-symbols-outlined text-[18px]">block</span></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 text-[13px]">
               <div className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant/10">
                  <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                    <div>
                      <h2 className="text-xl font-black font-headline text-primary flex items-center gap-2 uppercase tracking-tight">
                        <span className="material-symbols-outlined text-[20px]">{editingId ? 'edit' : 'edit_calendar'}</span> {editingId ? 'Update' : 'Setup Kegiatan'}
                      </h2>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); setConflictWarning(null); }} className="w-8 h-8 hover:bg-rose-50 hover:text-rose-600 rounded-full flex justify-center items-center text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                  </div>

                  <form onSubmit={saveEvent} className="p-8">
                    
                    {conflictWarning && (
                      <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex gap-3 shadow-inner">
                        <span className="material-symbols-outlined flex-shrink-0 animate-pulse">warning</span>
                        <div>
                          <p className="font-bold text-sm">Bentrok Jadwal Ditemukan!</p>
                          <p className="text-xs mt-1 leading-relaxed">{conflictWarning}</p>
                          <button type="button" onClick={() => setConflictWarning(null)} className="mt-2 text-xs font-bold underline hover:text-rose-900">Tetap Paksakan Simpan</button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Nama Kegiatan</label>
                        <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium" placeholder="Ex: Pelatihan Desain Grafis" />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Tanggal Pelaksanaan</label>
                        <input required name="date" value={formData.date} onChange={handleInputChange} type="date" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium cursor-pointer" />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Kategori Skala</label>
                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-bold appearance-none">
                           <option value="internal">Rapat Internal</option>
                           <option value="eksternal">Event Kampus (Eksternal)</option>
                           <option value="sosial">Sosial / Pengabdian</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Jam Mulai</label>
                        <input required name="startTime" value={formData.startTime} onChange={handleInputChange} type="time" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Jam Selesai</label>
                        <input required name="endTime" value={formData.endTime} onChange={handleInputChange} type="time" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium" />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Lokasi / Ruangan</label>
                        <input required name="location" value={formData.location} onChange={handleInputChange} type="text" className="w-full p-4 bg-surface-container flex border border-outline-variant/20 rounded-xl focus:border-primary text-sm font-medium" placeholder="Ex: Auditorium Gedung B" />
                      </div>

                      <div className="col-span-2 mt-2 bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-row items-center justify-between">
                         <div>
                            <h4 className="font-bold text-primary font-headline text-sm">Aktifkan Pengingat Otomatis (H-1)</h4>
                            <p className="text-xs text-on-surface-variant font-medium mt-1">Kirim broadcast notifikasi via platform dan email ke semua anggota pengurus.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" name="reminder" checked={formData.reminder} onChange={handleInputChange} className="sr-only peer" />
                           <div className="w-14 h-7 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                         </label>
                      </div>

                    </div>

                    <div className="flex gap-4 pt-4 border-t border-outline-variant/10">
                      <button type="button" onClick={() => checkConflict()} className="flex-1 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-bold transition-all text-sm border border-outline-variant/30 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">rule</span>
                        Cek Konflik Area
                      </button>
                      <button type="submit" className="flex-1 py-4 bg-primary hover:bg-primary-fixed hover:-translate-y-1 text-white rounded-xl font-bold transition-all text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Simpan Jadwal Utama
                      </button>
                    </div>

                  </form>

               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default JadwalKegiatan;
