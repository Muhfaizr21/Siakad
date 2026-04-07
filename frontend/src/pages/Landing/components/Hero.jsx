import React from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex flex-col">
            {/* Hero Background */}
            <div className="absolute inset-0 z-0">
                <img alt="Modern University Library" className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1uBZ2qlX_nWzau7-mosh_yHdRPinQPJoJyUZuVKPF9NHLr9uoG_AeayrcLe5_aCstw-Zoc7hKC4jjrwwt8nVBIv4-ioL64obVsTgNJihyhD3Rel-it1mprTp9JPmrzV4D1tfmAN-P0jjoDzwItHuDzxprOLe1Qg_R-4DmlT3Yyj97y_wWUBsP8QQDgNVEsqEULTqMmS3vtYoHROlMpyZq8iurZMhSvR6zncdMZUmfobFn_8ujZ9rOLfnmh5TuC61CNeSPs31kHN8S" />
                <div className="absolute inset-0 hero-bg-overlay"></div>
            </div>
            {/* Integrated Nav */}
            <Navbar />
            
            {/* Hero Content */}
            <div className="relative z-10 flex-grow flex items-center px-8 max-w-7xl mx-auto w-full py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
                    <div className="text-white">
                        <span
                            className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-[0.2em] mb-6">Empowering
                            Your Academic Journey</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            The Digital Heart of <span className="text-primary-fixed">BKU</span> Excellence.
                        </h1>
                        <p className="text-xl text-white/80 max-w-lg font-body leading-relaxed mb-10">
                            A centralized ecosystem designed to streamline your learning experience, from interactive course
                            modules to real-time academic tracking.
                        </p>
                        <div className="flex items-center gap-8">
                            <div className="flex -space-x-3">
                                <img alt="Student" className="w-12 h-12 rounded-full border-2 border-white object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-qRYfXZUbNS90-QslidJWIaN9-HOozD2a3Xvt4EdlmKRIVzv5ki21YM69faQvhVu0C-oXsa0bbNgwBL_voCuA4s4U73YVSNtqOXMPHsOjWnFQOoLOo1mDA1--uXX1roDMmjsx9g1Bq023YUhUsbqyWt953SBJV0_90Xrs78Fww7S5s1BmR3456ztdQUt4E_vCwboLfgQDMGR07PRyndqwr103bvMG4XDOwNL4zb9VutWY06ic1nfttN4d1wOwFLrLDsJ10oync2RJ" />
                                <img alt="Student" className="w-12 h-12 rounded-full border-2 border-white object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACmz4MWjnHNx3_2yikragrTULhPh0-QOVA15J0qMKeYGpeNRm5Xo5AmOETN0pHQrb361GURru49dz3MGOQDYzM4Vx_58ZAe0MChEhjOHq335uz7qNslz0w_wWFVYirqlySpKzmMNlLXreCENKxeOUWZMWq2byS-VBiADCDTsEM6ud3Jiz-UejgCYvx1OXCTdoaycvAfEtcXdDSkCTzwet5pcrBpNxA1nxPOcNYI54Elewl2JHpap5qvI6G4srjHng1Kf26ijNfjP-E" />
                                <img alt="Student" className="w-12 h-12 rounded-full border-2 border-white object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACCbUDsTBR3tuiUTr1AiCMFs_U5LBFITAyvB6zHhJlf8VWjrQCzgNJ48Q7IZiWWcsNFJpgiOCKn7XIotyewYrmWYlbBIjH5abcvWOhIEDF44eYCDPf_m2oIpnulaAjRu-QpbniVRD30ULF1vX6o68MNUgaGoVrI5xtfVC46ABLoMbP8LekqlF0QIAyUeu6iYib5R8FBdGCKAw7RHhue4BrvBxj9fQZccOlg_aj4qvhsUBv75xh63Z5bQ9dgoHvWaBjr_xNcu5ylk52" />
                                <div
                                    className="w-12 h-12 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-primary text-xs font-bold">
                                    +2k</div>
                            </div>
                            <p className="text-sm font-medium text-white/70">Joined by over 2,000+ <br />students this semester
                            </p>
                        </div>
                    </div>
                    {/* Glassmorphism Login Card */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-md glass-card p-10 rounded-[2.5rem] shadow-2xl">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Student Portal</h2>
                                <p className="text-on-surface-variant text-sm font-medium">Access your digital campus resources
                                </p>
                            </div>
                            <form 
                                className="space-y-5" 
                                onSubmit={(e) => { 
                                    e.preventDefault(); 
                                    navigate('/student'); 
                                }}
                            >
                                <div className="space-y-1.5">
                                    <label
                                        className="block text-xs font-bold text-primary uppercase tracking-wider ml-1">Student
                                        ID or Email</label>
                                    <input
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-outline-variant/30 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. bku-12345" type="text" />
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="block text-xs font-bold text-primary uppercase tracking-wider ml-1">Password</label>
                                    <input
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-outline-variant/30 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••" type="password" />
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                                            type="checkbox" />
                                        <span
                                            className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">Keep
                                            me signed in</span>
                                    </label>
                                    <a className="text-sm font-bold text-primary hover:underline" href="#">Forgot Password?</a>
                                </div>
                                <button
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-primary/30 hover:bg-primary-container hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95 duration-200"
                                    type="submit"
                                >
                                    Sign In to Dashboard
                                </button>
                            </form>
                            <div className="mt-8 pt-6 border-t border-primary/10 text-center">
                                <p className="text-sm text-on-surface-variant font-medium">Are you a new student? <a
                                        className="text-primary font-bold hover:underline" href="#">Onboarding Guide</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
