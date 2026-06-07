const fs = require('fs');
const path = require('path');

const studentDir = 'd:/siakad/frontend/src/pages/Student';

function scanDir(dir, files = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'scratch' && file !== 'components' && file !== 'tabs' && file !== 'Kencana') {
        scanDir(filePath, files);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      files.push(filePath);
    }
  });
  return files;
}

const allFiles = scanDir(studentDir);

console.log("Checking headers in student pages:");
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const hasPageHeader = content.includes('PageHeader');
  const hasPageContent = content.includes('PageContent');
  const hasManualBreadcrumb = content.includes('Dashboard') && (content.includes('ChevronRight') || content.includes('chevron_right') || content.includes('material-symbols-outlined'));
  
  console.log(`- ${path.relative(studentDir, file)}:`);
  console.log(`  PageHeader: ${hasPageHeader ? 'YES' : 'NO'}`);
  console.log(`  PageContent: ${hasPageContent ? 'YES' : 'NO'}`);
  console.log(`  Manual Breadcrumb/nav: ${content.includes('<nav') ? 'YES' : 'NO'}`);
});
