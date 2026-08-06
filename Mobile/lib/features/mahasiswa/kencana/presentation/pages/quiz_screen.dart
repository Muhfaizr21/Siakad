import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/mission.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/bku_shimmer.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';

class QuizScreen extends StatefulWidget {
  final Mission mission;

  const QuizScreen({super.key, required this.mission});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  // State mesin kuis
  bool _isLoadingSoal = true;
  bool _isSubmitting = false;
  String? _errorMsg;

  List<Map<String, dynamic>> _questions = [];
  String _quizTitle = 'Kuis Evaluasi';
  int _durasiMenit = 30;
  int _passingGrade = 70;

  int _currentQuestionIndex = 0;
  // map soal_id -> option_id yang dipilih
  final Map<String, int> _jawaban = {};

  Timer? _timer;
  int _timeLeft = 0;

  // State hasil
  bool _isFinished = false;
  double _nilaiAkhir = 0;
  bool _lulus = false;
  int _jumlahBenar = 0;
  double _nilaiKumulatif = 0;

  @override
  void initState() {
    super.initState();
    _loadSoal();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  // ─── Load soal dari API ──────────────────────────────────────────────────

  Future<void> _loadSoal() async {
    setState(() {
      _isLoadingSoal = true;
      _errorMsg = null;
    });
    try {
      final kuisId = widget.mission.id;
      final response =
          await ApiClient().client.get('/kencana/kuis/$kuisId/soal');
      if (response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>;
        final rawSoal = data['soal'] as List? ?? [];

        setState(() {
          _quizTitle =
              data['judul']?.toString() ?? widget.mission.title ?? 'Kuis Evaluasi';
          _durasiMenit = (data['durasi_menit'] ?? 30) as int;
          _passingGrade = (data['passing_grade'] ?? 70) as int;
          _timeLeft = _durasiMenit * 60;
          _questions = rawSoal.cast<Map<String, dynamic>>();
          _isLoadingSoal = false;
        });

        _startTimer();
      } else {
        setState(() {
          _errorMsg = response.data['message'] ?? 'Gagal memuat soal';
          _isLoadingSoal = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMsg = 'Tidak dapat terhubung ke server.';
        _isLoadingSoal = false;
      });
    }
  }

  // ─── Timer ──────────────────────────────────────────────────────────────

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timeLeft > 0) {
        setState(() => _timeLeft--);
      } else {
        _submitKuis(); // Otomatis kumpul saat waktu habis
      }
    });
  }

  String _getFormattedTime() {
    final m = (_timeLeft / 60).floor();
    final s = _timeLeft % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  bool get _isTimeAlmostUp => _timeLeft <= 60 && _timeLeft > 0;

  // ─── Submit ke API ───────────────────────────────────────────────────────

  Future<void> _submitKuis() async {
    _timer?.cancel();
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);

    try {
      final kuisId = widget.mission.id;
      // Ubah jawaban ke format String key (soal_id)
      final jawabanStr = _jawaban.map((k, v) => MapEntry(k, v));

      final response = await ApiClient().client.post(
        '/kencana/kuis/$kuisId/submit',
        data: {'jawaban': jawabanStr},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>;
        final nilai = (data['nilai'] ?? 0.0).toDouble();
        final lulus = data['lulus'] == true;
        final jumlahBenar = (data['jumlah_benar'] ?? 0) as int;
        final nilaiKumulatif =
            (data['nilai_kumulatif_terbaru'] ?? 0.0).toDouble();

        // Update provider agar progress kencana refresh
        if (mounted) {
          context.read<StudentProvider>().loadAllData();
        }

        setState(() {
          _nilaiAkhir = nilai;
          _lulus = lulus;
          _jumlahBenar = jumlahBenar;
          _nilaiKumulatif = nilaiKumulatif;
          _isFinished = true;
          _isSubmitting = false;
        });
      } else {
        _showError(response.data['message'] ?? 'Gagal mengumpulkan kuis');
        setState(() => _isSubmitting = false);
      }
    } catch (e) {
      _showError('Gagal mengirim jawaban. Periksa koneksi internet kamu.');
      setState(() => _isSubmitting = false);
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ─── Navigasi soal ───────────────────────────────────────────────────────

  void _handleNext() {
    final currentQ = _questions[_currentQuestionIndex];
    final qId = currentQ['id'].toString();

    if (_jawaban[qId] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih salah satu jawaban terlebih dahulu.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() => _currentQuestionIndex++);
    } else {
      _submitKuis();
    }
  }

  // ─── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    if (_isLoadingSoal) return _buildLoading();
    if (_errorMsg != null) return _buildError();
    if (_isFinished) return _buildResultView();
    if (_questions.isEmpty) return _buildEmptySoal();

    final currentQ = _questions[_currentQuestionIndex];
    final qId = currentQ['id'].toString();
    final opts = (currentQ['options'] as List? ?? []).cast<Map<String, dynamic>>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: _quizTitle.toUpperCase(),
            info: '${_questions.length} PERTANYAAN • $_durasiMenit MENIT',
            variant: AppBarVariant.student,
            showBackButton: true,
            isExpandable: false,
            showNotification: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header: nomor soal + timer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Soal ${_currentQuestionIndex + 1}/${_questions.length}',
                          style: AppTextStyles.labelSm.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 400),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: _isTimeAlmostUp
                              ? Colors.red.withAlpha(15)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.timer_outlined,
                                color: _isTimeAlmostUp
                                    ? Colors.red
                                    : AppColors.outline,
                                size: 20),
                            const SizedBox(width: 6),
                            Text(
                              _getFormattedTime(),
                              style: AppTextStyles.labelMd.copyWith(
                                color: _isTimeAlmostUp
                                    ? Colors.red
                                    : AppColors.primary,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (_currentQuestionIndex + 1) / _questions.length,
                      backgroundColor: AppColors.primary.withAlpha(10),
                      color: AppColors.primary,
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Pertanyaan
                  Text(
                    currentQ['pertanyaan']?.toString() ?? '',
                    style: AppTextStyles.titleLg.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                        fontSize: 20),
                  ),
                  const SizedBox(height: 32),

                  // Opsi jawaban
                  ...opts.map((opt) {
                    final optId = (opt['id'] as num).toInt();
                    final isSelected = _jawaban[qId] == optId;
                    return _buildOption(
                        qId: qId,
                        optId: optId,
                        text: opt['opsi']?.toString() ?? '',
                        isSelected: isSelected);
                  }),

                  const SizedBox(height: 40),

                  // Tombol lanjut / kumpul
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _handleNext,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: Colors.grey[200],
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              _currentQuestionIndex == _questions.length - 1
                                  ? 'Selesai & Kumpulkan'
                                  : 'Pertanyaan Selanjutnya',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Navigasi soal (dot row)
                  _buildDotNavigation(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption({
    required String qId,
    required int optId,
    required String text,
    required bool isSelected,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => setState(() => _jawaban[qId] = optId),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withAlpha(10) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
              width: isSelected ? 2 : 1.5,
            ),
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.outline,
                      width: 2),
                  color: isSelected ? AppColors.primary : Colors.transparent,
                ),
                child:
                    isSelected ? const Icon(Icons.check, color: Colors.white, size: 14) : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  text,
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.primary,
                    fontWeight:
                        isSelected ? FontWeight.w900 : FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDotNavigation() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(_questions.length, (i) {
          final qId =
              (_questions[i]['id'] ?? '').toString();
          final answered = _jawaban.containsKey(qId);
          final isCurrent = i == _currentQuestionIndex;
          return GestureDetector(
            onTap: () => setState(() => _currentQuestionIndex = i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: isCurrent ? 28 : 10,
              height: 10,
              decoration: BoxDecoration(
                color: isCurrent
                    ? AppColors.primary
                    : answered
                        ? AppColors.primary.withAlpha(60)
                        : AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(5),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ─── Layar loading, error, hasil ────────────────────────────────────────

  Widget _buildLoading() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'MEMUAT KUIS',
            variant: AppBarVariant.student,
            showBackButton: true,
            isExpandable: false,
            showNotification: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(children: [
                const SizedBox(height: 20),
                const BkuShimmerList(itemCount: 4, itemHeight: 72),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline_rounded,
                  size: 72, color: AppColors.error.withAlpha(100)),
              const SizedBox(height: 20),
              Text(_errorMsg ?? 'Terjadi kesalahan',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelMd
                      .copyWith(color: AppColors.outline)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadSoal,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Coba Lagi'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptySoal() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.quiz_outlined,
                size: 72, color: AppColors.outline.withAlpha(80)),
            const SizedBox(height: 16),
            Text('Soal belum tersedia',
                style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Kembali'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultView() {
    final lulus = _lulus;
    final skor = _nilaiAkhir.toStringAsFixed(0);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Ikon hasil
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: (lulus ? Colors.green : Colors.orange).withAlpha(15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  lulus
                      ? Icons.verified_rounded
                      : Icons.emoji_events_outlined,
                  color: lulus ? Colors.green : Colors.orange,
                  size: 80,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                lulus ? 'Selamat, Kamu Lulus! 🎉' : 'Kuis Selesai',
                style: AppTextStyles.display.copyWith(
                    color: AppColors.primary,
                    fontSize: 28,
                    fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 12),
              Text(
                lulus
                    ? 'Kamu berhasil melewati batas minimum nilai $_passingGrade.'
                    : 'Nilai minimum adalah $_passingGrade. Kamu masih bisa mencoba lagi.',
                textAlign: TextAlign.center,
                style:
                    AppTextStyles.bodyMd.copyWith(color: AppColors.outline, height: 1.5),
              ),
              const SizedBox(height: 40),

              // Kartu skor
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: lulus
                        ? [
                            const Color(0xFF10B981).withAlpha(20),
                            const Color(0xFF059669).withAlpha(10),
                          ]
                        : [
                            Colors.orange.withAlpha(20),
                            Colors.amber.withAlpha(10),
                          ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: (lulus ? Colors.green : Colors.orange).withAlpha(40),
                  ),
                ),
                child: Column(
                  children: [
                    Text('SKOR KAMU',
                        style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.outline, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(
                      skor,
                      style: AppTextStyles.display.copyWith(
                          color: lulus ? Colors.green : Colors.orange,
                          fontSize: 60,
                          fontWeight: FontWeight.w900),
                    ),
                    Text(
                      'dari 100',
                      style: AppTextStyles.labelSm.copyWith(
                          color: AppColors.outline, fontWeight: FontWeight.bold),
                    ),
                    const Divider(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildResultStat(
                            '$_jumlahBenar', 'Jawaban\nBenar', Icons.check_circle_outline_rounded, Colors.green),
                        _buildResultStat(
                            '${_questions.length - _jumlahBenar}', 'Jawaban\nSalah', Icons.cancel_outlined, Colors.red),
                        _buildResultStat(
                            _nilaiKumulatif.toStringAsFixed(0), 'Nilai\nKumulatif', Icons.analytics_rounded, AppColors.primary),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // Tombol kembali
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Kembali ke Journey',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultStat(
      String value, String label, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(height: 4),
        Text(value,
            style: AppTextStyles.titleLg.copyWith(
                fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.primary)),
        const SizedBox(height: 2),
        Text(label,
            textAlign: TextAlign.center,
            style: AppTextStyles.labelSm
                .copyWith(color: AppColors.outline, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
