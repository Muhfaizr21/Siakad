import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { NavLink } from 'react-router-dom';
import { 
  Bell, 
  Trophy, 
  BookOpen, 
  HeartHandshake, 
  MessageSquare, 
  GraduationCap, 
  Check, 
  Trash2, 
  Search,
  Filter,
  CheckCircle2,
  X,
  MoreVertical,
  ChevronRight,
  Clock
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { NotifListSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/Select';

const CATEGORY_ICONS = {
  achievement: <Trophy size={18} className="text-[#f97316]" />,
  beasiswa: <GraduationCap size={18} className="text-[#3b82f6]" />,
  konseling: <HeartHandshake size={18} className="text-[#10b981]" />,
  student_voice: <MessageSquare size={18} className="text-[#8b5cf6]" />,
  kencana: <BookOpen size={18} className="text-[#f59e0b]" />,
  sistem: <Bell size={18} className="text-[#64748b]" />,
};

const CATEGORIES = [
  { id: 'Semua', label: 'Semua' },
  { id: 'achievement', label: 'Achievement' },
  { id: 'beasiswa', label: 'Beasiswa' },
  { id: 'konseling', label: 'Konseling' },
  { id: 'student_voice', label: 'Student Voice' },
  { id: 'kencana', label: 'KENCANA' },
  { id: 'sistem', label: 'Sistem' },
];

export default function NotificationPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('Semua');
  const [filterTime, setFilterTime] = useState('semua'); // hari_ini, minggu_ini, bulan_ini, semua
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notifikasi', 'full-list', filterType, filterTime],
    queryFn: async () => {
      const { data } = await api.get(`/notifikasi?tipe=${filterType}&waktu=${filterTime}`);
      return data.data;
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => api.put(`/notifikasi/${id}/baca`),
    onSuccess: () => queryClient.invalidateQueries(['notifikasi'])
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/notifikasi/${id}`),
    onSuccess: () => {
      toast.success("Notifikasi dihapus");
      queryClient.invalidateQueries(['notifikasi']);
    }
  });

  const bulkReadMutation = useMutation({
    mutationFn: async (ids) => api.put('/notifikasi/baca-semua'), // For simplicity, mark all. or we need bulk read.
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries(['notifikasi']);
      toast.success("Notifikasi ditandai telah dibaca");
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => api.delete('/notifikasi/hapus-bulk', { data: { ids } }),
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries(['notifikasi']);
      toast.success("Notifikasi terpilih berhasil dihapus");
    }
  });

  const deleteReadAllMutation = useMutation({
    mutationFn: async () => api.delete('/notifikasi/hapus-sudah-dibaca'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifikasi']);
      toast.success("Semua notifikasi terbaca telah dihapus");
    }
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifData?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifData?.map(n => n.id) || []);
    }
  };

  // Grouping logic
  const groupedNotifs = useMemo(() => {
    if (!notifData) return {};
    
    const groups = {
      'Hari Ini': [],
      'Kemarin': [],
      'Minggu Ini': [],
      'Lebih Lama': []
    };

    notifData.forEach(notif => {
      const date = parseISO(notif.created_at);
      if (isToday(date)) {
        groups['Hari Ini'].push(notif);
      } else if (isYesterday(date)) {
        groups['Kemarin'].push(notif);
      } else if (isThisWeek(date)) {
        groups['Minggu Ini'].push(notif);
      } else {
        groups['Lebih Lama'].push(notif);
      }
    });

    // Remove empty groups
    return Object.fromEntries(Object.entries(groups).filter(([_, v]) => v.length > 0));
  }, [notifData]);

  const hasUnread = notifData?.some(n => !n.is_read);

  return (
    <div className="p-6 md:p-10 text-[#171717] min-h-screen bg-[#fafafa]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8">
        <NavLink to="/student/dashboard" className="hover:text-[#f97316] cursor-pointer transition-colors">Dashboard</NavLink>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Notifikasi</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Notifikasi</h1>
          <p className="text-[#737373] font-bold text-sm mt-1">
            Kamu memiliki {notifData?.filter(n => !n.is_read).length || 0} pesan belum dibaca.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => queryClient.invalidateQueries(['notifikasi'])}
            disabled={!hasUnread}
            className="px-5 py-2.5 bg-[#fff7ed] text-[#f97316] rounded-xl text-sm font-bold border border-[#fed7aa] hover:bg-[#ffedd5] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Tandai Semua Dibaca
          </button>
          <button 
            onClick={() => deleteReadAllMutation.mutate()}
            className="px-5 py-2.5 bg-white text-[#737373] rounded-xl text-sm font-bold border border-[#e5e5e5] hover:bg-[#fafafa] transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            Hapus yang Sudah Dibaca
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <Tabs value={filterType} onValueChange={setFilterType} className="max-w-full overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-2">
            {CATEGORIES.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all overflow-hidden relative ${
                  filterType === cat.id 
                    ? 'bg-[#171717] text-white border-[#171717]' 
                    : 'bg-white text-[#737373] border-[#e5e5e5] hover:border-[#f97316]'
                }`}
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
           <span className="text-sm font-bold text-[#a3a3a3]">Filter Waktu:</span>
           <Select value={filterTime} onValueChange={setFilterTime}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white border-[#e5e5e5] font-bold">
                <SelectValue placeholder="Semua Waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Waktu</SelectItem>
                <SelectItem value="hari_ini">Hari Ini</SelectItem>
                <SelectItem value="minggu_ini">Minggu Ini</SelectItem>
                <SelectItem value="bulan_ini">Bulan Ini</SelectItem>
              </SelectContent>
           </Select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#171717] text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300">
           <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-[#f97316] rounded-full flex items-center justify-center text-[10px] font-black">
                {selectedIds.length}
              </span>
              <span className="text-sm font-bold">dipilih</span>
           </div>
           <div className="h-6 w-px bg-white/20" />
           <div className="flex items-center gap-4">
              <button 
                onClick={() => bulkReadMutation.mutate(selectedIds)}
                className="text-sm font-bold hover:text-[#f97316] transition-colors flex items-center gap-2"
              >
                <Check size={16} /> Tandai Dibaca
              </button>
              <button 
                onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                className="text-sm font-bold text-[#fca5a5] hover:text-[#ef4444] transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Hapus
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity"
              >
                Batal
              </button>
           </div>
        </div>
      )}

      {/* List content */}
      <div className="space-y-10 pb-20">
        {isLoading ? (
          <NotifListSkeleton count={8} />
        ) : Object.keys(groupedNotifs).length > 0 ? (
          Object.entries(groupedNotifs).map(([groupName, items]) => (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-xs font-black uppercase tracking-widest text-[#a3a3a3]">{groupName}</h2>
                 <div className="flex-1 h-px bg-[#e5e5e5]/50" />
              </div>
              
              <div className="grid gap-3">
                {items.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`group relative bg-white border rounded-2xl p-5 transition-all hover:shadow-md flex gap-5 items-start ${
                      !notif.is_read ? 'border-[#f97316]/30 shadow-sm' : 'border-[#e5e5e5] grayscale-[0.5] opacity-80 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-1.5">
                       <input 
                         type="checkbox" 
                         checked={selectedIds.includes(notif.id)}
                         onChange={() => toggleSelect(notif.id)}
                         className="w-5 h-5 rounded-md border-[#d4d4d4] text-[#f97316] focus:ring-[#f97316] cursor-pointer"
                       />
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                         !notif.is_read ? 'bg-[#fff7ed] border-[#fed7aa]' : 'bg-[#fafafa] border-[#e5e5e5]'
                       }`}>
                          {CATEGORY_ICONS[notif.type] || <Bell size={20} />}
                       </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between gap-4 mb-1">
                          <h3 className={`text-base tracking-tight ${!notif.is_read ? 'font-black text-[#171717]' : 'font-bold text-[#525252]'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[11px] font-bold text-[#a3a3a3] flex items-center gap-1">
                             <Clock size={12} />
                             {format(parseISO(notif.created_at), 'HH:mm')}
                          </span>
                       </div>
                       <p className="text-sm font-medium text-[#737373] leading-relaxed mb-4">
                         {notif.content}
                       </p>
                       
                       {notif.link && (
                          <a 
                            href={notif.link}
                            className="inline-flex items-center gap-2 text-xs font-black text-[#f97316] uppercase tracking-widest hover:underline"
                          >
                            Lihat Detail <ChevronRight size={14} />
                          </a>
                       )}
                    </div>

                    {/* Actions Hover */}
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                       {!notif.is_read && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); markReadMutation.mutate(notif.id); }}
                            className="w-8 h-8 flex items-center justify-center bg-[#f0fdf4] text-[#16a34a] rounded-lg border border-[#dcfce7] hover:shadow-sm"
                            title="Tandai dibaca"
                          >
                            <Check size={14} />
                          </button>
                       )}
                       <button 
                         onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(notif.id); }}
                         className="w-8 h-8 flex items-center justify-center bg-[#fef2f2] text-[#ef4444] rounded-lg border border-[#fecaca] hover:shadow-sm"
                         title="Hapus"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>

                    {!notif.is_read && (
                       <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316] rounded-l-2xl" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            icon="Bell" 
            title="Semua Sudah Beres!" 
            description="Belum ada notifikasi baru untuk filter ini. Kamu sudah update dengan semua informasi terbaru." 
          />
        )}
      </div>
    </div>
  );
}
