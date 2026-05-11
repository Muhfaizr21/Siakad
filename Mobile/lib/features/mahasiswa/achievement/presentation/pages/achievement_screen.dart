import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/mahasiswa/achievement/presentation/pages/report_achievement_screen.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class AchievementScreen extends StatelessWidget {
  const AchievementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            title: 'PRESTASI MAHASISWA',
            subtitle: 'RIWAYAT & PENGHARGAAN',
            variant: AppBarVariant.student,
            expandedHeight: 160,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  const FadeInAnimation(
                    delay: 0.2,
                    child: _RecapSection(),
                  ),
                  const SizedBox(height: 32),
                  FadeInAnimation(
                    delay: 0.4,
                    child: Text(
                      'Riwayat Prestasi',
                      style: AppTextStyles.titleLg.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (student.achievements.isEmpty)
                    const FadeInAnimation(delay: 0.6, child: _EmptyState())
                  else
                    ...List.generate(student.achievements.length, (index) {
                      return FadeInAnimation(
                        delay: 0.6 + (index * 0.1),
                        child: _AchievementCard(achievement: student.achievements[index]),
                      );
                    }),
                  const SizedBox(height: 160),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FadeInAnimation(
        delay: 1.0,
        child: Padding(
          padding: const EdgeInsets.only(bottom: 110),
          child: FloatingActionButton.extended(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ReportAchievementScreen())),
            backgroundColor: AppColors.primary,
            elevation: 4,
            icon: const Icon(Icons.add_task_rounded, color: Colors.white),
            label: Text('Tambah Prestasi', style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
      extendBody: true,
    );
  }
}

class _RecapSection extends StatelessWidget {
  const _RecapSection();

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withAlpha(50), blurRadius: 25, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Indeks Prestasi Kumulatif', style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontWeight: FontWeight.bold)),
                  Text('3.85', style: AppTextStyles.display.copyWith(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white.withAlpha(20), borderRadius: BorderRadius.circular(16)),
                child: const Icon(Icons.military_tech_rounded, color: Colors.amber, size: 32),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStat('Total', '${student.totalAchievements}', Icons.folder_shared_rounded, Colors.blue),
              _buildStat('Valid', '${student.validatedAchievements}', Icons.verified_rounded, Colors.green),
              _buildStat('Pending', '${student.pendingAchievements}', Icons.pending_rounded, Colors.orange),
              _buildStat('Synced', '${student.syncedAchievements}', Icons.sync_rounded, Colors.teal),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.white.withAlpha(20), shape: BoxShape.circle),
          child: Icon(icon, color: Colors.white, size: 16),
        ),
        const SizedBox(height: 8),
        Text(value, style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _AchievementCard extends StatelessWidget {
  final dynamic achievement;
  const _AchievementCard({required this.achievement});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    IconData statusIcon;
    
    switch (achievement.status) {
      case 'Validated':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'Rejected':
        statusColor = Colors.red;
        statusIcon = Icons.cancel_rounded;
        break;
      default:
        statusColor = Colors.orange;
        statusIcon = Icons.hourglass_empty_rounded;
    }

    final date = achievement.date;
    final formattedDate = "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        boxShadow: [
          BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 12, offset: const Offset(0, 4)),
        ],
      ),
      child: InkWell(
        onTap: () => _showAchievementDetail(context, achievement),
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(10),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.emoji_events_rounded, color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: statusColor.withAlpha(15), borderRadius: BorderRadius.circular(8)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(statusIcon, color: statusColor, size: 12),
                                  const SizedBox(width: 6),
                                  Text(
                                    achievement.status.toUpperCase(),
                                    style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.w900, fontSize: 9),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (achievement.isSynced)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: Colors.teal.withAlpha(15), borderRadius: BorderRadius.circular(8)),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.sync_rounded, color: Colors.teal, size: 12),
                                    const SizedBox(width: 6),
                                    Text(
                                      'SIMKATMAWA',
                                      style: AppTextStyles.labelSm.copyWith(color: Colors.teal, fontWeight: FontWeight.w900, fontSize: 9),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(achievement.title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.primary)),
                        Text(achievement.organizer, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1, thickness: 1.2),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildTag(Icons.layers_rounded, achievement.level),
                  const SizedBox(width: 16),
                  _buildTag(Icons.workspace_premium_rounded, achievement.rank),
                  const Spacer(),
                  _buildTag(Icons.calendar_month_rounded, formattedDate),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAchievementDetail(BuildContext context, dynamic achievement) {
    Color statusColor;
    IconData statusIcon;
    String statusDesc;
    
    switch (achievement.status) {
      case 'Validated':
        statusColor = Colors.green;
        statusIcon = Icons.verified_rounded;
        statusDesc = 'Prestasi telah divalidasi oleh Kemahasiswaan.';
        break;
      case 'Rejected':
        statusColor = Colors.red;
        statusIcon = Icons.error_outline_rounded;
        statusDesc = 'Prestasi ditolak. Silakan cek kembali berkas Anda.';
        break;
      default:
        statusColor = Colors.orange;
        statusIcon = Icons.hourglass_empty_rounded;
        statusDesc = 'Prestasi sedang dalam proses review panitia.';
    }

    final date = achievement.date;
    final formattedDate = "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: statusColor.withAlpha(15), shape: BoxShape.circle),
                          child: Icon(statusIcon, color: statusColor, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              achievement.status.toUpperCase(),
                              style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.w900, letterSpacing: 1),
                            ),
                            Text(
                              'Status Verifikasi',
                              style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    Text(achievement.title, style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 20)),
                    const SizedBox(height: 8),
                    Text(achievement.organizer, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 32),
                    const Divider(),
                    const SizedBox(height: 24),
                    Text('Detail Penghargaan', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _buildDetailRow(Icons.layers_rounded, 'Tingkat', achievement.level),
                    _buildDetailRow(Icons.emoji_events_rounded, 'Pencapaian', achievement.rank),
                    _buildDetailRow(Icons.calendar_today_rounded, 'Tanggal', formattedDate),
                    _buildDetailRow(
                      Icons.cloud_done_rounded, 
                      'Simkatmawa', 
                      achievement.isSynced ? 'Sudah Sinkron' : 'Belum Sinkron',
                      color: achievement.isSynced ? Colors.teal : AppColors.outline
                    ),
                    const SizedBox(height: 24),
                    Text('Dokumen Sertifikat', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    if (achievement.certificateUrl != null)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.surfaceVariant),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(color: Colors.red.withAlpha(10), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.picture_as_pdf_rounded, color: Colors.red, size: 24),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Sertifikat_${achievement.id}.pdf', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Text('Klik untuk melihat dokumen', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11)),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Membuka pratinjau sertifikat...'), behavior: SnackBarBehavior.floating),
                                );
                              },
                              icon: const Icon(Icons.visibility_rounded, color: AppColors.primary),
                            ),
                          ],
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(16),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant.withAlpha(30),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.surfaceVariant.withAlpha(100)),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.cloud_off_rounded, color: AppColors.outline.withAlpha(100), size: 32),
                            const SizedBox(height: 12),
                            Text(
                              'File sertifikat belum tersedia atau belum diunggah.',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: statusColor.withAlpha(10), borderRadius: BorderRadius.circular(16)),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline_rounded, color: statusColor, size: 18),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(statusDesc, style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded),
                label: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.surfaceVariant, width: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  foregroundColor: AppColors.primary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: AppColors.outline.withAlpha(100), size: 20),
          const SizedBox(width: 16),
          Text(label, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
          const Spacer(),
          Text(value, style: AppTextStyles.labelMd.copyWith(color: color ?? AppColors.primary, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildTag(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: AppColors.outline, size: 14),
        const SizedBox(width: 6),
        Text(text, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 40),
        Icon(Icons.emoji_events_outlined, size: 80, color: AppColors.outline.withAlpha(50)),
        const SizedBox(height: 16),
        Text('Belum ada prestasi', style: AppTextStyles.titleLg.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
        Text('Yuk, mulai lapor prestasi mandiri kamu!', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
      ],
    );
  }
}
