import fs from 'fs';

const files = [
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/components/layout/Header.jsx',
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/components/layout/NotificationDropdown.jsx',
    'C:/Users/tegar/.gemini/antigravity/scratch/Siakad/frontend/src/pages/Student/NotificationPage.jsx'
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
    let content = fs.readFileSync(fp, 'utf8');
    for (const [oldVal, newVal] of Object.entries(replacements)) {
        content = content.split(oldVal).join(newVal);
    }
    
    // Restore Trophy icon orange
    content = content.split('<Trophy size={18} className="text-[#00236F]" />').join('<Trophy size={18} className="text-[#f97316]" />');
    content = content.split('<Trophy size={16} className="text-[#00236F]" />').join('<Trophy size={16} className="text-[#f97316]" />');

    fs.writeFileSync(fp, content, 'utf8');
});

console.log('Colors replaced successfully!');
