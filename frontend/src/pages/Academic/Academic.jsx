import React from 'react';
import AcademicHero from './components/AcademicHero';
import Faculties from './components/Faculties';
import Calendar from './components/Calendar';
import Research from './components/Research';

const Academic = () => {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-primary">
        <main>
            <AcademicHero />
            <Faculties />
            <Calendar />
            <Research />
        </main>
    </div>
  );
};

export default Academic;
