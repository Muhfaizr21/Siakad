import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';

// ─── Data Model Asesmen ───────────────────────────────────────────────────────

class _AssessmentType {
  final String name;
  final String kategori;
  final String deskripsi;
  final List<String> questions;
  final List<String> options;
  final String Function(int totalScore) calculateScore;

  const _AssessmentType({
    required this.name,
    required this.kategori,
    required this.deskripsi,
    required this.questions,
    required this.options,
    required this.calculateScore,
  });
}

// DASS-21: Depression Anxiety Stress Scale
// Skor per jawaban: 0=Tidak Pernah, 1=Kadang, 2=Sering, 3=Hampir Selalu
// Depresi: soal 3,5,10,13,16,17,21 → skor x2
// Kecemasan: soal 2,4,7,9,15,19,20 → skor x2
// Stres: soal 1,6,8,11,12,14,18 → skor x2
final _dass21 = _AssessmentType(
  name: 'DASS-21',
  kategori: 'Kesehatan Mental',
  deskripsi: 'Depression Anxiety Stress Scale - 21 item. Mengukur tingkat depresi, kecemasan, dan stres.',
  questions: [
    'Saya merasa sulit untuk tenang setelah sesuatu yang membuat saya kesal.',
    'Saya menyadari mulut saya kering.',
    'Saya tidak dapat merasakan perasaan positif sama sekali.',
    'Saya mengalami kesulitan bernapas (napas cepat, terengah-engah tanpa aktivitas fisik).',
    'Saya merasa sulit untuk berinisiatif melakukan sesuatu.',
    'Saya cenderung bereaksi berlebihan terhadap situasi.',
    'Saya merasa gemetar (misalnya tangan gemetar).',
    'Saya merasa banyak menggunakan energi untuk merasa cemas.',
    'Saya khawatir tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri.',
    'Saya merasa tidak ada yang bisa saya nantikan.',
    'Saya merasa gelisah.',
    'Saya merasa sulit untuk rileks.',
    'Saya merasa sedih dan tertekan.',
    'Saya tidak toleran terhadap hal-hal yang menghalangi saya menyelesaikan sesuatu.',
    'Saya merasa hampir panik.',
    'Saya tidak bisa antusias terhadap apapun.',
    'Saya merasa tidak berharga sebagai manusia.',
    'Saya merasa mudah tersinggung.',
    'Saya menyadari detak jantung saya tanpa aktivitas fisik.',
    'Saya merasa takut tanpa alasan yang jelas.',
    'Saya merasa hidup tidak berarti.',
  ],
  options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Hampir Selalu'],
  calculateScore: (total) {
    // Simplified: total semua jawaban
    if (total <= 14) return 'Normal';
    if (total <= 28) return 'Sedang';
    if (total <= 42) return 'Tinggi';
    return 'Berat';
  },
);

final _stressCheck = _AssessmentType(
  name: 'Tes Stres Akademik',
  kategori: 'Kesehatan Mental',
  deskripsi: 'Mengukur tingkat stres yang berkaitan dengan kegiatan akademik.',
  questions: [
    'Saya merasa tertekan dengan beban tugas kuliah.',
    'Saya kesulitan mengatur waktu belajar.',
    'Saya sering begadang karena tugas atau ujian.',
    'Saya merasa nilai akademik saya tidak memuaskan.',
    'Saya khawatir tentang masa depan karir setelah lulus.',
    'Saya merasa tidak mampu memenuhi ekspektasi dosen atau orang tua.',
    'Saya sulit berkonsentrasi saat belajar.',
    'Saya merasa lelah secara mental akibat aktivitas akademik.',
    'Saya merasa tidak punya waktu untuk diri sendiri.',
    'Saya merasa terisolasi dari teman-teman karena kesibukan kuliah.',
  ],
  options: ['Tidak Pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Selalu'],
  calculateScore: (total) {
    if (total <= 10) return 'Normal';
    if (total <= 20) return 'Ringan';
    if (total <= 30) return 'Sedang';
    return 'Tinggi';
  },
);

