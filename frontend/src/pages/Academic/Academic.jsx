import React from 'react';
import AcademicHero from './components/AcademicHero';
import Faculties from './components/Faculties';
import Research from './components/Research';

const Academic = () => {
  return (
    <div className="antialiased overflow-x-hidden w-full" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <main>
        <AcademicHero />
        <Faculties />
        <Research />
      </main>
    </div>
  );
};

export default Academic;