import React from 'react';
import { useKencanaCertificateQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, PrimaryButton, StatusBadge, fmtDate } from './components';

export default function KencanaCertificatePage() {
  const { data, isLoading, isError } = useKencanaCertificateQuery();

  if (isLoading) return <KencanaShell title="Sertifikat Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Sertifikat Kencana"><ErrorPanel message="Gagal memuat sertifikat." /></KencanaShell>;

  const certificate = data?.certificate || {};
  const eligible = Boolean(data?.eligible);
  const lockedReasons = data?.locked_reasons || [];
  const fileUrl = certificate.file_url || certificate.FileURL || '';

  return (
    <KencanaShell
      title="Sertifikat Kencana"
      subtitle="Sertifikat hanya dapat diunduh ketika status kelulusan sudah lulus dan seluruh syarat wajib terpenuhi."
      actions={<PrimaryButton to="/student/kencana/score">Lihat Nilai</PrimaryButton>}
    >
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-border bg-white/85 p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9b8f7a]">Certificate Gate</p>
              <h2 className="mt-2 text-3xl font-black text-[#1d1b16]">{eligible ? 'Sertifikat siap diakses' : 'Sertifikat masih terkunci'}</h2>
            </div>
            <StatusBadge status={eligible ? 'passed' : 'locked'} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info label="Nomor Sertifikat" value={certificate.certificate_number || '-'} />
            <Info label="Tanggal Terbit" value={certificate.issued_at ? fmtDate(certificate.issued_at) : '-'} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {eligible && fileUrl ? (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4c5c] px-5 py-3 text-sm font-black text-white transition hover:bg-[#123f4b]">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                Unduh Sertifikat
              </a>
            ) : (
              <PrimaryButton disabled>{eligible ? 'File belum diterbitkan' : 'Belum Bisa Diunduh'}</PrimaryButton>
            )}
            <PrimaryButton to="/student/kencana/remedial">Cek Remedial</PrimaryButton>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-[#1f2f33] p-8 text-white shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8a84f]">Syarat Wajib</p>
          <h2 className="mt-2 text-2xl font-black">Checklist Kelulusan</h2>
          <div className="mt-6 space-y-3">
            {lockedReasons.length === 0 ? (
              <p className="rounded-2xl bg-white/10 p-4 text-sm font-bold text-emerald-100">Tidak ada pengunci. Jika file belum tersedia, tunggu penerbitan dari admin.</p>
            ) : (
              lockedReasons.map((reason) => <p key={reason} className="rounded-2xl bg-white/10 p-4 text-sm font-bold text-amber-100">{reason}</p>)
            )}
          </div>
        </div>
      </section>
    </KencanaShell>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f1e5] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9b8f7a]">{label}</p>
      <p className="mt-2 text-lg font-black text-[#1d1b16]">{value}</p>
    </div>
  );
}