final _anxietyCheck = _AssessmentType(
  name: 'Tes Kecemasan Sosial',
  kategori: 'Kesehatan Mental',
  deskripsi: 'Mengukur tingkat kecemasan dalam situasi sosial dan interaksi dengan orang lain.',
  questions: [
    'Saya merasa cemas saat harus berbicara di depan kelas.',
    'Saya menghindari situasi sosial karena takut dipermalukan.',
    'Saya khawatir orang lain menilai saya secara negatif.',
    'Saya merasa tidak nyaman saat bertemu orang baru.',
    'Saya sering memeriksa ulang pekerjaan karena takut salah.',
    'Saya merasa jantung berdebar saat harus presentasi.',
    'Saya sulit memulai percakapan dengan orang yang tidak dikenal.',
    'Saya merasa malu atau canggung dalam situasi sosial.',
  ],
  options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Hampir Selalu'],
  calculateScore: (total) {
    if (total <= 8) return 'Normal';
    if (total <= 16) return 'Sedang';
    return 'Tinggi';
  },
);

final List<_AssessmentType> _allAssessments = [_dass21, _stressCheck, _anxietyCheck];

// ─── Screen Pilih Asesmen ─────────────────────────────────────────────────────

class AssessmentScreen extends StatelessWidget {
  const AssessmentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          const SliverToBoxAdapter(
            child: BkuStaticAppBar(
              title: 'Tes Kesehatan Mental',
              variant: AppBarVariant.student,
              showBackButton: true,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoBanner(),
                  const SizedBox(height: 24),
                  Text(
                    'Pilih Jenis Asesmen',
                    style: AppTextStyles.titleMd.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._allAssessments.map((a) => _buildAssessmentCard(context, a)),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.withAlpha(10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blue.withAlpha(40)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, color: Colors.blue, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Jawab dengan jujur. Hasil asesmen bersifat rahasia dan hanya dilihat oleh psikolog BKU.',
              style: AppTextStyles.labelMd.copyWith(color: Colors.blue[800], height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAssessmentCard(BuildContext context, _AssessmentType assessment) {
    final colors = {
      'DASS-21': AppColors.primary,
      'Tes Stres Akademik': Colors.orange,
      'Tes Kecemasan Sosial': Colors.purple,
    };
    final color = colors[assessment.name] ?? AppColors.primary;

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => _AssessmentQuizScreen(assessment: assessment),
        ),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: color.withAlpha(15), blurRadius: 15, offset: const Offset(0, 6)),
          ],
          border: Border.all(color: color.withAlpha(20)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: color.withAlpha(15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(Icons.psychology_rounded, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(assessment.name,
                      style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Text(assessment.deskripsi,
                      style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                      maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildChip('${assessment.questions.length} soal', color),
                      const SizedBox(width: 8),
                      _buildChip(assessment.kategori, Colors.teal),
                    ],
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: color, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label,
          style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}

// ─── Screen Quiz Asesmen ──────────────────────────────────────────────────────

class _AssessmentQuizScreen extends StatefulWidget {
  final _AssessmentType assessment;
  const _AssessmentQuizScreen({required this.assessment});

  @override
  State<_AssessmentQuizScreen> createState() => _AssessmentQuizScreenState();
}

class _AssessmentQuizScreenState extends State<_AssessmentQuizScreen> {
  int _currentIndex = 0;
  final Map<int, int> _answers = {};

  List<String> get _questions => widget.assessment.questions;
  List<String> get _options => widget.assessment.options;

  int get _totalScore =>
      _answers.values.fold(0, (sum, v) => sum + v);

  String get _calculatedScore =>
      widget.assessment.calculateScore(_totalScore);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: BkuStaticAppBar(
              title: widget.assessment.name,
              variant: AppBarVariant.student,
              showBackButton: true,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProgress(),
                  const SizedBox(height: 32),
                  _buildQuestionCard(),
                  const SizedBox(height: 32),
                  _buildOptions(),
                  const SizedBox(height: 40),
                  _buildNavButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgress() {
    final progress = (_currentIndex + 1) / _questions.length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Pertanyaan ${_currentIndex + 1} dari ${_questions.length}',
              style: AppTextStyles.labelMd
                  .copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
            ),
            Text(
              '${(progress * 100).toInt()}%',
              style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
            ),
          ],
        ),
        const SizedBox(height: 12),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: const Color(0xFFF1F5F9),
          color: AppColors.primary,
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildQuestionCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Text(
        _questions[_currentIndex],
        textAlign: TextAlign.center,
        style: AppTextStyles.titleMd
            .copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildOptions() {
    return Column(
      children: List.generate(_options.length, (index) {
        final isSelected = _answers[_currentIndex] == index;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GestureDetector(
            onTap: () => setState(() => _answers[_currentIndex] = index),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : const Color(0xFFE2E8F0),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withAlpha(40),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : [],
              ),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? Colors.white : AppColors.outline,
                        width: 2,
                      ),
                      color: isSelected ? Colors.white : Colors.transparent,
                    ),
                    child: isSelected
                        ? const Icon(Icons.check, size: 16, color: AppColors.primary)
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Text(
                    _options[index],
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildNavButtons() {
    final answered = _answers.containsKey(_currentIndex);
    final isLast = _currentIndex == _questions.length - 1;

    return Row(
      children: [
        if (_currentIndex > 0)
          Expanded(
            child: OutlinedButton(
              onPressed: () => setState(() => _currentIndex--),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Kembali'),
            ),
          ),
        if (_currentIndex > 0) const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: answered
                ? () {
                    if (!isLast) {
                      setState(() => _currentIndex++);
                    } else {
                      _showResult();
                    }
                  }
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: Text(isLast ? 'Lihat Hasil' : 'Lanjut'),
          ),
        ),
      ],
    );
  }

  void _showResult() {
    final score = _calculatedScore;
    Color scoreColor = Colors.green;
    if (score == 'Ringan' || score == 'Sedang') scoreColor = Colors.orange;
    if (score == 'Tinggi' || score == 'Berat') scoreColor = Colors.red;

    String recommendation;
    switch (score) {
      case 'Normal':
        recommendation = 'Kondisi kamu baik. Tetap jaga kesehatan mental dengan aktivitas positif.';
        break;
      case 'Ringan':
      case 'Sedang':
        recommendation = 'Disarankan untuk menjadwalkan sesi konseling awal bersama psikolog BKU.';
        break;
      case 'Tinggi':
      case 'Berat':
        recommendation = 'Segera hubungi psikolog BKU untuk mendapatkan penanganan lebih lanjut.';
        break;
      default:
        recommendation = 'Konsultasikan hasil ini dengan psikolog BKU.';
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.analytics_rounded,
                color: scoreColor, size: 72),
            const SizedBox(height: 16),
            Text('Hasil ${widget.assessment.name}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: scoreColor.withAlpha(15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: scoreColor.withAlpha(40)),
              ),
              child: Text(
                score,
                style: TextStyle(
                    color: scoreColor,
                    fontWeight: FontWeight.w900,
                    fontSize: 20),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              recommendation,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.outline, fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 24),
            // Submit ke backend
            Consumer<StudentCounselingProvider>(
              builder: (context, provider, _) => SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: provider.assessmentSubmitting
                      ? null
                      : () async {
                          final success = await provider.submitAssessmentResult(
                            assessmentName: widget.assessment.name,
                            kategori: widget.assessment.kategori,
                            skor: score,
                            answers: _answers,
                            deskripsi: widget.assessment.deskripsi,
                          );
                          if (!ctx.mounted) return;
                          Navigator.pop(ctx);
                          if (!mounted) return;
                          final messenger = ScaffoldMessenger.of(context);
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(success
                                  ? 'Hasil asesmen berhasil disimpan!'
                                  : 'Hasil disimpan lokal. Cek koneksi internet.'),
                              backgroundColor:
                                  success ? AppColors.primary : Colors.orange,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                          Navigator.pop(context);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: provider.assessmentSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Simpan & Selesai',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('Tutup tanpa menyimpan',
                  style: TextStyle(color: AppColors.outline, fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }
}
