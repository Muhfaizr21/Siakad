import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const ContentManagement = () => {
    const newsList = [
        { id: 1, title: "Pembukaan Beasiswa Unggulan BKU 2024", category: "Beasiswa", date: "6 April 2024", views: "2,450", status: "Published" },
        { id: 2, title: "Pembaruan Protokol KRS Semester Ganjil", category: "Akademik", date: "5 April 2024", views: "1,200", status: "Published" },
        { id: 3, title: "Informasi Maintenance Sistem (Patch 2.1)", category: "Sistem", date: "4 April 2024", views: "0", status: "Draft" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8 ">
              <header className="flex justify-between items-end ">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase  tracking-widest leading-none">Pusat Berita & Konten</h1>
                  <p className="text-secondary mt-2 font-medium ">Otoritas pusat untuk publikasi informasi resmi ke seluruh ekosistem universitas.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all  leading-tight">
                    Tulis Berita Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2 ">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-tight">Total Artikel</p>
                    <h3 className="text-4xl font-black text-primary  leading-none">124</h3>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2 ">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-tight">Total Pembaca</p>
                    <h3 className="text-4xl font-black text-emerald-600  leading-none">45.2K</h3>
                 </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm ">
                <table className="w-full text-left ">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70  leading-tight">
                      <th className="px-10 py-6">Judul Konten</th>
                      <th className="px-10 py-6 text-center">Kategori</th>
                      <th className="px-10 py-6">Tanggal Rilis</th>
                      <th className="px-10 py-6 text-center">Viewers</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text ">
                    {newsList.map((news, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group ">
                        <td className="px-10 py-6 ">
                            <span className="font-extrabold text-primary uppercase tracking-tight  group-hover:text-blue-700 transition-colors leading-tight">{news.title}</span>
                        </td>
                        <td className="px-10 py-6 text-center ">
                            <span className="px-3 py-1 bg-slate-100 text-secondary text-[9px] font-black rounded-lg border border-outline-variant/10 ">
                                {news.category}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-secondary  opacity-90 leading-tight tracking-tighter uppercase">{news.date}</td>
                        <td className="px-10 py-6 text-center font-black text-primary  leading-none">{news.views}</td>
                        <td className="px-10 py-6 ">
                            <div className="flex items-center gap-2.5 ">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest  border ${
                                    news.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                    {news.status}
                                </span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right ">
                           <button className="px-4 py-3 hover:bg-primary/5 rounded-xl text-primary transition-all  leading-none">
                                <span className="material-symbols-outlined text-[20px] ">edit_note</span>
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>
        </div>
    )
}

export default ContentManagement;
