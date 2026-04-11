import React from 'react';
import AboutHero from './components/AboutHero';
import MissionVision from './components/MissionVision';
import Values from './components/Values';
import Leadership from './components/Leadership';
import Milestones from './components/Milestones';

const About = () => {
  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden">
        <main>
            <AboutHero />
            <MissionVision />
            <Values />
            <Leadership />
            <Milestones />
        </main>
    </div>
  );
};

export default About;
