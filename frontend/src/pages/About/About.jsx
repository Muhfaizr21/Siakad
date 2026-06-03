import React from 'react';
import AboutHero from './components/AboutHero';
import LegalInfo from './components/LegalInfo';
import MissionVision from './components/MissionVision';
import Leadership from './components/Leadership';
import Partnerships from './components/Partnerships';
import Values from './components/Values';

const About = () => {
  return (
    <div className="antialiased overflow-x-hidden w-full flex-grow flex flex-col" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <main className="w-full flex-grow">
        <AboutHero />
        <LegalInfo />
        <MissionVision />
        <Leadership />
        <Partnerships />
        <Values />
      </main>
    </div>
  );
};

export default About;