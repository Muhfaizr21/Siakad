const fs = require('fs');
const path = require('path');

const filePath = 'd:/siakad/frontend/src/pages/Student/InsurancePage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. replace PageContent import to include PageHeader
content = content.replace("import { PageContent } from '@/components/ui/page';", "import { PageContent, PageHeader } from '@/components/ui/page';");

// 2. replace PROVIDER_OPTIONS
const oldProviderOptions = `const PROVIDER_OPTIONS = [
  { value: 'BKU_Assurance', label: 'BKU Assurance (Kampus)', color: 'bg-[var(--theme-primary)]', textColor: 'text-[var(--theme-primary)]', border: 'border-[var(--theme-primary)]', bg: 'bg-[var(--theme-primary-light)]' },
  { value: 'BPJS', label: 'BPJS Kesehatan', color: 'bg-emerald-600', textColor: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { value: 'Asuransi_Lain', label: 'Asuransi Swasta Lain', color: 'bg-purple-600', textColor: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50' },
];`;

const newProviderOptions = `const PROVIDER_OPTIONS = [
  { value: 'BKU_Assurance', label: 'BKU Assurance (Kampus)', color: 'bg-[var(--theme-primary)]', textColor: 'text-[var(--theme-primary)]', border: 'border-[var(--theme-primary-light)]', bg: 'bg-[var(--theme-primary-light)]' },
  { value: 'BPJS', label: 'BPJS Kesehatan', color: 'bg-[var(--theme-success)]', textColor: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success-light)]', bg: 'bg-[var(--theme-success-light)]' },
  { value: 'Asuransi_Lain', label: 'Asuransi Swasta Lain', color: 'bg-[var(--theme-warning)]', textColor: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning-light)]', bg: 'bg-[var(--theme-warning-light)]' },
];`;

if (content.includes(oldProviderOptions)) {
  content = content.replace(oldProviderOptions, newProviderOptions);
} else {
  // Line-by-line replacement fallback
  content = content.replace(/color: 'bg-emerald-600',\s*textColor: 'text-emerald-600',\s*border: 'border-emerald-200',\s*bg: 'bg-emerald-50'/g, `color: 'bg-[var(--theme-success)]', textColor: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success-light)]', bg: 'bg-[var(--theme-success-light)]'`);
  content = content.replace(/color: 'bg-purple-600',\s*textColor: 'text-purple-600',\s*border: 'border-purple-200',\s*bg: 'bg-purple-50'/g, `color: 'bg-[var(--theme-warning)]', textColor: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning-light)]', bg: 'bg-[var(--theme-warning-light)]'`);
}

// 3. replace StatusBadge styles
const oldStatusBadge = `  const statusConfig = {
    'PENDING_VERIFICATION': { label: 'Menunggu Verifikasi', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    'APPROVED_TK': { label: 'Disetujui Nakes', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle },
    'APPROVED_FINAL': { label: 'Disetujui Final', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
    'REJECTED': { label: 'Ditolak', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  };`;

const newStatusBadge = `  const statusConfig = {
    'PENDING_VERIFICATION': { label: 'Menunggu Verifikasi', bg: 'bg-[var(--theme-warning-light)]', text: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning-light)]', icon: Clock },
    'APPROVED_TK': { label: 'Disetujui Nakes', bg: 'bg-[var(--theme-primary-light)]', text: 'text-[var(--theme-primary)]', border: 'border-[var(--theme-primary-light)]', icon: CheckCircle },
    'APPROVED_FINAL': { label: 'Disetujui Final', bg: 'bg-[var(--theme-success-light)]', text: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success-light)]', icon: CheckCircle },
    'REJECTED': { label: 'Ditolak', bg: 'bg-[var(--theme-error-light)]', text: 'text-[var(--theme-error)]', border: 'border-[var(--theme-error-light)]', icon: XCircle },
  };`;

if (content.includes(oldStatusBadge)) {
  content = content.replace(oldStatusBadge, newStatusBadge);
}

