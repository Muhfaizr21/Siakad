import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/pages/tk_main_screen.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_booking_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/booking.dart';

class TkBookingScreen extends StatefulWidget {
  const TkBookingScreen({super.key});

  @override
  State<TkBookingScreen> createState() => _TkBookingScreenState();
}

class _TkBookingScreenState extends State<TkBookingScreen> {
  int _selectedTabIndex = 0;

  final List<Map<String, dynamic>> _tabs = [
    {'label': 'Menunggu', 'icon': Icons.hourglass_empty_rounded},
    {'label': 'Dikonfirmasi', 'icon': Icons.check_circle_outline_rounded},
    {'label': 'Selesai', 'icon': Icons.task_alt_rounded},
    {'label': 'Ditolak', 'icon': Icons.cancel_outlined},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkBookingProvider>().loadBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          // Header
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF001A4D), Color(0xFF003A6E), Color(0xFF005B8A)],
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          onPressed: () {
                            final mainState = context.findAncestorStateOfType<TkMainScreenState>();
                            if (mainState != null) {
                              mainState.setSelectedIndex(0);
                            } else if (GoRouter.of(context).canPop()) {
                              context.pop();
                            } else {
                              context.go('/tenagakes?tab=0');
                            }
                          },
                          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            'Booking Kesehatan',
                            style: AppTextStyles.titleLg.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            context.read<TkBookingProvider>().loadBookings();
                          },
                          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Kelola jadwal booking pasien',
                      style: AppTextStyles.bodySm.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Tab Chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: List.generate(_tabs.length, (index) {
                  final tab = _tabs[index];
                  final isSelected = _selectedTabIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTabIndex = index),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : AppColors.neutral100,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.neutral200,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              tab['icon'] as IconData,
                              size: 16,
                              color: isSelected ? Colors.white : AppColors.neutral500,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              tab['label'] as String,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : AppColors.neutral500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),

          // Pending Booking Banner
          Consumer<TkBookingProvider>(
            builder: (context, provider, child) {
              final pendingCount = provider.pendingBookings.length;
              if (pendingCount == 0) return const SizedBox.shrink();

              return Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.warning.withAlpha(30),
                      AppColors.warning.withAlpha(15),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.warning.withAlpha(60)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withAlpha(40),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.pending_actions_rounded,
                        color: AppColors.warning,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$pendingCount Booking Menunggu Konfirmasi',
                            style: AppTextStyles.bodyMd.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.warning,
                            ),
                          ),
                          Text(
                            'Segera proses booking untuk jadwal hari ini',
                            style: AppTextStyles.labelSm.copyWith(
                              color: AppColors.neutral500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          // Booking List
          Expanded(
            child: Consumer<TkBookingProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  );
                }

                final bookings = _getFilteredBookings(provider);
                return _buildBookingList(bookings);
              },
            ),
          ),
        ],
      ),
    );
  }

  List<Booking> _getFilteredBookings(TkBookingProvider provider) {
    switch (_selectedTabIndex) {
      case 0:
        return provider.pendingBookings;
      case 1:
        return provider.confirmedBookings;
      case 2:
        return provider.completedBookings;
      case 3:
        return provider.rejectedBookings;
      default:
        return provider.allBookings;
    }
  }

  int _getBookingId(dynamic booking) {
    if (booking is Map) return booking['id'] as int? ?? 0;
    return booking.id as int? ?? 0;
  }

  String _getBookingField(dynamic booking, String field) {
    if (booking is Map) return booking[field]?.toString() ?? '-';
    switch (field) {
      case 'name': return booking.nama;
      case 'nim': return booking.nim;
      case 'status': return booking.status;
      case 'date': return booking.jadwalTanggal ?? '-';
      case 'time': return booking.waktu ?? '-';
      case 'tipe_layanan': return booking.tipeLayanan ?? '-';
      case 'keluhan': return booking.keluhan ?? '';
      default: return '-';
    }
  }

  Widget _buildBookingList(List bookings) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_available_rounded,
              size: 72,
              color: AppColors.neutral300,
            ),
            const SizedBox(height: 16),
            Text(
              'Tidak ada booking',
              style: AppTextStyles.titleMd.copyWith(
                color: AppColors.neutral400,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Booking akan muncul di sini',
              style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral400),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () => context.read<TkBookingProvider>().loadBookings(),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
        itemCount: bookings.length,
        itemBuilder: (context, index) {
          final booking = bookings[index];
          final bookingId = _getBookingId(booking);
          final status = _getBookingField(booking, 'status');
          final isPending = status == 'Menunggu Konfirmasi';
          final isRejected = status == 'Ditolak';
          final isCompleted = status == 'Selesai';
          final keluhan = _getBookingField(booking, 'keluhan');

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isPending
                    ? AppColors.warning.withAlpha(60)
                    : isRejected
                        ? AppColors.danger.withAlpha(30)
                        : AppColors.neutral200,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildAvatar(_getBookingField(booking, 'name')),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getBookingField(booking, 'name'),
                              style: AppTextStyles.bodyMd.copyWith(
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF1E293B),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _getBookingField(booking, 'nim'),
                              style: AppTextStyles.labelSm.copyWith(
                                color: const Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                _buildInfoChip(
                                  Icons.calendar_today_rounded,
                                  _getBookingField(booking, 'date'),
                                ),
                                const SizedBox(width: 8),
                                _buildInfoChip(
                                  Icons.access_time_rounded,
                                  _getBookingField(booking, 'time'),
                                ),
                              ],
                            ),
                            if (_getBookingField(booking, 'tipe_layanan') != '-') ...[
                              const SizedBox(height: 6),
                              _buildInfoChip(
                                Icons.medical_services_rounded,
                                _getBookingField(booking, 'tipe_layanan'),
                              ),
                            ],
                          ],
                        ),
                      ),
                      _buildStatusBadge(status),
                    ],
                  ),
                ),

                if (keluhan.isNotEmpty && keluhan != '-')
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.neutral50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Keluhan',
                          style: AppTextStyles.labelSm.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.neutral500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          keluhan,
                          style: AppTextStyles.bodySm.copyWith(
                            color: AppColors.neutral700,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),

                if (isPending)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(color: AppColors.neutral200),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _handleReject(bookingId),
                            icon: const Icon(Icons.close_rounded, size: 18),
                            label: const Text('Tolak'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.danger,
                              side: const BorderSide(color: AppColors.danger),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _handleAccept(bookingId),
                            icon: const Icon(Icons.check_rounded, size: 18),
                            label: const Text('Terima'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.success,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                if (!isPending && !isRejected && !isCompleted && bookingId != 0)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(color: AppColors.neutral200),
                      ),
                    ),
                    child: SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _handleComplete(bookingId),
                        icon: const Icon(Icons.task_alt_rounded, size: 18),
                        label: const Text('Tandai Selesai'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildAvatar(String name) {
    final parts = name.trim().split(' ');
    final avatarText = parts.length >= 2
        ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
        : name.isNotEmpty
            ? name[0].toUpperCase()
            : '?';

    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(25),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(
        child: Text(
          avatarText,
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: AppColors.neutral500),
        const SizedBox(width: 4),
        Text(
          text,
          style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    IconData icon;

    switch (status) {
      case 'Dikonfirmasi':
        color = AppColors.success;
        icon = Icons.check_circle_outline_rounded;
        break;
      case 'Menunggu Konfirmasi':
        color = AppColors.warning;
        icon = Icons.hourglass_empty_rounded;
        break;
      case 'Selesai':
        color = AppColors.info;
        icon = Icons.task_alt_rounded;
        break;
      case 'Ditolak':
        color = AppColors.danger;
        icon = Icons.cancel_outlined;
        break;
      default:
        color = AppColors.neutral500;
        icon = Icons.info_outline_rounded;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            status,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleAccept(int id) async {
    if (id == 0) return;
    final provider = context.read<TkBookingProvider>();
    final success = await provider.acceptBooking(id);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('Booking berhasil dikonfirmasi'),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  Future<void> _handleReject(int id) async {
    if (id == 0) return;
    final provider = context.read<TkBookingProvider>();

    final alasanController = TextEditingController();
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Padding(
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
                    color: AppColors.neutral300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Tolak Booking',
                style: AppTextStyles.titleMd.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.danger,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Berikan alasan penolakan (opsional)',
                style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: alasanController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Contoh: Jadwal penuh, perlu reschedule...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.neutral300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.neutral300),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Batal'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.danger,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Tolak'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );

    if (result == true) {
      final success = await provider.rejectBooking(
        id,
        alasan: alasanController.text.isNotEmpty ? alasanController.text : null,
      );
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.cancel_rounded, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Text('Booking ditolak'),
              ],
            ),
            backgroundColor: AppColors.danger,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    }
  }

  Future<void> _handleComplete(int id) async {
    if (id == 0) return;
    final provider = context.read<TkBookingProvider>();
    final success = await provider.completeBooking(id);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.task_alt_rounded, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('Booking ditandai selesai'),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }
}
