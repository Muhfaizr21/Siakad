import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-white transition-opacity duration-300">
        <div className="w-full px-8 py-20 flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto">
            <div className="flex flex-col gap-6">
                <div className="text-2xl font-extrabold tracking-tighter">
                    BKU <span className="opacity-70 font-normal text-white">Student Hub</span>
                </div>
                <p className="max-w-xs text-slate-600 text-sm leading-relaxed">
                    The official student portal for BKU, providing excellence in digital education management since
                    2024.
                </p>
                <div className="flex gap-4">
                    <div
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-lg">language</span>
                    </div>
                    <div
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-lg">help_outline</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-10">
                <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Resources</span>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Library Access</a>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">E-Learning Portal</a>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">IT Support</a>
                </div>
                <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Institution</span>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Privacy Policy</a>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Terms of Service</a>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Contact Us</a>
                </div>
                <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Portal</span>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Faculty Login</a>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Admin Login</a>
                    <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Mobile App</a>
                </div>
            </div>
        </div>
        <div
            className="w-full max-w-7xl mx-auto px-8 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
            <p>© 2024 BKU Student Hub. Institutional excellence in every pixel.</p>
            <div className="flex gap-6">
                <span>v4.2.0-stable</span>
                <span>Uptime: 99.99%</span>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
