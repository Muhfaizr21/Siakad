import React, { useState, useEffect } from "react";

export default function LoginPage() {
    const [dbStatus, setDbStatus] = useState("Checking database connection...");

    useEffect(() => {
        fetch("http://localhost:8000/api/health")
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setDbStatus("🟢 Database 'siakad' Connected successfully via Golang Backend");
                } else {
                    setDbStatus("🔴 Database Connection error");
                }
            })
            .catch(err => {
                setDbStatus("🔴 Backend is offline");
            });
    }, []);

    return (
        <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
            {/* TopNavBar: Fixed Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center px-8 h-16 w-full max-w-full">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-bold text-[#00236f] font-headline">BKU Student Hub</span>
                        <div className="hidden md:flex gap-6">
                            <a className="text-slate-600 hover:text-[#00236f] font-headline font-medium tracking-tight transition-all duration-300 hover:opacity-80" href="#">Dashboard</a>
                            <a className="text-slate-600 hover:text-[#00236f] font-headline font-medium tracking-tight transition-all duration-300 hover:opacity-80" href="#">Courses</a>
                            <a className="text-slate-600 hover:text-[#00236f] font-headline font-medium tracking-tight transition-all duration-300 hover:opacity-80" href="#">Library</a>
                            <a className="text-slate-600 hover:text-[#00236f] font-headline font-medium tracking-tight transition-all duration-300 hover:opacity-80" href="#">Services</a>
                        </div>

                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500" data-icon="help_outline">help_outline</span>
                            <span className="material-symbols-outlined text-slate-500" data-icon="notifications">notifications</span>
                        </div>
                        <button className="bg-primary text-on-primary px-6 py-2 rounded-xl font-headline font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero/Login Canvas */}
            <main className="relative flex-grow flex items-center justify-center pt-16 overflow-hidden">
                {/* Background Layer: Editorial Tonal Transition */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-container-low opacity-90"></div>
                    <img 
                        alt="BKU Campus" 
                        className="w-full h-full object-cover mix-blend-overlay opacity-30"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs8mZVr9W5GMzV39aWL82YLk4swsv-F22zXYi_0BqR2o8GP1OUWIVa69NHAYdwZGDTeufIQ-w39OCXrmZlSXMGDkJf5wymg3Ylwt-f1XQ08-_Nhc1yepaHLt0Pu7xnE4fLxYh4uL8cCVHvmUUOPjjhP9ei21h80-kvX2HjOlFxwbBp8ji9JqPBEDs8AibnpBrKgijJuuqQyll7kZx6XVAJczmBYtN_aA0EoTBv_gl1Zlq8nR4kWE1ApDTN31Iw295cIbDJs76Q3nEr" 
                    />
                </div>

                {/* Floating Decorative Elements */}
                <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl"></div>

                {/* Centered Login Card */}
                <section className="relative z-10 w-full max-w-md px-6 py-12">
                    <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 tonal-layering border border-outline-variant/10">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mb-4 text-primary">
                                <span className="material-symbols-outlined text-3xl font-bold" data-icon="school">school</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-on-background font-headline tracking-tight text-center">Welcome Back</h1>
                            <p className="text-on-surface-variant font-body text-sm mt-2 text-center">Secure access to your academic journey</p>
                            <p className="font-body text-xs font-bold mt-4 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">{dbStatus}</p>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant font-label ml-1" htmlFor="id">Email or NIM</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" data-icon="person">person</span>
                                    <input 
                                        className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 outline-none" 
                                        id="id" 
                                        placeholder="yourname@student.bku.ac.id" 
                                        type="text" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-semibold text-on-surface-variant font-label" htmlFor="password">Password</label>
                                    <a className="text-xs font-bold text-primary hover:underline transition-all" href="#">Forgot Password?</a>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" data-icon="lock">lock</span>
                                    <input 
                                        className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-0 rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 outline-none" 
                                        id="password" 
                                        placeholder="••••••••" 
                                        type="password" 
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface-variant" data-icon="visibility">visibility</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-1">
                                <input className="w-4 h-4 rounded-sm border-outline-variant text-primary focus:ring-primary/20" id="remember" type="checkbox" />
                                <label className="text-xs text-on-surface-variant font-medium" htmlFor="remember">Keep me logged in on this device</label>
                            </div>

                            <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-lg transition-all duration-300 hover:bg-primary-container hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] mt-2" type="submit">
                                Sign In to Hub
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
                            <p className="text-xs text-on-surface-variant font-body">
                                New student? <a className="text-primary font-bold hover:underline" href="#">Request portal access</a>
                            </p>
                        </div>
                    </div>

                    {/* Contextual Support Prompt */}
                    <div className="mt-6 flex justify-center gap-4 text-on-surface-variant/60 font-medium text-xs">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm" data-icon="verified_user">verified_user</span> Encrypted Session</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm" data-icon="contact_support">contact_support</span> 24/7 Support</span>
                    </div>
                </section>
            </main>

            {/* Footer: Tonal Separation */}
            <footer className="w-full py-12 bg-[#fcf9f8] border-t border-slate-200/15 text-center">
                <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-headline">
                        <a className="text-slate-500 hover:text-[#00236f] transition-colors" href="#">Privacy Policy</a>
                        <a className="text-slate-500 hover:text-[#00236f] transition-colors" href="#">Terms of Service</a>
                        <a className="text-slate-500 hover:text-[#00236f] transition-colors" href="#">Accessibility</a>
                        <a className="text-slate-500 hover:text-[#00236f] transition-colors" href="#">Contact Support</a>
                    </div>
                    <div className="flex items-center gap-4 py-4 justify-center w-full">
                        <div className="w-8 h-px bg-outline-variant/30"></div>
                        <span className="text-md font-bold text-slate-900 font-headline">BKU</span>
                        <div className="w-8 h-px bg-outline-variant/30"></div>
                    </div>
                    <p className="font-body text-sm text-slate-400">© 2024 BKU Student Hub. All Rights Reserved.</p>
                    <div className="flex gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all justify-center w-full">
                        <span className="material-symbols-outlined cursor-pointer" data-icon="language">language</span>
                        <span className="material-symbols-outlined cursor-pointer" data-icon="hub">hub</span>
                        <span className="material-symbols-outlined cursor-pointer" data-icon="public">public</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}