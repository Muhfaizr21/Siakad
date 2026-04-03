import React from 'react';
import AboutHero from './components/AboutHero';
import MissionVision from './components/MissionVision';
import Values from './components/Values';
import Leadership from './components/Leadership';
import Milestones from './components/Milestones';
import Footer from '../Landing/components/Footer';

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
        {/* We are reusing the Landing footer per visual consistency guidelines */}
        <Footer />
    </div>
  );
};

export default About;
