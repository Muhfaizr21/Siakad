import 'dart:async';
import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/core/services/auth_service.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:bkuhub_mobile/features/ormawa/absensi/presentation/pages/ormawa_qr_scan_screen.dart';

class OrmawaAbsensiScreen extends StatefulWidget {
  final bool showBackButton;

  const OrmawaAbsensiScreen({
    super.key,
    this.showBackButton = true,
  });

  @override
  State<OrmawaAbsensiScreen> createState() => _OrmawaAbsensiScreenState();
}

class _OrmawaAbsensiScreenState extends State<OrmawaAbsensiScreen> {
  String _searchQuery = '';
  String _statusFilter = 'Semua';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'ABSENSI KEGIATAN',
            subtitle: 'PRESENSI & KEHADIRAN',
            expandedHeight: 160.0,
            showBackButton: widget.showBackButton,
            isExpandable: false,
          ),
          Consumer<OrmawaProvider>(
            builder: (context, provider, child) {
              final allAgendas = provider.agendas;
              
              final agendas = allAgendas.where((agenda) {
                final now = DateTime.now();
                final isPast = agenda.date.isBefore(now.subtract(const Duration(days: 1)));
                final status = isPast ? 'SELESAI' : 'AKTIF';
                
                final matchesSearch = agenda.title.toLowerCase().contains(_searchQuery.toLowerCase());
                final matchesFilter = _statusFilter == 'Semua' || _statusFilter.toUpperCase() == status;
                
                return matchesSearch && matchesFilter;
              }).toList();
              
              if (provider.isLoading && allAgendas.isEmpty) {
                return const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              return SliverMainAxisGroup(
                slivers: [
                  _buildQuickStats(provider),
                  _buildSearchAndFilter(),
                  if (agendas.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.event_busy_rounded, size: 64, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text('Belum ada agenda kegiatan', style: AppTextStyles.labelMd.copyWith(color: Colors.grey)),
                          ],
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final agenda = agendas[index];
                            final now = DateTime.now();
                            final isPast = agenda.date.isBefore(now.subtract(const Duration(days: 1)));
                            final status = isPast ? 'SELESAI' : 'AKTIF';
                            final statusColor = isPast ? Colors.blue : Colors.green;

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildAbsensiCard(
                                agenda.id,
                                agenda.title,
                                '${agenda.date.day}/${agenda.date.month}/${agenda.date.year} • ${agenda.date.hour}:${agenda.date.minute.toString().padLeft(2, '0')}',
                                status,
                                statusColor,
                              ),
                            );
                          },
                          childCount: agendas.length,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilter() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            // Search Field
            Expanded(
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: TextField(
                  onChanged: (value) => setState(() => _searchQuery = value),
                  decoration: InputDecoration(
                    hintText: 'Cari nama kegiatan...',
                    hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Filter Button
            InkWell(
              onTap: _showFilterBottomSheet,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Icon(Icons.filter_list_rounded, color: AppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Colors.white,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Filter Status', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ['Semua', 'Aktif', 'Selesai'].map((filter) {
                      final isSelected = _statusFilter == filter;
                      return ChoiceChip(
                        label: Text(
                          filter,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.primary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                          ),
                        ),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _statusFilter = filter);
                            setModalState(() => _statusFilter = filter);
                          }
                        },
                        selectedColor: AppColors.primary,
                        backgroundColor: const Color(0xFFF1F5F9),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        showCheckmark: false,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildQuickStats(OrmawaProvider provider) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.primaryContainer],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF003399).withAlpha(60),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    icon: Icons.layers_rounded,
                    title: 'Sesi Kegiatan',
                    value: provider.agendas.length.toString(),
                  ),
                  Container(width: 1, height: 40, color: Colors.white.withAlpha(50)),
                  _buildStatItem(
                    icon: Icons.people_rounded,
                    title: 'Total Anggota',
                    value: provider.members.length.toString(),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Divider(color: Colors.white.withAlpha(50), height: 1),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    icon: Icons.check_circle_outline_rounded,
                    title: 'Hadir / Alpa',
                    value: '0 / 0',
                  ),
                  Container(width: 1, height: 40, color: Colors.white.withAlpha(50)),
                  _buildStatItem(
                    icon: Icons.percent_rounded,
                    title: 'Rasio Kehadiran',
                    value: '0%',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Expanded(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(30),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 20),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontSize: 10),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAbsensiCard(String id, String title, String time, String status, Color statusColor) {
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withAlpha(10), borderRadius: BorderRadius.circular(8)),
                child: Text(
                  status,
                  style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.w900, fontSize: 10),
                ),
              ),
              const Icon(Icons.more_horiz_rounded, color: Color(0xFF94A3B8)),
            ],
          ),
          const SizedBox(height: 16),
          Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Text(time, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Kehadiran', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => OrmawaAbsensiDetailScreen(title: title, eventId: id),
                          ),
                        );
                      },
                      child: Text(
                        'Lihat Peserta',
                        style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (status.toUpperCase() != 'SELESAI')
                Row(
                  children: [
                    if (AuthService().currentRole == UserRole.ormawa) ...[
                      OutlinedButton(
                        onPressed: () {
                          _showQrScannerDialog(context, id, title);
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          side: const BorderSide(color: AppColors.primary),
                        ),
                        child: const Text('Tampilkan QR', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                    ],
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => OrmawaQrScanScreen(
                              eventId: id,
                              eventTitle: title,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                      child: const Text('Scan QR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _showQrScannerDialog(BuildContext context, String eventId, String title) {
    final qrData = 'https://siakad.ubk.ac.id/student/presensi?eventId=$eventId';

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) {
        return _QrScannerDialogContent(
          eventId: eventId,
          title: title,
          qrData: qrData,
        );
      },
    );
  }
}

class _QrScannerDialogContent extends StatefulWidget {
  final String eventId;
  final String title;
  final String qrData;

  const _QrScannerDialogContent({
    required this.eventId,
    required this.title,
    required this.qrData,
  });

  @override
  State<_QrScannerDialogContent> createState() => _QrScannerDialogContentState();
}

class _QrScannerDialogContentState extends State<_QrScannerDialogContent> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().fetchAttendance(widget.eventId);
    });
    // Poll attendance list every 3 seconds to keep UI synced in real-time
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        context.read<OrmawaProvider>().fetchAttendance(widget.eventId);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      elevation: 0,
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(20),
              blurRadius: 30,
              offset: const Offset(0, 15),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: Stack(
            children: [
              Positioned(
                top: -60,
                right: -60,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primary.withAlpha(8),
                  ),
                ),
              ),
              Positioned(
                bottom: -80,
                left: -80,
                child: Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primary.withAlpha(5),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Consumer<OrmawaProvider>(
                  builder: (context, provider, child) {
                    final list = provider.attendanceList;
                    final attendedCount = list.where((e) => e.status == 'hadir').length;

                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(10),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.qr_code_scanner_rounded,
                            color: AppColors.primary,
                            size: 28,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'PEMINDAI QR PRESENSI',
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.primary.withAlpha(150),
                            letterSpacing: 2,
                            fontWeight: FontWeight.w800,
                            fontSize: 11,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          widget.title,
                          style: AppTextStyles.titleLg.copyWith(
                            fontSize: 20,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w900,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Arahkan kamera mahasiswa ke kode QR di bawah ini untuk melakukan presensi secara mandiri.',
                          style: AppTextStyles.bodySm.copyWith(
                            color: const Color(0xFF64748B),
                            height: 1.4,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.green.withAlpha(15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.green.withAlpha(30)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.people_alt_rounded, color: Colors.green, size: 16),
                              const SizedBox(width: 8),
                              Text(
                                '$attendedCount Mahasiswa Hadir',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: Colors.green.shade800,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(28),
                            border: Border.all(color: const Color(0xFFF1F5F9), width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withAlpha(10),
                                blurRadius: 25,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: QrImageView(
                            data: widget.qrData,
                            version: QrVersions.auto,
                            size: 180.0,
                            eyeStyle: const QrEyeStyle(
                              eyeShape: QrEyeShape.square,
                              color: AppColors.primary,
                            ),
                            dataModuleStyle: const QrDataModuleStyle(
                              dataModuleShape: QrDataModuleShape.square,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),
                        SizedBox(
                          width: double.infinity,
                          height: 54,
                          child: ElevatedButton(
                            onPressed: () => Navigator.pop(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'TUTUP',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OrmawaAbsensiDetailScreen extends StatefulWidget {
  final String title;
  final String eventId;
  const OrmawaAbsensiDetailScreen({super.key, required this.title, required this.eventId});

  @override
  State<OrmawaAbsensiDetailScreen> createState() => _OrmawaAbsensiDetailScreenState();
}

class _OrmawaAbsensiDetailScreenState extends State<OrmawaAbsensiDetailScreen> {
  bool _isSubmitting = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().fetchAttendance(widget.eventId);
    });
    // Start periodic polling for real-time check-in updates
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        context.read<OrmawaProvider>().fetchAttendance(widget.eventId);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _recordAttendance(String mahasiswaId, String status) async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await context.read<OrmawaProvider>().submitAttendance(widget.eventId, mahasiswaId, status);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(status == 'hadir' ? 'Kehadiran berhasil dicatat!' : 'Ketidakhadiran dicatat!'),
            backgroundColor: status == 'hadir' ? Colors.green : Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
        // Refresh
        context.read<OrmawaProvider>().fetchAttendance(widget.eventId);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mencatat kehadiran: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Consumer<OrmawaProvider>(
        builder: (context, provider, child) {
          final list = provider.attendanceList;
          
          final attendedCount = list.where((e) => e.status == 'hadir').length;
          final absentCount = list.where((e) => e.status == 'tidak_hadir').length;

          return CustomScrollView(
            slivers: [
              BkuAppBar(
                title: 'Konfirmasi Kehadiran',
                variant: AppBarVariant.ormawa,
                showBackButton: true,
                isExpandable: false,
                showNotification: false,
                actions: [
                  IconButton(
                    onPressed: () => provider.fetchAttendance(widget.eventId),
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                  ),
                ],
              ),
              
              if (provider.isLoading && list.isEmpty)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else ...[
                // Beautiful Header Card
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(20, 20, 20, 10),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                      border: Border.all(color: const Color(0xFFF1F5F9)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title,
                          style: AppTextStyles.titleMd.copyWith(
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Cek lis secara manual untuk memperbarui status kehadiran mahasiswa.',
                          style: AppTextStyles.labelSm.copyWith(
                            color: const Color(0xFF64748B),
                            height: 1.3,
                          ),
                        ),
                        if (list.isNotEmpty) ...[
                          const SizedBox(height: 18),
                          const Divider(color: Color(0xFFF1F5F9), height: 1),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE8F5E9),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check_circle_rounded, color: Colors.green, size: 18),
                                      const SizedBox(width: 8),
                                      Text(
                                        '$attendedCount Hadir',
                                        style: AppTextStyles.labelSm.copyWith(
                                          color: Colors.green.shade800,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFEBEE),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.cancel_rounded, color: Colors.red, size: 18),
                                      const SizedBox(width: 8),
                                      Text(
                                        '$absentCount Alpa',
                                        style: AppTextStyles.labelSm.copyWith(
                                          color: Colors.red.shade800,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                
                if (list.isEmpty)
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.person_off_rounded, size: 64, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text('Belum ada data kehadiran', style: AppTextStyles.labelSm.copyWith(color: Colors.grey)),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = list[index];
                          final isAttended = item.status == 'hadir';
                          final isAbsent = item.status == 'tidak_hadir';
                          
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(3),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                                border: Border.all(
                                  color: isAttended 
                                      ? Colors.green.withAlpha(80) 
                                      : (isAbsent ? Colors.red.withAlpha(80) : const Color(0xFFF1F5F9)),
                                  width: 1.5,
                                ),
                              ),
                              child: Row(
                                children: [
                                  // Left status line
                                  Container(
                                    width: 4,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: isAttended 
                                          ? Colors.green 
                                          : (isAbsent ? Colors.red : Colors.grey.shade300),
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  CircleAvatar(
                                    radius: 20,
                                    backgroundColor: isAttended 
                                        ? Colors.green.withAlpha(30) 
                                        : (isAbsent ? Colors.red.withAlpha(30) : AppColors.primary.withAlpha(10)),
                                    child: Text(
                                      item.mahasiswaName?.isNotEmpty == true ? item.mahasiswaName!.substring(0, 1).toUpperCase() : '?',
                                      style: TextStyle(
                                        color: isAttended 
                                            ? Colors.green 
                                            : (isAbsent ? Colors.red : AppColors.primary), 
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.mahasiswaName ?? 'Mahasiswa #${item.mahasiswaId}', 
                                          style: AppTextStyles.bodyMd.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'NIM. ${item.nim ?? item.mahasiswaId}', 
                                          style: AppTextStyles.labelSm.copyWith(
                                            color: const Color(0xFF64748B), 
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      InkWell(
                                        onTap: () => _recordAttendance(item.mahasiswaId, 'hadir'),
                                        borderRadius: BorderRadius.circular(12),
                                        child: Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: isAttended ? Colors.green : Colors.transparent,
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(
                                              color: isAttended ? Colors.green : const Color(0xFFE2E8F0),
                                              width: 1.5,
                                            ),
                                          ),
                                          child: Icon(
                                            Icons.check_rounded, 
                                            color: isAttended ? Colors.white : const Color(0xFF64748B), 
                                            size: 18,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      InkWell(
                                        onTap: () => _recordAttendance(item.mahasiswaId, 'tidak_hadir'),
                                        borderRadius: BorderRadius.circular(12),
                                        child: Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: isAbsent ? Colors.red : Colors.transparent,
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(
                                              color: isAbsent ? Colors.red : const Color(0xFFE2E8F0),
                                              width: 1.5,
                                            ),
                                          ),
                                          child: Icon(
                                            Icons.close_rounded, 
                                            color: isAbsent ? Colors.white : const Color(0xFF64748B), 
                                            size: 18,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                        childCount: list.length,
                      ),
                    ),
                  ),
              ]
            ],
          );
        },
      ),
    );
  }
}
