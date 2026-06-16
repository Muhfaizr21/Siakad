  import re

with open("src/pages/Psychologist/BookingManagement.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update Imports
imports_target = """import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';"""
imports_replacement = """import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DashboardHero } from '@/components/ui/dashboard';
import { PageContent } from '@/components/ui/page';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';

const PendingIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>pending_actions</span>;
const ConfirmIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>event_available</span>;
const DoneIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>task_alt</span>;
const RejectIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>cancel</span>;"""
code = code.replace(imports_target, imports_replacement)

# 2. Update states and hooks
states_target = """  const [selectedTab, setSelectedTab] = useState('Semua');
  const [issueFilter, setIssueFilter] = useState('Semua Topik');
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingConfirmId, setPendingConfirmId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [fakultasList, setFakultasList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  

  useEffect(() => {
    let ignore = false;

    psychologistService.getBookings()
      .then((res) => {
        if (!ignore) setBookings(res.data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Gagal memuat data booking.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    psychologistService.getFakultasList().then((res) => {
      if (!ignore) setFakultasList(res.data || []);
    });
    psychologistService.getProdiList().then((res) => {
      if (!ignore) setProdiList(res.data || []);
    });

    return () => { ignore = true; };
  }, []);

  const filteredProdis = useMemo(() => {
    if (selectedFakultas === 'Semua Fakultas') return [];
    const selectedFak = fakultasList.find(f => f.nama === selectedFakultas);
    if (!selectedFak) return [];
    return prodiList.filter(p => p.fakultas_id === selectedFak.id);
  }, [selectedFakultas, prodiList, fakultasList]);

  const handleFakultasChange = (val) => {
    setSelectedFakultas(val);
    setSelectedProdi('Semua Prodi');
  };"""

states_replacement = """  const [selectedTab, setSelectedTab] = useState('Semua');
  const [issueFilter, setIssueFilter] = useState('Semua Topik');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingConfirmId, setPendingConfirmId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let ignore = false;

    psychologistService.getBookings()
      .then((res) => {
        if (!ignore) setBookings(res.data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Gagal memuat data booking.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  const prodiOptions = useMemo(() => {
    const prodis = bookings
      .map((booking) => booking.prodi)
      .filter(Boolean);
    return ['Semua Prodi', ...Array.from(new Set(prodis))];
  }, [bookings]);"""
code = code.replace(states_target, states_replacement)

# 3. Update filteredBookings
filtered_bookings_target = """  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const status = booking.status || 'Menunggu';
        const matchesTab = selectedTab === 'Semua' || status === selectedTab;
        const matchesIssue = issueFilter === 'Semua Topik' || booking.issue === issueFilter;
        const matchesFakultas = selectedFakultas === 'Semua Fakultas' || booking.faculty === selectedFakultas;
        const matchesProdi = selectedProdi === 'Semua Prodi' || booking.prodi === selectedProdi;
        
        const bookingRawDate = booking.raw_date || (booking.date ? new Date(booking.date).toISOString().split('T')[0] : '');
        const matchesStartDate = !startDate || (bookingRawDate && bookingRawDate >= startDate);
        const matchesEndDate = !endDate || (bookingRawDate && bookingRawDate <= endDate);

        return matchesTab && matchesIssue && matchesFakultas && matchesProdi && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        const first = new Date(a.created_at || a.date).getTime();
        const second = new Date(b.created_at || b.date).getTime();
        return sortOrder === 'Terbaru' ? second - first : first - second;
      });
  }, [bookings, issueFilter, selectedTab, sortOrder, selectedFakultas, selectedProdi, startDate, endDate]);"""
filtered_bookings_replacement = """  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const status = booking.status || 'Menunggu';
        const matchesTab = selectedTab === 'Semua' || status === selectedTab;
        const matchesIssue = issueFilter === 'Semua Topik' || booking.issue === issueFilter;
        const matchesProdi = selectedProdi === 'Semua Prodi' || booking.prodi === selectedProdi;
        
        const bookingRawDate = booking.raw_date || (booking.date ? new Date(booking.date).toISOString().split('T')[0] : '');
        const matchesStartDate = !startDate || (bookingRawDate && bookingRawDate >= startDate);
        const matchesEndDate = !endDate || (bookingRawDate && bookingRawDate <= endDate);

        return matchesTab && matchesIssue && matchesProdi && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        const first = new Date(a.created_at || a.date).getTime();
        const second = new Date(b.created_at || b.date).getTime();
        return second - first;
      });
  }, [bookings, issueFilter, selectedTab, selectedProdi, startDate, endDate]);"""
code = code.replace(filtered_bookings_target, filtered_bookings_replacement)

# 4. Update hasActiveFilter and resetFilters
filters_target = """  const hasActiveFilter = selectedTab !== 'Semua' || issueFilter !== 'Semua Topik' || selectedFakultas !== 'Semua Fakultas' || selectedProdi !== 'Semua Prodi' || startDate || endDate;

  const resetFilters = () => {
    setSelectedTab('Semua');
    setIssueFilter('Semua Topik');
    setSelectedFakultas('Semua Fakultas');
    setSelectedProdi('Semua Prodi');
    setStartDate('');
    setEndDate('');
    setSortOrder('Terbaru');
  };"""
filters_replacement = """  const hasActiveFilter = selectedTab !== 'Semua' || issueFilter !== 'Semua Topik' || selectedProdi !== 'Semua Prodi' || startDate || endDate;

  const resetFilters = () => {
    setSelectedTab('Semua');
    setIssueFilter('Semua Topik');
    setSelectedProdi('Semua Prodi');
    setStartDate('');
    setEndDate('');
  };"""
code = code.replace(filters_target, filters_replacement)

# 5. UI Layout Replace
ui_target_start = """  return (
    <div className="w-full relative space-y-6 min-h-screen bg-transparent font-inter pb-8">"""
ui_target_end = """        <DataTable"""
ui_target_regex = re.compile(re.escape(ui_target_start) + r".*?(?=        <DataTable)", re.DOTALL)

ui_replacement = """  return (
    <PageContent>
      
      <DashboardHero
        title="Manajemen"
        highlightedTitle="Janji Temu"
        subtitle="Pantau, cari, dan tindak lanjuti permintaan sesi konseling baru untuk mempercepat penyelesaian bantuan psikologis mahasiswa."
        icon="event_available"
        badges={[{ label: 'Layanan Konseling Mahasiswa', active: false }]}
        actions={
          <div className="px-4 py-2 bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
             <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '16px' }}>psychology</span>
             <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-[var(--theme-primary)]/70 uppercase tracking-widest">Akses Validasi</span>
                <span className="text-[12px] font-bold text-[var(--theme-primary)] font-jakarta">Psychologist Portal</span>
             </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {tabs.slice(1).map((status) => {
          let theme = 'primary';
          let StatusIcon = PendingIcon;
          if (status === 'Menunggu') { theme = 'warning'; StatusIcon = PendingIcon; }
          if (status === 'Dikonfirmasi') { theme = 'info'; StatusIcon = ConfirmIcon; }
          if (status === 'Selesai') { theme = 'success'; StatusIcon = DoneIcon; }
          if (status === 'Ditolak') { theme = 'error'; StatusIcon = RejectIcon; }

          return (
            <PrimaryStatsCard
              key={status}
              title={`Status ${status}`}
              value={statusCounts[status] || 0}
              icon={StatusIcon}
              colorTheme={theme}
            />
          );
        })}
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5 relative overflow-hidden">
        
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 font-headline">Daftar Booking</h2>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Total {filteredBookings.length} permintaan ditemukan</p>
            </div>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-100"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                Reset Filter
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10 cursor-pointer"
            >
              {issueOptions.map((issue) => (
                <option key={issue} value={issue}>{issue}</option>
              ))}
            </select>

            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10 cursor-pointer"
            >
              {prodiOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
              title="Dari Tanggal"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
              title="Sampai Tanggal"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`
                inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all
                ${selectedTab === tab
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-primary)]/5 hover:text-[var(--theme-primary)]'}
              `}
            >
              {tab}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${selectedTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {statusCounts[tab] || 0}
              </span>
            </button>
          ))}
        </div>

"""

code = ui_target_regex.sub(ui_replacement, code)

# Fix ending div to PageContent
code = code.replace("    </div>\n  );\n}", "    </PageContent>\n  );\n}")

with open("src/pages/Psychologist/BookingManagement.jsx", "w", encoding="utf-8") as f:
    f.write(code)
