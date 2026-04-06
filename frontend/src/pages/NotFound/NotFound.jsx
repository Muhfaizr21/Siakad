import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-primary/20">404</h1>
        <div className="relative -mt-16">
          <h2 className="text-3xl font-bold text-on-surface mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-on-surface-variant mb-8">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
          <Link
            to="/faculty"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">home</span>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
