import React, { useEffect } from 'react';
import Navbar from '../Landing/components/Navbar';
import Footer from '../Landing/components/Footer';
import ServicesHeader from './components/ServicesHeader';
import ServicesGrid from './components/ServicesGrid';
import ServicesRoadmap from './components/ServicesRoadmap';

const Services = () => {
  // Ensure starting at top of page on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col">
        {/* Pass theme="light" because Services doesn't have a dark hero image overlaying it */}
        <Navbar theme="light" />
        <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto flex-grow w-full">
            <ServicesHeader />
            <ServicesGrid />
            <ServicesRoadmap />
        </main>
        <Footer />
    </div>
  );
};

export default Services;
