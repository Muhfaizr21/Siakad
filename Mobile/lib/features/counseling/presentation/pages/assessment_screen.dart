import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class AssessmentScreen extends StatefulWidget {
  const AssessmentScreen({super.key});

  @override
  State<AssessmentScreen> createState() => _AssessmentScreenState();
}

class _AssessmentScreenState extends State<AssessmentScreen> {
  int _currentQuestionIndex = 0;
  final Map<int, int> _answers = {};

  final List<String> _questions = [
    'Saya merasa sulit untuk beristirahat.',
    'Saya merasa mulut saya kering.',
    'Saya tidak dapat merasakan perasaan positif apa pun.',
    'Saya mengalami kesulitan bernapas (misal: napas cepat, terengah-engah).',
    'Saya merasa sulit untuk berinisiatif melakukan sesuatu.',
    'Saya cenderung bereaksi berlebihan terhadap situasi.',
    'Saya merasa goyah (misal: kaki terasa mau copot).',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProgressIndicator(),
                  const SizedBox(height: 32),
                  _buildQuestionCard(),
                  const SizedBox(height: 32),
                  _buildOptions(),
                  const SizedBox(height: 40),
                  _buildNavigationButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Pertanyaan ${_currentQuestionIndex + 1} dari ${_questions.length}',
              style: AppTextStyles.labelMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
            ),
            Text(
              '${((_currentQuestionIndex + 1) / _questions.length * 100).toInt()}%',
              style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
            ),
          ],
        ),
        const SizedBox(height: 12),
        LinearProgressIndicator(
          value: (_currentQuestionIndex + 1) / _questions.length,
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
        _questions[_currentQuestionIndex],
        textAlign: TextAlign.center,
        style: AppTextStyles.titleMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildOptions() {
    final List<String> options = [
      'Tidak Pernah',
      'Kadang-kadang',
      'Sering',
      'Hampir Selalu',
    ];

    return Column(
      children: List.generate(options.length, (index) {
        final isSelected = _answers[_currentQuestionIndex] == index;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GestureDetector(
            onTap: () => setState(() => _answers[_currentQuestionIndex] = index),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0)),
                boxShadow: isSelected ? [BoxShadow(color: AppColors.primary.withAlpha(40), blurRadius: 10, offset: const Offset(0, 4))] : [],
              ),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: isSelected ? Colors.white : AppColors.outline, width: 2),
                      color: isSelected ? Colors.white : Colors.transparent,
                    ),
                    child: isSelected ? const Icon(Icons.check, size: 16, color: AppColors.primary) : null,
                  ),
                  const SizedBox(width: 16),
                  Text(
                    options[index],
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

  Widget _buildNavigationButtons() {
    return Row(
      children: [
        if (_currentQuestionIndex > 0)
          Expanded(
            child: OutlinedButton(
              onPressed: () => setState(() => _currentQuestionIndex--),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Kembali'),
            ),
          ),
        if (_currentQuestionIndex > 0) const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: _answers.containsKey(_currentQuestionIndex)
                ? () {
                    if (_currentQuestionIndex < _questions.length - 1) {
                      setState(() => _currentQuestionIndex++);
                    } else {
                      _showResult();
                    }
                  }
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: Text(_currentQuestionIndex < _questions.length - 1 ? 'Lanjut' : 'Lihat Hasil'),
          ),
        ),
      ],
    );
  }

  void _showResult() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.analytics_rounded, color: Colors.blue, size: 80),
            const SizedBox(height: 24),
            const Text(
              'Hasil Analisis Mental',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildResultRow('Kecemasan', 'Sedang', Colors.orange),
            _buildResultRow('Stres', 'Ringan', Colors.green),
            _buildResultRow('Depresi', 'Normal', Colors.green),
            const SizedBox(height: 24),
            const Text(
              'Rekomendasi: Anda disarankan untuk menjadwalkan sesi konseling awal untuk diskusi lebih lanjut.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.outline, fontSize: 12),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Back to counseling home
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Selesai'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultRow(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(8)),
            child: Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
