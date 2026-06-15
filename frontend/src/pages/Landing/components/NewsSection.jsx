import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowUpRight, Calendar, X } from 'lucide-react'
import { getPublicNews } from '../../../services/api'
import { AnimatePresence } from 'framer-motion'

const defaultNews = [
  {
    title: 'UBK Buka Pendaftaran Mahasiswa Baru 2026/2027',
    category: 'Pengumuman',
    date: '13 Juni 2026',
    excerpt: 'Universitas Bhakti Kencana resmi membuka pendaftaran mahasiswa baru tahun akademik 2026/2027 melalui jalur prestasi dan reguler.',
    image: null,
  },
  {
    title: 'Tim Robotik UBK Raih Medali Emas di Kontes Robot Nasional',
    category: 'Prestasi',
    date: '10 Juni 2026',
    excerpt: 'Mahasiswa Fakultas Sains dan Teknologi UBK berhasil meraih medali emas dalam Kontes Robot Nasional 2026.',
    image: null,
  },
  {
    title: 'Kerja Sama UBK dengan 10 Rumah Sakit Tingkatkan Mutu Praktik',
    category: 'Kerja Sama',
    date: '5 Juni 2026',
    excerpt: 'Fakultas Ilmu Kesehatan UBK menjalin kerja sama dengan 10 rumah sakit untuk meningkatkan kualitas praktik mahasiswa.',
    image: null,
  },
]

function NewsCard({ title, category, date, excerpt, image, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-secondary)]">
            {category}
          </span>
          <span className="text-xs text-slate-400">{date}</span>
        </div>
        <h3 className="font-bold font-headline text-[var(--theme-primary)] mb-2 group-hover:text-[var(--theme-secondary)] transition-colors">
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


export default function NewsSection({ settings }) {
  const title = settings?.news_title || 'Berita & Artikel'
  const subtitle = settings?.news_subtitle || 'Terbaru dari UBK'
  const desc = settings?.news_desc || 'Ikuti perkembangan terbaru tentang kegiatan, prestasi, dan pengumuman dari Universitas Bhakti Kencana.'
  
  const [newsList, setNewsList] = useState(defaultNews)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getPublicNews(3)
        if (response?.status === 'success' && response.data && response.data.length > 0) {
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
          }))
          setNewsList(formattedNews)
        }
      } catch (error) {
        console.error("Failed to fetch public news:", error)
      }
    }
    fetchNews()
  }, [])

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--theme-secondary)] mb-3">
            {title}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-headline text-[var(--theme-primary)]">
            {subtitle}
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            {desc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.map((item, i) => (
            <NewsCard key={i} {...item} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 text-[var(--theme-primary)] font-bold hover:gap-3 transition-all"
          >
            Lihat Semua Berita
            <ChevronRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
