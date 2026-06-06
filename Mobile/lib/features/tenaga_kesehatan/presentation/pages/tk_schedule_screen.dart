import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_schedule_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/schedule.dart';

class TkScheduleScreen extends StatefulWidget {
  final bool showBackButton;

  const TkScheduleScreen({
    super.key,
    this.showBackButton = true,
  });

  @override
  State<TkScheduleScreen> createState() => _TkScheduleScreenState();
}

class _TkScheduleScreenState extends State<TkScheduleScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkScheduleProvider>().loadSchedules();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Jadwal Praktik',
          style: AppTextStyles.titleMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_rounded, color: AppColors.primary),
            onPressed: () => context.push('/tk/add-schedule'),
          ),
        ],
      ),
      body: Consumer<TkScheduleProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.schedules.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_available_rounded, size: 64, color: AppColors.neutral300),
                  const SizedBox(height: 16),
                  Text(
                    'Belum ada jadwal praktik',
                    style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/tk/add-schedule'),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Buat Jadwal Baru'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            );
          }

          // Group schedules by date
          final groupedSchedules = _groupSchedulesByDate(provider.schedules);

          return RefreshIndicator(
            onRefresh: () => provider.loadSchedules(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: groupedSchedules.length,
              itemBuilder: (context, index) {
                final entry = groupedSchedules.entries.elementAt(index);
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        entry.key,
                        style: AppTextStyles.labelSm.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    ...entry.value.map((schedule) => _buildScheduleCard(schedule)),
                  ],
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/tk/add-schedule'),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Buat Jadwal', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Map<String, List<Schedule>> _groupSchedulesByDate(List<Schedule> schedules) {
    final grouped = <String, List<Schedule>>{};
    for (final schedule in schedules) {
      final dateKey = _formatDate(schedule.tanggal);
      grouped.putIfAbsent(dateKey, () => []).add(schedule);
    }
    return grouped;
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    final scheduleDate = DateTime(date.year, date.month, date.day);

    if (scheduleDate == today) {
      return 'Hari Ini';
    } else if (scheduleDate == tomorrow) {
      return 'Besok';
    } else {
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return '${date.day} ${months[date.month - 1]} ${date.year}';
    }
  }

  Widget _buildScheduleCard(Schedule schedule) {
    return Dismissible(
      key: Key('schedule_${schedule.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.danger,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_rounded, color: Colors.white),
      ),
      confirmDismiss: (direction) async {
        return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Hapus Jadwal'),
            content: const Text('Yakin ingin menghapus jadwal ini?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                child: const Text('Hapus'),
              ),
            ],
          ),
        );
      },
      onDismissed: (direction) {
        context.read<TkScheduleProvider>().deleteSchedule(schedule.id);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Jadwal berhasil dihapus'),
            backgroundColor: AppColors.success,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.neutral200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.schedule_rounded, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        schedule.tipeLayanan,
                        style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.access_time_rounded, size: 14, color: AppColors.neutral500),
                          const SizedBox(width: 4),
                          Text(
                            schedule.waktuFormat,
                            style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: schedule.hasKuota
                        ? AppColors.success.withAlpha(20)
                        : AppColors.danger.withAlpha(20),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    schedule.hasKuota
                        ? 'Sisa: ${schedule.availableSlots}'
                        : 'Penuh',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: schedule.hasKuota ? AppColors.success : AppColors.danger,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.location_on_rounded, size: 14, color: AppColors.neutral500),
                const SizedBox(width: 4),
                Text(
                  schedule.lokasi,
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                ),
                const Spacer(),
                Text(
                  'Kuota: ${schedule.kuota}',
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral400),
                ),
              ],
            ),
            if (schedule.catatan != null && schedule.catatan!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.neutral100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.note_rounded, size: 14, color: AppColors.neutral500),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        schedule.catatan!,
                        style: AppTextStyles.labelSm.copyWith(
                          color: AppColors.neutral600,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
