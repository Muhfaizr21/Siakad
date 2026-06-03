import React, { useEffect } from 'react';
import AnnouncementTicker from './components/AnnouncementTicker';
import HomeHero from './components/HomeHero';
import AboutSection from './components/AboutSection';
import FacultySection from './components/FacultySection';
import AdvantagesSection from './components/AdvantagesSection';
import FeatureSection from './components/FeatureSection';
import NewsSection from './components/NewsSection';
import CampusLocations from './components/CampusLocations';
import RegistrationCTA from './components/RegistrationCTA';

export default function Home() {
  // Ensure the page starts at the top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="antialiased overflow-x-hidden w-full"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)'
      }}
    >
      {/* 1. Infinite Announcement Marquee */}
      <AnnouncementTicker />

      {/* 2. Hero Section with stats & animations */}
      <HomeHero />

      {/* 3. Legacy and core points of BKU */}
      <AboutSection />

      {/* 4. Faculty & Study Programs listing */}
      <FacultySection />

      {/* 5. Prestige & Advantages highlights */}
      <AdvantagesSection />

      {/* 6. BKU Hub Platform Key modules */}
      <FeatureSection />

      {/* 7. Campus Locations Grid */}
      <CampusLocations />

      {/* 8. Latest Campus News feed */}
      <NewsSection />

      {/* 9. Registration Call to Action */}
      <RegistrationCTA />
    </div>
  );
}
