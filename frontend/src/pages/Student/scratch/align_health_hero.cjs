const fs = require('fs');
const path = require('path');

const filePath = 'd:/siakad/frontend/src/pages/Student/HealthScreeningPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. replace getBMICategory
const oldBMICat = `const getBMICategory = (bmi) => {
  if (!bmi || isNaN(bmi)) return { label: 'Unknown', color: 'text-neutral-400', bg: 'bg-neutral-50', border: 'border-neutral-200', dot: 'bg-neutral-300', bar: 'bg-neutral-300' };
  const v = parseFloat(bmi);
  if (v < 18.5) return { label: 'Kekurangan BB', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-400',   bar: 'bg-blue-400'   };
  if (v < 25)   return { label: 'Normal',        color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200',dot: 'bg-emerald-500',bar: 'bg-emerald-500'};
  if (v < 30)   return { label: 'Kelebihan BB',  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400',  bar: 'bg-amber-400'  };
  return         { label: 'Obesitas',             color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    bar: 'bg-red-500'    };
};`;

const newBMICat = `const getBMICategory = (bmi) => {
  if (!bmi || isNaN(bmi)) return { label: 'Unknown', color: 'text-neutral-400', bg: 'bg-[var(--theme-bg)]', border: 'border-border', dot: 'bg-neutral-300', bar: 'bg-neutral-300' };
  const v = parseFloat(bmi);
  if (v < 18.5) return { label: 'Kekurangan BB', color: 'text-[var(--theme-primary)]',   bg: 'bg-[var(--theme-primary-light)]',   border: 'border-[var(--theme-primary-light)]',   dot: 'bg-[var(--theme-primary)]',   bar: 'bg-[var(--theme-primary)]'   };
  if (v < 25)   return { label: 'Normal',        color: 'text-[var(--theme-success)]',bg: 'bg-[var(--theme-success-light)]',border: 'border-[var(--theme-success-light)]',dot: 'bg-[var(--theme-success)]',bar: 'bg-[var(--theme-success)]'};
  if (v < 30)   return { label: 'Kelebihan BB',  color: 'text-[var(--theme-warning)]',  bg: 'bg-[var(--theme-warning-light)]',  border: 'border-[var(--theme-warning-light)]',  dot: 'bg-[var(--theme-warning)]',  bar: 'bg-[var(--theme-warning)]'  };
  return         { label: 'Obesitas',             color: 'text-[var(--theme-error)]',    bg: 'bg-[var(--theme-error-light)]',    border: 'border-[var(--theme-error-light)]',    dot: 'bg-[var(--theme-error)]',    bar: 'bg-[var(--theme-error)]'    };
};`;

