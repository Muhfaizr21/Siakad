import React from 'react';
import Navbar from '../../Landing/components/Navbar';

const AcademicHero = () => {
  return (
    <section className="relative h-[614px] flex flex-col overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
            <img alt="BKU Campus" className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9lX3EypKOCc3S8wPp4Llf2x10Ejr2WT-633nk1LFV_l9L0xd40ee1nTtGKGbkTfGo4Pw8oaMGAi2wcag-puotM4blcGNtDSB09gIAj5c0Y4uKjywyqdt1OTeRA1KWix5xnTkyN_XStfoIDoRziX4zpvZ8zovcTDCD-l3X6t0o_q3Ej6IbExReqm23doLIT-rzyLfKbdXrMwzoY8Tb4pRrYt39G9Z4u2gBLwwjR4beHMYi_yszwqTmVM51BotBznMEDXmjphhJzFDE" />
            <div className="absolute inset-0 bg-primary/40 glass-effect"></div>
        </div>
        
        {/* We keep Navbar here to preserve the transparent overlay effect */}
        <Navbar />
        
        <div className="relative z-10 flex-grow flex items-center max-w-7xl mx-auto px-8 w-full">
            <div>
                <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                    Excellence in <br /><span className="text-primary-fixed">Higher Learning.</span>
                </h1>
                <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed font-body">
                    Empowering the next generation of leaders through rigorous academic programs, world-class faculty,
                    and pioneering research initiatives.
                </p>
            </div>
        </div>
    </section>
  );
};

export default AcademicHero;
