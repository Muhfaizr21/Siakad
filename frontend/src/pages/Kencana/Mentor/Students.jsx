import React from 'react';
import { useMentorStudentsQuery, useMentorRemoveAssignmentMutation } from '../../../queries/useKencanaMentorQuery';
import { Link } from 'react-router-dom';

const Students = () => {
  const { data: students, isLoading } = useMentorStudentsQuery();
  const removeMutation = useMentorRemoveAssignmentMutation();
  const rows = Array.isArray(students) ? students : [];

  const handleRemove = (id) => {
    if(window.confirm('Hapus mahasiswa ini dari daftar bimbingan?')) {
      removeMutation.mutate(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Mahasiswa Bimbingan</h1>
        <Link to="/kencana-mentor/available" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-violet-500/20">
          + Tambah Bimbingan
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">NIM</th>
                <th className="pb-3 font-medium">Nama Mahasiswa</th>
                <th className="pb-3 font-medium">Program Studi</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((assignment) => (
                <tr key={assignment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="py-4 font-medium text-slate-900">{assignment.student?.nim || '-'}</td>
                  <td className="py-4 text-slate-800 font-semibold">{assignment.student?.nama || '-'}</td>
                  <td className="py-4 text-slate-600">{assignment.student?.program_studi || '-'}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      assignment.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      assignment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {assignment.status === 'active' ? 'Disetujui' : 
                       assignment.status === 'pending' ? 'Pending' : 'Ditolak'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {assignment.status === 'active' && (
                        <Link to={`/kencana-mentor/students/${assignment.student_id}`} className="text-violet-600 hover:text-violet-800 text-sm font-bold px-3 py-1 bg-violet-50 rounded-lg">
                          Detail
                        </Link>
                      )}
                      <button 
                        onClick={() => handleRemove(assignment.id)}
                        disabled={removeMutation.isPending}
                        className="text-rose-600 hover:text-rose-800 text-sm font-bold px-3 py-1 bg-rose-50 rounded-lg disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan="5" className="py-4 text-center text-slate-500">Anda belum memiliki mahasiswa bimbingan.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Students;