if (content.includes(oldBMICat)) {
  content = content.replace(oldBMICat, newBMICat);
  console.log('Updated getBMICategory');
} else {
  // Let's try replacing single lines if the block isn't matched exactly due to CRLF
  content = content.replace(/color: 'text-blue-600',\s*bg: 'bg-blue-50',\s*border: 'border-blue-200'/g, `color: 'text-[var(--theme-primary)]', bg: 'bg-[var(--theme-primary-light)]', border: 'border-[var(--theme-primary-light)]'`);
  content = content.replace(/color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200'/g, `color: 'text-[var(--theme-success)]', bg: 'bg-[var(--theme-success-light)]', border: 'border-[var(--theme-success-light)]'`);
  content = content.replace(/color: 'text-amber-600',\s*bg: 'bg-amber-50',\s*border: 'border-amber-200'/g, `color: 'text-[var(--theme-warning)]', bg: 'bg-[var(--theme-warning-light)]', border: 'border-[var(--theme-warning-light)]'`);
  content = content.replace(/color: 'text-red-600',\s*bg: 'bg-red-50',\s*border: 'border-red-200'/g, `color: 'text-[var(--theme-error)]', bg: 'bg-[var(--theme-error-light)]', border: 'border-[var(--theme-error-light)]'`);
  console.log('Line replaced getBMICategory');
}

// 2. replace getBPStatus
content = content.replace(/color: 'text-red-600',\s*bg: 'bg-red-50'/g, `color: 'text-[var(--theme-error)]', bg: 'bg-[var(--theme-error-light)]'`);
content = content.replace(/color: 'text-amber-600',\s*bg: 'bg-amber-50'/g, `color: 'text-[var(--theme-warning)]', bg: 'bg-[var(--theme-warning-light)]'`);
content = content.replace(/color: 'text-emerald-600',\s*bg: 'bg-emerald-50'/g, `color: 'text-[var(--theme-success)]', bg: 'bg-[var(--theme-success-light)]'`);
console.log('Updated getBPStatus');

// 3. replace getStatusInfo
content = content.replace(/text: 'text-rose-600'/g, `text: 'text-[var(--theme-error)]'`);
content = content.replace(/text: 'text-rose-500'/g, `text: 'text-[var(--theme-error)]'`);
content = content.replace(/text: 'text-red-600'/g, `text: 'text-[var(--theme-error)]'`);
content = content.replace(/text: 'text-amber-600'/g, `text: 'text-[var(--theme-warning)]'`);
content = content.replace(/text: 'text-emerald-600'/g, `text: 'text-[var(--theme-success)]'`);
content = content.replace(/text: 'text-blue-600'/g, `text: 'text-[var(--theme-primary)]'`);

content = content.replace(/bg-rose-500 shadow-rose-500\/20/g, `bg-[var(--theme-error)] shadow-[var(--theme-error)]/20`);
content = content.replace(/bg-emerald-500 shadow-emerald-500\/20/g, `bg-[var(--theme-success)] shadow-[var(--theme-success)]/20`);
content = content.replace(/bg-amber-500 shadow-amber-500\/20/g, `bg-[var(--theme-warning)] shadow-[var(--theme-warning)]/20`);
content = content.replace(/bg-blue-500 shadow-blue-500\/20/g, `bg-[var(--theme-primary)] shadow-[var(--theme-primary)]/20`);
content = content.replace(/bg-red-500 shadow-red-500\/20/g, `bg-[var(--theme-error)] shadow-[var(--theme-error)]/20`);
console.log('Updated getStatusInfo');

// 4. replace StatItem props in HealthScreeningPage.jsx
content = content.replace(/colorClass="text-blue-600" bgClass="bg-blue-50"/g, `colorClass="text-[var(--theme-primary)]" bgClass="bg-[var(--theme-primary-light)]"`);
content = content.replace(/colorClass="text-emerald-600" bgClass="bg-emerald-50"/g, `colorClass="text-[var(--theme-success)]" bgClass="bg-[var(--theme-success-light)]"`);
content = content.replace(/colorClass="text-teal-600" bgClass="bg-teal-50"/g, `colorClass="text-[var(--theme-info)]" bgClass="bg-[var(--theme-info-light)]"`);
content = content.replace(/colorClass="text-amber-600" bgClass="bg-amber-50"/g, `colorClass="text-[var(--theme-warning)]" bgClass="bg-[var(--theme-warning-light)]"`);
content = content.replace(/colorClass="text-sky-600" bgClass="bg-sky-50"/g, `colorClass="text-[var(--theme-primary)]" bgClass="bg-[var(--theme-primary-light)]"`);
content = content.replace(/colorClass="text-purple-600" bgClass="bg-purple-50"/g, `colorClass="text-[var(--theme-error)]" bgClass="bg-[var(--theme-error-light)]"`);
console.log('Updated StatItem elements');

// 5. replace ringColor in BMI circular score
content = content.replace(/score >= 85 \? "#10b981" : score >= 70 \? "#f59e0b" : "#f43f5e"/g, `score >= 85 ? "var(--theme-success)" : score >= 70 ? "var(--theme-warning)" : "var(--theme-error)"`);
console.log('Updated circular wellness score');

// 6. replace p-5 grid bg-neutral-50/50 and bg-white bg-opacity-50
content = content.replace(/bg-neutral-50\/50/g, 'bg-[var(--theme-bg)]');
content = content.replace(/bg-white bg-opacity-50/g, 'bg-surface/50');
content = content.replace(/bg-neutral-50 px-4/g, 'bg-[var(--theme-bg)] px-4');
console.log('Updated grid backgrounds');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done.');
