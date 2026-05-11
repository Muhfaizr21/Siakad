import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class SessionNoteScreen extends StatefulWidget {
  final String studentName;
  final String studentId;

  const SessionNoteScreen({
    super.key,
    required this.studentName,
    required this.studentId,
  });

  @override
  State<SessionNoteScreen> createState() => _SessionNoteScreenState();
}

class _SessionNoteScreenState extends State<SessionNoteScreen> {
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _planController = TextEditingController();
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'CATATAN SESI',
            subtitle: 'ELECTRONIC HEALTH RECORD',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            expandedHeight: 160,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildConfidentialBanner(),
                  const SizedBox(height: 24),
                  _buildStudentInfo(),
                  const SizedBox(height: 32),
                  _buildInputSection(
                    'Ringkasan Sesi & Observasi',
                    'Tuliskan poin-poin utama dari sesi hari ini...',
                    _notesController,
                    10,
                  ),
                  const SizedBox(height: 24),
                  _buildInputSection(
                    'Rencana Tindak Lanjut',
                    'Apa langkah selanjutnya untuk mahasiswa ini?',
                    _planController,
                    5,
                  ),
                  const SizedBox(height: 40),
                  _buildSaveButton(),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfidentialBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withAlpha(10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.withAlpha(30)),
      ),
      child: Row(
        children: [
          const Icon(Icons.security_rounded, color: Colors.red, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'DOKUMEN RAHASIA: Catatan ini terenkripsi end-to-end dan hanya dapat diakses oleh Psikolog yang berwenang.',
              style: AppTextStyles.labelSm.copyWith(
                color: Colors.red[800],
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primary,
            child: Icon(Icons.person_rounded, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.studentName,
                style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.bold),
              ),
              Text(
                'NIM: ${widget.studentId}',
                style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
              ),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Sesi #4',
                style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
              Text(
                '07 Mei 2024',
                style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputSection(String label, String hint, TextEditingController controller, int lines) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.bodyMd.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: controller,
          maxLines: lines,
          style: AppTextStyles.bodyMd,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline.withAlpha(100)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.all(20),
          ),
        ),
      ],
    );
  }

  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: _isSaving ? null : () async {
          setState(() => _isSaving = true);
          await Future.delayed(const Duration(seconds: 2)); // Simulating encryption
          if (mounted) {
            setState(() => _isSaving = false);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Catatan Sesi Berhasil Dienkripsi & Disimpan'),
                backgroundColor: AppColors.primary,
              ),
            );
            Navigator.pop(context);
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 0,
        ),
        child: _isSaving
            ? const SizedBox(
                height: 24,
                width: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.enhanced_encryption_rounded),
                  const SizedBox(width: 12),
                  Text(
                    'Simpan & Enkripsi Catatan',
                    style: AppTextStyles.bodyLg.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
