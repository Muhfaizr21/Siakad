import React from 'react';
import Navbar from '../../Landing/components/Navbar';

const AboutHero = () => {
  return (
    <section className="relative h-[716px] flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover"
                alt="stately neo-gothic university library with large arched windows and stone masonry in soft morning sunlight"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGlAKDQN83dAeuGVlHtbB1c2CHQmUE2iGGipEOPFuQuCQi8N9SDWGqJmpSepAt6rxuWNGO-9bqbdr9FSXw3n_EAgIUrET5DcEi3Sq-De_HYg2usUAWt5EzXtpIW2EPZuoOJgla6MrYSUhqPxwYz_m4LOxBEnJk-Pvc3dhno-RUtZoL185JL-ks3N41zndjwMroalGAPqEu8JtrXc8j3TsXNFpwAVDMLIk4m-Yq5M1UIsFcmWrZ0r5xY98GTZDErvEPAoFOuA1TJ3kJ" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40"></div>
        </div>
        
        {/* Reusing Landing Navbar logic inside Hero */}
        <Navbar />

        <div className="relative z-10 flex-grow flex items-center max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-2xl">
                <span
                    className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest mb-6 border border-white/20">ESTABLISHED
                    1924</span>
                <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">A Century of
                    Academic <span className="text-blue-200  font-medium">Excellence.</span></h1>
                <p className="text-xl text-blue-50/90 leading-relaxed max-w-xl">BKU has been the cornerstone of
                    intellectual growth and innovation, fostering a community where tradition meets the future.</p>
            </div>
        </div>
    </section>
  );
};

export default AboutHero;
