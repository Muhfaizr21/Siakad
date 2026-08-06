import React from 'react';
import { useFakultasParticipantsQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';
import { DashboardHero } from '@/components/ui/dashboard';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { UserInfoCell, TitleSubtitleCell } from '@/components/ui/TableCells';

const Participants = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  const { data: participants, isLoading } = useFakultasParticipantsQuery({ fakultas_id: fakultasId });

  const columns = [
    {
      key: 'nama',
      label: 'Informasi Mahasiswa',
      render: (v, p) => <UserInfoCell name={p.nama || '-'} subtitle={p.nim || p.email_kampus || p.email_personal || '-'} avatarUrl={p.foto_url || p.foto} />
    },
    {
      key: 'fakultas_name',
      label: 'Program Studi & Fakultas',
      render: (v, p) => <TitleSubtitleCell title={p.program_studi_name || '-'} subtitle={p.fakultas_name || '-'} />
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (v, p) => (
        <span className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          {p.jenis_kelamin || p.JenisKelamin || '-'}
        </span>
      )
    },
    {
      key: 'kontak',
      label: 'Kontak',
      render: (v, p) => <TitleSubtitleCell title={p.telepon || p.Telepon || p.no_hp || '-'} subtitle={p.email_kampus || p.email_personal || p.email || '-'} />
    }
  ];

  return (
    <div className="space-y-6">
      <DashboardHero
        title="Data"
        highlightedTitle="Peserta"
        subtitle="Daftar mahasiswa peserta Kencana yang terdaftar di fakultas Anda."
        icon="groups"
        badges={[
          { label: 'Kencana Fakultas', active: false },
          { label: `${participants?.length || 0} Mahasiswa`, active: true }
        ]}
      />

      <div>
          <DataTable
            columns={columns}
            data={participants || []}
            loading={isLoading}
            searchPlaceholder="Cari berdasarkan NIM atau nama..."
            title="Daftar Peserta Terdaftar"
            itemLabel="peserta"
          />
      </div>
    </div>
  );
};

export default Participants;
