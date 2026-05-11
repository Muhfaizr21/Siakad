import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';

class StudentCounselingScreen extends StatelessWidget {
  const StudentCounselingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'BKU Care',
            subtitle: 'KONSELING & KESEHATAN MENTAL',
            variant: AppBarVariant.student,
            showBackButton: true,
            expandedHeight: 160,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildGreeting(),
                  const SizedBox(height: 24),
                  _buildUrgentCard(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Menu Layanan'),
                  const SizedBox(height: 16),
                  _buildServiceGrid(context),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Jadwal Saya'),
                  const SizedBox(height: 16),
                  _buildMyAppointments(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Psikolog Tersedia'),
                  const SizedBox(height: 16),
                  _buildPsychologistList(context),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGreeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Halo, Mahasiswa BKU',
          style: AppTextStyles.titleLg.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
        Text(
          'Apa yang kamu rasakan hari ini? Kami di sini untuk mendengarkan.',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline),
        ),
      ],
    );
  }

  Widget _buildUrgentCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.red.withAlpha(30)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Butuh bantuan segera?',
                  style: AppTextStyles.bodyLg.copyWith(
                    color: Colors.red[900],
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Klik untuk hubungi hotline darurat 24/7',
                  style: AppTextStyles.labelMd.copyWith(color: Colors.red[700]),
                ),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, color: Colors.red, size: 16),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        color: AppColors.primary,
        fontWeight: FontWeight.w900,
      ),
    );
  }

  Widget _buildServiceGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.2,
      children: [
        _buildServiceCard(context, 'Booking Sesi', Icons.event_available_rounded, Colors.blue, AppRoutes.counselingBooking),
        _buildServiceCard(context, 'Tes Mental', Icons.quiz_rounded, Colors.purple, AppRoutes.assessment),
        _buildServiceCard(context, 'Self-Care', Icons.spa_rounded, Colors.teal, null),
        _buildServiceCard(context, 'Riwayat', Icons.history_rounded, Colors.orange, null),
      ],
    );
  }

  Widget _buildServiceCard(BuildContext context, String title, IconData icon, Color color, String? route) {
    return GestureDetector(
      onTap: route != null ? () => context.push(route) : null,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: color.withAlpha(15),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyAppointments() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text('09', style: AppTextStyles.titleMd.copyWith(color: Colors.green[700], fontWeight: FontWeight.bold)),
                Text('MEI', style: AppTextStyles.labelSm.copyWith(color: Colors.green[700])),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Konseling Rutin', style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                Text('Dr. Sarah Sp.Psi • 14:00 WIB', style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('Online', style: TextStyle(color: Colors.blue[700], fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildPsychologistList(BuildContext context) {
    return Column(
      children: [
        _buildPsychologistCard(context, 'Dr. Sarah Specialist', 'Kecemasan, Karir', '4.9'),
        const SizedBox(height: 12),
        _buildPsychologistCard(context, 'Bpk. Budi Raharjo', 'Masalah Keluarga', '4.8'),
      ],
    );
  }

  Widget _buildPsychologistCard(BuildContext context, String name, String tags, String rating) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 28,
            backgroundColor: Color(0xFFF1F5F9),
            child: Icon(Icons.person_rounded, color: AppColors.outline),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                Text(tags, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: Colors.orange, size: 16),
                    const SizedBox(width: 4),
                    Text(rating, style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => context.push(AppRoutes.counselingBooking),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            child: const Text('Book'),
          ),
        ],
      ),
    );
  }
}
