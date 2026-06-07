const fs = require('fs');
const path = require('path');

const filePath = 'd:/siakad/frontend/src/pages/Student/HealthScreeningPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replacements configuration
const replacements = [
  // Brand colors to theme CSS variables
  { from: /bg-bku-primary/g, to: 'bg-[var(--theme-primary)]' },
  { from: /text-bku-primary/g, to: 'text-[var(--theme-primary)]' },
  { from: /hover:text-bku-primary/g, to: 'hover:text-[var(--theme-primary)]' },
  { from: /hover:bg-\[#0B4FAE\]/g, to: 'hover:bg-[var(--theme-primary-dark)]' },
  { from: /bg-\[#0B4FAE\]/g, to: 'bg-[var(--theme-primary-dark)]' },
  { from: /shadow-bku-primary\/20/g, to: 'shadow-[var(--theme-primary)]/20' },
  { from: /border-bku-primary/g, to: 'border-[var(--theme-primary)]' },
  { from: /hover:border-bku-primary/g, to: 'hover:border-[var(--theme-primary)]' },

  // Borders to theme border
  { from: /border-neutral-50/g, to: 'border-border' },
  { from: /border-neutral-100/g, to: 'border-border' },
  { from: /border-neutral-200/g, to: 'border-border' },
  { from: /border-neutral-300/g, to: 'border-border' },
  { from: /border-neutral-100\/70/g, to: 'border-border/70' },
  { from: /divide-neutral-50/g, to: 'divide-border' },
  { from: /divide-neutral-100/g, to: 'divide-border' },

  // Backgrounds to theme background/surface
  { from: /bg-neutral-50/g, to: 'bg-[var(--theme-bg)]' },
  { from: /bg-neutral-100/g, to: 'bg-[var(--theme-bg)]' },
  { from: /bg-white/g, to: 'bg-surface' },
  
  // Text colors to theme text
  { from: /text-\[#171717\]/g, to: 'text-[var(--theme-text)]' },
  { from: /text-neutral-300/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /text-neutral-400/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /text-neutral-500/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /text-neutral-600/g, to: 'text-[var(--theme-text-muted)]' },
  { from: /text-neutral-700/g, to: 'text-[var(--theme-text)]' },
  { from: /text-neutral-900/g, to: 'text-[var(--theme-text)]' }
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
console.log(`Successfully completed alignment! Total replacements: ${replacedCount}`);
