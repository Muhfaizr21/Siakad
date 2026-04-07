import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const KeuanganKas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, hasPermission } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    nominal: '',
    category: 'Operasional',
    type: 'keluar',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (ormawaId) {
      fetchData();
    }
  }, [ormawaId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ormawaService.getFinancials(ormawaId);
      if (data.status === 'success') setTransaksi(data.data || []);
    } catch (e) {
      console.error("Gagal memuat kas:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveMutation = async (e) => {
    e.preventDefault();
    try {
      const data = await ormawaService.addTransaction({
        ...formData,
        nominal: Number(formData.nominal),
        ormawaId: Number(ormawaId)
      });
      if (data.status === 'success') {
        setIsModalOpen(false);
        setFormData({ 
          description: '', 
          nominal: '', 
          category: 'Operasional', 
          type: 'keluar', 
          date: new Date().toISOString().split('T')[0] 
        });
        fetchData();
      }
    } catch (e) { 
      alert(`⚠️ Gagal menyimpan mutasi: ${e.message}`);
    }
  };

  const saldoAktif = (transaksi || []).reduce((acc, curr) => {
    const nominal = Number(curr.nominal) || 0;
    return curr.type === 'masuk' ? acc + nominal : acc - nominal;
  }, 0);

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-20 px-4 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold font-headline mb-1 text-on-surface">Buku Kas & Keuangan</h1>
              <p className="text-on-surface-variant text-xs font-medium leading-relaxed">Laporan keuangan real-time otomatis dari sistem administrasi.</p>
            </div>
            {hasPermission('keuangan', 'create') && (
              <button 
                 onClick={() => setIsModalOpen(true)}
                 className="bg-primary hover:bg-primary-fixed text-white px-5 py-2.5 rounded-xl font-black font-headline shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Tambah Catatan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-primary to-[#00174f] p-6 lg:p-7 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                <div>
                   <h2 className="text-white/60 font-black font-label text-[10px] tracking-widest uppercase mb-1">Saldo Kas Aktif</h2>
                   <p className="text-3xl lg:text-4xl font-black text-white font-headline tracking-tighter leading-none">{formatRp(saldoAktif)}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 px-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                  <h3 className="font-bold text-base font-headline text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                    Buku Besar Historis
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-on-surface">
                    <thead className="bg-surface-container/50 text-[10px] uppercase text-on-surface-variant font-black tracking-[0.15em]">
                      <tr>
                        <th className="px-6 py-3.5">Tgl</th>
                        <th className="px-6 py-3.5">Keterangan</th>
                        <th className="px-6 py-3.5 text-right">Masuk</th>
                        <th className="px-6 py-3.5 text-right">Keluar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-medium">
                       {(transaksi || []).map((trx) => (
                        <tr key={trx.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-6 py-3.5 text-[11px] font-bold text-on-surface-variant opacity-70">
                            {trx.date ? new Date(trx.date).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="block font-bold mb-0.5 text-on-surface text-[13.5px] leading-tight">{trx.description}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] uppercase font-black bg-outline-variant/10 px-1.5 py-0.5 rounded text-on-surface-variant tracking-wider">{trx.category}</span>
                               {trx.proposalId && <span className="text-[9px] text-primary font-black flex items-center gap-0.5 uppercase"><span className="material-symbols-outlined text-[11px]">link</span> PROP #{trx.proposalId}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-right font-black text-emerald-600 text-[13px]">
                            {trx.type === 'masuk' ? formatRp(trx.nominal) : '-'}
                          </td>
                          <td className="px-6 py-3.5 text-right font-black text-rose-600 text-[13px]">
                            {trx.type === 'keluar' ? formatRp(trx.nominal) : '-'}
                          </td>
                        </tr>
                      ))}
                      {transaksi.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center  text-on-surface-variant">Belum ada transaksi tercatat</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
               <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-md font-bold font-headline mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Catatan Keuangan
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Setiap pencairan dana dari proposal yang disetujui Universitas akan otomatis tercatat sebagai "Masuk" di buku kas ini. Pastikan Anda mengunggah bukti nota (LPJ) setelah kegiatan selesai.
                  </p>
               </div>
            </div>
          </div>

          {/* ADD MUTATION MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
               <div className="bg-surface w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 border border-outline-variant/10">
                 <h2 className="text-2xl font-bold font-headline text-primary mb-6">Tambah Catatan Kas</h2>
                 <form onSubmit={saveMutation} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Keterangan / Item</label>
                     <input required placeholder="Ex: Pembelian Banner" className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Nominal (Rp)</label>
                       <input required type="number" placeholder="Ex: 50000" className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30" value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Jenis</label>
                       <select className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                         <option value="keluar">Keluar (-)</option>
                         <option value="masuk">Masuk (+)</option>
                       </select>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Kategori</label>
                       <input required placeholder="Ex: Konsumsi" className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Tanggal</label>
                       <input required type="date" className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                     </div>
                   </div>
                   
                   <div className="pt-6 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-on-surface-variant font-bold">Batal</button>
                     <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg">Simpan Mutasi</button>
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


export default KeuanganKas;
