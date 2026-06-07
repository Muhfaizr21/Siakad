const fs = require('fs');
const path = require('path');

const filePath = 'd:/siakad/frontend/src/pages/Student/InsurancePage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
  // 1. Stats Card in Ajukan Tab
  { from: /bg-amber-50 border border-amber-100/g, to: 'bg-[var(--theme-warning-light)] border border-[var(--theme-warning-light)]' },
  { from: /text-amber-700/g, to: 'text-[var(--theme-warning)]' },
  { from: /text-amber-600/g, to: 'text-[var(--theme-warning)]' },
  { from: /bg-emerald-50 border border-emerald-100/g, to: 'bg-[var(--theme-success-light)] border border-[var(--theme-success-light)]' },
  { from: /text-emerald-700/g, to: 'text-[var(--theme-success)]' },
  { from: /text-emerald-600/g, to: 'text-[var(--theme-success)]' },

  // 2. Upload Dokumen Status (green block)
  { from: /border-green-500 bg-green-50\/50/g, to: 'border-[var(--theme-success)] bg-[var(--theme-success-light)]/50' },
  { from: /bg-green-600/g, to: 'bg-[var(--theme-success)]' },
  { from: /text-green-700/g, to: 'text-[var(--theme-success)]' },

  // 3. borderColors in Riwayat Card border-l-
  { from: /'border-l-amber-500'/g, to: "'border-l-[var(--theme-warning)]'" },
  { from: /'border-l-blue-500'/g, to: "'border-l-[var(--theme-primary)]'" },
  { from: /'border-l-emerald-500'/g, to: "'border-l-[var(--theme-success)]'" },
  { from: /'border-l-red-500'/g, to: "'border-l-[var(--theme-error)]'" },

  // 4. Catatan Review colors in Detail Modal
  { from: /bg-red-50 border border-red-200 text-red-700/g, to: 'bg-[var(--theme-error-light)] border border-[var(--theme-error-light)] text-[var(--theme-error)]' },
  { from: /bg-blue-50 border border-blue-200 text-blue-700/g, to: 'bg-[var(--theme-primary-light)] border border-[var(--theme-primary-light)] text-[var(--theme-primary)]' },
  { from: /bg-red-50 border-red-200 text-red-700/g, to: 'bg-[var(--theme-error-light)] border-[var(--theme-error-light)] text-[var(--theme-error)]' },
  { from: /bg-blue-50 border-blue-200 text-blue-700/g, to: 'bg-[var(--theme-primary-light)] border-[var(--theme-primary-light)] text-[var(--theme-primary)]' }
];

let replacedCount = 0;
for (const r of replacements) {
  const count = (content.match(r.from) || []).length;
  if (count > 0) {
    content = content.replace(r.from, r.to);
    replacedCount += count;
    console.log(`Replaced ${count} occurrences of ${r.from}`);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Successfully completed precise insurance replacements! Total: ${replacedCount}`);
