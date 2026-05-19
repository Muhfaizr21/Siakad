import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/counseling_session.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';

class BookCounselingScreen extends StatefulWidget {
  final String topic;
  final Psychologist? psychologist;

  const BookCounselingScreen({super.key, required this.topic, this.psychologist});

  @override
  State<BookCounselingScreen> createState() => _BookCounselingScreenState();
}

class _BookCounselingScreenState extends State<BookCounselingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  String _sessionMethod = 'Tatap Muka (Offline)';
  String _genderPreference = 'Bebas';
  DateTime? _selectedDate;
  String _selectedTime = '10:00 - 11:00';

  List<Map<String, dynamic>> _loadedSlots = [];
  bool _isLoadingSlots = false;
  Map<String, dynamic>? _selectedSlot;

  @override
  void initState() {
    super.initState();
    if (widget.psychologist != null) {
      _loadSlots();
    }
  }

  Future<void> _loadSlots() async {
    setState(() {
      _isLoadingSlots = true;
    });
    try {
      final slots = await context.read<StudentProvider>().getPsychologistSchedules(widget.psychologist!.id);
      if (mounted) {
        setState(() {
          _loadedSlots = slots;
          if (slots.isNotEmpty) {
            _selectedSlot = slots.first;
            _selectedTime = "${slots.first['start']} - ${slots.first['end']}";
            if (slots.first['next_date'] != null) {
              _selectedDate = DateTime.parse(slots.first['next_date']);
            }
          }
        });
      }
    } catch (e) {
      debugPrint('Error loading dynamic slots: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingSlots = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Form Pendaftaran Sesi', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTopicBanner(),
              const SizedBox(height: 32),
              _buildSectionTitle('Detail Keluhan'),
              const SizedBox(height: 12),
              _buildTextArea(_descriptionController, 'Ceritakan sedikit apa yang sedang kamu rasakan atau apa yang ingin kamu bahas...'),
              const SizedBox(height: 32),
              _buildSectionTitle('Preferensi Sesi'),
              const SizedBox(height: 12),
              _buildLabel('Metode Sesi'),
              _buildDropdown(['Tatap Muka (Offline)', 'Daring (Online via Zoom)'], _sessionMethod, (val) => setState(() => _sessionMethod = val!)),
              const SizedBox(height: 20),
              _buildLabel('Preferensi Gender Psikolog'),
              _buildDropdown(['Bebas', 'Laki-laki', 'Perempuan'], _genderPreference, (val) => setState(() => _genderPreference = val!)),
              const SizedBox(height: 32),
              _buildSectionTitle('Pilih Jadwal'),
              const SizedBox(height: 12),
              _buildDatePicker(),
              const SizedBox(height: 16),
              _buildTimeSelector(),
              const SizedBox(height: 48),
              _buildSubmitButton(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopicBanner() {
    return Column(
      children: [
        if (widget.psychologist != null) ...[
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.primary.withAlpha(15)),
              boxShadow: [BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 56,
                  height: 56,
                  child: ClipOval(
                    child: Image.network(
                      widget.psychologist!.profileImageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.primary.withAlpha(20),
                        child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 28),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Psikolog Pilihan', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                      Text(widget.psychologist!.name, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
                      Text(widget.psychologist!.specialization, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(10),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.primary.withAlpha(20)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                child: const Icon(Icons.psychology_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Topik Konseling', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                    Text(widget.topic, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.titleLg.copyWith(fontSize: 18));
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(text, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildTextArea(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      maxLines: 5,
      style: AppTextStyles.labelMd,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Mohon isi detail keluhan kamu' : null,
    );
  }

  Widget _buildDropdown(List<String> items, String value, Function(String?) onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: AppTextStyles.labelMd))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: DateTime.now().add(const Duration(days: 1)),
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 30)),
        );
        if (date != null) setState(() => _selectedDate = date);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.surfaceVariant),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded, size: 20, color: AppColors.outline),
            const SizedBox(width: 12),
            Text(
              _selectedDate == null ? 'Pilih Tanggal Sesi' : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
              style: AppTextStyles.labelMd.copyWith(color: _selectedDate == null ? AppColors.outline : AppColors.onSurfaceVariant),
            ),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.outline),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeSelector() {
    if (_isLoadingSlots) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(8.0),
          child: SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
          ),
        ),
      );
    }

    if (_loadedSlots.isNotEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _loadedSlots.map((slot) {
              final slotTime = "${slot['start']} - ${slot['end']}";
              final slotDisplay = slot['display'] ?? slotTime;
              final isSelected = _selectedSlot?['id'] == slot['id'];
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedSlot = slot;
                    _selectedTime = slotTime;
                    if (slot['next_date'] != null) {
                      _selectedDate = DateTime.parse(slot['next_date']);
                    }
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isSelected ? AppColors.primary : AppColors.surfaceVariant),
                  ),
                  child: Text(
                    slotDisplay,
                    style: AppTextStyles.labelSm.copyWith(
                      color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          if (_selectedSlot != null && _selectedSlot!['location'] != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(8),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withAlpha(15)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Lokasi Sesi: ${_selectedSlot!['location']}',
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      );
    }

    final times = ['09:00 - 10:00', '10:00 - 11:00', '13:00 - 14:00', '14:00 - 15:00'];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: times.map((t) {
        bool isSelected = _selectedTime == t;
        return InkWell(
          onTap: () => setState(() => _selectedTime = t),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isSelected ? AppColors.primary : AppColors.surfaceVariant),
            ),
            child: Text(
              t,
              style: AppTextStyles.labelSm.copyWith(
                color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 58,
      child: ElevatedButton(
        onPressed: () => _submitForm(),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 4,
        ),
        child: Text('Kirim Pendaftaran Sesi', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate() && _selectedDate != null) {
      final packedId = widget.psychologist != null
          ? "${widget.psychologist!.id}:${_selectedSlot != null ? _selectedSlot!['id'] : ''}"
          : 'UNASSIGNED';

      final newSession = CounselingSession(
        id: 'C${DateTime.now().millisecondsSinceEpoch}',
        psychologistId: packedId,
        psychologistName: widget.psychologist?.name ?? 'Psikolog Pilihan (Menunggu Konfirmasi)',
        topic: widget.topic,
        date: _selectedDate!,
        time: _selectedTime,
        location: _selectedSlot != null ? _selectedSlot!['location'] : 'Gedung Rektorat Lt. 2 (Ruang Konseling)',
        status: 'Scheduled',
        notes: _descriptionController.text,
      );
      context.read<StudentProvider>().bookCounseling(newSession);
      _showSuccessDialog();
    } else if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mohon pilih tanggal sesi terlebih dahulu')));
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 80),
            const SizedBox(height: 24),
            Text('Pendaftaran Berhasil!', style: AppTextStyles.titleLg),
            const SizedBox(height: 12),
            Text(
              'Sesi konseling kamu telah dijadwalkan. Mohon tunggu konfirmasi psikolog melalui notifikasi aplikasi.',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Tutup', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
