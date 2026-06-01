import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminQuizQuery, useCreateQuestionMutation, useUpdateQuestionMutation } from '../../../queries/useKencanaAdminQuery';

const QuizBuilder = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading } = useAdminQuizQuery(quizId);
  const createQuestionMutation = useCreateQuestionMutation();
  const updateQuestionMutation = useUpdateQuestionMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    score: 10,
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>;
  }

  if (!quiz) {
    return <div className="p-8 text-center text-slate-500">Kuis tidak ditemukan.</div>;
  }

  const handleAddOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  const handleRemoveOption = (index) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...questionForm.options];
    if (field === 'is_correct') {
      // If setting one as correct, make others incorrect
      newOptions.forEach(opt => opt.is_correct = false);
      newOptions[index].is_correct = true;
    } else {
      newOptions[index][field] = value;
    }
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validations
    if (!questionForm.question_text.trim()) return alert("Teks soal tidak boleh kosong");
    
    let payload = {
      quiz_id: parseInt(quizId),
      question_text: questionForm.question_text,
      question_type: questionForm.question_type,
      score: parseFloat(questionForm.score),
      order_number: (quiz.questions?.length || 0) + 1
    };

    if (questionForm.question_type === 'multiple_choice') {
      const validOptions = questionForm.options.filter(o => o.option_text.trim() !== '');
      if (validOptions.length < 2) return alert("Soal pilihan ganda minimal harus memiliki 2 opsi jawaban");
      const hasCorrect = validOptions.some(o => o.is_correct);
      if (!hasCorrect) return alert("Tentukan setidaknya satu jawaban yang benar");
      
      payload.options = validOptions.map((o, idx) => ({
        option_text: o.option_text,
        is_correct: o.is_correct,
        order_number: idx + 1
      }));
    }

    const mutation = editingQuestion ? updateQuestionMutation : createQuestionMutation;
    const submitPayload = editingQuestion ? { id: editingQuestion.id, ...payload } : payload;

    mutation.mutate(submitPayload, {
      onSuccess: () => {
        setShowForm(false);
        setEditingQuestion(null);
        setQuestionForm({
          question_text: '',
          question_type: 'multiple_choice',
          score: 10,
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        });
      }
    });
  };

  const startEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_text: question.question_text || '',
      question_type: question.question_type || 'multiple_choice',
      score: question.score || 10,
      options: question.options?.length ? question.options.map((opt) => ({
        id: opt.id,
        option_text: opt.option_text || '',
        is_correct: Boolean(opt.is_correct),
        order_number: opt.order_number || 0,
      })) : [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
      ],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setQuestionForm({
      question_text: '',
      question_type: 'multiple_choice',
      score: 10,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-60 pointer-events-none"></div>
        <button onClick={() => navigate('/kencana-admin/stages')} className="text-sm font-bold text-slate-500 hover:text-violet-600 mb-4 inline-flex items-center gap-1 transition-colors">
          &larr; Kembali ke Tahapan
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-800">{quiz.title}</h1>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">{quiz.description || 'Kuis ini belum memiliki deskripsi.'}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${quiz.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {quiz.status === 'published' ? 'Dipublikasikan' : 'Draft'}
            </span>
            <p className="text-xs font-bold text-slate-400 mt-2">Durasi: {quiz.duration_minutes} Menit</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800">Daftar Soal ({quiz.questions?.length || 0})</h2>
        {!showForm && (
          <button 
            onClick={() => { setEditingQuestion(null); setShowForm(true); }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
          >
            + Tambah Soal
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-violet-100 shadow-lg p-6 lg:p-8 animate-fade-in relative">
          <button onClick={resetForm} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h3 className="text-xl font-black text-slate-800 mb-6">{editingQuestion ? 'Edit Soal' : 'Buat Soal Baru'}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Teks Pertanyaan</label>
                <textarea 
                  required
                  rows="3"
                  value={questionForm.question_text}
                  onChange={e => setQuestionForm({...questionForm, question_text: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all font-medium"
                  placeholder="Masukkan pertanyaan di sini..."
                />
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipe Soal</label>
                  <select 
                    value={questionForm.question_type}
                    onChange={e => setQuestionForm({...questionForm, question_type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700"
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="essay">Esai / Teks Pendek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Skor / Bobot Nilai</label>
                  <input 
                    type="number"
                    required min="1"
                    value={questionForm.score}
                    onChange={e => setQuestionForm({...questionForm, score: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {questionForm.question_type === 'multiple_choice' && (
              <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="font-bold text-slate-700">Opsi Jawaban</h4>
                  <button type="button" onClick={handleAddOption} className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
                    + Tambah Opsi
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${opt.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-transparent bg-slate-50'}`}>
                      <div className="pt-2">
                        <input 
                          type="radio" 
                          name="correct_option"
                          checked={opt.is_correct}
                          onChange={() => handleOptionChange(idx, 'is_correct', true)}
                          className="w-5 h-5 text-emerald-500 focus:ring-emerald-500"
                          title="Tandai sebagai jawaban benar"
                        />
                      </div>
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={opt.option_text}
                          onChange={e => handleOptionChange(idx, 'option_text', e.target.value)}
                          placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                      </div>
                      {questionForm.options.length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(idx)} className="text-slate-400 hover:text-rose-500 p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold shadow-md disabled:opacity-50 transition-colors"
              >
                {(createQuestionMutation.isPending || updateQuestionMutation.isPending) ? 'Menyimpan...' : (editingQuestion ? 'Update Soal' : 'Simpan Soal')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {!quiz.questions?.length ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p className="text-slate-500 font-bold">Belum ada soal untuk kuis ini.</p>
            <p className="text-sm text-slate-400 mt-1">Klik tombol Tambah Soal untuk memulai membuat kuis.</p>
          </div>
        ) : (
          quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-black text-lg">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-bold text-slate-800 pr-8">{q.question_text}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md whitespace-nowrap">Bobot: {q.score}</span>
                    <button onClick={() => startEditQuestion(q)} className="text-xs font-black bg-violet-50 text-violet-700 px-3 py-1 rounded-lg hover:bg-violet-100">Edit</button>
                  </div>
                </div>
                
                <div className="inline-flex mb-3 px-2 py-1 bg-slate-50 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                  {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai / Teks'}
                </div>

                {q.question_type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border ${opt.is_correct ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0 ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-sm pt-0.5 leading-relaxed">{opt.option_text}</span>
                        {opt.is_correct && (
                          <svg className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default QuizBuilder;
