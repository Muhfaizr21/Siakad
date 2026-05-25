import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';

class StudentCounselingScreen extends StatefulWidget {
  const StudentCounselingScreen({super.key});

  @override
  State<StudentCounselingScreen> createState() => _StudentCounselingScreenState();
}

class _StudentCounselingScreenState extends State<StudentCounselingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<StudentCounselingProvider>();
      p.loadPsychologists();
      p.loadMyBookings();
    });
  }

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
    final name = context.watch<StudentProvider>().name;
    final firstName = name.split(' ').first;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Halo, $firstName 👋',
            style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
        Text('Apa yang kamu rasakan hari ini? Kami di sini untuk mendengarkan.',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
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
            decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
            child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Butuh bantuan segera?',
                    style: AppTextStyles.bodyLg.copyWith(color: Colors.red[900], fontWeight: FontWeight.bold)),
                Text('Klik untuk hubungi hotline darurat 24/7',
                    style: AppTextStyles.labelMd.copyWith(color: Colors.red[700])),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, color: Colors.red, size: 16),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(title,
        style: AppTextStyles.titleMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900));
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
        _buildServiceCard(context, 'Riwayat Saya', Icons.history_rounded, Colors.orange, null, onTap: () => _showMyBookings(context)),
        _buildServiceCard(context, 'Rekam Medis', Icons.medical_information_rounded, Colors.teal, null, onTap: () => _showMedicalRecord(context)),
      ],
    );
  }

  Widget _buildServiceCard(BuildContext context, String title, IconData icon, Color color, String? route, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap ?? (route != null ? () => context.push(route) : null),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: color.withAlpha(15), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withAlpha(20), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildMyAppointments() {
    return Consumer<StudentCounselingProvider>(
      builder: (context, provider, _) {
        if (provider.myBookingsLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        final bookings = provider.myBookings;
        if (bookings.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Center(
              child: Text('Belum ada jadwal konseling',
                  style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
            ),
          );
        }

        // Tampilkan booking terbaru yang aktif
        final active = bookings.firstWhere(
          (b) => b['status'] == 'Menunggu' || b['status'] == 'Dikonfirmasi',
          orElse: () => bookings.first,
        );

        final psikolog = active['psychologist'] as Map<String, dynamic>?;
        final psikologName = psikolog?['name']?.toString() ?? '-';
        final displayDate = active['display_date']?.toString() ?? '-';
        final start = active['start']?.toString() ?? '-';
        final status = active['status']?.toString() ?? '-';
        final topic = active['topic']?.toString() ?? '-';

        Color statusColor = AppColors.primary;
        if (status == 'Menunggu') statusColor = Colors.orange;
        if (status == 'Selesai') statusColor = Colors.green;
        if (status == 'Ditolak' || status == 'Dibatalkan') statusColor = Colors.red;

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: statusColor.withAlpha(30)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(displayDate.split(' ').first,
                        style: AppTextStyles.titleMd.copyWith(color: statusColor, fontWeight: FontWeight.bold)),
                    Text(displayDate.split(' ').skip(1).join(' '),
                        style: AppTextStyles.labelSm.copyWith(color: statusColor)),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(topic, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                    Text('$psikologName • $start WIB',
                        style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(status,
                    style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPsychologistList(BuildContext context) {
    return Consumer<StudentCounselingProvider>(
      builder: (context, provider, _) {
        if (provider.psychologistsLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (provider.psychologistsError != null) {
          return Center(
            child: Text(provider.psychologistsError!,
                style: AppTextStyles.bodyMd.copyWith(color: Colors.red)),
          );
        }
        final psychologists = provider.psychologists;
        if (psychologists.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Center(
              child: Text('Belum ada psikolog tersedia',
                  style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
            ),
          );
        }
        return Column(
          children: psychologists.map((p) => _buildPsychologistCard(context, p)).toList(),
        );
      },
    );
  }

  Widget _buildPsychologistCard(BuildContext context, Map<String, dynamic> p) {
    final name = p['name']?.toString() ?? '-';
    final spec = p['specialization']?.toString() ?? '-';
    final id = p['id']?.toString() ?? '';
    final isActive = p['is_active'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isActive ? Colors.green.withAlpha(30) : Colors.grey.withAlpha(30)),
      ),
      child: Row(
        children: [
          Stack(
            children: [
              const CircleAvatar(
                radius: 28,
                backgroundColor: Color(0xFFF1F5F9),
                child: Icon(Icons.person_rounded, color: AppColors.outline),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: isActive ? Colors.green : Colors.grey,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                Text(spec, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                const SizedBox(height: 4),
                Text(
                  isActive ? 'Tersedia' : 'Tidak Tersedia',
                  style: TextStyle(
                    color: isActive ? Colors.green : Colors.grey,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: isActive
                ? () => context.push('${AppRoutes.counselingBooking}?psikolog_id=$id')
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey.withAlpha(50),
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

  void _showMyBookings(BuildContext context) {
    final provider = context.read<StudentCounselingProvider>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MyBookingsSheet(provider: provider),
    );
  }

  void _showMedicalRecord(BuildContext context) {
    final provider = context.read<StudentCounselingProvider>();
    provider.loadMyMedicalRecord();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MedicalRecordSheet(provider: provider),
    );
  }
}

// ─── My Bookings Sheet ────────────────────────────────────────────────────────

class _MyBookingsSheet extends StatelessWidget {
  final StudentCounselingProvider provider;
  const _MyBookingsSheet({required this.provider});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 48, height: 5,
              decoration: BoxDecoration(color: Colors.grey.withAlpha(50), borderRadius: BorderRadius.circular(10))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text('Riwayat Booking',
                style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900)),
          ),
          Expanded(
            child: ChangeNotifierProvider.value(
              value: provider,
              child: Consumer<StudentCounselingProvider>(
                builder: (context, p, _) {
                  if (p.myBookingsLoading) return const Center(child: CircularProgressIndicator());
                  if (p.myBookings.isEmpty) {
                    return Center(child: Text('Belum ada booking',
                        style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)));
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: p.myBookings.length,
                    itemBuilder: (context, i) {
                      final b = p.myBookings[i];
                      final psikolog = b['psychologist'] as Map<String, dynamic>?;
                      final status = b['status']?.toString() ?? '-';
                      final mode = b['mode']?.toString() ?? 'Tatap Muka';
                      final linkMeeting = b['link_meeting']?.toString() ?? '';
                      final isOnline = mode == 'Online';
                      final isDikonfirmasi = status == 'Dikonfirmasi';

                      Color statusColor = AppColors.primary;
                      if (status == 'Menunggu') statusColor = Colors.orange;
                      if (status == 'Selesai') statusColor = Colors.green;
                      if (status == 'Ditolak' || status == 'Dibatalkan') statusColor = Colors.red;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: statusColor.withAlpha(30)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(b['topic']?.toString() ?? '-',
                                          style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                                      Text('${psikolog?['name'] ?? '-'} • ${b['display_date'] ?? '-'}',
                                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                                      Text('${b['start'] ?? '-'} - ${b['end'] ?? '-'}',
                                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                      color: statusColor.withAlpha(15), borderRadius: BorderRadius.circular(8)),
                                  child: Text(status,
                                      style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            // Badge mode
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isOnline ? Colors.blue.withAlpha(20) : Colors.teal.withAlpha(20),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isOnline ? Icons.videocam_rounded : Icons.location_on_rounded,
                                        size: 11,
                                        color: isOnline ? Colors.blue : Colors.teal,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        mode,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: isOnline ? Colors.blue : Colors.teal,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            // Link meeting — tampil kalau Online + Dikonfirmasi + ada link
                            if (isOnline && isDikonfirmasi && linkMeeting.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              GestureDetector(
                                onTap: () async {
                                  final uri = Uri.parse(linkMeeting);
                                  if (await canLaunchUrl(uri)) {
                                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withAlpha(10),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.blue.withAlpha(40)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.videocam_rounded, color: Colors.blue, size: 18),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Link Meeting Tersedia',
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.blue,
                                              ),
                                            ),
                                            Text(
                                              linkMeeting,
                                              style: TextStyle(
                                                fontSize: 10,
                                                color: Colors.blue.withAlpha(180),
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.open_in_new_rounded, color: Colors.blue, size: 16),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Medical Record Sheet ─────────────────────────────────────────────────────

class _MedicalRecordSheet extends StatelessWidget {
  final StudentCounselingProvider provider;
  const _MedicalRecordSheet({required this.provider});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 48, height: 5,
              decoration: BoxDecoration(color: Colors.grey.withAlpha(50), borderRadius: BorderRadius.circular(10))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text('Rekam Medis Saya',
                style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900)),
          ),
          Expanded(
            child: ChangeNotifierProvider.value(
              value: provider,
              child: Consumer<StudentCounselingProvider>(
                builder: (context, p, _) {
                  if (p.medicalRecordLoading) return const Center(child: CircularProgressIndicator());
                  final records = p.myMedicalRecord['records'] as List? ?? [];
                  final summary = p.myMedicalRecord['summary'] as Map<String, dynamic>? ?? {};
                  if (records.isEmpty) {
                    return Center(child: Text('Belum ada catatan sesi',
                        style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)));
                  }
                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      // Summary card
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primary.withAlpha(30)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.summarize_rounded, color: AppColors.primary),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Total: ${summary['total_records'] ?? 0} catatan',
                                    style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                                Text('Status terkini: ${summary['latest_status'] ?? '-'}',
                                    style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      ...records.map((r) {
                        final rec = r as Map<String, dynamic>;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(rec['display_date']?.toString() ?? '-',
                                      style: AppTextStyles.labelSm.copyWith(
                                          color: AppColors.outline, fontWeight: FontWeight.bold)),
                                  Text(rec['type']?.toString() ?? '-',
                                      style: AppTextStyles.labelSm.copyWith(
                                          color: AppColors.primary, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              if ((rec['complaint']?.toString() ?? '').isNotEmpty)
                                Text('Keluhan: ${rec['complaint']}',
                                    style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF475569))),
                              if ((rec['recommendation']?.toString() ?? '').isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text('Rekomendasi: ${rec['recommendation']}',
                                    style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                              ],
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _buildChip('Mood: ${rec['mood'] ?? '-'}', Colors.blue),
                                  const SizedBox(width: 8),
                                  _buildChip(rec['status']?.toString() ?? '-', Colors.green),
                                ],
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withAlpha(15), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
