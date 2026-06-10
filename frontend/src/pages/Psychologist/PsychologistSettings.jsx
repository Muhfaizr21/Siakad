import React, { useEffect, useMemo, useState } from 'react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Lock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>lock</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Shield = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>security</span>;
const Briefcase = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>work</span>;
const MapPin = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>location_on</span>;
const Languages = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>language</span>;
const DollarSign = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>attach_money</span>;
const Globe = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>public</span>;
const Key = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>vpn_key</span>;



const EMPTY_PROFILE = {
  nama: '',
  email: '',
  spesialisasi: '',
  no_hp: '',
  bio: '',
  lokasi: '',

  bahasa: '',
};

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const FIELD_CLASS = 'w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
};

export default function PsychologistSettings() {
  const [activeTab, setActiveTab] = useState('profil');
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [schedules, setSchedules] = useState([]);
  const [password, setPassword] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([psychologistService.getMe(), psychologistService.getSchedules()])
      .then(([profileRes, scheduleRes]) => {
        if (!mounted) return;
        setProfile({ ...EMPTY_PROFILE, ...(profileRes.data || {}) });
        setSchedules(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Gagal memuat pengaturan.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const groupedSchedules = useMemo(() => {
    const groups = Object.fromEntries(DAYS.map((day) => [day, []]));
    schedules.forEach((day) => {
      const slots = Array.isArray(day.slots) ? day.slots : [];
      groups[day.day] = slots.filter((slot) => day.enabled && slot.enabled !== false);
    });
    return groups;
  }, [schedules]);

  const tabs = [
    { id: 'profil', label: 'Profil Publik', icon: User },
    { id: 'keamanan', label: 'Keamanan', icon: Shield },
    { id: 'praktek', label: 'Pengaturan Praktek', icon: Briefcase },
  ];

  const updateProfileField = (key, value) => {
    setMessage('');
    setError('');
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving('profile');
    setMessage('');
    setError('');
    try {
      const payload = { ...profile };
      const res = await psychologistService.updateProfile(payload);
      setProfile({ ...EMPTY_PROFILE, ...(res.data || {}) });
      setMessage('Profil berhasil disimpan ke psikolog.profiles.');
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving('');
    }
  };

  const savePassword = async () => {
    setSaving('password');
    setMessage('');
    setError('');
    try {
      await psychologistService.changePassword(password);
      setPassword({ old_password: '', new_password: '', confirm_password: '' });
      setMessage('Password berhasil diperbarui di public.users.');
    } catch (err) {
      setError(err?.message || 'Gagal memperbarui password.');
    } finally {
      setSaving('');
    }
  };

  return (
    <div className="w-full relative space-y-6 min-h-screen bg-transparent font-inter pb-8">
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
              <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                  Settings
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                Pengaturan <span className="text-primary font-black">Akun</span>
              </h1>
              <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                Profil tersimpan di psikolog.profiles, jadwal di psikolog.schedule_slots, dan password di public.users.
              </p>
            </div>
          </div>
        </div>
      </section>

          {message && (
            <div className="flex items-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700">
              <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
              <p className="text-sm font-semibold">{message}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg">error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <aside className="space-y-2 lg:col-span-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border text-slate-500 hover:bg-slate-50'}`}
                  style={activeTab !== tab.id ? { backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' } : {}}
                >
                  <tab.icon size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </aside>

            <section className="lg:col-span-9">
              <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                {loading ? (
                  <div className="flex min-h-96 items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl shrink-0">sync</span>
                  </div>
                ) : (
                  <>
                    {activeTab === 'profil' && (
                      <div className="space-y-6 p-5 lg:p-5">
                        <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 md:flex-row md:items-center">
                          <div className="flex size-28 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-white shadow-lg shadow-primary/20 overflow-hidden relative">
                            {getInitials(profile.nama)}
                          </div>
                          <div>
                            <h2 className="text-sm font-black font-headline uppercase tracking-widest" style={{ color: 'var(--theme-h2)' }}>Identitas Profesional</h2>
                            <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-slate-400">
                              Data ini digunakan oleh portal booking mahasiswa dan dashboard psikolog.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <Field label="Nama Lengkap" icon={User}>
                            <input value={profile.nama || ''} onChange={(e) => updateProfileField('nama', e.target.value)} className={FIELD_CLASS} />
                          </Field>
                          <Field label="Email Institusi" icon={Mail}>
                            <input value={profile.email || ''} onChange={(e) => updateProfileField('email', e.target.value)} className={FIELD_CLASS} />
                          </Field>
                          <Field label="Spesialisasi" icon={Briefcase}>
                            <input value={profile.spesialisasi || ''} onChange={(e) => updateProfileField('spesialisasi', e.target.value)} className={FIELD_CLASS} />
                          </Field>
                          <Field label="Nomor Telepon" icon={Phone}>
                            <input value={profile.no_hp || ''} onChange={(e) => updateProfileField('no_hp', e.target.value)} className={FIELD_CLASS} />
                          </Field>
                          <Field label="Lokasi Praktik" icon={MapPin}>
                            <input value={profile.lokasi || ''} onChange={(e) => updateProfileField('lokasi', e.target.value)} className={FIELD_CLASS} />
                          </Field>
                          <Field label="Bahasa" icon={Languages}>
                            <input value={profile.bahasa || ''} onChange={(e) => updateProfileField('bahasa', e.target.value)} className={FIELD_CLASS} placeholder="Indonesia, Inggris" />
                          </Field>

                          <div className="md:col-span-2">
                            <Field label="Bio Profesional" icon={Globe}>
                              <textarea
                                value={profile.bio || ''}
                                onChange={(e) => updateProfileField('bio', e.target.value)}
                                className={`${FIELD_CLASS} min-h-32 resize-none`}
                              />
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'keamanan' && (
                      <div className="space-y-6 p-5 lg:p-5">
                        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                          <div className="flex items-start gap-3">
                            <Lock size={22} className="mt-0.5 text-amber-600" />
                            <div>
                              <h2 className="text-xs font-black uppercase tracking-widest text-amber-700">Keamanan Akun</h2>
                              <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700/70">
                                Perubahan password langsung memperbarui hash password akun psikolog di database.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="max-w-lg space-y-5">
                          <Field label="Password Saat Ini" icon={Key}>
                            <input
                              type="password"
                              value={password.old_password}
                              onChange={(e) => setPassword((prev) => ({ ...prev, old_password: e.target.value }))}
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field label="Password Baru" icon={Lock}>
                            <input
                              type="password"
                              value={password.new_password}
                              onChange={(e) => setPassword((prev) => ({ ...prev, new_password: e.target.value }))}
                              className={FIELD_CLASS}
                              placeholder="Minimal 8 karakter"
                            />
                          </Field>
                          <Field label="Konfirmasi Password Baru" icon={Lock}>
                            <input
                              type="password"
                              value={password.confirm_password}
                              onChange={(e) => setPassword((prev) => ({ ...prev, confirm_password: e.target.value }))}
                              className={FIELD_CLASS}
                            />
                          </Field>
                        </div>
                      </div>
                    )}

                    {activeTab === 'praktek' && (
                      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2 lg:p-5">
                        <div className="space-y-4">
                          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                            <span className="material-symbols-outlined text-lg shrink-0">schedule</span>
                            Jadwal Dari Database
                          </h2>
                          <div className="space-y-3">
                            {DAYS.map((day) => (
                              <div key={day} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{day}</span>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{groupedSchedules[day]?.length || 0} slot</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {groupedSchedules[day]?.length ? (
                                    groupedSchedules[day].map((slot, index) => (
                                      <span key={`${day}-${slot.start}-${index}`} className="rounded-xl bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                                        {slot.start} - {slot.end}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] font-semibold text-slate-400">Tidak aktif</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="rounded-2xl bg-slate-950 p-5 text-white">
                            <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/40">Tarif Konseling / Sesi</p>
                            <p className="font-headline text-3xl font-black">GRATIS</p>
                            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/45">Layanan konseling di-cover sepenuhnya oleh kampus.</p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Bahasa Layanan</p>
                            <div className="flex flex-wrap gap-2">
                              {(profile.bahasa || 'Indonesia')
                                .split(',')
                                .map((lang) => lang.trim())
                                .filter(Boolean)
                                .map((lang) => (
                                  <span key={lang} className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                                    {lang}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 border-t px-6 py-5 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)' }}>
                      {activeTab === 'keamanan' ? (
                        <button
                          type="button"
                          onClick={savePassword}
                          disabled={saving === 'password'}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
                        >
                          {saving === 'password' ? <span className="material-symbols-outlined animate-spin text-base shrink-0">sync</span> : <span className="material-symbols-outlined text-base shrink-0">save</span>}
                          Simpan Password
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={saving === 'profile'}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
                        >
                          {saving === 'profile' ? <span className="material-symbols-outlined animate-spin text-base shrink-0">sync</span> : <span className="material-symbols-outlined text-base shrink-0">save</span>}
                          Simpan Profil
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
        {React.createElement(icon, { size: 13 })}
        {label}
      </span>
      {children}
    </label>
  );
}
