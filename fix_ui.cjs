
const fs = require('fs');
let text = fs.readFileSync('frontend/src/pages/Student/CounselingHistoryPage.jsx', 'utf8');
text = text.replace(/#00236F/g, 'bku-primary');
text = text.replace(/text-bku-primary/g, 'text-bku-primary font-headline');
text = text.replace(/bg-bku-primary/g, 'bg-bku-primary');
text = text.replace(/border-bku-primary/g, 'border-bku-primary');
fs.writeFileSync('frontend/src/pages/Student/CounselingHistoryPage.jsx', text);
console.log('Fixed CounselingHistoryPage');

