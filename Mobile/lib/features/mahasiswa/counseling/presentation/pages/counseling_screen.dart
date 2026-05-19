import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/counseling_session.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/mahasiswa/counseling/presentation/pages/book_counseling_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/counseling/presentation/pages/psychologist_list_screen.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';

class CounselingScreen extends StatefulWidget {
  const CounselingScreen({super.key});

  @override
  State<CounselingScreen> createState() => _CounselingScreenState();
}

class _CounselingScreenState extends State<CounselingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentProvider>().loadAllData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            title: 'Layanan Konseling',
            subtitle: 'CARE & SUPPORT',
            variant: AppBarVariant.student,
            expandedHeight: 160,
            showBackButton: true,
            isExpandable: false,
            actions: [
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.search_rounded, color: Colors.white),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    const FadeInAnimation(delay: 0.2, child: _CounselingBanner()),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Psikolog Aktif', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                              TextButton(
                                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const PsychologistListScreen())), 
                                child: Text('Lihat Semua', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 220,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.only(bottom: 12),
                              physics: const BouncingScrollPhysics(),
                              itemCount: student.availablePsychologists.length,
                              itemBuilder: (context, index) => FadeInAnimation(
                                delay: 0.4 + (index * 0.1),
                                child: _buildPsychologistCard(context, student.availablePsychologists[index]),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.5, 
                      child: student.isLoading 
                        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                        : _buildDashboardSection(student),
                    ),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.6,
                      child: Text('Jadwal & Riwayat', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    ),
                    const SizedBox(height: 16),
                    if (student.isLoading)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 40),
                        child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                      )
                    else if (student.counselingSessions.isEmpty)
                      FadeInAnimation(delay: 0.7, child: _buildEmptyState())
                    else
                      ...List.generate(student.counselingSessions.length, (index) => 
                        FadeInAnimation(
                          delay: 0.7 + (index * 0.1),
                          child: _buildSessionCard(context, student.counselingSessions[index]),
                        )
                      ),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardSection(StudentProvider student) {
    final total = student.counselingSessions.length.toString();
    final pending = student.counselingSessions.where((s) => s.status.toLowerCase() != 'completed').length.toString();
    final completed = student.counselingSessions.where((s) => s.status.toLowerCase() == 'completed').length.toString();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Statistik Layanan', style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.w900, color: AppColors.outline, letterSpacing: 0.5)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.primary.withAlpha(15)),
            boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 15, offset: const Offset(0, 5))],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMiniStat('TOTAL SESI', total, Icons.history_rounded, Colors.blue),
                  _buildMiniStat('MENUNGGU', pending, Icons.pending_actions_rounded, Colors.orange),
                  _buildMiniStat('SELESAI', completed, Icons.check_circle_rounded, Colors.green),
                ],
              ),
              const SizedBox(height: 24),
              const Divider(height: 1),
              const SizedBox(height: 24),
              _buildFacultyMapping(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMiniStat(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withAlpha(10), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 8),
        Text(value, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.primary)),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildFacultyMapping() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Progres Sesi per Fakultas (Top 3)', style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.w900, fontSize: 10)),
        const SizedBox(height: 16),
        _buildFacultyBar('Fakultas Farmasi', 0.85, '452 Mhs'),
        const SizedBox(height: 12),
        _buildFacultyBar('Fakultas Keperawatan', 0.65, '312 Mhs'),
        const SizedBox(height: 12),
        _buildFacultyBar('Fakultas Kesehatan', 0.45, '220 Mhs'),
      ],
    );
  }

  Widget _buildFacultyBar(String name, double progress, String detail) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(name, style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.bold, fontSize: 11)),
            Text(detail, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: AppColors.surfaceVariant,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildSessionCard(BuildContext context, CounselingSession session) {
    bool isCompleted = session.status == 'Completed';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showSessionDetail(context, session),
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isCompleted ? Colors.green.withAlpha(10) : AppColors.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    isCompleted ? Icons.check_circle_rounded : Icons.calendar_today_rounded,
                    color: isCompleted ? Colors.green : AppColors.primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(session.topic, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
                      Text(session.psychologistName, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.access_time_rounded, size: 12, color: AppColors.primary.withAlpha(150)),
                          const SizedBox(width: 4),
                          Text(session.time, style: AppTextStyles.labelSm.copyWith(color: AppColors.primary.withAlpha(150), fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 12),
                          Icon(Icons.location_on_rounded, size: 12, color: AppColors.primary.withAlpha(150)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              session.location ?? 'Ruang Konseling', 
                              style: AppTextStyles.labelSm.copyWith(color: AppColors.primary.withAlpha(150), fontSize: 10, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: isCompleted ? Colors.green.withAlpha(15) : Colors.orange.withAlpha(15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    isCompleted ? 'SELESAI' : 'TERJADWAL',
                    style: AppTextStyles.labelSm.copyWith(color: isCompleted ? Colors.green : Colors.orange, fontWeight: FontWeight.w900, fontSize: 9),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSessionDetail(BuildContext context, CounselingSession session) {
    bool isCompleted = session.status == 'Completed';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 24),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: (isCompleted ? Colors.green : Colors.orange).withAlpha(30), blurRadius: 25)],
                        border: Border.all(color: (isCompleted ? Colors.green : Colors.orange).withAlpha(20)),
                      ),
                      child: Icon(
                        isCompleted ? Icons.verified_user_rounded : Icons.pending_actions_rounded,
                        size: 56,
                        color: isCompleted ? Colors.green : Colors.orange,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Center(child: Text(isCompleted ? 'Sesi Telah Selesai' : 'Sesi Terjadwal', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary))),
                  const SizedBox(height: 40),
                  _buildDetailSection('Topik Konseling', session.topic, Icons.topic_rounded),
                  const SizedBox(height: 24),
                  _buildDetailSection('Psikolog', session.psychologistName, Icons.person_rounded),
                  const SizedBox(height: 16),
                  _buildDetailSection('Waktu Konseling', '${session.date.day}/${session.date.month}/${session.date.year} • ${session.time}', Icons.access_time_rounded),
                  const SizedBox(height: 16),
                  _buildDetailSection('Tempat / Lokasi', session.location ?? 'Ruang Konseling', Icons.location_on_rounded),
                  const SizedBox(height: 32),
                  if (isCompleted && session.notes != null) ...[
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(5),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.primary.withAlpha(20)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.description_rounded, size: 18, color: AppColors.primary),
                              const SizedBox(width: 8),
                              Text('Catatan Psikolog', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(session.notes!, style: AppTextStyles.labelMd.copyWith(height: 1.6, color: AppColors.onSurfaceVariant, fontSize: 13, fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 58,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      child: const Text('Tutup Detail', style: TextStyle(fontWeight: FontWeight.w900)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailSection(String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: AppColors.outline),
            const SizedBox(width: 8),
            Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
          ],
        ),
        const SizedBox(height: 8),
        Text(value, style: AppTextStyles.labelMd.copyWith(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary)),
      ],
    );
  }

  Widget _buildPsychologistCard(BuildContext context, Psychologist psy) {
    return Container(
      width: 150,
      margin: const EdgeInsets.only(right: 16),
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
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primary.withAlpha(50)],
                        ),
                      ),
                      child: SizedBox(
                        width: 68,
                        height: 68,
                        child: ClipOval(
                          child: Image.network(
                            psy.profileImageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              color: AppColors.primary.withAlpha(20),
                              child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 34),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 4,
                      bottom: 4,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2.5),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  psy.name.split(',')[0],
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelMd.copyWith(
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                    fontSize: 14,
                    letterSpacing: -0.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  psy.specialization.split('&')[0].trim(),
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.outline,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Spacer(),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primary.withAlpha(180)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withAlpha(30),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'Booking',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white,
                        fontSize: 10,
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

  void _showBookingDialog(BuildContext context, Psychologist? selectedPsy) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            if (selectedPsy != null) ...[
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
            ],
            Text('Pilih Topik Konseling', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            const SizedBox(height: 8),
            Text('Apa yang ingin kamu bahas hari ini?', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
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

  Widget _buildTopicOption(BuildContext context, String title, IconData icon, Psychologist? selectedPsy) {
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 40),
          Icon(Icons.psychology_outlined, size: 64, color: AppColors.outline.withAlpha(50)),
          const SizedBox(height: 16),
          Text('Belum ada riwayat konseling', style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _CounselingBanner extends StatelessWidget {
  const _CounselingBanner();

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
      child: Stack(
        children: [
          Positioned(
            right: -20,
            bottom: -20,
            child: Icon(Icons.favorite_rounded, size: 100, color: Colors.white.withAlpha(15)),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withAlpha(40), borderRadius: BorderRadius.circular(8)),
                child: Text('CARE & SUPPORT', style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
              ),
              const SizedBox(height: 16),
              Text('Kamu Tidak Sendirian.', style: AppTextStyles.headlineMd.copyWith(color: Colors.white, fontSize: 22, height: 1.2, fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              Text('Yuk, curhat atau konsultasi dengan psikolog profesional kampus kami.', style: AppTextStyles.labelSm.copyWith(color: Colors.white70, height: 1.4, fontWeight: FontWeight.w500)),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.search_rounded, size: 16),
                label: const Text('Cari Psikolog', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
