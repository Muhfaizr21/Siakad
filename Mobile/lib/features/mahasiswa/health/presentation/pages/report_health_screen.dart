import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/health_record.dart';

class ReportHealthScreen extends StatefulWidget {
  const ReportHealthScreen({super.key});

  @override
  State<ReportHealthScreen> createState() => _ReportHealthScreenState();
}

class _ReportHealthScreenState extends State<ReportHealthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _sysController = TextEditingController();
  final _diaController = TextEditingController();
  final _hrController = TextEditingController();
  final _tempController = TextEditingController();
  
  double _currentBMI = 0;
  String _bmiStatus = '-';
  Color _bmiColor = AppColors.outline;

  @override
  void initState() {
    super.initState();
    _heightController.addListener(_calculateBMI);
    _weightController.addListener(_calculateBMI);
  }

  void _calculateBMI() {
    if (_heightController.text.isNotEmpty && _weightController.text.isNotEmpty) {
      double h = double.tryParse(_heightController.text) ?? 0;
      double w = double.tryParse(_weightController.text) ?? 0;
      if (h > 0 && w > 0) {
        double bmi = w / ((h / 100) * (h / 100));
        setState(() {
          _currentBMI = bmi;
          if (bmi < 18.5) { _bmiStatus = 'Underweight'; _bmiColor = Colors.blue; }
          else if (bmi < 25) { _bmiStatus = 'Normal'; _bmiColor = Colors.green; }
          else if (bmi < 30) { _bmiStatus = 'Overweight'; _bmiColor = Colors.orange; }
          else { _bmiStatus = 'Obese'; _bmiColor = Colors.red; }
        });
      }
    }
  }

  @override
  void dispose() {
    _heightController.dispose();
    _weightController.dispose();
    _sysController.dispose();
    _diaController.dispose();
    _hrController.dispose();
    _tempController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Input Data Kesehatan', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildBMIPreview(),
              const SizedBox(height: 32),
              _buildInputCard(
                'Parameter Tubuh',
                Icons.accessibility_new_rounded,
                Colors.blue,
                [
                  Row(
                    children: [
                      Expanded(child: _buildInputField(_heightController, 'Tinggi (cm)', Icons.height_rounded, '170')),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInputField(_weightController, 'Berat (kg)', Icons.monitor_weight_rounded, '65')),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildInputCard(
                'Tekanan Darah',
                Icons.favorite_rounded,
                Colors.red,
                [
                  Row(
                    children: [
                      Expanded(child: _buildInputField(_sysController, 'Sistolik', Icons.arrow_upward_rounded, '120')),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInputField(_diaController, 'Diastolik', Icons.arrow_downward_rounded, '80')),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildInputCard(
                'Metrik Tambahan',
                Icons.analytics_rounded,
                Colors.orange,
                [
                  Row(
                    children: [
                      Expanded(child: _buildInputField(_hrController, 'Detak Jantung', Icons.monitor_heart_rounded, '72')),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInputField(_tempController, 'Suhu (°C)', Icons.thermostat_rounded, '36.5')),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 48),
              _buildSubmitButton(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBMIPreview() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [_bmiColor.withAlpha(200), _bmiColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: _bmiColor.withAlpha(80), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withAlpha(40), shape: BoxShape.circle),
            child: const Icon(Icons.speed_rounded, color: Colors.white, size: 32),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Prediksi BMI Kamu', style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(
                  _currentBMI > 0 ? _currentBMI.toStringAsFixed(1) : '--', 
                  style: AppTextStyles.headlineMd.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 28),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
            child: Text(
              _bmiStatus, 
              style: AppTextStyles.labelSm.copyWith(color: _bmiColor, fontWeight: FontWeight.w900, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputCard(String title, IconData icon, Color color, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 12),
              Text(title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 20),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInputField(TextEditingController controller, String label, IconData icon, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold, fontSize: 11)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: TextInputType.number,
          style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: AppColors.outline.withAlpha(100)),
            prefixIcon: Icon(icon, size: 18, color: AppColors.primary.withAlpha(150)),
            filled: true,
            fillColor: AppColors.background.withAlpha(150),
            contentPadding: const EdgeInsets.all(16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
          ),
          validator: (val) => val == null || val.isEmpty ? 'Wajib isi' : null,
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      width: double.infinity,
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFF1E40AF)]),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withAlpha(100), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: ElevatedButton(
        onPressed: () => _submitForm(),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        child: Text('Simpan Data Kesehatan', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 16)),
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final record = HealthRecord(
        id: 'H${DateTime.now().millisecondsSinceEpoch}',
        height: double.parse(_heightController.text),
        weight: double.parse(_weightController.text),
        bloodPressure: '${_sysController.text}/${_diaController.text}',
        heartRate: int.parse(_hrController.text),
        temperature: double.parse(_tempController.text),
        date: DateTime.now(),
      );
      context.read<StudentProvider>().addHealthRecord(record);
      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 80),
            const SizedBox(height: 24),
            Text('Data Tersimpan!', style: AppTextStyles.titleLg),
            const SizedBox(height: 12),
            Text(
              'Terima kasih telah memantau kesehatanmu. Terus jaga pola makan dan olahraga ya!',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Kembali', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
