import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class AddScheduleSlotScreen extends StatefulWidget {
  const AddScheduleSlotScreen({super.key});

  @override
  State<AddScheduleSlotScreen> createState() => _AddScheduleSlotScreenState();
}

class _AddScheduleSlotScreenState extends State<AddScheduleSlotScreen> {
  TimeOfDay startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay endTime = const TimeOfDay(hour: 9, minute: 0);
  String selectedDay = 'Senin';
  final TextEditingController roomController = TextEditingController(text: 'Ruang Konseling A');
  bool isRecurring = false;
  
  final List<String> days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  Future<void> _selectTime(BuildContext context, bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStart ? startTime : endTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: Color(0xFF1E293B),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          startTime = picked;
          if (endTime.hour < startTime.hour || 
             (endTime.hour == startTime.hour && endTime.minute <= startTime.minute)) {
            endTime = TimeOfDay(hour: (startTime.hour + 1) % 24, minute: startTime.minute);
          }
        } else {
          endTime = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'Tambah Slot',
            info: 'Lengkapi formulir jadwal ketersediaan',
            isExpandable: false,
            variant: AppBarVariant.psychologist,
            showBackButton: true,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFormSection(
                    'Informasi Dasar',
                    [
                      _buildLabel('Pilih Hari'),
                      _buildDayDropdown(),
                      const SizedBox(height: 20),
                      _buildLabel('Lokasi / Ruangan'),
                      _buildRoomTextField(),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildFormSection(
                    'Pengaturan Waktu',
                    [
                      Row(
                        children: [
                          Expanded(
                            child: _buildTimePickerField(
                              'Mulai',
                              startTime.format(context),
                              () => _selectTime(context, true),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildTimePickerField(
                              'Selesai',
                              endTime.format(context),
                              () => _selectTime(context, false),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildFormSection(
                    'Opsi Lainnya',
                    [
                      _buildOptionTile(
                        'Ulangi Setiap Minggu',
                        'Aktifkan ketersediaan otomatis',
                        isRecurring,
                        (val) => setState(() => isRecurring = val),
                      ),
                    ],
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomAction(),
    );
  }

  Widget _buildFormSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.titleMd.copyWith(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(5),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
            border: Border.all(color: Colors.grey.withAlpha(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        label,
        style: AppTextStyles.labelSm.copyWith(
          color: const Color(0xFF64748B),
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildDayDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedDay,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
          items: days.map((String day) {
            return DropdownMenuItem<String>(
              value: day,
              child: Text(day, style: AppTextStyles.bodyLg),
            );
          }).toList(),
          onChanged: (String? newValue) {
            if (newValue != null) setState(() => selectedDay = newValue);
          },
        ),
      ),
    );
  }

  Widget _buildRoomTextField() {
    return TextField(
      controller: roomController,
      style: AppTextStyles.bodyLg,
      decoration: InputDecoration(
        hintText: 'Misal: Ruang Konseling A',
        filled: true,
        fillColor: const Color(0xFFF1F5F9),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        prefixIcon: const Icon(Icons.meeting_room_rounded, color: AppColors.primary, size: 20),
      ),
    );
  }

  Widget _buildTimePickerField(String label, String time, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontSize: 10),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.access_time_rounded, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  time,
                  style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionTile(String title, String desc, bool value, Function(bool) onChanged) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.bold)),
              Text(desc, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B))),
            ],
          ),
        ),
        Switch.adaptive(
          value: value,
          activeColor: AppColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }


  Widget _buildBottomAction() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0, -5)),
        ],
      ),
      child: SafeArea(
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 0,
          ),
          child: const Text(
            'Simpan Slot Jadwal',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5),
          ),
        ),
      ),
    );
  }


}
