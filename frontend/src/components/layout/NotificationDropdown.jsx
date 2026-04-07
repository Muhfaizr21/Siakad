import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Bell, 
  Trophy, 
  BookOpen, 
  HeartHandshake, 
  MessageSquare, 
  GraduationCap, 
  Check, 
  ChevronRight,
  Info,
  CheckCircle2,
  Dot
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
  achievement: <Trophy size={16} className="text-[#00236F]" />,
  beasiswa: <GraduationCap size={16} className="text-[#00236F]" />,
  konseling: <HeartHandshake size={16} className="text-[#00236F]" />,
  student_voice: <MessageSquare size={16} className="text-[#00236F]" />,
  kencana: <BookOpen size={16} className="text-[#00236F]" />,
  sistem: <Bell size={16} className="text-[#00236F]" />,
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Polling strategy: check unread count every 30s
  const { data: unreadData } = useQuery({
    queryKey: ['notifikasi', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifikasi/unread-count');
      return data;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notifikasi', 'list-dropdown'],
    queryFn: async () => {
      const { data } = await api.get('/notifikasi?status=unread');
      // Just take the latest 5 for dropdown
      return data.data.slice(0, 5);
    },
    enabled: isOpen
  });

  const markReadMutation = useMutation({
    mutationFn: async (notifId) => {
      await api.put(`/notifikasi/${notifId}/baca`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifikasi']);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifikasi/baca-semua');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifikasi']);
    }
  });

  // Handle click away
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClick = (notif) => {
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
          isOpen ? 'bg-[#EAF1FF] text-[#00236F]' : 'hover:bg-[#fafafa] text-[#525252]'
        }`}
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-[ring_2s_ease-in-out_infinite]' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#dc2626] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[360px] md:w-[380px] bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#f5f5f5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#171717]">Notifikasi</h3>
                {unreadCount > 0 && (
                   <span className="bg-[#EAF1FF] text-[#00236F] text-[10px] font-black px-2 py-0.5 rounded-lg border border-[#C9D8FF]">
                      {unreadCount} BARU
                   </span>
                )}
              </div>
              <button 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs font-bold text-[#00236F] hover:underline disabled:opacity-50"
                disabled={unreadCount === 0}
              >
                Tandai semua dibaca
              </button>
            </div>

            {/* List */}
            <div className="max-height-[400px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                 <div className="p-10 text-center">
                    <div className="w-6 h-6 border-2 border-[#00236F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#a3a3a3] font-bold">Memuat...</p>
                 </div>
              ) : notifData?.length > 0 ? (
                <div className="divide-y divide-[#f5f5f5]">
                  {notifData.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-[#fafafa] relative ${
                        !notif.is_read ? 'bg-[#EAF1FF]/50' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-[#e5e5e5] bg-white`}>
                          {CATEGORY_ICONS[notif.type] || <Bell size={16} />}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                           <h4 className={`text-xs truncate ${!notif.is_read ? 'font-bold text-[#171717]' : 'font-semibold text-[#525252]'}`}>
                             {notif.title}
                           </h4>
                           <span className="text-[10px] font-bold text-[#a3a3a3] flex-shrink-0">
                              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                           </span>
                        </div>
                        <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                          {notif.content}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <div className="flex-shrink-0 self-center">
                          <div className="w-2 h-2 bg-[#00236F] rounded-full shadow-[0_0_8px_rgba(0,35,111,0.5)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#f5f5f5]">
                    <Bell size={28} className="text-[#d4d4d4]" />
                  </div>
                  <p className="text-sm font-bold text-[#171717]">Belum ada notifikasi</p>
                  <p className="text-xs text-[#a3a3a3] mt-1">Event terbaru kamu akan muncul di sini.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <button 
              onClick={() => { setIsOpen(false); navigate('/student/notifikasi'); }}
              className="w-full p-4 border-t border-[#f5f5f5] text-xs font-bold text-[#171717] hover:bg-[#fafafa] transition-colors flex items-center justify-center gap-2"
            >
              Lihat Semua Notifikasi
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles for Ring Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ring {
          0% { transform: rotate(0); }
          5% { transform: rotate(15deg); }
          10% { transform: rotate(-15deg); }
          15% { transform: rotate(10deg); }
          20% { transform: rotate(-10deg); }
          25% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
      `}} />
    </div>
  );
}
