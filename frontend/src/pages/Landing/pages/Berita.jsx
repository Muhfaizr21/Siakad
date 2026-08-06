import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { getPublicNews } from '../../../services/api'
import { Calendar, ArrowUpRight, Search, Filter, X } from 'lucide-react'

const categories = ['Semua', 'Pengumuman', 'Prestasi', 'Acara', 'Kerja Sama', 'Pengabdian']

function NewsCard({ title, category, date, excerpt, image, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {image ? (
        <img src={image.startsWith('http') ? image : `http://localhost:8000${image}`} alt={title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 bg-[var(--theme-primary)]/5 flex items-center justify-center">
          <div className="text-center">
            <div className="size-12 rounded-xl bg-[var(--theme-primary)]/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="size-6 text-[var(--theme-primary)]" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Featured News</p>
          </div>
        </div>
      )}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-secondary)]">
            {category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="size-3.5" />
            {date}
          </div>
        </div>
        <h3 className="text-lg font-bold font-headline text-[var(--theme-primary)] mb-3 group-hover:text-[var(--theme-secondary)] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3 whitespace-pre-wrap">
          {excerpt}
        </p>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1 text-sm font-bold text-[var(--theme-primary)] group-hover:gap-2 transition-all cursor-pointer">
          Baca Selengkapnya
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      {isModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="flex-shrink-0 relative">
                {image ? (
                  <img src={image.startsWith('http') ? image : `http://localhost:8000${image}`} alt={title} className="w-full h-64 object-cover" />
                ) : (
                  <div className="h-48 bg-[var(--theme-primary)]/5 flex items-center justify-center">
                    <Calendar className="size-10 text-[var(--theme-primary)]/40" />
                  </div>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 size-10 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-xs font-bold uppercase tracking-widest rounded-lg">
                    {category}
                  </span>
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {date}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-headline text-[var(--theme-primary)] mb-6 leading-tight">
                  {title}
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {excerpt}
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </motion.article>
  )
}

export default function Berita() {
  const { settings } = useOutletContext() || {};

  const title = settings?.berita_page_title || 'Berita & Pengumuman';
  const subtitle = settings?.berita_page_subtitle || 'Ikuti perkembangan terbaru dari Universitas Bhakti Kencana.';

  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Fetch more news for the full page, e.g., 20
        const response = await getPublicNews(20);
        if (response?.status === 'success' && response.data) {
          const formattedNews = response.data.map(item => ({
            title: item.Judul,
            category: item.Kategori || item.Status || 'Pengumuman',
            date: new Date(item.TanggalPublish).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            excerpt: item.Isi,
            image: item.GambarURL || null
          }));
          setAllNews(formattedNews);
        }
      } catch (error) {
        console.error("Failed to fetch public news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Derived state for filtering
  const filteredNews = allNews.filter(news => {
    const matchCategory = activeCategory === 'Semua' || news.category === activeCategory;
    const matchSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/unnamed.webp" alt="Kampus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[var(--theme-primary)]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold font-headline text-white mb-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    cat === activeCategory
                      ? 'bg-[var(--theme-primary)] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              Memuat berita...
            </div>
          ) : paginatedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedNews.map((item, i) => (
                <NewsCard key={i} {...item} index={i} />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              {searchQuery ? 'Tidak ada berita yang sesuai dengan pencarian Anda.' : 'Belum ada berita yang tersedia untuk kategori ini.'}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-10 rounded-xl text-sm font-bold transition-all ${
                      page === currentPage
                        ? 'bg-[var(--theme-primary)] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
