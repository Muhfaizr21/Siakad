const fs = require('fs');
const path = require('path');

const studentDir = 'd:/siakad/frontend/src/pages/Student';

// Helper function to safely replace content
function patchFile(relativePath, patches) {
  const fullPath = path.join(studentDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${relativePath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf-8');
  let original = content;

  patches.forEach((patch, idx) => {
    if (content.includes(patch.from)) {
      content = content.replace(patch.from, patch.to);
      console.log(`  Patch #${idx + 1} succeeded on ${relativePath}`);
    } else {
      console.log(`  Patch #${idx + 1} did not find exact match in ${relativePath}`);
    }
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Updated: ${relativePath}`);
  }
}

console.log("Applying multi-page alignments...");

// 1. CounselingHistoryPage.jsx
patchFile('CounselingHistoryPage.jsx', [
  // Import PageHeader
  {
    from: "import { PageContent } from '@/components/ui/page';",
    to: "import { PageContent, PageHeader } from '@/components/ui/page';"
  },
  // Replace manual header with PageHeader
  {
    from: "      <div className=\"mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between\">\n        <div>\n          <NavLink to=\"/student/counseling\" className=\"mb-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors hover:text-[bku-primary]\">\n            <ArrowLeft size={16} />\n            Kembali ke jadwal\n          </NavLink>\n          <h1 className=\"text-2xl font-extrabold tracking-tight text-[bku-primary] font-headline\">Riwayat Konseling</h1>\n          <p className=\"mt-1 max-w-2xl text-sm font-medium text-neutral-500\">\n            Pantau booking konseling dan lihat rekam medis yang sudah dicatat psikolog setelah sesi.\n          </p>\n        </div>\n\n        <div className=\"grid grid-cols-2 gap-3 sm:grid-cols-4 md:min-w-[520px]\">\n          {[\n            { label: 'Total Booking', value: history.length },\n            { label: 'Menunggu', value: waitingCount },\n            { label: 'Dikonfirmasi', value: confirmedCount },\n            { label: 'Selesai', value: completedCount },\n          ].map((item) => (\n            <div key={item.label} className=\"rounded-2xl border border-border bg-surface p-4 shadow-sm\">\n              <p className=\"text-[10px] font-bold uppercase tracking-wide text-neutral-400\">{item.label}</p>\n              <p className=\"mt-1 text-2xl font-extrabold text-neutral-900\">{item.value}</p>\n            </div>\n          ))}\n        </div>\n      </div>",
    to: "      <PageHeader \n        title=\"Riwayat Konseling\" \n        subtitle=\"Pantau booking konseling dan lihat rekam medis yang sudah dicatat psikolog setelah sesi.\" \n        icon=\"history\" \n        breadcrumbs={[\n          { label: 'Student Hub', path: '/student/dashboard' },\n          { label: 'Konseling', path: '/student/counseling' },\n          { label: 'Riwayat' }\n        ]} \n        action={\n          <div className=\"grid grid-cols-2 gap-3 sm:grid-cols-4 md:min-w-[520px]\">\n            {[\n              { label: 'Total Booking', value: history.length },\n              { label: 'Menunggu', value: waitingCount },\n              { label: 'Dikonfirmasi', value: confirmedCount },\n              { label: 'Selesai', value: completedCount },\n            ].map((item) => (\n              <div key={item.label} className=\"rounded-2xl border border-border bg-surface p-4 shadow-sm text-center\">\n                <p className=\"text-[10px] font-bold uppercase tracking-wide text-[var(--theme-text-muted)]\">{item.label}</p>\n                <p className=\"mt-1 text-2xl font-extrabold text-[var(--theme-text)]\">{item.value}</p>\n              </div>\n            ))}\n          </div>\n        } \n      />"
  },
  // Clean up remaining [bku-primary] references
  { from: /text-\[bku-primary\]/g, to: "text-[var(--theme-primary)]" },
  { from: /text-neutral-900/g, to: "text-[var(--theme-text)]" },
  { from: /text-neutral-800/g, to: "text-[var(--theme-text)]" },
  { from: /text-neutral-500/g, to: "text-[var(--theme-text-muted)]" },
  { from: /text-neutral-400/g, to: "text-[var(--theme-text-muted)]" }
]);

// 2. NotificationPage.jsx
patchFile('NotificationPage.jsx', [
  // Import PageContent & PageHeader
  {
    from: "import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';",
    to: "import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';\nimport { PageContent, PageHeader } from '@/components/ui/page';"
  },
  // Replace root div & breadcrumbs/headers with PageContent and PageHeader
  {
    from: "  return (\n    <div className=\"p-6 md:p-10 text-[var(--theme-text)] min-h-screen bg-[#fafafa]\">\n      {/* Breadcrumb */}\n      <div className=\"flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8\">\n        <NavLink to=\"/student/dashboard\" className=\"hover:text-[var(--theme-primary)] cursor-pointer transition-colors\">Dashboard</NavLink>\n        <span className=\"material-symbols-outlined\" style={{ fontSize: 16 }}>chevron_right</span>\n        <span className=\"text-[var(--theme-text)]\">Notifikasi</span>\n      </div>\n\n      <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10\">\n        <div className=\"space-y-1\">\n          <h1 className=\"text-3xl font-black font-headline tracking-tight\">Notifikasi</h1>\n          <p className=\"text-[#737373] font-bold text-xs sm:text-sm\">\n            Kamu memiliki {notifData?.filter(n => !n.is_read).length || 0} pesan belum dibaca.\n          </p>\n        </div>\n        \n        <div className=\"flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto\">\n          <button \n            onClick={() => queryClient.invalidateQueries(['notifikasi'])}\n            disabled={!hasUnread}\n            className=\"w-full sm:w-auto px-5 py-2.5 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] rounded-xl text-sm font-bold border border-[var(--theme-primary-light)] hover:bg-[var(--theme-primary-light)] transition-all disabled:opacity-50 flex items-center justify-center gap-2\"\n          >\n            <span className=\"material-symbols-outlined\" style={{ fontSize: '16px' }} >check_circle</span>\n            Tandai Semua Dibaca\n          </button>\n          <button \n            onClick={() => deleteReadAllMutation.mutate()}\n            className=\"w-full sm:w-auto px-5 py-2.5 bg-[var(--theme-error-light)] text-[var(--theme-error)] rounded-xl text-sm font-bold border border-[var(--theme-error-light)] hover:opacity-90 transition-all flex items-center justify-center gap-2\"\n          >\n            <span className=\"material-symbols-outlined\" style={{ fontSize: '16px' }} >delete_sweep</span>\n            Hapus Terbaca\n          </button>\n        </div>\n      </div>",
    to: "  return (\n    <PageContent className=\"font-body\">\n      <PageHeader \n        title=\"Notifikasi\" \n        subtitle={`Kamu memiliki ${notifData?.filter(n => !n.is_read).length || 0} pesan belum dibaca.`} \n        icon=\"notifications\" \n        breadcrumbs={[\n          { label: 'Student Hub', path: '/student/dashboard' },\n          { label: 'Notifikasi' }\n        ]} \n        action={\n          <div className=\"flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto\">\n            <button \n              onClick={() => queryClient.invalidateQueries(['notifikasi'])}\n              disabled={!hasUnread}\n              className=\"w-full sm:w-auto px-4 py-2 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] rounded-xl text-xs font-bold border border-[var(--theme-primary-light)] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm\"\n            >\n              <span className=\"material-symbols-outlined\" style={{ fontSize: '14px' }} >check_circle</span>\n              Tandai Semua Dibaca\n            </button>\n            <button \n              onClick={() => deleteReadAllMutation.mutate()}\n              className=\"w-full sm:w-auto px-4 py-2 bg-[var(--theme-error-light)] text-[var(--theme-error)] rounded-xl text-xs font-bold border border-[var(--theme-error-light)] hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm\"\n            >\n              <span className=\"material-symbols-outlined\" style={{ fontSize: '14px' }} >delete_sweep</span>\n              Hapus Terbaca\n            </button>\n          </div>\n        } \n      />"
  },
  // Replace the closing div with PageContent
  {
    from: "      </AnimatePresence>\n    </div>\n  );\n}",
    to: "      </AnimatePresence>\n    </PageContent>\n  );\n}"
  }
]);

// 3. SelfScreeningPage.jsx
patchFile('SelfScreeningPage.jsx', [
  // Import PageHeader
  {
    from: "import { PageContent } from '@/components/ui/page';",
    to: "import { PageContent, PageHeader } from '@/components/ui/page';"
  },
  // Replace manual header & layout centering
  {
    from: "  return (\n    <PageContent className=\"font-body\">\n      {/* Header */}\n      <div className=\"bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-6 shadow-lg\">\n        <div className=\"max-w-4xl mx-auto\">\n          <div className=\"flex items-center gap-3 mb-1\">\n            <div className=\"w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center\">\n              <HealthIcon size={24} className=\"text-white\" />\n            </div>\n            <div>\n              <h1 className=\"text-lg font-bold\">Self-Screening</h1>\n              <p className="text-xs text-white/80">Isi data sebelum ke klinik</p>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* Content */}\n      <div className=\"max-w-4xl mx-auto px-4 py-6 space-y-6\">",
    to: "  return (\n    <PageContent className=\"font-body\">\n      <PageHeader \n        title=\"Self-Screening\" \n        subtitle=\"Isi data subjektif/gejala sebelum melakukan kunjungan ke klinik\" \n        icon=\"medical_information\" \n        breadcrumbs={[\n          { label: 'Student Hub', path: '/student/dashboard' },\n          { label: 'Self-Screening' }\n        ]} \n      />\n\n      {/* Content */}\n      <div className=\"w-full space-y-6\">"
  },
  // Remove the nested div closer at the end (line 401/402 before PageContent)
  {
    from: "        </AnimatePresence>\n      </div>\n    </PageContent>\n  );\n}",
    to: "        </AnimatePresence>\n      </div>\n    </PageContent>\n  );\n}"
  }
]);

// 4. ScholarshipDetailPage.jsx
patchFile('ScholarshipDetailPage.jsx', [
  // Import PageHeader
  {
    from: "import { PageContent } from '@/components/ui/page';",
    to: "import { PageContent, PageHeader } from '@/components/ui/page';"
  },
  // Replace back button/custom header
  {
    from: "  return (\n    <PageContent className=\"font-body\">\n      \n      {/* Header */}\n      <button \n        onClick={() => {\n          if (user?.role === 'super_admin') {\n            navigate('/admin/student-beasiswa');\n          } else {\n            navigate('/student/scholarship');\n          }\n        }}\n        className=\"group flex items-center gap-2 mb-8 text-text-muted hover:text-bku-text font-black uppercase tracking-widest text-[10px] transition-all\"\n      >\n        <div className=\"w-8 h-8 rounded-xl border border-border group-hover:border-primary flex items-center justify-center transition-all\">\n          <ArrowLeft size={16} />\n        </div>\n        Kembali ke Dashboard\n      </button>\n\n      <div className=\"grid grid-cols-1 xl:grid-cols-12 gap-6\">",
    to: "  return (\n    <PageContent className=\"font-body\">\n      <PageHeader \n        title={beasiswaNama} \n        subtitle={`${beasiswaPenyelenggara} • Terdaftar pada ${new Date(pengajuanCreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`} \n        icon=\"workspace_premium\" \n        breadcrumbs={[\n          { label: 'Student Hub', path: '/student/dashboard' },\n          { label: 'Beasiswa', path: user?.role === 'super_admin' ? '/admin/student-beasiswa' : '/student/scholarship' },\n          { label: 'Detail Pengajuan' }\n        ]} \n        action={\n          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${\n            pengajuanStatus.toLowerCase() === 'diterima' ? 'bg-success/15 border-success/30 text-success' : \n            pengajuanStatus.toLowerCase() === 'ditolak' ? 'bg-error/15 border-error/30 text-error' :\n            'bg-primary/10 border-primary/20 text-primary'\n          }`}>\n            {pengajuanStatus.replace('_', ' ')}\n          </div>\n        } \n      />\n\n      <div className=\"grid grid-cols-1 xl:grid-cols-12 gap-6\">"
  }
]);

// 5. StudentVoiceDetailPage.jsx
patchFile('StudentVoiceDetailPage.jsx', [
  // Import PageHeader
  {
    from: "import { PageContent } from '@/components/ui/page';",
    to: "import { PageContent, PageHeader } from '@/components/ui/page';"
  },
  // Replace custom header and nested padding div
  {
    from: "  return (\n    <PageContent className=\"font-body\">\n      <div className=\"max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10\">\n        {/* Breadcrumb & Header */}\n        <div className=\"mb-8\">\n          <div className=\"flex items-center gap-2 text-sm font-medium text-text-muted mb-6\">\n            <NavLink to=\"/student/dashboard\" className=\"hover:text-[var(--theme-primary)] cursor-pointer transition-colors\">Dashboard</NavLink>\n            <span className=\"material-symbols-outlined opacity-50\" style={{ fontSize: 14 }}>chevron_left</span>\n            <NavLink to=\"/student/voice\" className=\"hover:text-[var(--theme-primary)] cursor-pointer transition-colors\">Suara Mahasiswa</NavLink>\n            <span className="material-symbols-outlined opacity-50" style={{ fontSize: 14 }}>chevron_left</span>\n            <span className=\"text-bku-text font-semibold\">Detail Tiket</span>\n          </div>\n\n          <div className=\"flex flex-col lg:flex-row lg:items-center justify-between gap-6\">\n            <div className=\"flex items-center gap-4\">\n              <Link \n                to=\"/student/voice\"\n                className=\"w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] transition-all shadow-sm shrink-0 hover:-translate-x-0.5\"\n              >\n                <span className=\"material-symbols-outlined\" style={{ fontSize: 20 }}>chevron_left</span>\n              </Link>\n              <div>\n                <div className=\"flex items-center gap-2 mb-1\">\n                  <span className=\"px-2 py-0.5 bg-[var(--theme-primary)] text-white text-xs font-semibold rounded-md shadow-sm\">\n                    TICKET ID\n                  </span>\n                  <span className=\"text-xs font-medium text-text-muted\">\n                    {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n                  </span>\n                </div>\n                <h1 className=\"text-xl md:text-2xl font-bold font-headline text-bku-text\">\n                  {ticket.nomor_tiket}\n                </h1>\n              </div>\n            </div>\n\n            <div className=\"flex flex-wrap items-center gap-3\">\n               <div className=\"flex flex-col items-end hidden md:block mr-2 text-right\">\n                  <span className=\"text-xs font-medium text-text-muted block mb-0.5\">Status Aspirasi</span>\n                  <span className=\"text-sm font-semibold text-bku-text\">Real-time Tracking</span>\n               </div>\n               <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getCategoryStyle(ticket.kategori)}`}>\n                 {ticket.kategori}\n               </span>\n               <LevelBadge level={ticket.level_saat_ini} />\n               <StatusBadge status={ticket.status} />\n            </div>\n          </div>\n        </div>",
    to: "  return (\n    <PageContent className=\"font-body\">\n      <PageHeader \n        title={ticket.nomor_tiket} \n        subtitle={\n          <div className=\"flex flex-wrap items-center gap-3 mt-1.5\">\n            <span className=\"px-2 py-0.5 bg-[var(--theme-primary)] text-white text-[10px] font-black rounded-md shadow-sm uppercase\">\n              TICKET ID\n            </span>\n            <span className=\"text-xs font-bold text-[var(--theme-text-muted)]\">\n              Dikirim pada ${new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n            </span>\n          </div>\n        } \n        icon=\"chat\" \n        breadcrumbs={[\n          { label: 'Student Hub', path: '/student/dashboard' },\n          { label: 'Suara Mahasiswa', path: '/student/voice' },\n          { label: 'Detail Tiket' }\n        ]} \n        action={\n          <div className=\"flex flex-wrap items-center gap-2\">\n             <span className={`px-3 py-1.5 rounded-xl text-xs font-black border shadow-sm ${getCategoryStyle(ticket.kategori)}`}>\n               {ticket.kategori}\n             </span>\n             <LevelBadge level={ticket.level_saat_ini} />\n             <StatusBadge status={ticket.status} />\n          </div>\n        } \n      />"
  },
  // Remove the closing div at the end of return block
  {
    from: "      </div>\n    </PageContent>\n  );\n}",
    to: "    </PageContent>\n  );\n}"
  }
]);

console.log("Header alignments finished!");
