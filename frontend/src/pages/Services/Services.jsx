import React, { useEffect } from 'react';
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
        <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto flex-grow w-full">
            <ServicesHeader />
            <ServicesGrid />
            <ServicesRoadmap />
        </main>
    </div>
  );
};

export default Services;
