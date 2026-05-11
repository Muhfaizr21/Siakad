import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/mission.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class QuizScreen extends StatefulWidget {
  final Mission mission;

  const QuizScreen({super.key, required this.mission});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentQuestionIndex = 0;
  int? _selectedOptionIndex;
  late Timer _timer;
  int _timeLeft = 600; // 10 minutes in seconds
  bool _isFinished = false;

  final List<Map<String, dynamic>> _questions = [
    {
      'question': 'Apa visi utama dari Universitas Bhakti Kencana?',
      'options': [
        'Menjadi kampus terbaik se-Asia',
        'Menjadi perguruan tinggi yang mandiri, inovatif, dan unggul di bidang kesehatan',
        'Fokus pada olahraga nasional',
        'Mencetak pengusaha muda'
      ],
      'correctIndex': 1,
    },
    {
      'question': 'Berapa jumlah Fakultas yang ada di UBK saat ini?',
      'options': ['2 Fakultas', '3 Fakultas', '4 Fakultas', '5 Fakultas'],
      'correctIndex': 2,
    },
    {
      'question': 'Slogan utama dalam gerakan PKKMB Kencana adalah?',
      'options': ['Kencana Berkarya', 'Mahasiswa Unggul, UBK Jaya', 'Bersama Membangun Negeri', 'Integritas & Dedikasi'],
      'correctIndex': 1,
    },
  ];

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0) {
        setState(() => _timeLeft--);
      } else {
        _finishQuiz();
      }
    });
  }

  void _finishQuiz() {
    _timer.cancel();
    setState(() => _isFinished = true);
    // Update score in provider
    context.read<StudentProvider>().toggleMission(widget.mission.id);
  }

  String _getFormattedTime() {
    final minutes = (_timeLeft / 60).floor();
    final seconds = _timeLeft % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isFinished) return _buildResultView();

    final currentQuestion = _questions[_currentQuestionIndex];

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'KUIS EVALUASI',
            info: '${_questions.length} PERTANYAAN • 10 MENIT',
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Pertanyaan ${_currentQuestionIndex + 1}/${_questions.length}',
                          style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.timer_outlined, color: Colors.red, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            _getFormattedTime(),
                            style: AppTextStyles.labelMd.copyWith(color: Colors.red, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  LinearProgressIndicator(
                    value: (_currentQuestionIndex + 1) / _questions.length,
                    backgroundColor: AppColors.primary.withAlpha(10),
                    color: AppColors.primary,
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  const SizedBox(height: 40),
                  Text(
                    currentQuestion['question'],
                    style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 20),
                  ),
                  const SizedBox(height: 32),
                  ...List.generate(
                    currentQuestion['options'].length,
                    (index) => _buildOption(index, currentQuestion['options'][index]),
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _selectedOptionIndex == null ? null : _handleNext,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: Colors.grey[200],
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text(
                        _currentQuestionIndex == _questions.length - 1 ? 'Selesai & Kumpulkan' : 'Pertanyaan Selanjutnya',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption(int index, String text) {
    final isSelected = _selectedOptionIndex == index;
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => setState(() => _selectedOptionIndex = index),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withAlpha(10) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
              width: 2,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: isSelected ? AppColors.primary : AppColors.outline, width: 2),
                  color: isSelected ? AppColors.primary : Colors.transparent,
                ),
                child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 14) : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  text,
                  style: AppTextStyles.labelMd.copyWith(
                    color: isSelected ? AppColors.primary : AppColors.primary,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleNext() {
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _selectedOptionIndex = null;
      });
    } else {
      _finishQuiz();
    }
  }

  Widget _buildResultView() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: Colors.green.withAlpha(10), shape: BoxShape.circle),
                child: const Icon(Icons.verified_rounded, color: Colors.green, size: 80),
              ),
              const SizedBox(height: 32),
              Text('Kuis Selesai!', style: AppTextStyles.display.copyWith(color: AppColors.primary, fontSize: 32, fontWeight: FontWeight.w900)),
              const SizedBox(height: 12),
              Text(
                'Selamat! Kamu telah menyelesaikan kuis evaluasi materi ini.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline),
              ),
              const SizedBox(height: 48),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: AppColors.primary.withAlpha(5), borderRadius: BorderRadius.circular(24)),
                child: Column(
                  children: [
                    Text('SKOR KAMU', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
                    Text('85/100', style: AppTextStyles.display.copyWith(color: AppColors.primary, fontSize: 48, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Kembali ke Journey', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
