import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const StrukturOrganisasi = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  const [newDivName, setNewDivName] = useState('');
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
    fetchDivisions();
  }, [ormawaId]);

  const fetchDivisions = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/divisions?ormawaId=${ormawaId}`);
      const json = await res.json();
      if (json.status === 'success') setDivisions(json.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (members.length >= 0) {
      // Root: Ketua/Presiden yang tidak punya atasan
      const ketua = members.find(m => (m.role.toLowerCase().includes('ketua') || m.role.toLowerCase().includes('presiden')) && !m.parentId) 
                  || members[0] 
                  || { student: { name: 'Belum Ada', nim: '-' }, role: 'Ketua Umum' };

      // Wakil: Bawahan langsung ketua dengan role wakil
      const wakil = members.find(m => m.parentId === ketua.id && m.role.toLowerCase().includes('wakil'))
                  || members.find(m => m.role.toLowerCase().includes('wakil'))
                  || { student: { name: 'Belum Ada', nim: '-' }, role: 'Wakil Ketua' };
      
      const pengurusInti = members.filter(m => 
        m.id !== ketua.id && m.id !== wakil.id && 
        (m.parentId === ketua.id || m.parentId === wakil.id || (!m.division || m.division === 'INTI'))
      ).map(m => ({
        id: m.id,
        nama: m.student?.name || 'Unknown',
        role: m.role
      }));

      // Group by Divisions (Showing ALL created divisions)
      const officialDivNames = new Set(divisions.map(d => d.name));
      const divArray = divisions.map(d => {
        const staffInDiv = members.filter(m => m.division === d.name);
        const kepala = staffInDiv.find(m => 
          m.role.toLowerCase().includes('kepala') || 
          m.role.toLowerCase().includes('kadiv') || 
          m.role.toLowerCase().includes('koordinator')
        )?.student?.name || 'Belum Ada';

        return {
          nama: d.name,
          kepala: kepala,
          kuota: staffInDiv.length,
          staff: staffInDiv
        };
      });

      // Add "Other" divisions that members might have but aren't in official list
      const adhocDivs = [];
      members.forEach(m => {
        if (m.division && m.division !== 'INTI' && !officialDivNames.has(m.division)) {
           // Find if already added to adhoc
           let existing = adhocDivs.find(a => a.nama === m.division);
           if (!existing) {
             existing = { nama: m.division, kepala: 'Belum Ada', kuota: 0, staff: [] };
             adhocDivs.push(existing);
           }
           if (m.role.toLowerCase().includes('kepala')) existing.kepala = m.student?.name;
           else existing.staff.push(m);
           existing.kuota++;
        }
      });

      setOrg({
        presiden: { id: ketua.id, nama: ketua.student?.name || 'Unknown', nim: ketua.student?.nim, role: ketua.role },
        wakil: { id: wakil.id, nama: wakil.student?.name || 'Unknown', nim: wakil.student?.nim, role: wakil.role },
        inti: pengurusInti,
        divisi: [...divArray, ...adhocDivs]
      });
    }
  }, [members, divisions]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members?ormawaId=${ormawaId}`);
      const json = await res.json();
      if (json.status === 'success') {
        setMembers(json.data || []);
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

  const handleAddDivision = async (e) => {
    e.preventDefault();
    if (!newDivName) return;
    try {
      const res = await fetch('http://localhost:8000/api/ormawa/divisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ormawaId: Number(ormawaId), name: newDivName })
      });
      if (res.ok) {
        setNewDivName('');
        setIsDivModalOpen(false);
        fetchDivisions();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-20 px-4 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold font-headline mb-1 text-on-surface text-primary">Struktur Kepengurusan</h1>
              <p className="text-on-surface-variant text-xs font-medium leading-relaxed">Manajemen hierarki & ploting formasi divisi.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDivModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-primary font-black rounded-xl border border-primary/20 shadow-sm hover:bg-white transition-all text-xs uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                Divisi
              </button>
              {hasPermission('struktur', 'edit') && (
                <button 
                  onClick={openReshuffleModal}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black rounded-xl shadow-lg hover:-translate-y-0.5 transition-all outline-none text-xs uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[16px]">group_add</span>
                  Edit Struktur
                </button>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 lg:p-10 overflow-x-auto shadow-sm min-h-[500px] flex flex-col items-center relative">
            <div className="flex flex-col items-center mt-2">
              {/* Leader */}
              <div className="w-56 bg-primary-container text-primary-fixed border-[3px] border-white shadow-xl rounded-2xl p-4 flex flex-col items-center text-center">
                 <div className="w-14 h-14 bg-primary rounded-full mb-2 flex items-center justify-center text-white text-xl overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${org.presiden.id}`} alt="avatar" />
                 </div>
                 <h3 className="font-black font-headline leading-tight text-[15px] uppercase tracking-tight">{org.presiden.role}</h3>
                 <p className="text-xs font-bold mt-1 opacity-80">{org.presiden.nama}</p>
              </div>

              <div className="w-0.5 h-6 bg-outline-variant/30"></div>

              {/* Vice */}
              <div className="w-48 bg-surface border border-outline-variant/20 shadow-md rounded-2xl p-3 flex flex-col items-center text-center">
                 <h3 className="font-black text-[11px] text-secondary font-headline uppercase tracking-wider">{org.wakil.role}</h3>
                 <p className="text-xs font-bold text-on-surface mt-0.5">{org.wakil.nama}</p>
              </div>

              <div className="w-0.5 h-10 bg-outline-variant/20 relative">
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-[30rem] h-0.5 bg-outline-variant/20"></div>
              </div>

              {/* Core / Divisions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {org.divisi.length > 0 ? org.divisi.map((div, i) => (
                  <div key={i} className="bg-surface border border-outline-variant/20 shadow-sm rounded-xl overflow-hidden min-w-[170px]">
                     <div className="bg-surface-container py-3 px-4 flex justify-between items-center border-b border-outline-variant/10">
                        <h4 className="font-bold text-sm font-headline text-on-surface">{div.nama}</h4>
                        <button 
                          onClick={async (e) => {
                             e.stopPropagation();
                             const d = divisions.find(dv => dv.name === div.nama);
                             if (d && window.confirm(`Hapus divisi ${div.nama}?`)) {
                               await fetch(`http://localhost:8000/api/ormawa/divisions/${d.id}`, { method: 'DELETE' });
                               fetchDivisions();
                               fetchMembers();
                             }
                          }}
                          className="w-6 h-6 rounded-md hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                     </div>
                     <div className="p-4 text-center">
                        <p className="text-[9px] text-secondary font-black uppercase tracking-[0.15em] mb-1 opacity-60">Kadiv</p>
                        <p className="font-bold text-[12.5px] text-primary line-clamp-1 leading-tight">{div.kepala}</p>
                        <div className="mt-2.5 flex justify-center -space-x-1.5">
                           {div.staff.slice(0,3).map((s, idx) => (
                             <img key={idx} src={`https://i.pravatar.cc/150?u=${s.id}`} className="w-5 h-5 rounded-full border border-white shadow-sm" />
                           ))}
                        </div>
                        <p className="text-[9px] font-black text-on-surface-variant mt-2 tracking-widest uppercase opacity-50">{div.kuota} Anggota</p>
                     </div>
                  </div>
                )) : <p className="col-span-4 text-[13px] text-on-surface-variant py-8 font-medium">Belum ada divisi yang diplot</p>}
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
                    <select value={editDivision} onChange={e => setEditDivision(e.target.value)} className="w-full bg-surface-container p-4 rounded-xl border-none outline-none text-sm">
                      <option value="">-- Tanpa Divisi (Inti) --</option>
                      {divisions.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
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
                  <p className="text-[10px] text-on-surface-variant mt-2 ">*Digunakan untuk membangun bagan organisasi hirarkis.</p>
                </div>

                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 font-bold text-on-surface-variant">Batal</button>
                   <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg">Simpan Perubahan</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Division Modal */}
      {isDivModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant/20">
            <div className="px-8 py-6 border-b border-outline-variant/10">
               <h2 className="text-xl font-bold font-headline text-on-surface">Tambah Divisi Baru</h2>
            </div>
            <form onSubmit={handleAddDivision} className="p-8 space-y-4">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Nama Divisi</label>
                  <input required autoFocus value={newDivName} onChange={e => setNewDivName(e.target.value)} className="w-full bg-surface-container p-4 rounded-xl border-none outline-none text-sm" placeholder="Contoh: Divisi Kaderisasi" />
               </div>
               <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsDivModalOpen(false)} className="w-full py-3 font-bold text-on-surface-variant">Batal</button>
                  <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg">Buat Divisi</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrukturOrganisasi;
