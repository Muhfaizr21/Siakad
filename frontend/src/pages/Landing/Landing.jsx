import React from 'react';
import Hero from './components/Hero';
import Gateways from './components/Gateways';
import Features from './components/Features';
import Timeline from './components/Timeline';
import Footer from './components/Footer';

const Landing = () => {
  return (
    <div className="bg-surface text-on-surface">
      <Hero />
      <Gateways />
      <Features />
      <Timeline />
      <Footer />
    </div>
  );
};

export default Landing;
