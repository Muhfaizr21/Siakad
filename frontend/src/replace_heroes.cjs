const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages', 'OrmawaAdmin');
const files = [
  'JadwalKegiatan.jsx',
  'KeuanganKas.jsx',
  'LpjManagement.jsx',
  'Notifikasi.jsx',
  'PkkmbManagement.jsx',
  'ProposalManagement.jsx',
  'Recruitment.jsx',
  'RoleBasedAccess.jsx',
  'Settings.jsx',
  'StaffManagement.jsx',
  'StrukturOrganisasi.jsx'
];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}, not found`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the welcome banner section
  // Match from <section ... Welcome Banner ... to </section>
  const bannerRegex = /\{\/\*\s*──\s*Welcome Banner\s*───────────────────────────────────────────\s*\*\/\}\s*<section[\s\S]*?<\/section>/;
  
  const match = content.match(bannerRegex);
  if (match) {
    const bannerBlock = match[0];
    
    // Extract icon
    let icon = 'groups';
    const iconMatch = bannerBlock.match(/<span className="material-symbols-outlined"[^>]*>([a-z_]+)<\/span>/);
    if (iconMatch) {
      icon = iconMatch[1];
    }
    
    // Extract title
    let title = '';
    const titleMatch = bannerBlock.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    // Extract subtitle
    let subtitle = '';
    const subtitleMatch = bannerBlock.match(/<p[^>]*text-\[var\(--theme-text-muted\)\][^>]*>([^<]+)<\/p>/) || 
                         bannerBlock.match(/<p[^>]*text-\[var\(--theme-text-subtle\)\][^>]*>([^<]+)<\/p>/) ||
                         bannerBlock.match(/<p[^>]*>([^<]+)<\/p>/);
    
    if (subtitleMatch) {
      subtitle = subtitleMatch[1].trim();
    }
    
    // Extract actions
    let actionsStr = '';
    // Let's find any button or Button inside the flex wrapper inside the banner but not the icon wrapper
    // Actually, usually it's after the text content
    const actionsMatch = bannerBlock.match(/<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">[\s\S]*?<\/div>\s*(<Button[\s\S]*?<\/Button>|<button[\s\S]*?<\/button>)\s*<\/div>/);
    let replacement = `      {/* ── Welcome Banner ─────────────────────────────────────────── */}\n      <OrmawaPageHero \n        title="${title}"\n        subtitle="${subtitle}"\n        icon="${icon}"\n`;
    
    // Fallback simple actions extraction if it's the last element before </section>
    // e.g. <Button ...>BUAT PENGUMUMAN</Button>
    // Let's do a broader search for action buttons (not the icon span)
    const allButtonsMatch = bannerBlock.match(/(<Button[\s\S]*?<\/Button>|<button[^>]*onClick=[\s\S]*?<\/button>)/);
    if (allButtonsMatch && !allButtonsMatch[0].includes('material-symbols-outlined" style={{ fontSize: \'32px\' }}')) {
       // if there's an action button like add proposal, we capture it. Actually it's safer to extract it properly or skip actions if none found.
       // Most pages have their own actions. Let's just try to extract anything that looks like the right side button
       const rightSideMatch = bannerBlock.match(/(?:<\/div>\s*<\/div>\s*<\/div>\s*|\s*)(<button[\s\S]*?<\/button>|<Button[\s\S]*?<\/Button>|{.*})?\s*<\/div>\s*<\/section>$/);
       if (rightSideMatch && rightSideMatch[1]) {
           replacement += `        actions={\n          ${rightSideMatch[1].trim().split('\\n').join('\\n          ')}\n        }\n`;
       } else if (allButtonsMatch) {
           replacement += `        actions={\n          ${allButtonsMatch[0].trim().split('\\n').join('\\n          ')}\n        }\n`;
       }
    }
    
    replacement += `      />`;
    
    content = content.replace(bannerRegex, replacement);
    
    // Add import if not exists
    if (!content.includes('OrmawaPageHero')) {
      content = content.replace(/(import .*?\n)(?=\n|const|function|export)/, `$1import { OrmawaPageHero } from './components/OrmawaPageHero'\n`);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`No banner found in ${file}`);
  }
}
