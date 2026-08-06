const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/Psychologist');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  if (file === 'BookingManagement.jsx' || file === 'PsychologistLayout.jsx' || file === 'PsychologistDashboard.jsx') return;

  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;

  // 1. Remove Sidebar / TopNavBar imports (more robustly)
  content = content.replace(/import Sidebar from ['"].\/components\/Sidebar['"];\r?\n?/g, '');
  content = content.replace(/import TopNavBar from ['"].\/components\/TopNavBar['"];\r?\n?/g, '');

  // 2. Remove sidebar state
  content = content.replace(/const \[sidebarOpen, setSidebarOpen\] = useState\(false\);\r?\n?/g, '');

  // 3. Remove Sidebar and TopNavBar component rendering
  content = content.replace(/<Sidebar[^>]*\/>\s*/g, '');
  content = content.replace(/<TopNavBar[^>]*\/>\s*/g, '');

  // 4. Handle early returns (like in BookingDetail.jsx)
  content = content.replace(
    /<div className="[^"]*min-h-screen[^"]*">\s*<main[^>]*>\s*<div className=\{UI\.layout\.canvas\}>/g,
    '<div className={UI.layout.canvas}>'
  );
  content = content.replace(
    /Memuat detail booking\.\.\.<\/div><\/main><\/div>/g,
    'Memuat detail booking...</div>'
  );

  // 5. Fix the main wrapper opening tags
  content = content.replace(
    /<div className="[^"]*min-h-screen[^"]*">\s*<main className="[^"]*">\s*<div className="pt-24 px-6 lg:px-10 pb-12 w-full relative space-y-8 scroll-smooth">/g,
    '<>\n      <div className="w-full relative space-y-6 scroll-smooth">'
  );

  content = content.replace(
    /<div className="[^"]*min-h-screen[^"]*">\s*<main className="[^"]*">\s*<div className=\{`\$\{UI\.layout\.canvas\} space-y-6`\}>/g,
    '<>\n      <div className="w-full relative space-y-6 scroll-smooth">'
  );

  content = content.replace(
    /<div className="[^"]*min-h-screen[^"]*">\s*<main className="[^"]*">\s*<div className=\{UI\.layout\.canvas \+ " space-y-8"\}>/g,
    '<>\n      <div className="w-full relative space-y-6 scroll-smooth">'
  );

  // 6. Fix closing tags (General case)
  content = content.replace(
    /<\/div>\s*<\/main>\s*<\/div>\s*\)\;/g,
    '</div>\n    </>\n  );'
  );

  // 7. Fix closing tags (ReferralManagement case with Modal inside main)
  // At the end of the file, if it has `</main>\n</div>\n);`
  content = content.replace(
    /<\/main>\s*<\/div>\s*\)\;/g,
    '</>\n  );'
  );

  // 8. Compact layout class changes
  content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-[2rem]');
  content = content.replace(/rounded-\[2rem\]/g, 'rounded-2xl');
  content = content.replace(/p-8/g, 'p-6');
  content = content.replace(/p-6/g, 'p-5');
  content = content.replace(/gap-6/g, 'gap-4');
  content = content.replace(/space-y-8/g, 'space-y-6');

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
