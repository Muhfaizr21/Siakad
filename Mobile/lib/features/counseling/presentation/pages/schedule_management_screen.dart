import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class ScheduleManagementScreen extends StatefulWidget {
  const ScheduleManagementScreen({super.key});

  @override
  State<ScheduleManagementScreen> createState() =>
      _ScheduleManagementScreenState();
}

class _ScheduleManagementScreenState extends State<ScheduleManagementScreen> {
  DateTime selectedDate = DateTime.now();

  // State lokal slot — TIDAK pernah di-overwrite setelah user edit
  Map<String, List<Map<String, dynamic>>> _slotsByDay = {};
  bool _isDirty = false;
  bool _isSaving = false;
  bool _initialLoaded = false;

  String get _selectedDayName => _indonesianDayName(selectedDate.weekday);
  List<Map<String, dynamic>> get _slotsForSelectedDate =>
      _slotsByDay[_selectedDayName] ?? [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final provider = context.read<CounselingProvider>();
      await provider.loadSchedules();
      if (mounted && !_initialLoaded) {
        _loadFromBackend(provider.schedules);
      }
    });
  }

  /// Hanya dipanggil SEKALI saat pertama load, atau saat user refresh manual
  void _loadFromBackend(List<Map<String, dynamic>> schedules) {
    final map = <String, List<Map<String, dynamic>>>{};
    for (final dayData in schedules) {
      final day = dayData['day']?.toString() ?? '';
      final slots = dayData['slots'];
      if (slots is List) {
        map[day] = slots.map((slot) {
          final s = Map<String, dynamic>.from(slot as Map<String, dynamic>);
          // is_available dari backend (field is_available atau fallback ke true)
          if (!s.containsKey('is_available')) {
            s['is_available'] = true;
          }
          return s;
        }).toList();
      } else {
        map[day] = [];
      }
    }
    if (mounted) {
      setState(() {
        _slotsByDay = map;
        _initialLoaded = true;
        _isDirty = false;
      });
    }
  }

  /// Build payload untuk dikirim ke backend
  List<Map<String, dynamic>> _buildPayload() {
    const allDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return allDays.map((day) {
      final slots = _slotsByDay[day] ?? [];
      final hasActive = slots.any((s) => s['is_available'] == true);
      return {
        'day': day,
        'enabled': hasActive,
        'slots': slots.map((slot) => {
          'kategori': slot['kategori'] ?? 'Personal',
          'start': slot['start'] ?? '',
          'end': slot['end'] ?? '',
          'lokasi': slot['lokasi'] ?? '',
          'kuota': slot['kuota'] ?? 1,
          'is_available': slot['is_available'] ?? true,
        }).toList(),
      };
    }).toList();
  }

  Future<void> _saveSchedules() async {
    setState(() => _isSaving = true);
    final provider = context.read<CounselingProvider>();
    final payload = _buildPayload();
    final success = await provider.saveSchedules(payload);
    if (!mounted) return;

    setState(() {
      _isSaving = false;
      // JANGAN sync dari provider — state lokal sudah benar
      // Hanya tandai tidak dirty kalau berhasil
      if (success) _isDirty = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Jadwal berhasil disimpan!' : 'Gagal menyimpan jadwal.'),
        backgroundColor: success ? AppColors.primary : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _toggleSlotAvailability(int index, bool value) {
    setState(() {
      final slots = List<Map<String, dynamic>>.from(_slotsForSelectedDate);
      slots[index] = {...slots[index], 'is_available': value};
      _slotsByDay = {..._slotsByDay, _selectedDayName: slots};
      _isDirty = true;
    });
  }



  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        if (provider.schedulesLoading && !_initialLoaded) {
          return Scaffold(
            backgroundColor: const Color(0xFFF8FAFC),
            body: CustomScrollView(
              slivers: [
                const BkuAppBar(
                  title: 'Kelola Jadwal',
                  info: 'Atur waktu ketersediaan sesi konseling',
                  isExpandable: false,
                  variant: AppBarVariant.psychologist,
                  showBackButton: true,
                  showNotification: true,
                ),
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 80),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ),
              ],
            ),
          );
        }

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              const BkuAppBar(
                title: 'Kelola Jadwal',
                info: 'Atur waktu ketersediaan sesi konseling',
                isExpandable: false,
                variant: AppBarVariant.psychologist,
                showBackButton: true,
                showNotification: true,
              ),
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildCalendarHeader(),
                    _buildCalendarStrip(),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildSectionTitle('Slot Waktu'),
                              GestureDetector(
                                onTap: () async {
                                  final p = context.read<CounselingProvider>();
                                  await context.push(AppRoutes.addScheduleSlot);
                                  if (!mounted) return;
                                  await p.loadSchedules();
                                  // Setelah tambah slot baru, reload dari backend
                                  _initialLoaded = false;
                                  _loadFromBackend(p.schedules);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withAlpha(15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.add_rounded, size: 18, color: AppColors.primary),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Tambah Slot',
                                        style: AppTextStyles.labelSm.copyWith(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          _buildTimeSlotsList(),
                          const SizedBox(height: 32),
                          _buildBulkActions(),
                          const SizedBox(height: 120),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          floatingActionButton: _isDirty
              ? FadeInAnimation(
                  delay: 0.2,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withAlpha(60),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: FloatingActionButton.extended(
                      onPressed: _isSaving ? null : _saveSchedules,
                      backgroundColor: AppColors.primary,
                      elevation: 0,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                      label: Text(
                        _isSaving ? 'Menyimpan...' : 'Simpan Perubahan',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                )
              : null,
        );
      },
    );
  }

  Widget _buildCalendarHeader() {
    const monthNames = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${monthNames[selectedDate.month]} ${selectedDate.year}',
                style: AppTextStyles.titleMd.copyWith(
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0F172A),
                ),
              ),
              Text(
                'Pilih tanggal untuk mengatur slot',
                style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.grey.withAlpha(30)),
            ),
            child: const Icon(Icons.calendar_today_rounded, size: 18, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarStrip() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 14,
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final isSelected = date.day == selectedDate.day && date.month == selectedDate.month;
          final dayName = _indonesianDayName(date.weekday);
          final slots = _slotsByDay[dayName] ?? [];
          final hasActiveSlot = slots.any((s) => s['is_available'] == true);

          return GestureDetector(
            onTap: () => setState(() => selectedDate = date),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: 72,
              margin: const EdgeInsets.only(right: 12, top: 4, bottom: 4),
              decoration: BoxDecoration(
                gradient: isSelected
                    ? const LinearGradient(
                        colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)], // Bright Blue Gradient
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: isSelected ? null : Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: isSelected
                    ? [BoxShadow(color: const Color(0xFF2563EB).withAlpha(80), blurRadius: 16, offset: const Offset(0, 8))]
                    : [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 8, offset: const Offset(0, 4))],
                border: isSelected ? null : Border.all(color: Colors.grey.withAlpha(20), width: 1.5),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _shortDay(date.weekday),
                    style: TextStyle(
                      color: isSelected ? Colors.white.withAlpha(200) : const Color(0xFF64748B),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    date.day.toString(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF0F172A),
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      height: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Colors.white
                          : hasActiveSlot
                              ? const Color(0xFF10B981)
                              : Colors.transparent,
                      shape: BoxShape.circle,
                      boxShadow: hasActiveSlot && !isSelected
                          ? [BoxShadow(color: const Color(0xFF10B981).withAlpha(100), blurRadius: 4)]
                          : null,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimeSlotsList() {
    final slots = _slotsForSelectedDate;

    if (slots.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.grey.withAlpha(20)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 24,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.event_busy_rounded, size: 48, color: const Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 24),
            Text(
              'Jadwal Kosong',
              style: AppTextStyles.titleLg.copyWith(color: const Color(0xFF1E293B), fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              'Tidak ada slot untuk $_selectedDayName. Ketuk "Tambah Slot" untuk menjadwalkan sesi konseling.',
              style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF64748B), height: 1.5),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: slots.length,
      itemBuilder: (context, index) {
        final slot = slots[index];
        final start = slot['start']?.toString() ?? '';
        final end = slot['end']?.toString() ?? '';
        final kategori = slot['kategori']?.toString() ?? 'Personal';
        final lokasi = slot['lokasi']?.toString() ?? '';
        final kuota = (slot['kuota'] as num?)?.toInt() ?? 1;
        final isAvailable = slot['is_available'] == true;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: isAvailable
                ? [BoxShadow(color: Colors.black.withAlpha(4), blurRadius: 10, offset: const Offset(0, 4))]
                : [],
            border: Border.all(
              color: isAvailable ? Colors.grey.withAlpha(20) : Colors.grey.withAlpha(40),
              width: 1,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Left colored accent line
                  Container(
                    width: 4,
                    color: isAvailable ? const Color(0xFF10B981) : const Color(0xFFCBD5E1),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.access_time_rounded,
                                      size: 14,
                                      color: isAvailable ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '$start - $end',
                                      style: AppTextStyles.titleSm.copyWith(
                                        fontWeight: FontWeight.w800,
                                        color: isAvailable ? const Color(0xFF1E293B) : const Color(0xFF94A3B8),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: [
                                    _buildSlotChip(kategori, isAvailable ? AppColors.primary : const Color(0xFF94A3B8), isAvailable),
                                    if (lokasi.isNotEmpty) _buildSlotChip(lokasi, isAvailable ? const Color(0xFF06B6D4) : const Color(0xFF94A3B8), isAvailable),
                                    _buildSlotChip(kuota == 1 ? '1 Pasien' : 'Maks $kuota', isAvailable ? const Color(0xFFF59E0B) : const Color(0xFF94A3B8), isAvailable),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Transform.scale(
                                scale: 0.8,
                                child: Switch.adaptive(
                                  value: isAvailable,
                                  activeColor: const Color(0xFF10B981),
                                  activeTrackColor: const Color(0xFF10B981).withAlpha(50),
                                  inactiveThumbColor: const Color(0xFFCBD5E1),
                                  inactiveTrackColor: const Color(0xFFF1F5F9),
                                  onChanged: (value) => _toggleSlotAvailability(index, value),
                                ),
                              ),
                              Text(
                                isAvailable ? 'Aktif' : 'Tutup',
                                style: TextStyle(
                                  color: isAvailable ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBulkActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.flash_on_rounded, color: AppColors.primary, size: 20),
            const SizedBox(width: 8),
            Text(
              'Aksi Cepat Harian',
              style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B)),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.withAlpha(20)),
            boxShadow: [
              BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            children: [
              _buildActionTile(
                icon: Icons.check_circle_outline_rounded,
                color: const Color(0xFF10B981),
                title: 'Aktifkan Semua Slot',
                subtitle: 'Buka semua slot jadwal di hari ini',
                onTap: () {
                  setState(() {
                    final slots = List<Map<String, dynamic>>.from(_slotsForSelectedDate);
                    _slotsByDay = {
                      ..._slotsByDay,
                      _selectedDayName: slots.map((s) => {...s, 'is_available': true}).toList(),
                    };
                    _isDirty = true;
                  });
                },
                isTop: true,
              ),
              Divider(height: 1, color: Colors.grey.withAlpha(20)),
              _buildActionTile(
                icon: Icons.block_rounded,
                color: const Color(0xFFEF4444),
                title: 'Nonaktifkan Semua Slot',
                subtitle: 'Tutup sementara semua slot hari ini',
                onTap: () {
                  setState(() {
                    final slots = List<Map<String, dynamic>>.from(_slotsForSelectedDate);
                    _slotsByDay = {
                      ..._slotsByDay,
                      _selectedDayName: slots.map((s) => {...s, 'is_available': false}).toList(),
                    };
                    _isDirty = true;
                  });
                },
                isTop: false,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required bool isTop,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.vertical(
        top: isTop ? const Radius.circular(16) : Radius.zero,
        bottom: !isTop ? const Radius.circular(16) : Radius.zero,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withAlpha(15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: const Color(0xFF1E293B),
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: const Color(0xFF94A3B8),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.grey.withAlpha(100), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(color: const Color(0xFF0F172A), fontWeight: FontWeight.w900),
    );
  }

  Widget _buildSlotChip(String label, Color color, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? color.withAlpha(15) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isActive ? color : const Color(0xFF94A3B8),
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  String _shortDay(int weekday) {
    const days = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
    return days[weekday - 1];
  }

  String _indonesianDayName(int weekday) {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return days[weekday - 1];
  }
}
