import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/mahasiswa/counseling/presentation/pages/book_counseling_screen.dart';

class PsychologistListScreen extends StatelessWidget {
  const PsychologistListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'Daftar Psikolog',
            subtitle: 'PROFESIONAL KAMPUS',
            variant: AppBarVariant.student,
            expandedHeight: 140,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final psy = student.availablePsychologists[index];
                  return FadeInAnimation(
                    delay: 0.1 * index,
                    child: _buildPsychologistCard(context, psy),
                  );
                },
                childCount: student.availablePsychologists.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPsychologistCard(BuildContext context, Psychologist psy) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.primary.withAlpha(8), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(5),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showBookingDialog(context, psy),
          borderRadius: BorderRadius.circular(28),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primary.withAlpha(50)],
                        ),
                      ),
                      child: SizedBox(
                        width: 60,
                        height: 60,
                        child: ClipOval(
                          child: Image.network(
                            psy.profileImageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              color: AppColors.primary.withAlpha(20),
                              child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 30),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 2,
                      bottom: 2,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  psy.name.split(',')[0],
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelMd.copyWith(
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  psy.specialization.split('&')[0].trim(),
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.outline,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Spacer(),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primary.withAlpha(180)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      'Booking',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showBookingDialog(BuildContext context, Psychologist selectedPsy) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            Row(
              children: [
                SizedBox(
                  width: 48,
                  height: 48,
                  child: ClipOval(
                    child: Image.network(
                      selectedPsy.profileImageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.primary.withAlpha(20),
                        child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 24),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Konseling dengan', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                      Text(selectedPsy.name, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 24),
            Text('Pilih Topik Konseling', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            const SizedBox(height: 32),
            _buildTopicOption(context, 'Masalah Akademik', Icons.school_rounded, selectedPsy),
            _buildTopicOption(context, 'Kesehatan Mental & Stres', Icons.psychology_rounded, selectedPsy),
            _buildTopicOption(context, 'Masalah Keluarga/Pribadi', Icons.family_restroom_rounded, selectedPsy),
            _buildTopicOption(context, 'Karir & Masa Depan', Icons.work_rounded, selectedPsy),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTopicOption(BuildContext context, String title, IconData icon, Psychologist selectedPsy) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        ),
        child: ListTile(
          onTap: () {
            Navigator.pop(context);
            Navigator.push(context, MaterialPageRoute(builder: (context) => BookCounselingScreen(topic: title, psychologist: selectedPsy)));
          },
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: AppColors.primary, size: 22),
          ),
          title: Text(title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
      ),
    );
  }
}
