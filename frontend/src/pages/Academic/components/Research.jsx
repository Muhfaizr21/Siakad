import React from 'react';

const Research = () => {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl"></div>
                <div className="relative z-10 grid grid-cols-2 gap-4">
                    <img alt="Research Labs" className="rounded-xl w-full h-64 object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY8x_C_CTe-KMkgcOkppizhEKRFDvBie0Pi4F2ufVmoJx7RaIkBVaasFHtJmC-v98JVZHS7xpoZdQjqHBVizWMVRLL0lDeVJH7wSkj7nsyTIpN6ePrfbYtgFHtQHcUKAappnOJ7WYTinqTcXsTjoRBb3Ru5dUrDwPdNvXfTKbrzywk0OwrRTlj7ctPV361GC_8GMoLZxFp4Mj0bTPG6rdUPaEdUBCvdA1kvabBdZjXyvPsfgdKNDZLtSD7ZMn2lhPZNzjXXrr-nbYL" />
                    <img alt="Collaboration" className="rounded-xl w-full h-64 object-cover mt-8"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp5z_MtsZBv8BKY5WRupEMHk7p-EcSmujkAJsUEVW6tw8v25UU8J2XqB4zJYCRnP4ghngGseJeHnlkNoBlS21mMzKpXWeVXotzo2PCWxdp39ur8BQST7S6HxF913qhyfusHLf_f1045ekqME3_XOjEtimtnvG-o0iRdxj3AD7jFSTijPQao5OrIUC-oyt0vSLy6e6Pofj0EzGL41fJAG5NTSnURa-rON_rhG7aiGZjtjZhoBEjkVMpuwiHmANifOmLqaf0gdtP_y_7" />
                </div>
            </div>
            <div>
                <span className="text-primary font-headline font-bold tracking-widest text-xs uppercase mb-2">Global
                    Impact</span>
                <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-6">Research Excellence
                </h2>
                <p className="text-secondary text-lg leading-relaxed mb-8">
                    BKU is ranked among the top 1% of research institutions globally. Our commitment to discovery
                    has led to breakthroughs in sustainable energy, personalized medicine, and ethical AI
                    development.
                </p>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div
                            className="w-12 h-12 shrink-0 bg-primary-fixed rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">biotech</span>
                        </div>
                        <div>
                            <h5 className="font-headline font-bold">Interdisciplinary Labs</h5>
                            <p className="text-secondary text-sm">Where science meets humanities for holistic solutions.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div
                            className="w-12 h-12 shrink-0 bg-primary-fixed rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">public</span>
                        </div>
                        <div>
                            <h5 className="font-headline font-bold">International Fellowships</h5>
                            <p className="text-secondary text-sm">Connecting our scholars with the world's leading
                                minds.</p>
                        </div>
                    </div>
                </div>
                <button
                    className="mt-10 bg-primary text-white px-8 py-4 rounded-xl font-headline font-bold text-sm flex items-center gap-2 hover:shadow-xl transition-all active:scale-95">
                    Research Portal <span className="material-symbols-outlined">open_in_new</span>
                </button>
            </div>
        </div>
    </section>
  );
};

export default Research;
