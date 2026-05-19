import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/mission.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/appeal_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/module_detail_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/quiz_screen.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class KencanaScreen extends StatefulWidget {
  const KencanaScreen({super.key});

  @override
  State<KencanaScreen> createState() => _KencanaScreenState();
}

class _KencanaScreenState extends State<KencanaScreen> {
  @override
  void initState() {
    super.initState();
    // Load fresh data when entering the Kencana screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentProvider>().loadAllData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final missions = student.missions;
    
    // Group missions by stage
    final praMissions = missions.where((m) => m.stage == 'Pra-PKKMB').toList();
    final intiMissions = missions.where((m) => m.stage == 'Pelaksanaan Inti').toList();
    final pascaMissions = missions.where((m) => m.stage == 'Pasca-PKKMB').toList();

    // Check completion status for locking logic
    final isPraDone = praMissions.isNotEmpty && praMissions.every((m) => m.isCompleted);
    final isIntiDone = isPraDone && intiMissions.isNotEmpty && intiMissions.every((m) => m.isCompleted);

    double totalScore = 0;
    final quizzes = missions.where((m) => m.type == 'Quiz').toList();
    if (quizzes.isNotEmpty) {
      int total = quizzes.fold(0, (sum, q) => sum + (q.score));
      totalScore = total / quizzes.length;
    }
    final isPassed = totalScore >= 75;

    return Scaffold(
      backgroundColor: Colors.white,
      body: RefreshIndicator(
        onRefresh: () => student.loadAllData(),
        color: AppColors.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          slivers: [
          BkuAppBar(
            title: 'PKKMB KENCANA',
            subtitle: 'JOURNEY & SERTIFIKASI',
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
                  FadeInAnimation(
                    delay: 0.2,
                    child: _buildRecapSection(student.missionProgress, student.completedMissionsCount, missions.length, totalScore),
                  ),
                  if (isPassed) ...[
                    const SizedBox(height: 24),
                    FadeInAnimation(
                      delay: 0.4,
                      child: _buildCertificateCard(context),
                    ),
                  ],
                  const SizedBox(height: 40),
                  Text(
                    'Alur Kegiatan Kamu',
                    style: AppTextStyles.titleLg.copyWith(
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // JOURNEY TIMELINE
                  _buildJourneyStage(
                    context,
                    'TAHAP 1: PRA KEGIATAN',
                    'Fokus pada pengenalan umum dan tata tertib.',
                    praMissions,
                    true, // Always unlocked
                    0,
                  ),
                  
                  _buildJourneyStage(
                    context,
                    'TAHAP 2: INTI KEGIATAN',
                    'Pelaksanaan materi tingkat universitas & fakultas.',
                    intiMissions,
                    isPraDone,
                    1,
                  ),
                  
                  _buildJourneyStage(
                    context,
                    'TAHAP 3: PASCA KEGIATAN',
                    'Tahap prodi, ormawa, dan ujian kelulusan.',
                    pascaMissions,
                    isIntiDone,
                    2,
                  ),
                  
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
        ),
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 90), // Lift it above BottomNav
        child: FloatingActionButton.extended(
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AppealScreen())),
          backgroundColor: AppColors.primary,
          elevation: 4,
          icon: const Icon(Icons.help_center_rounded, color: Colors.white),
          label: Text('Banding Skor', style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildJourneyStage(BuildContext context, String title, String subtitle, List<Mission> stageMissions, bool isUnlocked, int index) {
    final isLast = index == 2;
    final color = isUnlocked ? AppColors.primary : AppColors.outline.withAlpha(100);
    final completedCount = stageMissions.where((m) => m.isCompleted).length;
    final progress = stageMissions.isEmpty ? 0.0 : completedCount / stageMissions.length;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline Line & Dot
          Column(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: isUnlocked ? (progress == 1.0 ? Colors.green : color) : Colors.grey[200],
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(color: (isUnlocked ? color : Colors.grey).withAlpha(30), blurRadius: 10)
                  ],
                ),
                child: Center(
                  child: Icon(
                    isUnlocked ? (progress == 1.0 ? Icons.check : Icons.circle) : Icons.lock_rounded,
                    size: 10,
                    color: Colors.white,
                  ),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: isUnlocked && progress == 1.0 ? Colors.green : Colors.grey[200],
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // Stage Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelSm.copyWith(
                    color: color,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11),
                ),
                const SizedBox(height: 16),
                
                // Mission Container for this stage
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 32),
                  decoration: BoxDecoration(
                    color: isUnlocked ? Colors.white : Colors.grey[50],
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isUnlocked ? AppColors.surfaceVariant : Colors.grey[200]!,
                      width: 1.5,
                    ),
                  ),
                  child: stageMissions.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              Icon(Icons.info_outline_rounded, color: Colors.grey[400], size: 20),
                              const SizedBox(width: 12),
                              Text(
                                'Belum ada materi atau kuis',
                                style: AppTextStyles.bodyMd.copyWith(color: Colors.grey[400], fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )
                      : Column(
                          children: [
                            ...stageMissions.map((m) => _buildMissionItem(context, m, isUnlocked)),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissionItem(BuildContext context, Mission mission, bool isUnlocked) {
    final isQuiz = mission.type == 'Quiz';
    return InkWell(
      onTap: isUnlocked ? () => _showMissionDetail(context, mission) : null,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isUnlocked 
                  ? (mission.isCompleted ? Colors.green.withAlpha(10) : AppColors.primary.withAlpha(10))
                  : Colors.grey[200],
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isQuiz ? Icons.quiz_rounded : Icons.menu_book_rounded,
                size: 18,
                color: isUnlocked 
                  ? (mission.isCompleted ? Colors.green : AppColors.primary)
                  : Colors.grey[400],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    mission.title ?? '',
                    style: AppTextStyles.labelMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isUnlocked ? AppColors.primary : Colors.grey[400],
                      fontSize: 13,
                    ),
                  ),
                  Text(
                    isQuiz ? 'Selesaikan Kuis' : 'Baca & Pelajari Modul',
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.outline,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
            if (mission.isCompleted)
              const Icon(Icons.check_circle_rounded, color: Colors.green, size: 20)
            else if (!isUnlocked)
              const Icon(Icons.lock_outline_rounded, color: Colors.grey, size: 16)
            else
              const Icon(Icons.chevron_right_rounded, color: AppColors.outline, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildRecapSection(double progress, int completed, int total, double score) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, Color(0xFF1E40AF)],
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
                  Text('Rata-rata Skor Kuis', style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontWeight: FontWeight.bold)),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: score.toStringAsFixed(1),
                          style: AppTextStyles.display.copyWith(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900),
                        ),
                        TextSpan(
                          text: '/100',
                          style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(20),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  score >= 75 ? Icons.verified_rounded : Icons.pending_rounded,
                  color: score >= 75 ? Colors.greenAccent : Colors.amberAccent,
                  size: 32,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Progres', '${(progress * 100).toInt()}%', Icons.analytics_rounded),
              _buildStatItem('Selesai', '$completed', Icons.task_alt_rounded),
              _buildStatItem('Total Misi', '$total', Icons.assignment_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.white.withAlpha(20), shape: BoxShape.circle),
          child: Icon(icon, color: Colors.white, size: 16),
        ),
        const SizedBox(height: 8),
        Text(value, style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildCertificateCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.amber.withAlpha(100), width: 1.5),
        boxShadow: [
          BoxShadow(color: Colors.amber.withAlpha(20), blurRadius: 15, offset: const Offset(0, 5)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.amber.withAlpha(20), shape: BoxShape.circle),
            child: const Icon(Icons.workspace_premium_rounded, color: Colors.amber, size: 30),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Sertifikat Tersedia', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
                Text('Kamu telah memenuhi syarat kelulusan.', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sertifikat sedang di-generate...')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: const Text('Unduh', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showMissionDetail(BuildContext context, Mission mission) {
    final isQuiz = mission.type == 'Quiz';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
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
            Text(mission.title ?? '', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(10)),
              child: Text(isQuiz ? 'JENIS: KUIS' : 'JENIS: MODUL MATERI', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
            ),
            const SizedBox(height: 24),
            Text('Deskripsi Misi', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              mission.desc ?? (isQuiz 
                ? 'Selesaikan kuis ini untuk menguji pemahaman kamu mengenai materi pada tahap ini. Skor minimal kelulusan adalah 75.'
                : 'Silakan baca atau tonton materi yang telah disediakan. Materi ini akan menjadi bahan kuis pada tahap selanjutnya.'),
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline, height: 1.5),
            ),
            const Spacer(),
            if (!mission.isCompleted)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context); // Close bottom sheet
                    if (isQuiz) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QuizScreen(mission: mission),
                        ),
                      );
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ModuleDetailScreen(mission: mission),
                        ),
                      );
                    }
                  },
                  icon: Icon(isQuiz ? Icons.play_arrow_rounded : Icons.visibility_rounded),
                  label: Text(isQuiz ? 'Mulai Kuis Sekarang' : 'Buka Materi Modul', style: const TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.green.withAlpha(10), borderRadius: BorderRadius.circular(16)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.verified_rounded, color: Colors.green),
                    const SizedBox(width: 12),
                    Text(isQuiz ? 'Kuis Selesai (Skor: ${mission.score})' : 'Materi Selesai Dipelajari', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
