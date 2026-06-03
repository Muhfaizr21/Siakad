"use client"

import React, { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import {
  User,
  Key,
  Loader2,
  ShieldCheck
} from "lucide-react"
import api from "../../lib/axios"
import { Button } from "./components/button"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function Settings() {
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile]       = useState({ email: '', role: '' })
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/faculty/profile')
      if (data.success) {
        setProfile({ email: data.data.email, role: data.data.role })
      }
    } catch {
      toast.error('Gagal memuat profil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.put('/faculty/profile', { email: profile.email })
      if (data.success) {
        toast.success('Email berhasil diperbarui')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui email')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error('Konfirmasi password tidak cocok')
    }
    setSubmitting(true)
    try {
      const { data } = await api.put('/faculty/change-password', passwordData)
      if (data.success) {
        toast.success('Password berhasil diperbarui')
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui password')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin size-8 text-primary" />
        <p className="text-sm text-slate-400 font-medium">Memuat profil...</p>
      </div>
    )
  }

  return (
    <PageContainer className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />

      {/* Standard Header */}
      <PageHeader
        icon={ShieldCheck}
        title="Pengaturan Akun"
        description="Kelola Keamanan & Akses Portal"
      />

      {/* Card 1: Account Information */}
      <ResponsiveCard>
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline flex items-center gap-2">
              <User className="size-4 text-slate-500" />
              Account Information
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Update your email address and username
            </p>
          </div>

          <form onSubmit={handleUpdateEmail} className="space-y-6">
            <ResponsiveGrid cols={2}>
              {/* Email field */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Email Address</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-12 rounded-2xl font-bold font-headline bg-transparent border-slate-200/60 focus:bg-white transition-all shadow-none"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Username field (disabled/read-only) */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Username</Label>
                <Input
                  type="text"
                  value={profile.email ? profile.email.split('@')[0] : 'admin'}
                  className="h-12 rounded-2xl font-bold font-headline bg-slate-50 border-slate-200/60 text-slate-400 cursor-not-allowed shadow-none"
                  disabled
                />
              </div>
            </ResponsiveGrid>

            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 px-8 rounded-2xl font-headline bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {submitting ? (
                  <Loader2 className="animate-spin size-4 mr-2" />
                ) : null}
                Update Account Info
              </Button>
            </div>
          </form>
        </div>
      </ResponsiveCard>

      {/* Card 2: Change Password */}
      <ResponsiveCard>
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline flex items-center gap-2">
              <Key className="size-4 text-slate-500" />
              Change Password
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Update your account password
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Current Password */}
              <div className="space-y-2 col-span-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="h-12 rounded-2xl font-bold font-headline bg-transparent border-slate-200/60 focus:bg-white transition-all shadow-none placeholder:text-slate-300"
                  placeholder="Enter current password"
                  required
                />
              </div>
              
              {/* Empty grid cell to keep current password taking only half-width on md devices */}
              <div className="hidden md:block col-span-1" />

              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">New Password</Label>
                <Input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="h-12 rounded-2xl font-bold font-headline bg-transparent border-slate-200/60 focus:bg-white transition-all shadow-none placeholder:text-slate-300"
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Confirm Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="h-12 rounded-2xl font-bold font-headline bg-transparent border-slate-200/60 focus:bg-white transition-all shadow-none placeholder:text-slate-300"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 px-8 rounded-2xl font-headline bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {submitting ? (
                  <Loader2 className="animate-spin size-4 mr-2" />
                ) : null}
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </ResponsiveCard>
    </PageContainer>
  )
}
