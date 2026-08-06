const fs = require('fs');
const path = require('path');

const studentDir = 'd:/siakad/frontend/src/pages/Student';

function scanDir(dir, files = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        scanDir(filePath, files);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      files.push(filePath);
    }
  });
  return files;
}

const allFiles = scanDir(studentDir);
const report = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const fileIssues = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Check for hardcoded bg-white where it should probably be bg-surface or similar
    if (line.includes('bg-white') && !line.includes('bg-white/')) {
      fileIssues.push({ lineNum, type: 'bg-white', text: line.trim() });
    }
    
    // Check for hardcoded navy/blue hex colors
    const hexMatches = line.match(/#([0-9a-fA-F]{3,8})\b/g);
    if (hexMatches) {
      hexMatches.forEach(hex => {
        if (!['#fff', '#ffffff', '#000', '#000000', '#fafafa', '#f5f5f5', '#e5e5e5', '#a3a3a3', '#737373', '#525252', '#d4d4d4', '#171717'].includes(hex.toLowerCase())) {
          fileIssues.push({ lineNum, type: 'hardcoded-color', text: `Found ${hex} in: ${line.trim()}` });
        }
      });
    }

    // Check for wrong border radius sizes like rounded-lg or rounded-2xl or rounded-3xl or rounded-xl on buttons
    if (line.includes('rounded-') && !line.includes('rounded-full') && !line.includes('rounded-none')) {
      // Find out if it's a card (should be rounded-2xl) or button/input (should be rounded-xl)
      if (line.includes('button') || line.includes('input') || line.includes('select') || line.includes('textarea')) {
        if (!line.includes('rounded-xl') && !line.includes('rounded-full') && !line.includes('rounded-none')) {
          fileIssues.push({ lineNum, type: 'radius-button-input', text: `Button/input should be rounded-xl: ${line.trim()}` });
        }
      } else if (line.includes('card') || line.includes('shadow') || line.includes('border-border') || line.includes('border-border-muted')) {
        if (!line.includes('rounded-2xl')) {
          fileIssues.push({ lineNum, type: 'radius-card', text: `Card/panel should be rounded-2xl: ${line.trim()}` });
        }
      }
    }
  });

  if (fileIssues.length > 0) {
    report.push({ file: path.relative(studentDir, file), issues: fileIssues });
  }
});

console.log(JSON.stringify(report, null, 2));