// 4. replace custom header with PageHeader
const oldHeader = `      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[var(--theme-primary)] rounded-xl flex items-center justify-center shadow-md shadow-bku-primary/20">
              <InsuranceIcon size={22} className="text-white" />
            </div>
            Klaim Asuransi
          </h1>
          <p className="text-[#a3a3a3] mt-1.5 font-bold uppercase tracking-[0.16em] text-[10px]">Layanan Mandiri Klaim Asuransi Kesehatan Mahasiswa BKU</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-surface rounded-2xl shadow-sm border border-border w-fit">
          <button 
            onClick={() => setActiveTab('ajuan')}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all \${
              activeTab === 'ajuan' 
                ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-bku-primary/20' 
                : 'text-[#a3a3a3] hover:text-[#525252]'
            }\`}
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Ajukan Klaim
          </button>
          <button 
            onClick={() => setActiveTab('riwayat')}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all \${
              activeTab === 'riwayat' 
                ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-bku-primary/20' 
                : 'text-[#a3a3a3] hover:text-[#525252]'
            }\`}
          >
            <span className="material-symbols-outlined text-sm">history</span>
            Riwayat Saya
            {claims.length > 0 && (
              <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black \${activeTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#525252]'}\`}>
                {claims.length}
              </span>
            )}
          </button>
        </div>
      </motion.div>`;

const newHeader = `      <PageHeader 
        title="Klaim Asuransi" 
        subtitle="Layanan Mandiri Klaim Asuransi Kesehatan Mahasiswa BKU" 
        icon="health_and_safety"
        breadcrumbs={[
          { label: 'Student Hub', path: '/student/dashboard' },
          { label: 'Klaim Asuransi', path: '/student/insurance' }
        ]}
        action={
          <div className="flex p-1 bg-surface rounded-xl shadow-inner border border-border w-fit">
            <button 
              onClick={() => setActiveTab('ajuan')}
              className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all \${
                activeTab === 'ajuan' 
                  ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20' 
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-transparent'
              }\`}
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Ajukan Klaim
            </button>
            <button 
              onClick={() => setActiveTab('riwayat')}
              className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all \${
                activeTab === 'riwayat' 
                  ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20' 
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-transparent'
              }\`}
            >
              <span className="material-symbols-outlined text-sm">history</span>
              Riwayat Saya
              {claims.length > 0 && (
                <span className={\`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black \${activeTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)]'}\`}>
                  {claims.length}
                </span>
              )}
            </button>
          </div>
        }
      />`;

// Replace headers
content = content.replace(oldHeader, newHeader);

// Residual general standardizations
const generalReplacements = [
  { from: /shadow-bku-primary\/20/g, to: 'shadow-[var(--theme-primary)]/20' },
  { from: /focus:ring-bku-primary/g, to: 'focus:ring-[var(--theme-primary)]/20' },
  { from: /hover:bg-\[var\(--theme-primary-hover\)\]/g, to: 'hover:bg-[var(--theme-primary-dark)]' },
  { from: /bg-\[var\(--theme-primary-hover\)\]/g, to: 'bg-[var(--theme-primary-dark)]' },
  { from: /from-bku-primary to-\[#0B4FAE\]/g, to: 'from-[var(--theme-primary)] to-[var(--theme-primary-dark)]' },
  { from: /bg-\[#f5f5f5\]/g, to: 'bg-[var(--theme-bg)]' },
  { from: /text-slate-700/g, to: 'text-[var(--theme-text)]' },
  { from: /text-slate-600/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /text-\[#a3a3a3\]/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /text-\[#525252\]/g, to: 'text-[var(--theme-text)]' },
  { from: /text-\[#171717\]\/60/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /bg-slate-200/g, to: 'bg-[var(--theme-bg)]' },
  { from: /bg-slate-100/g, to: 'bg-[var(--theme-bg)]' },
  { from: /bg-white\/5/g, to: 'bg-surface/5' },
  { from: /border-white\/10/g, to: 'border-border/10' },
  { from: /bg-white\/20/g, to: 'bg-surface/20' },
  { from: /bg-white/g, to: 'bg-surface' }
];

let replacedCount = 0;
for (const r of generalReplacements) {
  const count = (content.match(r.from) || []).length;
  if (count > 0) {
    content = content.replace(r.from, r.to);
    replacedCount += count;
    console.log(`Replaced ${count} occurrences of ${r.from}`);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Successfully completed insurance page alignment!`);
