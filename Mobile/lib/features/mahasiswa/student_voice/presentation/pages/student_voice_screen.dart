import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/aspiration.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/mahasiswa/student_voice/presentation/pages/submit_aspiration_screen.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class StudentVoiceScreen extends StatefulWidget {
  const StudentVoiceScreen({super.key});

  @override
  State<StudentVoiceScreen> createState() => _StudentVoiceScreenState();
}

class _StudentVoiceScreenState extends State<StudentVoiceScreen> {
  String _selectedFilter = 'Semua';

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final filteredAspirations = student.aspirations.where((a) => 
      _selectedFilter == 'Semua' || a.category == _selectedFilter
    ).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            title: 'Aspirasi Mahasiswa',
            subtitle: 'SUARA & SARAN',
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
                  const FadeInAnimation(delay: 0.2, child: _AspirationBanner()),
                  const SizedBox(height: 32),
                  FadeInAnimation(delay: 0.4, child: _buildStatsDashboard(student)),
                  const SizedBox(height: 32),
                  FadeInAnimation(
                    delay: 0.6,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Riwayat Aspirasimu', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                        TextButton(onPressed: () {}, child: Text('Lihat Semua', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  FadeInAnimation(delay: 0.7, child: _buildCategoryFilter()),
                  const SizedBox(height: 16),
                  if (filteredAspirations.isEmpty)
                    FadeInAnimation(delay: 0.8, child: _buildEmptyState())
                  else
                    ...List.generate(filteredAspirations.length, (index) => 
                      FadeInAnimation(
                        delay: 0.8 + (index * 0.1),
                        child: _buildAspirationCard(filteredAspirations[index]),
                      )
                    ),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsDashboard(StudentProvider student) {
    return Row(
      children: [
        _buildStatCard('Terkirim', student.totalAspirations.toString(), Icons.send_rounded, Colors.blue),
        const SizedBox(width: 12),
        _buildStatCard('Diproses', student.pendingAspirations.toString(), Icons.sync_rounded, Colors.orange),
        const SizedBox(width: 12),
        _buildStatCard('Selesai', student.resolvedAspirations.toString(), Icons.task_alt_rounded, Colors.green),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withAlpha(10), shape: BoxShape.circle), child: Icon(icon, color: color, size: 18)),
            const SizedBox(height: 12),
            Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.primary)),
            Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryFilter() {
    final categories = ['Semua', 'Fasilitas', 'Akademik', 'Organisasi'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: categories.map((cat) {
          bool isSelected = _selectedFilter == cat;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(cat),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) setState(() => _selectedFilter = cat);
              },
              selectedColor: AppColors.primary,
              labelStyle: AppTextStyles.labelSm.copyWith(color: isSelected ? Colors.white : AppColors.onSurfaceVariant, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: isSelected ? Colors.transparent : AppColors.surfaceVariant)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildAspirationCard(Aspiration asp) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showAspirationDetail(context, asp),
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                      child: Text(asp.category, style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 9)),
                    ),
                    const Spacer(),
                    _buildStatusBadge(asp.status),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(asp.title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 15)),
                          const SizedBox(height: 8),
                          Text(
                            asp.description,
                            style: AppTextStyles.labelSm.copyWith(color: AppColors.onSurfaceVariant, height: 1.5, fontWeight: FontWeight.w500),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    if (asp.imageUrl != null) ...[
                      const SizedBox(width: 16),
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          image: DecorationImage(image: NetworkImage(asp.imageUrl!), fit: BoxFit.cover),
                        ),
                      ),
                    ],
                  ],
                ),
                if (asp.feedback != null) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppColors.primary.withAlpha(5), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.primary.withAlpha(10))),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.reply_rounded, size: 18, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('BALASAN KAMPUS:', style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.w900, fontSize: 9, color: AppColors.primary)),
                              const SizedBox(height: 4),
                              Text(asp.feedback!, style: AppTextStyles.labelSm.copyWith(color: AppColors.onSurfaceVariant, fontSize: 11, fontWeight: FontWeight.w500, height: 1.4)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_formatDate(asp.date), style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold)),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.outline, size: 20),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAspirationDetail(BuildContext context, Aspiration asp) {
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
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(2))),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                          child: Text(asp.category, style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
                        ),
                        _buildStatusBadge(asp.status),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text(asp.title, style: AppTextStyles.titleLg.copyWith(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    const SizedBox(height: 12),
                    Text(_formatDate(asp.date), style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
                    if (asp.imageUrl != null) ...[
                      const SizedBox(height: 24),
                      Container(
                        width: double.infinity,
                        height: 220,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 20, offset: const Offset(0, 8))],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: Image.network(
                            asp.imageUrl!,
                            fit: BoxFit.cover,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                color: AppColors.surfaceVariant,
                                child: const Center(child: CircularProgressIndicator()),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),
                    const Divider(),
                    const SizedBox(height: 32),
                    Text('Isi Aspirasi', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 16),
                    Text(
                      asp.description,
                      style: AppTextStyles.bodyMd.copyWith(color: AppColors.onSurfaceVariant, height: 1.6, fontWeight: FontWeight.w500),
                    ),
                    if (asp.feedback != null) ...[
                      const SizedBox(height: 40),
                      Text('Tanggapan Kampus', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(5),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.primary.withAlpha(10)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.verified_user_rounded, color: AppColors.primary, size: 20),
                                const SizedBox(width: 12),
                                Text('TIM ADMINISTRASI BKU', style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.w900, letterSpacing: 1, color: AppColors.primary)),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              asp.feedback!,
                              style: AppTextStyles.bodyMd.copyWith(color: AppColors.onSurfaceVariant, height: 1.6),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;
    switch (status) {
      case 'Pending': color = Colors.orange; text = 'MENUNGGU'; break;
      case 'In Progress': color = Colors.blue; text = 'DIPROSES'; break;
      case 'Resolved': color = Colors.green; text = 'SELESAI'; break;
      default: color = AppColors.outline; text = status.toUpperCase();
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: color.withAlpha(15), borderRadius: BorderRadius.circular(10)),
      child: Text(text, style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 8)),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m yang lalu';
    if (diff.inHours < 24) return '${diff.inHours}j yang lalu';
    return '${date.day}/${date.month}/${date.year}';
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 40),
          Icon(Icons.inbox_rounded, size: 64, color: AppColors.outline.withAlpha(50)),
          const SizedBox(height: 16),
          Text('Belum ada riwayat aspirasi', style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _AspirationBanner extends StatelessWidget {
  const _AspirationBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: AppColors.primary.withAlpha(50), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white.withAlpha(30), borderRadius: BorderRadius.circular(16)),
                child: const Icon(Icons.campaign_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Suarakan Aspirasimu', style: AppTextStyles.headlineMd.copyWith(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                    Text('Setiap suara berharga untuk BKU.', style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => const SubmitAspirationScreen()));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: Text('Tulis Aspirasi Sekarang', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            ),
          ),
        ],
      ),
    );
  }
}
