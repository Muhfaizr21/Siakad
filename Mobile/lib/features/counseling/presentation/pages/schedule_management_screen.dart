import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

class ScheduleManagementScreen extends StatefulWidget {
  const ScheduleManagementScreen({super.key});

  @override
  State<ScheduleManagementScreen> createState() => _ScheduleManagementScreenState();
}

class _ScheduleManagementScreenState extends State<ScheduleManagementScreen> {
  DateTime selectedDate = DateTime.now();
  
  // Mock data for time slots
  final List<Map<String, dynamic>> timeSlots = [
    {'time': '08:00 - 09:00', 'isAvailable': true, 'isBooked': false},
    {'time': '09:00 - 10:00', 'isAvailable': true, 'isBooked': true, 'patient': 'Andi Wijaya'},
    {'time': '10:00 - 11:00', 'isAvailable': false, 'isBooked': false},
    {'time': '11:00 - 12:00', 'isAvailable': true, 'isBooked': false},
    {'time': '13:00 - 14:00', 'isAvailable': true, 'isBooked': false},
    {'time': '14:00 - 15:00', 'isAvailable': true, 'isBooked': true, 'patient': 'Siti Aminah'},
    {'time': '15:00 - 16:00', 'isAvailable': true, 'isBooked': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
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
                            onTap: () => context.push(AppRoutes.addScheduleSlot),
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
      floatingActionButton: FadeInAnimation(
        delay: 1.0,
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
            onPressed: () {},
            backgroundColor: AppColors.primary,
            elevation: 0,
            icon: const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            label: const Text(
              'Simpan Perubahan',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 0.5),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCalendarHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Mei 2026',
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
      height: 90,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: 14,
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final isSelected = date.day == selectedDate.day && date.month == selectedDate.month;
          
          return GestureDetector(
            onTap: () => setState(() => selectedDate = date),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 64,
              margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                gradient: isSelected 
                  ? const LinearGradient(
                      colors: [Color(0xFF003399), Color(0xFF001A4D)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
                color: isSelected ? null : Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: isSelected ? [
                  BoxShadow(
                    color: const Color(0xFF003399).withAlpha(60),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  )
                ] : [
                  BoxShadow(
                    color: Colors.black.withAlpha(5),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  )
                ],
                border: isSelected ? null : Border.all(color: Colors.grey.withAlpha(30)),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _getDayName(date.weekday),
                    style: TextStyle(
                      color: isSelected ? Colors.white70 : const Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    date.day.toString(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF1E293B),
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  if (isSelected)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      width: 4,
                      height: 4,
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
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
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: timeSlots.length,
      itemBuilder: (context, index) {
        final slot = timeSlots[index];
        final bool isBooked = slot['isBooked'];
        
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: (isBooked ? Colors.orange : Colors.black).withAlpha(5),
                blurRadius: 15,
                offset: const Offset(0, 6),
              ),
            ],
            border: isBooked ? Border.all(color: Colors.orange.withAlpha(50), width: 1.5) : null,
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (isBooked ? Colors.orange : AppColors.primary).withAlpha(15),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        isBooked ? Icons.assignment_turned_in_rounded : Icons.schedule_rounded,
                        color: isBooked ? Colors.orange : AppColors.primary,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            slot['time'],
                            style: AppTextStyles.bodyLg.copyWith(
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: isBooked ? Colors.orange : (slot['isAvailable'] ? Colors.green : Colors.red),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isBooked ? 'Sudah Dipesan' : (slot['isAvailable'] ? 'Siap Konseling' : 'Dinonaktifkan'),
                                style: AppTextStyles.labelSm.copyWith(
                                  color: isBooked ? Colors.orange : (slot['isAvailable'] ? Colors.green : Colors.red),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    if (!isBooked)
                      Switch.adaptive(
                        value: slot['isAvailable'],
                        activeColor: const Color(0xFF003399),
                        onChanged: (value) {
                          setState(() {
                            timeSlots[index]['isAvailable'] = value;
                          });
                        },
                      ),
                  ],
                ),
              ),
              if (isBooked)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withAlpha(8),
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 12,
                        backgroundColor: Colors.orange,
                        child: Icon(Icons.person_rounded, size: 14, color: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        slot['patient'],
                        style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                      ),
                      const Spacer(),
                      Text(
                        'Detail Sesi',
                        style: AppTextStyles.labelSm.copyWith(color: Colors.orange, fontWeight: FontWeight.bold),
                      ),
                      const Icon(Icons.chevron_right_rounded, color: Colors.orange, size: 16),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBulkActions() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 12),
              Text(
                'Aksi Cepat',
                style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Set Berhalangan'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text('Salin ke Besok'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        color: const Color(0xFF0F172A),
        fontWeight: FontWeight.w900,
      ),
    );
  }

  String _getDayName(int weekday) {
    switch (weekday) {
      case 1: return 'SEN';
      case 2: return 'SEL';
      case 3: return 'RAB';
      case 4: return 'KAM';
      case 5: return 'JUM';
      case 6: return 'SAB';
      case 7: return 'MIN';
      default: return '';
    }
  }
}
