import React from 'react';
import ServicesHeader from './components/ServicesHeader';
import ServicesGrid from './components/ServicesGrid';

const Services = () => {
  return (
    <div className="antialiased overflow-x-hidden w-full flex-grow flex flex-col" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <main className="w-full flex-grow">
        <ServicesHeader />
        <ServicesGrid />
      </main>
    </div>
  );
};

export default Services;