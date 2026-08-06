const fs = require('fs');
const path = require('path');

const filePath = 'd:/siakad/frontend/src/pages/Student/HealthScreeningPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Restore the original first so we can run clean
console.log('Restoring...');
const cp = require('child_process');
cp.execSync('git restore frontend/src/pages/Student/HealthScreeningPage.jsx', { cwd: 'd:/siakad' });

content = fs.readFileSync(filePath, 'utf-8');

// Normalize line endings to LF for search
content = content.replace(/\r\n/g, '\n');

// Find and replace the opening div
const targetOpening = '      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8">';
if (content.includes(targetOpening)) {
  content = content.replace(targetOpening, '');
  console.log('Removed opening wrapper div');
} else {
  console.log('Opening wrapper div not found!');
}

// Find the target closing div around line 879
// Let's use a split by lines and look at line index
const lines = content.split('\n');
console.log('Line 879 is:', lines[878]); // 0-indexed is 878

if (lines[878].trim() === '</div>') {
  lines[878] = '// removed closing wrapper';
  console.log('Removed closing div at line 879');
} else {
  // Let's search for it
  for (let i = 870; i < 885; i++) {
    if (lines[i] && lines[i].trim() === '</div>') {
      console.log(`Found </div> at line ${i+1}: "${lines[i]}"`);
      lines[i] = '// removed closing wrapper';
      break;
    }
  }
}

content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Finished.');
