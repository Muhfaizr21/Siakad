import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const NavItem = ({ to, children, isLight }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => 
            `relative group transition-colors font-headline font-semibold text-sm uppercase tracking-widest ` +
            (isLight 
                ? (isActive ? 'text-primary' : 'text-secondary hover:text-primary') 
                : (isActive ? 'text-white' : 'text-white/90 hover:text-white'))
        }
    >
        {({ isActive }) => (
            <>
                {children}
                <span 
                    className={`absolute -bottom-1.5 left-0 h-[2px] transition-all duration-300 ease-out rounded-full ${isLight ? 'bg-primary' : 'bg-white'} ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                ></span>
            </>
        )}
    </NavLink>
);

const Navbar = ({ theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <nav className={`${isLight ? 'fixed top-0 bg-surface/80 backdrop-blur-md shadow-sm' : 'relative z-20'} w-full z-50 transition-all`}>
            <div className={`flex justify-between items-center px-8 max-w-7xl mx-auto ${isLight ? 'h-24' : 'py-8'}`}>
                <Link to="/" className={`text-2xl font-extrabold tracking-tighter hover:opacity-90 transition-opacity ${isLight ? 'text-primary' : 'text-white'}`}>
                    BKU <span className={`font-normal opacity-80 ${isLight ? 'text-primary-fixed-variant' : 'text-primary-fixed'}`}>Student Hub</span>
                </Link>
                <div className="hidden md:flex items-center gap-x-10">
                    <NavItem to="/about" isLight={isLight}>About</NavItem>
                    <NavItem to="/academic" isLight={isLight}>Academic</NavItem>
                    <NavItem to="/services" isLight={isLight}>Services</NavItem>
                    <Link to="/login">
                        <button
                            className={`ml-4 px-8 py-2.5 rounded-full font-bold transition-all active:scale-95 duration-200 shadow-lg ${isLight ? 'bg-primary text-white hover:bg-primary-container shadow-primary/20' : 'bg-white text-primary hover:bg-primary-fixed shadow-black/10'}`}>
                            Staff Login
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
