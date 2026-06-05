import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Building2, Brain, HeartPulse, Users, GraduationCap, 
  BookOpen, Sparkles, HandHelping, User, ChevronRight, Loader2, ArrowLeft 
} from 'lucide-react';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';

const ICON_MAP = {
  'shield': Shield,
  'building-2': Building2,
  'brain': Brain,
  'heart-pulse': HeartPulse,
  'users': Users,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'sparkles': Sparkles,
  'hand-helping': HandHelping,
  'user': User,
};

const getRouteByRole = (role) => {
  const r = String(role || '').toLowerCase().trim();
  if (r === 'super_admin') return '/admin';
  if (r === 'kencana_admin') return '/kencana-admin';
  if (r === 'kencana_fakultas') return '/kencana-fakultas';
  if (r === 'kencana_mentor') return '/kencana-mentor';
  if (r === 'faculty_admin' || r === 'dosen') return '/faculty';
  if (r === 'ormawa_admin' || r === 'ormawa') return '/ormawa';
  if (r === 'psikolog') return '/psychologist';
  if (r === 'tenaga_kesehatan' || r === 'tenagakes') return '/tenagakes';
  return '/student/dashboard';
};

export default function RoleSelector({ data, onBack, onError }) {
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSelectRole = async (role) => {
    setLoading(role.role);
    try {
      const response = await api.post('/auth/login/select-role', {
        temp_token: data.tempToken,
        selected_role: role.role,
      });

      if (response.data.success || response.data.status === 'success') {
        const payload = response.data.data || {};
        const token = payload.access_token || payload.token;
        if (!token) {
          onError('Token login tidak ditemukan dari server.');
          return;
        }
        setAuth(token, payload.user, payload.mahasiswa);
        navigate(getRouteByRole(role.role), { replace: true });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        onError(error.response.data.message);
      } else {
        onError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(null);
    }
  };

  const userName = data.user?.nama || data.user?.email || '';

  return (
    <div className="w-full max-w-[480px]">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 font-semibold text-[14px] mb-8 group transition-colors"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Login
      </button>

      {/* Header */}
      <div className="mb-10">
        <h2 
          className="text-[1.75rem] font-bold font-jakarta mb-3 tracking-tight"
          style={{ color: 'var(--theme-h2, #1a1a2e)' }}
        >
          Pilih Peran Anda
        </h2>
        <p className="text-neutral-500 text-[15px] leading-relaxed font-medium">
          {userName ? (
            <>Halo, <span className="text-neutral-700 font-semibold">{userName}</span>! </>
          ) : null}
          Akun Anda memiliki beberapa peran. Silakan pilih untuk melanjutkan.
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-3.5">
        {data.roles.map((role, index) => {
          const IconComponent = ICON_MAP[role.icon] || User;
          const isLoading = loading === role.role;
          const isDisabled = loading !== null && loading !== role.role;

          return (
            <button
              key={role.role}
              onClick={() => handleSelectRole(role)}
              disabled={isDisabled || isLoading}
              className="w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: isLoading ? role.color : '#e5e7eb',
                boxShadow: isLoading ? `0 0 0 3px ${role.color}20` : 'none',
                animationDelay: `${index * 80}ms`,
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isLoading) {
                  e.currentTarget.style.borderColor = role.color;
                  e.currentTarget.style.boxShadow = `0 8px 25px ${role.color}18, 0 0 0 3px ${role.color}12`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Subtle gradient background on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${role.color}06 0%, ${role.color}03 100%)` }}
              />
              
              <div className="relative flex items-center gap-4 p-5">
                {/* Icon */}
                <div 
                  className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${role.color}12` }}
                >
                  {isLoading ? (
                    <Loader2 
                      size={24} 
                      className="animate-spin" 
                      style={{ color: role.color }} 
                    />
                  ) : (
                    <IconComponent 
                      size={24} 
                      style={{ color: role.color }} 
                      strokeWidth={2} 
                    />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-bold text-[16px] text-neutral-800 group-hover:text-neutral-900 transition-colors truncate">
                    {role.label}
                  </h3>
                  <p className="text-[13px] text-neutral-500 font-medium mt-0.5 truncate">
                    {role.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight 
                  size={20} 
                  className="text-neutral-300 group-hover:text-neutral-600 flex-shrink-0 transition-all duration-300 group-hover:translate-x-1"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center">
        <p className="text-[12px] text-neutral-400 font-medium">
          Anda dapat beralih peran kapan saja dengan logout dan login kembali.
        </p>
      </div>
    </div>
  );
}
