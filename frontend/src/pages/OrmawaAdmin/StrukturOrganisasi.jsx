import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const StrukturOrganisasi = () => {
  const { user, hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [org, setOrg] = useState({
    presiden: { nama: 'Memuat...', nim: '-', role: 'Ketua Umum' },
    wakil: { nama: 'Memuat...', nim: '-', role: 'Wakil Ketua' },
    inti: [],
    divisi: []
  });

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const ormawaId = user?.ormawaId || 1;

  useEffect(() => {
    fetchMembers();
  }, [ormawaId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members?ormawaId=${ormawaId}`);
      const json = await res.json();
      if (json.status === 'success') {
        const data = json.data || [];
        setMembers(data);
        
        // Hierarchy logic:
        const ketua = data.find(m => m.role.toLowerCase().includes('ketua') && !m.parentId) || { student: { name: 'Belum Ada', nim: '-' }, role: 'Ketua Umum' };
        const wakil = data.find(m => m.role.toLowerCase().includes('wakil')) || { student: { name: 'Belum Ada', nim: '-' }, role: 'Wakil Ketua' };
        
        const pengurusInti = data.filter(m => 
          (m.role.toLowerCase().includes('sekretaris') || m.role.toLowerCase().includes('bendahara'))
        ).map(m => ({
          id: m.id,
          nama: m.student?.name || 'Unknown',
          role: m.role
        }));

        const divGroups = {};
        data.forEach(m => {
          if (m.division) {
            if (!divGroups[m.division]) divGroups[m.division] = { kepala: 'Belum Ada', staff: [] };
            if (m.role.toLowerCase().includes('kepala') || m.role.toLowerCase().includes('kadiv')) {
              divGroups[m.division].kepala = m.student?.name || 'Unknown';
            } else {
              divGroups[m.division].staff.push(m);
            }
          }
        });

        const divArray = Object.keys(divGroups).map(d => ({
          nama: d,
          kepala: divGroups[d].kepala,
          kuota: divGroups[d].staff.length,
          staff: divGroups[d].staff
        }));

        setOrg({
          presiden: { id: ketua.id, nama: ketua.student?.name || 'Unknown', nim: ketua.student?.nim, role: ketua.role },
          wakil: { id: wakil.id, nama: wakil.student?.name || 'Unknown', nim: wakil.student?.nim, role: wakil.role },
          inti: pengurusInti,
          divisi: divArray
        });
      }
    } catch (err) {
       console.error("Gagal mengambil anggota", err);
    }
  };

  const openReshuffleModal = () => {
    setSelectedMemberId('');
    setEditRole('');
    setEditDivision('');
    setEditParentId('');
    setIsModalOpen(true);
  };

  const handleMemberSelect = (e) => {
    const id = e.target.value;
    setSelectedMemberId(id);
    const m = members.find(x => x.id.toString() === id);
    if (m) {
       setEditRole(m.role);
       setEditDivision(m.division || '');
       setEditParentId(m.parentId || '');
    }
  };

  const submitReshuffle = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return alert('Pilih anggota terlebih dahulu');
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members/${selectedMemberId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            role: editRole,
            division: editDivision,
            parentId: editParentId ? Number(editParentId) : null
         })
      });
      const data = await res.json();
      if (data.status === 'success') {
         setIsModalOpen(false);
         fetchMembers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen pb-12">
        <TopNavBar />
        
        <div className="pt-24 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Struktur Kepengurusan</h1>
              <p className="text-on-surface-variant text-sm font-medium">Manajemen hierarki (Atasan-Bawahan) dan ploting formasi divisi.</p>
            </div>
            <div className="flex items-center gap-3">
              {hasPermission('struktur', 'edit') && (
                <button 
                  onClick={openReshuffleModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                  Edit Struktur / Reshuffle
                </button>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2.5rem] p-12 overflow-x-auto shadow-sm min-h-[600px] flex flex-col items-center relative">
            <div className="flex flex-col items-center mt-4">
              {/* Leader */}
              <div className="w-64 bg-primary-container text-primary-fixed border-4 border-white shadow-xl rounded-2xl p-6 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-primary rounded-full mb-3 flex items-center justify-center text-white text-2xl overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${org.presiden.id}`} alt="avatar" />
                 </div>
                 <h3 className="font-extrabold font-headline leading-tight">{org.presiden.role}</h3>
                 <p className="text-sm font-semibold mt-1">{org.presiden.nama}</p>
              </div>

              <div className="w-1 h-8 bg-outline-variant/30"></div>

              {/* Vice */}
              <div className="w-56 bg-surface border-2 border-outline-variant/20 shadow-lg rounded-2xl p-4 flex flex-col items-center text-center">
                 <h3 className="font-bold text-sm text-secondary font-headline outline-none">{org.wakil.role}</h3>
                 <p className="text-sm font-semibold text-on-surface mt-1">{org.wakil.nama}</p>
              </div>

              <div className="w-1 h-12 bg-outline-variant/30 relative">
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-[40rem] h-1 bg-outline-variant/30"></div>
              </div>

              {/* Core / Divisions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                {org.divisi.length > 0 ? org.divisi.map((div, i) => (
                  <div key={i} className="bg-surface border border-outline-variant/20 shadow-sm rounded-2xl overflow-hidden min-w-[180px]">
                     <div className="bg-surface-container py-3 px-2 text-center border-b border-outline-variant/10">
                        <h4 className="font-bold text-sm font-headline text-on-surface">{div.nama}</h4>
                     </div>
                     <div className="p-4 text-center">
                        <p className="text-[10px] text-secondary font-label uppercase mb-1">Kepala Divisi</p>
                        <p className="font-bold text-sm text-primary line-clamp-1">{div.kepala}</p>
                        <div className="mt-3 flex justify-center -space-x-2">
                           {div.staff.slice(0,3).map((s, idx) => (
                             <img key={idx} src={`https://i.pravatar.cc/150?u=${s.id}`} className="w-6 h-6 rounded-full border border-white" />
                           ))}
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-2">{div.kuota} Anggota</p>
                     </div>
                  </div>
                )) : <p className="col-span-4 italic text-on-surface-variant py-12">Belum ada divisi yang diplot</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reshuffle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant/20">
            <div className="px-8 py-6 border-b border-outline-variant/10">
               <h2 className="text-2xl font-bold font-headline text-on-surface">Atur Hierarki & Posisi</h2>
            </div>
            
            <form onSubmit={submitReshuffle} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Pilih Fungsionaris</label>
                  <select required value={selectedMemberId} onChange={handleMemberSelect} className="w-full bg-surface-container p-4 rounded-xl border-none outline-none text-sm">
                    <option value="">-- Pilih Anggota --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.student?.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Role / Jabatan</label>
                    <input required value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full bg-surface-container p-4 rounded-xl border-none outline-none text-sm" placeholder="Contoh: Bendahara" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Divisi</label>
                    <input value={editDivision} onChange={e => setEditDivision(e.target.value)} className="w-full bg-surface-container p-4 rounded-xl border-none outline-none text-sm" placeholder="Contoh: Media" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Atasan Langsung (Report To)</label>
                  <select value={editParentId} onChange={e => setEditParentId(e.target.value)} className="w-full bg-surface-container p-4 rounded-xl border-none outline-none text-sm">
                    <option value="">-- Tanpa Atasan (Top Level) --</option>
                    {members.filter(m => m.id.toString() !== selectedMemberId).map(m => (
                      <option key={m.id} value={m.id}>{m.student?.name} ({m.role})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-on-surface-variant mt-2 italic">*Digunakan untuk membangun bagan organisasi hirarkis.</p>
                </div>

                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 font-bold text-on-surface-variant">Batal</button>
                   <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg">Simpan Perubahan</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrukturOrganisasi;
