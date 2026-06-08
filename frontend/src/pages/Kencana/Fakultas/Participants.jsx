import React from 'react';
import { useFakultasParticipantsQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';
import { PageHeader } from '../../../components/ui/page/PageHeader';

const Participants = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  const { data: participants, isLoading } = useFakultasParticipantsQuery({ fakultas_id: fakultasId });

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon="users"
        title={
          <>
            <span className="text-[var(--theme-text)]">Data Peserta </span>
            <span className="text-[var(--theme-primary)]">Fakultas</span>
          </>
        }
        subtitle="Daftar mahasiswa peserta Kencana yang terdaftar di fakultas Anda."
        breadcrumbs={[
          { label: 'Kencana Fakultas', path: '#' },
          { label: 'Peserta' }
        ]}
      />

      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Peserta Terdaftar</h2>
          <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Gunakan tabel di bawah untuk melihat rincian NIM dan Nama mahasiswa.</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--theme-text-muted)] font-bold">Memuat data peserta...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider bg-[var(--theme-bg)]/50">
                  <th className="px-6 py-3 font-semibold">NIM</th>
                  <th className="px-6 py-3 font-semibold">Nama</th>
                  <th className="px-6 py-3 font-semibold">Fakultas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)]">
                {participants?.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--theme-bg)]/40 transition-colors text-sm font-semibold text-[var(--theme-text)]">
                    <td className="px-6 py-4 font-bold text-[var(--theme-primary)]">{p.nim}</td>
                    <td className="px-6 py-4 text-[var(--theme-text)]">{p.nama}</td>
                    <td className="px-6 py-4 text-[var(--theme-text-muted)]">{p.fakultas_name || '-'}</td>
                  </tr>
                ))}
                {!participants?.length && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-[var(--theme-text-muted)] font-semibold">
                      Belum ada data peserta dari fakultas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Participants;
