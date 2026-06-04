import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;



export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    let ignore = false;
    psychologistService.getBookingDetail(id).then((res) => {
      if (!ignore) setBooking({ ...res.data, color: 'bg-primary' });
    });
    return () => { ignore = true; };
  }, [id]);

  const handleStatus = async (status, link = '') => {
    await psychologistService.updateBookingStatus(id, status, '', link);
    setBooking((prev) => ({ ...prev, status, link_meeting: link }));
  };

  const handleConfirmClick = () => {
    if (booking.mode === 'Online') {
      setMeetingLink('');
      setShowLinkModal(true);
    } else {
      handleStatus('Dikonfirmasi');
    }
  };

  const submitConfirmWithLink = () => {
    if (!meetingLink.trim()) {
      alert('Harap masukkan link meeting Zoom/Google Meet');
      return;
    }
    setShowLinkModal(false);
    handleStatus('Dikonfirmasi', meetingLink);
  };

  if (!booking) {
    return <div className={UI.layout.canvas}>Memuat detail booking...</div>;
  }

  const history = (booking.history || []).map((item) => ({ ...item, icon: item.type === 'created' ? MessageSquare : Clock, color: item.type === 'created' ? 'text-blue-500' : 'text-amber-500' }));
  const isLocked = booking.status === 'Dikonfirmasi' || booking.status === 'Selesai';

  return (
    <>
      <div className={UI.layout.canvas + " space-y-6"}>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all mb-4 group"
          >
            <span className="material-symbols-outlined size-4 group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Kembali</span>
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            
            <div className="xl:col-span-2 space-y-6">
              
              {/* Compact Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-24 bg-primary-container relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
                   <div className="absolute -bottom-8 left-8">
                      <div className={`size-16 rounded-2xl ${booking.color} text-white flex items-center justify-center text-xl font-black border-4 border-white shadow-md`}>
                        {booking.avatar}
                      </div>
                   </div>
                </div>
                <div className="pt-10 pb-6 px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-primary uppercase tracking-tight">{booking.name}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.nim} • {booking.prodi}</p>
                    </div>
                    <span className="px-4 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest self-start md:self-center">
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[
                      { label: 'Email', value: booking.email, icon: Mail },
                      { label: 'WhatsApp', value: booking.phone, icon: Phone },
                      { label: 'Akademik', value: `Smt ${booking.semester}`, icon: 'menu_book' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
                         <item.icon className="size-3.5 text-slate-400" />
                         <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-[10px] font-bold text-slate-700 truncate">{item.value}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compact Details */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">                    <div className="space-y-3">
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                          <span className="material-symbols-outlined size-4 text-primary" >calendar_month</span>
                          <div>
                             <p className="text-[8px] font-black uppercase text-slate-400">Tanggal</p>
                             <p className="text-xs font-bold text-slate-900">{booking.date}</p>
                          </div>
                       </div>
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                          <span className="material-symbols-outlined size-4 text-primary" >schedule</span>
                          <div>
                             <p className="text-[8px] font-black uppercase text-slate-400">Waktu</p>
                             <p className="text-xs font-bold text-slate-900">{booking.time}</p>
                          </div>
                       </div>
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                          <span className="material-symbols-outlined size-4 text-primary" >
                            {booking.mode === 'Online' ? 'videocam' : 'groups'}
                          </span>
                          <div>
                             <p className="text-[8px] font-black uppercase text-slate-400">Metode & Lokasi</p>
                             <p className="text-xs font-bold text-slate-900">
                               {booking.mode === 'Online' ? 'Online (Zoom)' : 'Tatap Muka'}
                             </p>
                             {booking.mode === 'Online' && booking.link_meeting && (
                               <a 
                                 href={booking.link_meeting.startsWith('http') ? booking.link_meeting : `https://${booking.link_meeting}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-[10px] text-blue-600 font-bold underline block mt-0.5"
                               >
                                 Link: {booking.link_meeting}
                               </a>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-primary text-white space-y-2 relative overflow-hidden flex flex-col justify-center">
                       <span className="material-symbols-outlined absolute -right-4 -bottom-4 size-24 text-white/10" >show_chart</span>
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Isu Utama</p>
                       <p className="text-xl font-black uppercase tracking-tight">{booking.issue}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Catatan Mahasiswa</h4>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                       <p className="text-xs font-medium text-slate-600 italic">"{booking.note}"</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
                 <h3 className="text-[9px] font-black text-primary uppercase tracking-widest">Tindakan</h3>
                 <div className="space-y-2">
                     <button
                       onClick={handleConfirmClick}
                       disabled={isLocked}
                       className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                     >
                        Konfirmasi
                     </button>
                     <button
                       onClick={() => handleStatus('Ditolak')}
                       disabled={isLocked}
                       className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                     >
                        Tolak
                     </button>
                 </div>
                 {isLocked && (
                   <p className="rounded-2xl bg-slate-50 px-4 py-3 text-[10px] font-bold leading-5 text-slate-500">
                     Booking sudah {booking.status.toLowerCase()} dan tidak dapat diubah dari halaman ini.
                   </p>
                 )}
                 <button
                    onClick={() => navigate(`/psychologist/patients/${booking.mahasiswa_id}/medical-record?bookingId=${booking.id}`)}
                    className="w-full py-3 border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary transition-all"
                 >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >description</span> Rekam Medis
                 </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                 <h3 className="text-[9px] font-black text-primary uppercase tracking-widest mb-6">Riwayat</h3>
                 <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                     {history.map((item, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                         <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                            <item.icon className={`size-4 ${item.color}`} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{item.action}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

          </div>
        </div>

      {/* Zoom / Meeting Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary px-6 py-5 text-white">
              <h3 className="text-lg font-black uppercase tracking-tight font-headline">Konfirmasi Sesi Online</h3>
              <p className="text-xs text-white/70 mt-1">Sesi ini diajukan secara Online. Harap masukkan link Zoom atau Google Meet untuk mahasiswa.</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Meeting</label>
                <input
                  type="text"
                  placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLinkModal(false); }}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={submitConfirmWithLink}
                  className="flex-1 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/95 transition-all shadow-sm"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
