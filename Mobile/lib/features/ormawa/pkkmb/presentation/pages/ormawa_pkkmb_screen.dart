import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/pkkmb_mission.dart';

import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class OrmawaPKKMBScreen extends StatefulWidget {
  final bool showBackButton;
  const OrmawaPKKMBScreen({super.key, this.showBackButton = true});

  @override
  State<OrmawaPKKMBScreen> createState() => _OrmawaPKKMBScreenState();
}

class _OrmawaPKKMBScreenState extends State<OrmawaPKKMBScreen> {
  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(
          parent: BouncingScrollPhysics(),
        ),
        slivers: [
          BkuAppBar(
            title: 'PKKMB (KENCANA)',
            subtitle: 'MANAJEMEN',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: widget.showBackButton,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                _buildOverviewStats(ormawaProvider),
                const SizedBox(height: 28),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Layanan Manajemen',
                    style: AppTextStyles.labelMd.copyWith(
                      color: const Color(0xFF1E293B),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                _buildActionGrid(ormawaProvider),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Partisipasi Program Studi',
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF1E293B),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                          fontSize: 15,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => _navigateTo(const PKKMBProdiDetailView()),
                        child: Text(
                          'Lihat Semua',
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _buildProdiList(),
                const SizedBox(height: 60),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewStats(OrmawaProvider provider) {
    final numberFormat = NumberFormat.decimalPattern('id');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, Color(0xFF003399)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(60),
              blurRadius: 20,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Stack(
          children: [
            Positioned(
              right: -30,
              bottom: -30,
              child: Icon(
                Icons.school_rounded,
                size: 180,
                color: Colors.white.withAlpha(5),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Top Section: Total
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.groups_rounded,
                          color: Colors.white,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TOTAL PESERTA',
                            style: AppTextStyles.labelSm.copyWith(
                              color: Colors.white.withAlpha(150),
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.2,
                              fontSize: 10,
                            ),
                          ),
                          Text(
                            numberFormat.format(
                              provider.totalPKKMBParticipants,
                            ),
                            style: AppTextStyles.titleLg.copyWith(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Divider(color: Colors.white24, height: 1),
                  const SizedBox(height: 16),
                  // Bottom Section: Mini Stats
                  Row(
                    children: [
                      _buildStatItem(
                        'Selesai / Lulus',
                        numberFormat.format(provider.passedPKKMBCount),
                        Icons.verified_rounded,
                        const Color(0xFF10B981),
                      ),
                      Container(width: 1, height: 30, color: Colors.white10),
                      _buildStatItem(
                        'Sedang Proses',
                        numberFormat.format(provider.inProgressPKKMBCount),
                        Icons.sync_rounded,
                        const Color(0xFFF59E0B),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Expanded(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelSm.copyWith(
                  color: Colors.white60,
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                value,
                style: AppTextStyles.bodyMd.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionGrid(OrmawaProvider provider) {
    final missions = provider.pkkmbMissions;
    final activitiesCount = missions.length;
    final modulesCount = missions
        .where((m) => m.type == 'PDF' || m.type == 'Video')
        .length;
    final quizzesCount = missions.where((m) => m.type == 'Quiz').length;
    final pendingAppealsCount = provider.appeals
        .where((a) => a.status == 'MENUNGGU')
        .length;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: GridView.count(
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 0,
        childAspectRatio: 0.98,
        children: [
          _buildServiceItem(
            'Agenda',
            '$activitiesCount',
            Icons.event_note_rounded,
            AppColors.primary,
            () => _navigateTo(const PKKMBKegiatanView()),
          ),
          _buildServiceItem(
            'Modul',
            '$modulesCount',
            Icons.menu_book_rounded,
            const Color(0xFF6366F1),
            () => _navigateTo(const PKKMBModulView()),
          ),
          _buildServiceItem(
            'Kuis',
            '$quizzesCount',
            Icons.quiz_rounded,
            const Color(0xFFF59E0B),
            () => _navigateTo(const PKKMBKuisView()),
          ),
          _buildServiceItem(
            'Peserta',
            '10k+',
            Icons.people_alt_rounded,
            const Color(0xFF10B981),
            () => _navigateTo(const PKKMBPesertaView()),
          ),
          _buildServiceItem(
            'Banding',
            '$pendingAppealsCount',
            Icons.assignment_late_rounded,
            Colors.redAccent,
            () => _navigateTo(const PKKMBBandingView()),
          ),
          _buildServiceItem(
            'Sertifikat',
            '10k+',
            Icons.verified_rounded,
            Colors.cyan,
            () => _navigateTo(const PKKMBSertifikatView()),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceItem(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: AppTextStyles.labelSm.copyWith(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subtitle,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF94A3B8),
              fontSize: 8,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _navigateTo(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
  }

  Widget _buildProdiList() {
    final prodiData = [
      {
        'name': 'S1 Keperawatan',
        'total': 2450,
        'passed': 2100,
        'color': AppColors.primary,
      },
      {
        'name': 'S1 Farmasi',
        'total': 1820,
        'passed': 1650,
        'color': const Color(0xFF6366F1),
      },
      {
        'name': 'D3 Kebidanan',
        'total': 1200,
        'passed': 950,
        'color': const Color(0xFF10B981),
      },
      {
        'name': 'S1 Gizi',
        'total': 980,
        'passed': 820,
        'color': const Color(0xFFF59E0B),
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          children: prodiData.asMap().entries.map((entry) {
            final int index = entry.key;
            final prodi = entry.value;
            final double progress =
                (prodi['passed'] as int) / (prodi['total'] as int);
            final Color color = prodi['color'] as Color;

            return Column(
              children: [
                if (index > 0)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(height: 1, color: Color(0xFFF1F5F9)),
                  ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: color.withAlpha(15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          (prodi['name'] as String)[0],
                          style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                prodi['name'] as String,
                                style: AppTextStyles.labelMd.copyWith(
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF1E293B),
                                  fontSize: 13,
                                ),
                              ),
                              Text(
                                '${(progress * 100).toInt()}%',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: color,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: progress,
                              backgroundColor: const Color(0xFFF1F5F9),
                              valueColor: AlwaysStoppedAnimation<Color>(color),
                              minHeight: 4,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${prodi['total']} Mhs',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: const Color(0xFF94A3B8),
                                  fontSize: 9,
                                ),
                              ),
                              Text(
                                '${prodi['passed']} Lulus',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: const Color(0xFF10B981),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }


}

// Sub-Screens
class PKKMBKegiatanView extends StatelessWidget {
  const PKKMBKegiatanView({super.key});

  void _showAddScreen(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const OrmawaCreateKegiatanScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final missions = ormawaProvider.pkkmbMissions;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(
        title: 'Agenda & Kegiatan',
        variant: AppBarVariant.ormawa,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _SubScreenHeader(
              title: 'Manajemen Agenda',
              onAdd: () => _showAddScreen(context),
            ),
            const SizedBox(height: 24),
            if (missions.isEmpty)
              _buildEmptyState()
            else
              ...missions.map(
                (mission) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: _KegiatanItem(
                    title: mission.title,
                    subtitle: mission.stage,
                    date: mission.type,
                    location: mission.desc,
                    icon: mission.icon,
                    color: mission.color,
                  ),
                ),
              ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 60),
          Icon(
            Icons.event_busy_rounded,
            size: 80,
            color: AppColors.outline.withAlpha(30),
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada agenda terdaftar',
            style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
          ),
        ],
      ),
    );
  }
}

class PKKMBKuisView extends StatelessWidget {
  const PKKMBKuisView({super.key});

  void _showAddScreen(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreateKuisScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final quizMissions = ormawaProvider.pkkmbMissions
        .where((m) => m.type == 'Quiz')
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(title: 'Kuis Evaluasi', variant: AppBarVariant.ormawa),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _SubScreenHeader(
              title: 'Manajemen Kuis',
              onAdd: () => _showAddScreen(context),
            ),
            const SizedBox(height: 24),
            if (quizMissions.isEmpty)
              _buildEmptyState('Kuis')
            else
              ...quizMissions.map(
                (quiz) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: _KuisItem(
                    title: quiz.title,
                    type: quiz.stage,
                    duration: '30 Menit',
                    questions: '10 Soal',
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String type) {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 60),
          Icon(
            Icons.quiz_outlined,
            size: 80,
            color: AppColors.outline.withAlpha(30),
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada $type terdaftar',
            style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
          ),
        ],
      ),
    );
  }
}

class PKKMBPesertaView extends StatelessWidget {
  const PKKMBPesertaView({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(title: 'Data Peserta', variant: AppBarVariant.ormawa),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildSearchField('Cari NIM atau Nama Mahasiswa...'),
            const Spacer(flex: 1),
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(8),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.person_search_rounded,
                      size: 64,
                      color: AppColors.primary.withAlpha(40),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Belum Ada Peserta',
                    style: AppTextStyles.titleLg.copyWith(
                      color: const Color(0xFF1E293B),
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'Daftar mahasiswa yang terdaftar dalam PKKMB akan muncul di sini.',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.labelMd.copyWith(
                        color: const Color(0xFF64748B),
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchField(String hint) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      height: 60,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              hint,
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF94A3B8),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.tune_rounded,
              size: 18,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }
}

class PKKMBBandingView extends StatelessWidget {
  const PKKMBBandingView({super.key});

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final pendingAppeals = ormawaProvider.appeals
        .where((a) => a.status == 'MENUNGGU')
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          BkuStaticAppBar(
            title: 'ANTREAN BANDING',
            variant: AppBarVariant.ormawa,
            showBackButton: true,
          ),
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.orange.withAlpha(10),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.orange.withAlpha(20)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.info_outline_rounded,
                          color: Colors.orange,
                          size: 24,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Perlu Review Segera',
                                style: AppTextStyles.bodyMd.copyWith(
                                  fontWeight: FontWeight.w900,
                                  color: Colors.orange[800],
                                ),
                              ),
                              Text(
                                'Ada ${pendingAppeals.length} pengajuan banding yang menunggu keputusan Anda.',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: Colors.orange[700],
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (pendingAppeals.isEmpty)
                    _buildEmptyState()
                  else
                    ...pendingAppeals.map(
                      (appeal) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _BandingCard(
                          id: appeal.id,
                          name: appeal.studentName,
                          nim: appeal.nim,
                          kuis: appeal.quizTitle,
                          score: appeal.initialScore,
                          reason: appeal.reason,
                          evidenceUrl: appeal.evidenceUrl,
                        ),
                      ),
                    ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 80),
          Icon(
            Icons.assignment_turned_in_rounded,
            size: 80,
            color: Colors.green.withAlpha(30),
          ),
          const SizedBox(height: 16),
          Text(
            'Semua banding telah selesai direview',
            style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
          ),
        ],
      ),
    );
  }
}

// Shared UI Components
class _SubScreenHeader extends StatelessWidget {
  final String title;
  final VoidCallback onAdd;
  const _SubScreenHeader({required this.title, required this.onAdd});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: AppTextStyles.labelMd.copyWith(
            color: const Color(0xFF1E293B),
            fontWeight: FontWeight.w900,
            letterSpacing: 0.5,
            fontSize: 13,
          ),
        ),
        GestureDetector(
          onTap: onAdd,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, Color(0xFF003399)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withAlpha(40),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.add_rounded, color: Colors.white, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Tambah',
                  style: AppTextStyles.labelSm.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _KegiatanItem extends StatelessWidget {
  final String title, subtitle, date, location;
  final IconData icon;
  final Color color;
  const _KegiatanItem({
    required this.title,
    required this.subtitle,
    required this.date,
    required this.location,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withAlpha(15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        subtitle.toUpperCase(),
                        style: AppTextStyles.labelSm.copyWith(
                          color: const Color(0xFF64748B),
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Icon(
                          Icons.edit_outlined,
                          size: 16,
                          color: const Color(0xFF94A3B8),
                        ),
                        const SizedBox(width: 12),
                        const Icon(
                          Icons.delete_outline_rounded,
                          size: 16,
                          color: Colors.redAccent,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF1E293B),
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  location,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF64748B),
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: color.withAlpha(10),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Icon(icon, size: 12, color: color),
                          const SizedBox(width: 6),
                          Text(
                            date,
                            style: AppTextStyles.labelSm.copyWith(
                              color: color,
                              fontWeight: FontWeight.w900,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _KuisItem extends StatelessWidget {
  final String title, type, duration, questions;
  const _KuisItem({
    required this.title,
    required this.type,
    required this.duration,
    required this.questions,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      color: Colors.green,
                      size: 12,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'AKTIF',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.green,
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  Icon(
                    Icons.edit_outlined,
                    size: 18,
                    color: const Color(0xFF94A3B8),
                  ),
                  const SizedBox(width: 12),
                  const Icon(
                    Icons.delete_outline_rounded,
                    size: 18,
                    color: Colors.redAccent,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTextStyles.bodyMd.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
              fontSize: 16,
            ),
          ),
          Text(
            type,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF94A3B8),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _IconText(Icons.timer_rounded, duration, Colors.blue),
              const SizedBox(width: 20),
              _IconText(Icons.quiz_rounded, questions, Colors.purple),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const PKKMBManageQuestionsScreen(
                      quizTitle: 'Kuis PKKMB',
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF8FAFC),
                foregroundColor: AppColors.primary,
                elevation: 0,
                side: const BorderSide(color: Color(0xFFE2E8F0)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.tune_rounded, size: 18),
                  const SizedBox(width: 10),
                  Text(
                    'Kelola Soal',
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
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
}

class _IconText extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;
  const _IconText(this.icon, this.text, this.color);
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 14, color: color),
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

class _BandingCard extends StatelessWidget {
  final String id, name, nim, kuis, score, reason;
  final String? evidenceUrl;
  const _BandingCard({
    required this.id,
    required this.name,
    required this.nim,
    required this.kuis,
    required this.score,
    required this.reason,
    this.evidenceUrl,
  });

  void _handleReview(BuildContext context, bool approved) {
    context.read<OrmawaProvider>().reviewAppeal(id, approved);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(approved ? 'Banding disetujui!' : 'Banding ditolak!'),
        backgroundColor: approved ? Colors.green : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PKKMBBandingDetailScreen(
              id: id,
              name: name,
              nim: nim,
              kuis: kuis,
              score: score,
              reason: reason,
              evidenceUrl: evidenceUrl,
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(4),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(10),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.person_outline_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: AppTextStyles.bodyMd.copyWith(
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF1E293B),
                            fontSize: 15,
                          ),
                        ),
                        Text(
                          nim,
                          style: AppTextStyles.labelSm.copyWith(
                            color: const Color(0xFF94A3B8),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'PENDING',
                    style: AppTextStyles.labelSm.copyWith(
                      color: Colors.orange,
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: const Color(0xFFE2E8F0).withAlpha(100),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.quiz_rounded,
                        size: 16,
                        color: Color(0xFF64748B),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          kuis,
                          style: AppTextStyles.labelSm.copyWith(
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF475569),
                            fontSize: 12,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.withAlpha(10),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Skor: $score',
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.red,
                            fontWeight: FontWeight.w900,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Divider(height: 1, color: Color(0xFFE2E8F0)),
                  ),
                  Text(
                    'ALASAN MAHASISWA:',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '"$reason"',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF1E293B),
                      fontStyle: FontStyle.italic,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _handleReview(context, false),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFFCA5A5)),
                      foregroundColor: Colors.red,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(
                      'Tolak Banding',
                      style: AppTextStyles.labelSm.copyWith(
                        fontWeight: FontWeight.w900,
                        color: Colors.red,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () => _handleReview(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      elevation: 4,
                      shadowColor: AppColors.primary.withAlpha(100),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(
                      'Setujui Banding',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Dedicated Form Screens
class OrmawaCreateKegiatanScreen extends StatefulWidget {
  const OrmawaCreateKegiatanScreen({super.key});

  @override
  State<OrmawaCreateKegiatanScreen> createState() =>
      _OrmawaCreateKegiatanScreenState();
}

class _OrmawaCreateKegiatanScreenState
    extends State<OrmawaCreateKegiatanScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedStage = 'Pra-PKKMB';
  String _selectedType = 'PDF';
  bool _isSaving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _handleSave() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Judul tidak boleh kosong')));
      return;
    }

    setState(() => _isSaving = true);
    await Future.delayed(const Duration(seconds: 1)); // Simulate save

    if (mounted) {
      context.read<OrmawaProvider>().addPKKMBMission(
        PKKMBMission(
          id: DateTime.now().toString(),
          title: _titleController.text,
          desc: _descController.text,
          stage: _selectedStage,
          type: _selectedType,
          icon: _selectedType == 'Quiz'
              ? Icons.quiz_rounded
              : (_selectedType == 'Video'
                    ? Icons.play_circle_fill_rounded
                    : Icons.picture_as_pdf_rounded),
          color: _selectedStage == 'Pra-PKKMB'
              ? Colors.blue
              : (_selectedStage == 'Pelaksanaan Inti'
                    ? Colors.purple
                    : Colors.orange),
        ),
      );

      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Agenda berhasil dipublikasikan ke Mahasiswa!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          BkuStaticAppBar(
            title: 'TAMBAH AGENDA PKKMB',
            variant: AppBarVariant.ormawa,
            showBackButton: true,
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Detail Kegiatan Baru',
                    style: AppTextStyles.titleLg.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Agenda ini akan otomatis muncul di timeline "Journey" mahasiswa.',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 32),

                  _InputField(
                    label: 'Judul Kegiatan',
                    hint: 'Contoh: Visi Misi & Pengenalan Kampus',
                    icon: Icons.event_rounded,
                    controller: _titleController,
                  ),
                  const SizedBox(height: 16),

                  _buildDropdownField(
                    'Tahapan PKKMB',
                    _selectedStage,
                    ['Pra-PKKMB', 'Pelaksanaan Inti', 'Pasca-PKKMB'],
                    (val) => setState(() => _selectedStage = val!),
                  ),
                  const SizedBox(height: 16),

                  _buildDropdownField(
                    'Tipe Misi',
                    _selectedType,
                    ['PDF', 'Video', 'Quiz'],
                    (val) => setState(() => _selectedType = val!),
                  ),
                  const SizedBox(height: 16),

                  _InputField(
                    label: 'Instruksi / Lokasi',
                    hint: 'Gedung A / Baca PDF Berikut...',
                    icon: Icons.location_on_rounded,
                    controller: _descController,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 40),

                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _handleSave,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 4,
                      ),
                      child: _isSaving
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'PUBLIKASIKAN SEKARANG',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                letterSpacing: 1,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownField(
    String label,
    String value,
    List<String> items,
    Function(String?) onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              icon: const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.primary,
              ),
              items: items.map((String item) {
                return DropdownMenuItem(
                  value: item,
                  child: Text(item, style: AppTextStyles.labelMd),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

class OrmawaCreateKuisScreen extends StatelessWidget {
  const OrmawaCreateKuisScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: BkuStaticAppBar(
        title: 'Konfigurasi Kuis',
        variant: AppBarVariant.ormawa,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Set-up Kuis Kencana',
              style: AppTextStyles.titleLg.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Pastikan standar kelulusan sesuai dengan regulasi kampus.',
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 32),
            _InputField(
              label: 'Judul Kuis',
              hint: 'Contoh: Kuis Etika & Budaya Kampus',
              icon: Icons.quiz_rounded,
            ),
            const SizedBox(height: 16),
            _InputField(
              label: 'Instruksi / Aturan',
              hint: 'Tuliskan poin-poin instruksi untuk mahasiswa...',
              icon: Icons.description_rounded,
              maxLines: 4,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _InputField(
                    label: 'Durasi (Menit)',
                    hint: '30',
                    icon: Icons.timer_rounded,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _InputField(
                    label: 'Passing Grade (KKM)',
                    hint: '75',
                    icon: Icons.verified_rounded,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _InputField(
                    label: 'Jumlah Soal',
                    hint: '20',
                    icon: Icons.list_alt_rounded,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _InputField(
                    label: 'Batas Percobaan',
                    hint: '3x',
                    icon: Icons.replay_rounded,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _InputField(
                    label: 'Waktu Mulai',
                    hint: '01/09/2024',
                    icon: Icons.calendar_today_rounded,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _InputField(
                    label: 'Waktu Berakhir',
                    hint: '15/09/2024',
                    icon: Icons.event_available_rounded,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 8,
                  shadowColor: AppColors.primary.withAlpha(50),
                ),
                child: const Text(
                  'Publikasikan Kuis',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final String label, hint;
  final IconData icon;
  final int maxLines;
  final TextEditingController? controller;
  const _InputField({
    required this.label,
    required this.hint,
    required this.icon,
    this.maxLines = 1,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment: maxLines > 1
                ? CrossAxisAlignment.start
                : CrossAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: maxLines > 1 ? 12 : 0),
                child: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  maxLines: maxLines,
                  style: AppTextStyles.labelMd,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(
                      vertical: maxLines > 1 ? 12 : 12,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PKKMBModulView extends StatelessWidget {
  const PKKMBModulView({super.key});

  void _showAddScreen(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreateModulScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final moduleMissions = ormawaProvider.pkkmbMissions
        .where((m) => m.type == 'PDF' || m.type == 'Video')
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(
        title: 'Modul & Materi',
        variant: AppBarVariant.ormawa,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _SubScreenHeader(
              title: 'MANAJEMEN MODUL',
              onAdd: () => _showAddScreen(context),
            ),
            const SizedBox(height: 24),
            if (moduleMissions.isEmpty)
              _buildEmptyState()
            else
              ...moduleMissions.map(
                (module) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildModulItem(
                    module.title,
                    '${module.type} • ${module.stage}',
                    module.icon,
                    module.color,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 60),
          Icon(
            Icons.library_books_rounded,
            size: 80,
            color: AppColors.outline.withAlpha(30),
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada modul terdaftar',
            style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
          ),
        ],
      ),
    );
  }

  Widget _buildModulItem(
    String title,
    String info,
    IconData icon,
    Color iconColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const Row(
                      children: [
                        Icon(
                          Icons.edit_outlined,
                          size: 18,
                          color: Color(0xFF94A3B8),
                        ),
                        SizedBox(width: 12),
                        Icon(
                          Icons.delete_outline_rounded,
                          size: 18,
                          color: Colors.redAccent,
                        ),
                      ],
                    ),
                  ],
                ),
                Text(
                  info,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class OrmawaCreateModulScreen extends StatelessWidget {
  const OrmawaCreateModulScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: BkuStaticAppBar(
        title: 'Tambah Modul',
        variant: AppBarVariant.ormawa,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Upload Materi Baru',
              style: AppTextStyles.titleLg.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Mahasiswa akan dapat mengunduh file ini melalui portal Kencana.',
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 32),
            _InputField(
              label: 'Judul Modul',
              hint: 'Contoh: Panduan Tata Tertib PKKMB',
              icon: Icons.title_rounded,
            ),
            const SizedBox(height: 16),
            _InputField(
              label: 'Kategori / Tag',
              hint: 'Contoh: PDF, Video, Dokumen',
              icon: Icons.tag_rounded,
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFFE2E8F0),
                  style: BorderStyle.none,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.cloud_upload_outlined,
                    size: 48,
                    color: AppColors.primary.withAlpha(150),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Upload File atau Tempel Link',
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Maksimal ukuran file: 10MB',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _InputField(
              label: 'Link External (Opsional)',
              hint: 'https://youtube.com/watch?v=...',
              icon: Icons.link_rounded,
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Simpan & Publikasikan',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PKKMBManageQuestionsScreen extends StatelessWidget {
  final String quizTitle;
  const PKKMBManageQuestionsScreen({super.key, required this.quizTitle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(
        title: 'Kelola Soal',
        variant: AppBarVariant.ormawa,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quizTitle,
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      'Total: 2 Soal Tersusun',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const OrmawaAddQuestionScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add, size: 16, color: Colors.white),
                  label: const Text(
                    'Tambah Soal',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _buildQuestionCard(
                  1,
                  'Apa kepanjangan dari PKKMB?',
                  'Pengenalan Kehidupan Kampus bagi Mahasiswa Baru',
                  'A',
                ),
                const SizedBox(height: 16),
                _buildQuestionCard(
                  2,
                  'Siapa rektor universitas saat ini?',
                  'Prof. Dr. Ir. H. Mujahidin, M.S.',
                  'C',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(
    int no,
    String question,
    String answer,
    String optionLabel,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'PERTANYAAN $no',
                style: AppTextStyles.labelSm.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                ),
              ),
              const Row(
                children: [
                  Icon(Icons.edit_outlined, size: 18, color: Color(0xFF94A3B8)),
                  SizedBox(width: 12),
                  Icon(
                    Icons.delete_outline_rounded,
                    size: 18,
                    color: Colors.redAccent,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            question,
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: const BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      optionLabel,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    answer,
                    style: AppTextStyles.labelSm.copyWith(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class OrmawaAddQuestionScreen extends StatelessWidget {
  const OrmawaAddQuestionScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: BkuStaticAppBar(
        title: 'Tambah Soal',
        variant: AppBarVariant.ormawa,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Susun Pertanyaan',
              style: AppTextStyles.titleLg.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Gunakan bahasa yang jelas dan mudah dipahami.',
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 32),
            _InputField(
              label: 'Pertanyaan',
              hint: 'Masukkan teks pertanyaan...',
              icon: Icons.help_outline_rounded,
              maxLines: 4,
            ),
            const SizedBox(height: 24),
            Text(
              'Pilihan Jawaban',
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF475569),
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildOptionInput('A', 'Pilihan A...'),
            _buildOptionInput('B', 'Pilihan B...'),
            _buildOptionInput('C', 'Pilihan C...'),
            _buildOptionInput('D', 'Pilihan D...'),
            const SizedBox(height: 24),
            _InputField(
              label: 'Jawaban Benar',
              hint: 'Pilih (A/B/C/D)',
              icon: Icons.check_circle_outline_rounded,
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Simpan Pertanyaan',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionInput(String label, String hint) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(10),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                label,
                style: AppTextStyles.bodyMd.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  hint,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class PKKMBSertifikatView extends StatelessWidget {
  const PKKMBSertifikatView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(
        title: 'Sertifikat & SK',
        variant: AppBarVariant.ormawa,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFF7ED), Color(0xFFFFFBEB)],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.amber.withAlpha(50)),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.auto_awesome_rounded,
                    color: Colors.amber,
                    size: 40,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Penerbitan Sertifikat',
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '8.420 mahasiswa telah memenuhi syarat kelulusan PKKMB.',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF92400E),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber[700],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Generate Sertifikat Massal',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            _SubScreenHeader(title: 'DOKUMEN RESMI', onAdd: () {}),
            const SizedBox(height: 16),
            _buildDocItem(
              'SK Kelulusan PKKMB 2024',
              'PDF • Diterbitkan 12 Okt 2024',
            ),
            const SizedBox(height: 12),
            _buildDocItem(
              'SK Panitia Pelaksana',
              'PDF • Diterbitkan 01 Sep 2024',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDocItem(String title, String info) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.assignment_turned_in_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  info,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.file_download_outlined,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class PKKMBProdiDetailView extends StatelessWidget {
  const PKKMBProdiDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final prodiData = [
      {
        'name': 'S1 Keperawatan',
        'total': 2450,
        'passed': 2100,
        'color': AppColors.primary,
      },
      {
        'name': 'S1 Farmasi',
        'total': 1820,
        'passed': 1650,
        'color': const Color(0xFF6366F1),
      },
      {
        'name': 'D3 Kebidanan',
        'total': 1200,
        'passed': 950,
        'color': const Color(0xFF10B981),
      },
      {
        'name': 'S1 Gizi',
        'total': 980,
        'passed': 820,
        'color': const Color(0xFFF59E0B),
      },
      {
        'name': 'D3 Keperawatan',
        'total': 1500,
        'passed': 1300,
        'color': Colors.cyan,
      },
      {
        'name': 'S1 Kebidanan',
        'total': 800,
        'passed': 720,
        'color': Colors.pinkAccent,
      },
      {
        'name': 'S1 Administrasi RS',
        'total': 1100,
        'passed': 900,
        'color': Colors.deepPurple,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(
        title: 'Partisipasi Program Studi',
        variant: AppBarVariant.ormawa,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: prodiData.length,
        itemBuilder: (context, index) {
          final prodi = prodiData[index];
          final double progress =
              (prodi['passed'] as int) / (prodi['total'] as int);
          final Color color = prodi['color'] as Color;

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: const Color(0xFFF1F5F9)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      prodi['name'] as String,
                      style: AppTextStyles.labelMd.copyWith(
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF1E293B),
                      ),
                    ),
                    Text(
                      '${(progress * 100).toInt()}%',
                      style: AppTextStyles.labelSm.copyWith(
                        color: color,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: const Color(0xFFF1F5F9),
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildMiniInfo(
                      'Total',
                      '${prodi['total']}',
                      Icons.groups_rounded,
                      color,
                    ),
                    _buildMiniInfo(
                      'Lulus',
                      '${prodi['passed']}',
                      Icons.check_circle_rounded,
                      const Color(0xFF10B981),
                    ),
                    _buildMiniInfo(
                      'Proses',
                      '${(prodi['total'] as int) - (prodi['passed'] as int)}',
                      Icons.sync_rounded,
                      const Color(0xFF64748B),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMiniInfo(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Row(
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTextStyles.labelSm.copyWith(
                fontSize: 8,
                color: const Color(0xFF94A3B8),
              ),
            ),
            Text(
              value,
              style: AppTextStyles.labelSm.copyWith(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1E293B),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class PKKMBBandingDetailScreen extends StatelessWidget {
  final String id, name, nim, kuis, score, reason;
  final String? evidenceUrl;

  const PKKMBBandingDetailScreen({
    super.key,
    required this.id,
    required this.name,
    required this.nim,
    required this.kuis,
    required this.score,
    required this.reason,
    this.evidenceUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: BkuStaticAppBar(title: 'Detail Banding', variant: AppBarVariant.ormawa),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Student Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(5),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(10),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.person_rounded,
                      color: AppColors.primary,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: AppTextStyles.titleLg.copyWith(
                          fontSize: 18,
                          color: const Color(0xFF1E293B),
                        ),
                      ),
                      Text(
                        nim,
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF64748B),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Appeal Info
            Text(
              'Informasi Banding',
              style: AppTextStyles.labelMd.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow(
                    'Kuis',
                    kuis,
                    Icons.quiz_rounded,
                    Colors.purple,
                  ),
                  const Divider(height: 32, color: Color(0xFFF1F5F9)),
                  _buildDetailRow(
                    'Skor Awal',
                    score,
                    Icons.bar_chart_rounded,
                    Colors.red,
                  ),
                  const Divider(height: 32, color: Color(0xFFF1F5F9)),
                  Text(
                    'ALASAN MAHASISWA:',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '"$reason"',
                    style: AppTextStyles.bodyMd.copyWith(
                      color: const Color(0xFF334155),
                      fontStyle: FontStyle.italic,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Evidence Section
            Text(
              'Bukti / Lampiran',
              style: AppTextStyles.labelMd.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 12),
            if (evidenceUrl != null)
              GestureDetector(
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => Dialog(
                      backgroundColor: Colors.transparent,
                      insetPadding: EdgeInsets.zero,
                      child: Stack(
                        children: [
                          InteractiveViewer(
                            child: Image.network(
                              evidenceUrl!,
                              fit: BoxFit.contain,
                              width: double.infinity,
                              height: double.infinity,
                            ),
                          ),
                          Positioned(
                            top: 40,
                            right: 20,
                            child: IconButton(
                              icon: const Icon(
                                Icons.close_rounded,
                                color: Colors.white,
                                size: 32,
                              ),
                              onPressed: () => Navigator.pop(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
                child: Container(
                  width: double.infinity,
                  height: 250,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    image: DecorationImage(
                      image: NetworkImage(evidenceUrl!),
                      fit: BoxFit.cover,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withAlpha(150),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    alignment: Alignment.bottomCenter,
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.zoom_in_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Ketuk untuk Memperbesar',
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    style: BorderStyle.none,
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.no_photography_rounded,
                      color: const Color(0xFF94A3B8).withAlpha(100),
                      size: 48,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Tidak ada lampiran bukti',
                      style: AppTextStyles.labelMd.copyWith(
                        color: const Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 40),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      context.read<OrmawaProvider>().reviewAppeal(id, false);
                      Navigator.pop(context);
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.redAccent),
                      foregroundColor: Colors.red,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 20),
                    ),
                    child: const Text(
                      'Tolak Banding',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () {
                      context.read<OrmawaProvider>().reviewAppeal(id, true);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      elevation: 8,
                      shadowColor: AppColors.primary.withAlpha(100),
                    ),
                    child: const Text(
                      'Setujui Banding',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF94A3B8),
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              value,
              style: AppTextStyles.bodyMd.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF1E293B),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
