import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';

class PsychologistListScreen extends StatefulWidget {
  const PsychologistListScreen({super.key});

  @override
  State<PsychologistListScreen> createState() => _PsychologistListScreenState();
}

class _PsychologistListScreenState extends State<PsychologistListScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentCounselingProvider>().loadPsychologists();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<StudentCounselingProvider>(
      builder: (context, provider, _) {
        final psychologists = provider.psychologists;

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
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
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  child: _buildSearchBar(provider),
                ),
              ),
              if (provider.psychologistsLoading)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (provider.psychologistsError != null)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline_rounded, size: 56, color: Colors.red[300]),
                        const SizedBox(height: 12),
                        Text(provider.psychologistsError!,
                            style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => provider.loadPsychologists(),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                )
              else if (psychologists.isEmpty)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.person_search_rounded, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 12),
                        Text('Tidak ada psikolog tersedia',
                            style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
                      ],
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.all(20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildPsychologistCard(context, psychologists[index]),
                      childCount: psychologists.length,
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSearchBar(StudentCounselingProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: TextField(
        controller: _searchCtrl,
        onChanged: (v) => provider.loadPsychologists(search: v),
        decoration: InputDecoration(
          hintText: 'Cari psikolog...',
          hintStyle: AppTextStyles.labelMd.copyWith(color: const Color(0xFF94A3B8)),
          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
          suffixIcon: _searchCtrl.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF94A3B8)),
                  onPressed: () {
                    _searchCtrl.clear();
                    provider.loadPsychologists();
                  },
                )
              : null,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  Widget _buildPsychologistCard(BuildContext context, Map<String, dynamic> p) {
    final name = p['name']?.toString() ?? '-';
    final spec = p['specialization']?.toString() ?? '-';
    final id = p['id']?.toString() ?? '';
    final isActive = p['is_active'] == true;
    final location = p['location']?.toString() ?? '';
    final languages = p['languages'] as List? ?? [];
    final fee = p['fee'] as int? ?? 0;

    final initials = name.trim().isEmpty ? 'P'
        : name.trim().split(' ').take(2).map((w) => w[0].toUpperCase()).join();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isActive ? AppColors.primary.withAlpha(20) : Colors.grey.withAlpha(30),
        ),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 12, offset: const Offset(0, 6))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                // Avatar
                Stack(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isActive
                              ? [AppColors.primary, const Color(0xFF0044BB)]
                              : [Colors.grey, Colors.grey.shade400],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Center(
                        child: Text(
                          initials,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 2,
                      right: 2,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: isActive ? Colors.green : Colors.grey,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 14),
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: AppTextStyles.bodyLg.copyWith(
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF1E293B),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        spec,
                        style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isActive ? Colors.green.withAlpha(15) : Colors.grey.withAlpha(15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              isActive ? 'Tersedia' : 'Tidak Tersedia',
                              style: TextStyle(
                                color: isActive ? Colors.green : Colors.grey,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          if (fee > 0) ...[
                            const SizedBox(width: 6),
                            Text(
                              'Rp ${_formatFee(fee)}',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (location.isNotEmpty || languages.isNotEmpty) ...[
              const SizedBox(height: 12),
              Divider(height: 1, color: Colors.grey.withAlpha(20)),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (location.isNotEmpty) ...[
                    const Icon(Icons.location_on_rounded, size: 13, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        location,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
            ],
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isActive
                    ? () => _showTopicPicker(context, id, name)
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey.withAlpha(40),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: Text(
                  isActive ? 'Booking Sesi' : 'Tidak Tersedia',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTopicPicker(BuildContext context, String psikologId, String psikologName) {
    const topics = [
      ('Masalah Akademik', Icons.school_rounded),
      ('Kesehatan Mental & Stres', Icons.psychology_rounded),
      ('Masalah Keluarga/Pribadi', Icons.family_restroom_rounded),
      ('Karir & Masa Depan', Icons.work_rounded),
      ('Lainnya', Icons.more_horiz_rounded),
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey.withAlpha(60), borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            Text('Konseling dengan $psikologName',
                style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            const SizedBox(height: 6),
            Text('Pilih topik yang ingin kamu diskusikan',
                style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF64748B))),
            const SizedBox(height: 20),
            ...topics.map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                onTap: () {
                  Navigator.pop(context);
                  context.push('${AppRoutes.counselingBooking}?psikolog_id=$psikologId');
                },
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(t.$2, color: AppColors.primary, size: 20),
                ),
                title: Text(t.$1, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w700)),
                trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.grey.withAlpha(30)),
                ),
                tileColor: Colors.white,
              ),
            )),
          ],
        ),
      ),
    );
  }

  String _formatFee(int fee) {
    if (fee >= 1000000) return '${(fee / 1000000).toStringAsFixed(0)}jt';
    if (fee >= 1000) return '${(fee / 1000).toStringAsFixed(0)}rb';
    return fee.toString();
  }
}
