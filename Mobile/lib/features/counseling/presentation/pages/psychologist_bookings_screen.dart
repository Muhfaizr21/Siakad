import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class PsychologistBookingsScreen extends StatefulWidget {
  const PsychologistBookingsScreen({super.key});

  @override
  State<PsychologistBookingsScreen> createState() =>
      _PsychologistBookingsScreenState();
}

class _PsychologistBookingsScreenState
    extends State<PsychologistBookingsScreen> {
  int _selectedTabIndex = 0;
  final List<String> _tabs = [
    'Semua',
    'Menunggu',
    'Dikonfirmasi',
    'Selesai',
    'Ditolak'
  ];

  String _searchQuery = '';
  String _sortOrder = 'Terbaru';
  String? _selectedProdi;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadBookings();
    });
  }

  List<Map<String, dynamic>> _filteredBookings(
      List<Map<String, dynamic>> bookings) {
    List<Map<String, dynamic>> result = List.from(bookings);

    // Filter Status
    if (_selectedTabIndex != 0) {
      final statusFilter = _tabs[_selectedTabIndex];
      result = result.where((b) => b['status'] == statusFilter).toList();
    }

    // Filter Search (Nama / NIM)
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      result = result.where((b) {
        final name = (b['name']?.toString() ?? '').toLowerCase();
        final nim = (b['nim']?.toString() ?? '').toLowerCase();
        return name.contains(q) || nim.contains(q);
      }).toList();
    }

    // Filter Prodi
    if (_selectedProdi != null && _selectedProdi!.isNotEmpty) {
      result = result.where((b) => b['faculty']?.toString() == _selectedProdi).toList();
    }

    // Sort (Menggunakan ID sebagai acuan Terbaru/Terlama, asumsi ID auto-increment)
    result.sort((a, b) {
      final idA = int.tryParse(a['id']?.toString() ?? '0') ?? 0;
      final idB = int.tryParse(b['id']?.toString() ?? '0') ?? 0;
      return _sortOrder == 'Terbaru' ? idB.compareTo(idA) : idA.compareTo(idB);
    });

    return result;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final bookings = provider.bookings;
        final filtered = _filteredBookings(bookings);
        final waiting =
            bookings.where((b) => b['status'] == 'Menunggu').length;

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              BkuAppBar(
                title: 'Booking Masuk',
                info: 'Kelola & konfirmasi permintaan sesi konseling',
                variant: AppBarVariant.psychologist,
                showBackButton: false,
                isExpandable: false,
              ),
              SliverToBoxAdapter(
                child: provider.bookingsLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 80),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : provider.bookingsError != null
                        ? _buildError(provider.bookingsError!, provider)
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (waiting > 0) ...[
                                const SizedBox(height: 16),
                                _buildPendingBanner(waiting),
                              ],
                              const SizedBox(height: 16),
                              _buildSearchAndFilter(bookings),
                              const SizedBox(height: 16),
                              _buildTabs(),
                              const SizedBox(height: 24),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 24),
                                child: Text(
                                  '${filtered.length} Permintaan',
                                  style: AppTextStyles.titleMd.copyWith(
                                    color: const Color(0xFF0F172A),
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              _buildBookingList(filtered, provider),
                              const SizedBox(height: 40),
                            ],
                          ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildError(String message, CounselingProvider provider) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.error_outline_rounded, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(message,
                style: AppTextStyles.bodyMd
                    .copyWith(color: const Color(0xFF94A3B8))),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: provider.loadBookings,
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingBanner(int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFFF59E0B).withAlpha(30),
              const Color(0xFFF59E0B).withAlpha(10)
            ],
          ),
          borderRadius: BorderRadius.circular(16),
          border:
              Border.all(color: const Color(0xFFF59E0B).withAlpha(80)),
        ),
        child: Row(
          children: [
            const Icon(Icons.pending_actions_rounded,
                color: Color(0xFFF59E0B), size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '$count permintaan booking menunggu konfirmasi kamu!',
                style: AppTextStyles.labelMd.copyWith(
                  color: const Color(0xFF92400E),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchAndFilter(List<Map<String, dynamic>> allBookings) {
    final prodis = allBookings
        .map((b) => b['faculty']?.toString() ?? '')
        .where((p) => p.isNotEmpty)
        .toSet()
        .toList();
    prodis.sort();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: 'Cari nama mahasiswa atau NIM...',
              hintStyle: TextStyle(color: Colors.grey.withAlpha(150), fontSize: 13, fontWeight: FontWeight.w600),
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 4,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.withAlpha(40)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _sortOrder,
                      icon: const Icon(Icons.sort_rounded, color: AppColors.primary, size: 18),
                      style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800),
                      items: ['Terbaru', 'Terlama'].map((e) {
                        return DropdownMenuItem(value: e, child: Text(e));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _sortOrder = val);
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 6,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.withAlpha(40)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String?>(
                      isExpanded: true,
                      value: _selectedProdi,
                      hint: Text('Semua Prodi', style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800)),
                      icon: const Icon(Icons.filter_list_rounded, color: AppColors.primary, size: 18),
                      style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800),
                      items: [
                        DropdownMenuItem<String?>(value: null, child: const Text('Semua Prodi')),
                        ...prodis.map((e) {
                          return DropdownMenuItem<String?>(value: e, child: Text(e, overflow: TextOverflow.ellipsis));
                        }),
                      ],
                      onChanged: (val) {
                        setState(() => _selectedProdi = val);
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        physics: const BouncingScrollPhysics(),
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedTabIndex == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedTabIndex = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 12),
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : Colors.grey.withAlpha(50),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                            color: AppColors.primary.withAlpha(50),
                            blurRadius: 8,
                            offset: const Offset(0, 4))
                      ]
                    : null,
              ),
              alignment: Alignment.center,
              child: Text(
                _tabs[index],
                style: AppTextStyles.labelMd.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isSelected
                      ? Colors.white
                      : const Color(0xFF64748B),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBookingList(
      List<Map<String, dynamic>> list, CounselingProvider provider) {
    if (list.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.event_busy_rounded,
                  size: 64, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text('Tidak ada booking',
                  style: AppTextStyles.bodyMd
                      .copyWith(color: Colors.grey)),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      itemBuilder: (context, index) =>
          _buildBookingCard(list[index], provider),
    );
  }

  Widget _buildBookingCard(
      Map<String, dynamic> booking, CounselingProvider provider) {
    final status = booking['status']?.toString() ?? 'Menunggu';
    final isWaiting = status == 'Menunggu';
    final isDone = status == 'Selesai';

    Color statusColor;
    IconData statusIcon;
    if (isWaiting) {
      statusColor = const Color(0xFFF59E0B);
      statusIcon = Icons.hourglass_empty_rounded;
    } else if (isDone) {
      statusColor = const Color(0xFF10B981);
      statusIcon = Icons.check_circle_outline_rounded;
    } else if (status == 'Ditolak') {
      statusColor = const Color(0xFFEF4444);
      statusIcon = Icons.cancel_outlined;
    } else {
      statusColor = AppColors.primary;
      statusIcon = Icons.event_available_rounded;
    }

    final name = booking['name']?.toString() ?? '-';
    final nim = booking['nim']?.toString() ?? '-';
    final faculty = booking['faculty']?.toString() ?? '';
    final date = booking['date_full']?.toString() ?? booking['date']?.toString() ?? '-';
    final time = booking['time']?.toString() ?? '-';
    final issue = booking['issue']?.toString() ?? booking['topik']?.toString() ?? '-';
    final note = booking['note']?.toString() ?? booking['keluhan']?.toString() ?? '';
    final id = booking['id']?.toString() ?? '';
    final mode = booking['mode']?.toString() ?? 'Tatap Muka';
    final isOnline = mode == 'Online';

    // Generate avatar initials from name
    final parts = name.trim().split(' ');
    final avatar = parts.length >= 2
        ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
        : name.isNotEmpty
            ? name[0].toUpperCase()
            : '?';

    const avatarColors = [
      Color(0xFF3B82F6),
      Color(0xFF10B981),
      Color(0xFF8B5CF6),
      Color(0xFFF59E0B),
      Color(0xFFEF4444),
    ];
    final avatarColor = avatarColors[name.length % avatarColors.length];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: isWaiting
                ? const Color(0xFFF59E0B).withAlpha(80)
                : Colors.grey.withAlpha(30)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: avatarColor.withAlpha(30),
                  child: Text(
                    avatar,
                    style: TextStyle(
                      color: avatarColor,
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: AppTextStyles.bodyMd.copyWith(
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$nim${faculty.isNotEmpty ? ' • $faculty' : ''}',
                        style: AppTextStyles.labelSm
                            .copyWith(color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 12, color: statusColor),
                      const SizedBox(width: 4),
                      Text(status,
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: statusColor)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey.withAlpha(30)),
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _buildInfoChip(Icons.calendar_today_rounded, date),
                    const SizedBox(width: 12),
                    _buildInfoChip(Icons.access_time_rounded, time),
                  ],
                ),
                const SizedBox(height: 8),
                _buildInfoChip(Icons.psychology_rounded, issue,
                    color: AppColors.primary),
                const SizedBox(height: 8),
                // Badge mode Online/Tatap Muka
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
                if (note.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    note,
                    style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF64748B), height: 1.5),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          if (isWaiting) ...[
            Divider(height: 1, color: Colors.grey.withAlpha(30)),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          _showActionDialog(booking, false, id, provider),
                      icon: const Icon(Icons.close_rounded, size: 16),
                      label: const Text('Tolak',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFEF4444),
                        side: const BorderSide(
                            color: Color(0xFFEF4444)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () =>
                          _showActionDialog(booking, true, id, provider),
                      icon: const Icon(Icons.check_rounded, size: 16),
                      label: const Text('Konfirmasi',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, {Color? color}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: color ?? Colors.grey[500]),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: color ?? Colors.grey[600],
            fontWeight:
                color != null ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  void _showActionDialog(Map<String, dynamic> booking, bool isConfirm,
      String id, CounselingProvider provider) {
    final messenger = ScaffoldMessenger.of(context);
    final name = booking['name']?.toString() ?? '-';
    final mode = booking['mode']?.toString() ?? 'Tatap Muka';
    final isOnline = mode == 'Online';
    final linkCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 8),
                Icon(
                  isConfirm
                      ? Icons.event_available_rounded
                      : Icons.event_busy_rounded,
                  color: isConfirm
                      ? AppColors.primary
                      : const Color(0xFFEF4444),
                  size: 56,
                ),
                const SizedBox(height: 16),
                Text(
                  isConfirm ? 'Konfirmasi Booking?' : 'Tolak Booking?',
                  style: AppTextStyles.titleMd
                      .copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),

                // Badge mode
                if (isConfirm) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isOnline
                          ? Colors.blue.withAlpha(20)
                          : Colors.teal.withAlpha(20),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isOnline ? Icons.videocam_rounded : Icons.location_on_rounded,
                          size: 14,
                          color: isOnline ? Colors.blue : Colors.teal,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          mode,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isOnline ? Colors.blue : Colors.teal,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                Text(
                  isConfirm
                      ? 'Mahasiswa $name akan mendapat notifikasi bahwa booking-nya dikonfirmasi.'
                      : 'Mahasiswa $name akan mendapat notifikasi bahwa booking-nya ditolak.',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelMd.copyWith(
                      color: const Color(0xFF64748B), height: 1.5),
                ),

                // Field link meeting — hanya muncul kalau konfirmasi + Online
                if (isConfirm && isOnline) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue.withAlpha(10),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.blue.withAlpha(40)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.link_rounded, color: Colors.blue, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              'Link Meeting (Wajib)',
                              style: AppTextStyles.labelMd.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: linkCtrl,
                          style: const TextStyle(fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'https://meet.google.com/xxx-xxxx-xxx',
                            hintStyle: TextStyle(color: Colors.grey.withAlpha(120), fontSize: 12),
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.blue.withAlpha(60)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.blue.withAlpha(60)),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            prefixIcon: const Icon(Icons.videocam_rounded, color: Colors.blue, size: 18),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Link akan dikirim ke mahasiswa via notifikasi.',
                          style: TextStyle(fontSize: 10, color: Colors.blue.withAlpha(150)),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(dialogContext),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(
                              color: Colors.grey.withAlpha(100)),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Batal',
                            style: TextStyle(
                                color: Colors.grey,
                                fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          // Validasi link kalau Online
                          if (isConfirm && isOnline && linkCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('Link meeting wajib diisi untuk sesi Online'),
                                backgroundColor: Colors.orange,
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            );
                            return;
                          }
                          Navigator.pop(dialogContext);
                          final newStatus = isConfirm ? 'Dikonfirmasi' : 'Ditolak';
                          final success = await provider.updateBookingStatus(
                            id,
                            newStatus,
                            linkMeeting: isConfirm && isOnline ? linkCtrl.text.trim() : null,
                          );
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(success
                                  ? (isConfirm
                                      ? 'Booking $name dikonfirmasi! ${isOnline ? "Link meeting terkirim." : ""}'
                                      : 'Booking $name berhasil ditolak.')
                                  : 'Gagal mengubah status booking.'),
                              backgroundColor: success
                                  ? (isConfirm ? AppColors.primary : const Color(0xFFEF4444))
                                  : Colors.red,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          backgroundColor: isConfirm
                              ? AppColors.primary
                              : const Color(0xFFEF4444),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          isConfirm ? 'Konfirmasi' : 'Ya, Tolak',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          maxLines: 1,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
