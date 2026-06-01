import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useMentorStudentProgressQuery, 
  useMentorStudentScoreQuery,
  useMentorStudentAttendanceQuery
} from '../../../queries/useKencanaMentorQuery';

const StudentDetail = () => {
  const { studentId } = useParams();
  
  // Use parallel queries
  const { data: progressData, isLoading: loadingProgress } = useMentorStudentProgressQuery(studentId);
  const { data: scoreData, isLoading: loadingScore } = useMentorStudentScoreQuery(studentId);
  const { data: attendanceData, isLoading: loadingAttendance } = useMentorStudentAttendanceQuery(studentId);

  const isLoading = loadingProgress || loadingScore || loadingAttendance;

  if (isLoading) {
    return <div className="p-8 text-slate-500">Loading detail mahasiswa...</div>;
  }

  const student = progressData?.student || scoreData?.student || {};
  const score = scoreData?.score || {};
  const scoreItems = scoreData?.items || [];
  const blockers = scoreData?.blockers || [];
  const progress = progressData?.progress_total || 0;
  
  const attendance = attendanceData || { percentage: 0, present_count: 0, required_sessions: 0 };

  // Group items by component
  const cognitiveItems = scoreItems.filter(i => i.component.toLowerCase() === 'cognitive');
  const psychomotorItems = scoreItems.filter(i => i.component.toLowerCase() === 'psychomotor');
  const affectiveItems = scoreItems.filter(i => i.component.toLowerCase() === 'affective');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/kencana-mentor/students" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm">
          &larr; Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Detail Mahasiswa Bimbingan</h1>
          <p className="text-sm font-semibold text-slate-500">PKKMB Kencana</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Identitas Mahasiswa */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Identitas Mahasiswa</p>
          <h2 className="text-3xl font-black text-slate-800">{student.Nama || 'Nama Mahasiswa'}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-bold">NIM</p>
              <p className="text-sm font-black text-slate-800">{student.NIM || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">Program Studi</p>
              <p className="text-sm font-black text-slate-800">{student.ProgramStudi?.Nama || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">Fakultas</p>
              <p className="text-sm font-black text-slate-800">{student.Fakultas?.Nama || '-'}</p>
            </div>
          </div>
        </div>

        {/* Ringkasan Kelulusan */}
        <div className={`rounded-3xl border shadow-sm p-6 flex flex-col justify-between ${
          score.graduation_status === 'passed' ? 'bg-emerald-50 border-emerald-200' : 
          score.graduation_status === 'failed' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Status Kelulusan</p>
            <h2 className={`text-2xl font-black ${
              score.graduation_status === 'passed' ? 'text-emerald-700' : 
              score.graduation_status === 'failed' ? 'text-rose-700' : 'text-slate-700'
            }`}>
              {score.graduation_status === 'passed' ? 'LULUS' : 
               score.graduation_status === 'failed' ? 'TIDAK LULUS' : 
               score.graduation_status === 'conditional_pass' ? 'LULUS BERSYARAT' : 'DALAM PROSES'}
            </h2>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold">Nilai Akhir Kencana</p>
              <p className="text-4xl font-black text-slate-900">{score.final_score || 0}</p>
            </div>
          </div>
          {blockers.length > 0 && (
            <div className="mt-4 p-3 bg-white/60 rounded-xl border border-rose-100">
              <p className="text-xs font-bold text-rose-600 mb-1">Catatan Kendala:</p>
              <ul className="list-disc pl-4 text-xs font-semibold text-rose-700">
                {blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Rincian Nilai (Seperti Google Sheet) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800">Rincian Komponen Penilaian</h3>
        </div>
        
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Komponen</th>
                <th className="py-3 px-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Bobot</th>
                <th className="py-3 px-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Rata-Rata</th>
                <th className="py-3 px-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Nilai Berbobot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              
              {/* KOGNITIF */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-4 align-top">
                  <span className="font-black text-slate-800 block mb-2">KOGNITIF</span>
                  <ul className="list-disc pl-5 text-slate-500 font-medium space-y-1">
                    {cognitiveItems.length > 0 ? cognitiveItems.map(item => (
                      <li key={item.id}>{item.item_name}: <span className="font-bold text-slate-700">{item.score}</span></li>
                    )) : <li>Belum ada data kognitif</li>}
                  </ul>
                </td>
                <td className="py-4 px-4 font-black text-slate-400 text-lg align-top">25%</td>
                <td className="py-4 px-4 font-black text-slate-800 text-lg align-top">{score.cognitive_average || 0}</td>
                <td className="py-4 px-4 font-black text-sky-600 text-lg align-top">{score.cognitive_weighted || 0}</td>
              </tr>

              {/* PSIKOMOTOR */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-4 align-top">
                  <span className="font-black text-slate-800 block mb-2">PSIKOMOTOR</span>
                  <ul className="list-disc pl-5 text-slate-500 font-medium space-y-1">
                    {psychomotorItems.length > 0 ? psychomotorItems.map(item => (
                      <li key={item.id}>{item.item_name}: <span className="font-bold text-slate-700">{item.score}</span></li>
                    )) : <li>Belum ada data psikomotor</li>}
                  </ul>
                </td>
                <td className="py-4 px-4 font-black text-slate-400 text-lg align-top">35%</td>
                <td className="py-4 px-4 font-black text-slate-800 text-lg align-top">{score.psychomotor_average || 0}</td>
                <td className="py-4 px-4 font-black text-violet-600 text-lg align-top">{score.psychomotor_weighted || 0}</td>
              </tr>

              {/* AFEKTIF */}
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-4 align-top">
                  <span className="font-black text-slate-800 block mb-2">AFEKTIF</span>
                  <ul className="list-disc pl-5 text-slate-500 font-medium space-y-1">
                    {affectiveItems.length > 0 ? affectiveItems.map(item => (
                      <li key={item.id}>{item.item_name}: <span className="font-bold text-slate-700">{item.score}</span></li>
                    )) : <li>Belum ada data afektif</li>}
                  </ul>
                </td>
                <td className="py-4 px-4 font-black text-slate-400 text-lg align-top">40%</td>
                <td className="py-4 px-4 font-black text-slate-800 text-lg align-top">{score.affective_average || 0}</td>
                <td className="py-4 px-4 font-black text-rose-600 text-lg align-top">{score.affective_weighted || 0}</td>
              </tr>

            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td className="py-4 px-4 font-black text-slate-800 uppercase tracking-wider text-right" colSpan="3">Total Nilai Akhir (100%)</td>
                <td className="py-4 px-4 font-black text-slate-900 text-2xl">{score.final_score || 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Kehadiran & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Kehadiran (Syarat Wajib 100%)</p>
            <p className="text-3xl font-black text-slate-800">{attendance.percentage}%</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{attendance.present_count} dari {attendance.required_sessions} Sesi Wajib</p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl ${
            attendance.percentage >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {attendance.percentage >= 100 ? 'OK' : '!'}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Progress Materi</p>
            <p className="text-3xl font-black text-slate-800">{progress}%</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">Total Penyelesaian Tahapan Kencana</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDetail;
