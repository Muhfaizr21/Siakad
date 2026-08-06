const fs = require('fs');
const path = require('path');

const studentDir = 'd:/siakad/frontend/src/pages/Student';

function scanDir(dir, files = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'scratch') {
        scanDir(filePath, files);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      files.push(filePath);
    }
  });
  return files;
}

const allFiles = scanDir(studentDir);

const replacements = [
  // 1. Hardcoded blue colors & bku-primary mapping
  { regex: /bg-\[#00236[fF]\]/g, replacement: 'bg-[var(--theme-primary)]' },
  { regex: /text-\[#00236[fF]\]/g, replacement: 'text-[var(--theme-primary)]' },
  { regex: /border-\[#00236[fF]\]/g, replacement: 'border-[var(--theme-primary)]' },
  { regex: /focus:border-\[#00236[fF]\]/g, replacement: 'focus:border-[var(--theme-primary)]' },
  
  { regex: /bg-bku-primary/g, replacement: 'bg-[var(--theme-primary)]' },
  { regex: /text-bku-primary/g, replacement: 'text-[var(--theme-primary)]' },
  { regex: /border-bku-primary/g, replacement: 'border-[var(--theme-primary)]' },
  { regex: /hover:bg-bku-primary/g, replacement: 'hover:bg-[var(--theme-primary-hover)]' },
  
  { regex: /bg-\[#0[bB]4[fF][aA][eE]\]/g, replacement: 'bg-[var(--theme-primary-hover)]' },
  { regex: /hover:bg-\[#0[bB]4[fF][aA][eE]\]/g, replacement: 'hover:bg-[var(--theme-primary-hover)]' },
  
  // 2. Hardcoded light blue bg/border
  { regex: /bg-\[#eef4ff\]/gi, replacement: 'bg-[var(--theme-primary-light)]' },
  { regex: /bg-\[#eaf1ff\]/gi, replacement: 'bg-[var(--theme-primary-light)]' },
  { regex: /hover:bg-\[#eef4ff\]/gi, replacement: 'hover:bg-[var(--theme-primary-light)]' },
  { regex: /hover:bg-\[#eaf1ff\]/gi, replacement: 'hover:bg-[var(--theme-primary-light)]' },
  { regex: /hover:bg-\[#dbe7ff\]/gi, replacement: 'hover:bg-[var(--theme-primary-light)]' },
  { regex: /hover:bg-\[#dce8ff\]/gi, replacement: 'hover:bg-[var(--theme-primary-light)]' },
  { regex: /hover:bg-\[#d5e2ff\]/gi, replacement: 'hover:bg-[var(--theme-primary-light)]' },
  { regex: /border-\[#c9d8ff\]/gi, replacement: 'border-[var(--theme-primary-light)]' },
  
  // 3. Hardcoded table headers and specific backgrounds
  { regex: /bg-\[#f4f8ff\]/gi, replacement: 'bg-[var(--theme-bg)]' },
  { regex: /bg-\[#f7faff\]/gi, replacement: 'bg-[var(--theme-primary-light)]' },
  { regex: /border-\[#dbe7ff\]/gi, replacement: 'border-[var(--theme-border-muted)]' },
  { regex: /border-\[#eef1f6\]/gi, replacement: 'border-[var(--theme-border-muted)]' },
  { regex: /border-\[#f5f5f5\]/gi, replacement: 'border-[var(--theme-border-muted)]' },
  
  // 4. Hardcoded borders to border-border
  { regex: /border-\[#e5e5e5\]/g, replacement: 'border-border' },
  { regex: /border-slate-200/g, replacement: 'border-border' },
  { regex: /border-neutral-200/g, replacement: 'border-border' },
  { regex: /border-neutral-300/g, replacement: 'border-border' },
  
  // 5. Hardcoded bg-white -> bg-surface in cards/containers (safe replacements)
  { regex: /bg-white p-/g, replacement: 'bg-surface p-' },
  { regex: /bg-white rounded/g, replacement: 'bg-surface rounded' },
  { regex: /bg-white border/g, replacement: 'bg-surface border' },
  { regex: /bg-white shadow/g, replacement: 'bg-surface shadow' },
  { regex: /bg-white w-/g, replacement: 'bg-surface w-' },
  { regex: /bg-white flex/g, replacement: 'bg-surface flex' },
  { regex: /bg-white grid/g, replacement: 'bg-surface grid' },
  { regex: /bg-white hover:/g, replacement: 'bg-surface hover:' },
  
  // 6. Hardcoded colors like text-[#171717]
  { regex: /text-\[#171717\]/g, replacement: 'text-[var(--theme-text)]' },
  { regex: /text-\[#1e3a8a\]/gi, replacement: 'text-[var(--theme-primary)]' },
  
  // 7. Button and Input Radius (rounded-2xl on buttons -> rounded-xl)
  // Standard buttons should be rounded-xl
  { regex: /rounded-2xl bg-\[var\(--theme-primary\)\]/g, replacement: 'rounded-xl bg-[var(--theme-primary)]' },
  { regex: /rounded-2xl bg-bku-primary/g, replacement: 'rounded-xl bg-[var(--theme-primary)]' },
  { regex: /rounded-2xl py-3 px-4 bg-bku-primary/g, replacement: 'rounded-xl py-3 px-4 bg-[var(--theme-primary)]' },
  { regex: /rounded-2xl bg-gradient-to-r/g, replacement: 'rounded-xl bg-gradient-to-r' },
  
  // Inputs should be rounded-xl
  { regex: /rounded-2xl border border-border px-4 py-2/g, replacement: 'rounded-xl border border-border px-4 py-2' },
  { regex: /rounded-2xl border border-neutral-200 bg-white px-4 py-3/g, replacement: 'rounded-xl border border-border bg-surface px-4 py-3' }
];

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Standardized styles in: ${path.relative(studentDir, file)}`);
  }
});

console.log("Standardization script finished running.");
