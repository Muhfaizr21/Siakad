import fs from 'fs';

const files = [
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/pages/Error/Error404.jsx',
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/pages/Error/Error403.jsx',
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/pages/Error/Error500.jsx',
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/pages/Error/OfflinePage.jsx'
];

const replacements = {
    '#f97316': '#00236F',
    '#ea580c': '#0B4FAE',
    '#fed7aa': '#C9D8FF',
    '#fff7ed': '#EAF1FF',
    '#ffedd5': '#D5E2FF',
    'rgba(249,115,22,0.5)': 'rgba(0,35,111,0.5)'
};

files.forEach(fp => {
    if (fs.existsSync(fp)) {
        let content = fs.readFileSync(fp, 'utf8');
        for (const [oldVal, newVal] of Object.entries(replacements)) {
            content = content.split(oldVal).join(newVal);
        }
        fs.writeFileSync(fp, content, 'utf8');
    }
});

console.log('Colors in error pages replaced successfully!');
