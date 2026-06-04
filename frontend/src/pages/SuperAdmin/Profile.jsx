"use client"

import React, { useState, useEffect } from 'react'

import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'
import useAuthStore from '../../store/useAuthStore'
import { cn } from '@/lib/utils'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Avatar, AvatarFallback } from './components/ui/avatar'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Camera = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>photo_camera</span>;
const Badge = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified</span>;
const Smartphone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>smartphone</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;
const Lock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>lock</span>;
const KeyRound = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>vpn_key</span>;
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Bell = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>notifications</span>;



const AdminProfile = () => {
    const { user: authUser } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [profile, setProfile] = useState({ Email: '' })
    const [passwords, setPasswords] = useState({
        OldPassword: '',
        NewPassword: '',
        ConfirmPassword: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/admin/profile')
                if (res.data.status === 'success') {
                    setProfile(res.data.data)
                }
            } catch (err) {
                toast.error('Gagal memuat profil administratif')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault()
        setSubmitting(true)
        try {
            const res = await api.put('/admin/profile', { Email: profile.Email })
            if (res.data.status === 'success') {
                toast.success('Profil administratif berhasil diperbarui')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui profil')
        } finally {
            setSubmitting(false)
        }
    }

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault()
        if (passwords.NewPassword !== passwords.ConfirmPassword) {
            toast.error('Konfirmasi password baru tidak sesuai')
            return
        }
        setSubmitting(true)
        try {
            const res = await api.put('/admin/profile', {
                OldPassword: passwords.OldPassword,
                NewPassword: passwords.NewPassword
            })
            if (res.data.status === 'success') {
                toast.success('Kredensial keamanan berhasil diperbarui')
                setPasswords({ OldPassword: '', NewPassword: '', ConfirmPassword: '' })
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui kredensial')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined size-10 text-primary animate-spin" >sync</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Loading Personal Node...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
            <Toaster position="top-right" />
            
            <div className="max-w-[1400px] mx-auto space-y-10">
                
                {/* ── Breadcrumbs & Navigation ─────────────────────────── */}
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">
                    <span className="hover:text-primary transition-colors cursor-pointer">Super Admin Hub</span>
                    <ChevronRight size={10} className="text-neutral-300" />
                    <span className="text-neutral-900">Administrator Profile</span>
                </nav>

                {/* ── Profile Header ──────────────────────────────────────── */}
                <Card className="glass-card border-slate-200/60 shadow-none rounded-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-bku-primary/5 to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 p-12 opacity-5 text-bku-primary group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <span className="material-symbols-outlined" style={{ fontSize: '200px' }} >security</span>
                    </div>

                    <CardContent className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                        <div className="relative group/avatar">
                            <Avatar className="size-32 rounded-2xl border border-slate-200/60 shadow-md bg-gradient-to-br from-bku-primary to-indigo-700 flex items-center justify-center text-white text-5xl font-black font-headline">
                                {profile.Email?.[0]?.toUpperCase() || <User size={40} />}
                            </Avatar>
                            <Button size="icon" className="absolute -bottom-2 -right-2 h-10 w-10 bg-white text-slate-800 rounded-xl shadow-lg hover:bg-slate-100 transition-all opacity-0 group-hover/avatar:opacity-100 translate-y-2 group-hover/avatar:translate-y-0 border-none">
                                <Camera size={18} />
                            </Button>
                        </div>

                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                    <h1 className="text-4xl font-black font-headline tracking-tighter uppercase leading-none" style={{ color: 'var(--theme-h1)' }}>
                                        {profile.Email?.split('@')[0] || 'Super Administrator'}
                                    </h1>
                                    <Badge className="px-3 py-1 bg-bku-primary/10 text-bku-primary border border-bku-primary/20 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-none">Root Authority</Badge>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }} >mail</span>
                                        <span className="text-sm font-medium font-inter">{profile.Email}</span>
                                    </div>
                                    <div className="size-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1.5">
                                        <Smartphone size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest tabular-nums">Secured Device</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-8 pt-6 border-t border-slate-200/40">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '12px' }} >schedule</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined {new Date(profile.CreatedAt).getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ── Identity & Security Forms ─────────────────────────── */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                            <form onSubmit={handleUpdateProfile} className="p-8 md:p-10 space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-200/40 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black font-headline uppercase tracking-tight" style={{ color: 'var(--theme-h3)' }}>Identity Configuration</h3>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Informasi Dasar Akun Administratif</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Administrative Access Email</Label>
                                        <div className="relative group/input">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-bku-primary transition-colors" >mail</span>
                                            <Input 
                                                type="email" 
                                                value={profile.Email}
                                                onChange={(e) => setProfile({...profile, Email: e.target.value})}
                                                className="h-12 pl-12 rounded-xl border-slate-200 bg-white/60 focus:bg-white font-bold text-sm font-headline focus:ring-bku-primary/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 bg-slate-800 text-white rounded-xl font-black font-headline text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-none transition-all active:scale-95 border-none"
                                    >
                                        {submitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '16px' }} >save</span>}
                                        Update Identity Node
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                            <form onSubmit={handleChangePassword} className="p-8 md:p-10 space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-200/40 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} Alert >security</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black font-headline uppercase tracking-tight" style={{ color: 'var(--theme-h3)' }}>Security Protocol Override</h3>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Pembaruan Kredensial Akses Root</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Current Access Key</Label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-rose-500 transition-colors" />
                                            <Input 
                                                type="password" 
                                                value={passwords.OldPassword}
                                                onChange={(e) => setPasswords({...passwords, OldPassword: e.target.value})}
                                                placeholder="Current credential..."
                                                className="h-12 pl-12 rounded-xl border-slate-200 bg-white/60 focus:bg-white font-bold text-sm font-headline focus:ring-rose-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 font-headline">New Access Key</Label>
                                        <div className="relative group/input">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-rose-300 group-focus-within/input:text-rose-500 transition-colors" />
                                            <Input 
                                                type="password" 
                                                value={passwords.NewPassword}
                                                onChange={(e) => setPasswords({...passwords, NewPassword: e.target.value})}
                                                placeholder="New strong key..."
                                                className="h-12 pl-12 rounded-xl border-rose-200 bg-rose-50/50 focus:bg-white font-bold text-sm font-headline focus:ring-rose-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Confirm New Key</Label>
                                        <div className="relative group/input">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-rose-500 transition-colors" />
                                            <Input 
                                                type="password" 
                                                value={passwords.ConfirmPassword}
                                                onChange={(e) => setPasswords({...passwords, ConfirmPassword: e.target.value})}
                                                placeholder="Repeat new key..."
                                                className="h-12 pl-12 rounded-xl border-slate-200 bg-white/60 focus:bg-white font-bold text-sm font-headline focus:ring-rose-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 bg-rose-600 text-white rounded-xl font-black font-headline text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-none transition-all active:scale-95 border-none"
                                    >
                                        {submitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '16px' }} >security</span>}
                                        Update Security Credential
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* ── Sidebar Stats ────────────────────────────────────── */}
                    <aside className="lg:col-span-4 space-y-8">
                        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden group">
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-1 border-l-2 border-bku-primary pl-4">
                                    <h4 className="text-xs font-black font-headline uppercase tracking-widest" style={{ color: 'var(--theme-h4)' }}>Audit Activity</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Logs</p>
                                </div>
                                
                                <div className="space-y-6">
                                    {[
                                        { label: "Recent Event", val: "Updated Global RBAC", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                                        { label: "Security Status", val: "0 Unguarded Nodes", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex gap-5 group/stat">
                                            <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 border border-transparent transition-all group-hover/stat:scale-110 shadow-none", stat.bg, stat.color)}>
                                                <stat.icon size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black font-headline text-slate-800 uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-[11px] font-medium text-slate-500 uppercase font-inter italic line-clamp-1">"{stat.val}"</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter tabular-nums mt-1">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-slate-200/60 text-slate-800 shadow-none rounded-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-bku-primary/5 to-transparent pointer-events-none" />
                            <div className="absolute -bottom-10 -right-10 p-12 opacity-5 text-bku-primary group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                <span className="material-symbols-outlined" style={{ fontSize: '150px' }} >security</span>
                            </div>

                            <CardContent className="p-8 space-y-6 relative z-10">
                                <h4 className="text-[10px] font-black font-headline uppercase tracking-[0.4em]" style={{ color: 'var(--theme-h4)' }}>Node Security Status</h4>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Master Encryption</span>
                                            <span className="text-xs font-black text-slate-800 uppercase font-headline">256-bit AES</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                                            <div className="w-[95%] h-full bg-emerald-500 rounded-full shadow-none" />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/60 rounded-xl border border-slate-200/60 flex items-center gap-3">
                                       <Zap size={14} className="text-bku-primary animate-pulse" />
                                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Last verified by System Core @ 15:44 UTC</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>

            </div>
        </div>
    )
}

export default AdminProfile
