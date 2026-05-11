import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

class OrmawaKalenderScreen extends StatefulWidget {
  const OrmawaKalenderScreen({super.key});

  @override
  State<OrmawaKalenderScreen> createState() => _OrmawaKalenderScreenState();
}

class _OrmawaKalenderScreenState extends State<OrmawaKalenderScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().refreshData();
    });
  }

  List<OrmawaAgenda> _getEventsForDay(DateTime day, List<OrmawaAgenda> allAgendas) {
    return allAgendas.where((agenda) => isSameDay(agenda.date, day)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final selectedEvents = _getEventsForDay(_selectedDay ?? _focusedDay, provider.agendas);

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            slivers: [
              BkuAppBar(
                variant: AppBarVariant.ormawa,
                title: 'JADWAL KALENDER',
                subtitle: 'AGENDA & KEGIATAN',
                expandedHeight: 160.0,
                showBackButton: true,
                isExpandable: false,
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildCalendarCard(provider.agendas),
                      const SizedBox(height: 24),
                      _buildHeaderActions(selectedEvents.length),
                      const SizedBox(height: 16),
                      if (provider.isLoading)
                        const Center(child: CircularProgressIndicator())
                      else if (selectedEvents.isEmpty)
                        _buildEmptyState()
                      else
                        _buildAgendaList(selectedEvents),
                    ],
                  ),
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _showAddJadwal(context),
            backgroundColor: AppColors.primary,
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: const Text('Tambah Kegiatan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        );
      },
    );
  }

  Widget _buildCalendarCard(List<OrmawaAgenda> agendas) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: TableCalendar<OrmawaAgenda>(
        firstDay: DateTime.utc(2020, 1, 1),
        lastDay: DateTime.utc(2030, 12, 31),
        focusedDay: _focusedDay,
        calendarFormat: _calendarFormat,
        selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
        eventLoader: (day) => _getEventsForDay(day, agendas),
        startingDayOfWeek: StartingDayOfWeek.monday,
        onDaySelected: (selectedDay, focusedDay) {
          setState(() {
            _selectedDay = selectedDay;
            _focusedDay = focusedDay;
          });
        },
        onFormatChanged: (format) {
          setState(() {
            _calendarFormat = format;
          });
        },
        calendarStyle: CalendarStyle(
          outsideDaysVisible: false,
          markerDecoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          todayDecoration: BoxDecoration(
            color: AppColors.primary.withAlpha(40),
            shape: BoxShape.circle,
          ),
          selectedDecoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          todayTextStyle: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
        ),
        headerStyle: HeaderStyle(
          formatButtonVisible: true,
          titleCentered: true,
          formatButtonDecoration: BoxDecoration(
            color: AppColors.primary.withAlpha(20),
            borderRadius: BorderRadius.circular(12),
          ),
          formatButtonTextStyle: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildHeaderActions(int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              DateFormat('EEEE, d MMMM').format(_selectedDay ?? _focusedDay).toUpperCase(),
              style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.bold),
            ),
            Text(
              '$count AGENDA DITEMUKAN',
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16),
            ),
          ],
        ),
        IconButton(
          onPressed: () => context.read<OrmawaProvider>().refreshData(),
          icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40),
      width: double.infinity,
      child: Column(
        children: [
          Icon(Icons.event_busy_rounded, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'Tidak ada agenda di tanggal ini',
            style: AppTextStyles.bodyMd.copyWith(color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Widget _buildAgendaList(List<OrmawaAgenda> agendas) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: agendas.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final agenda = agendas[index];
        return _buildAgendaCard(agenda);
      },
    );
  }

  Widget _buildAgendaCard(OrmawaAgenda agenda) {
    Color statusColor;
    switch (agenda.status.toLowerCase()) {
      case 'terlaksana':
      case 'selesai':
        statusColor = Colors.green;
        break;
      case 'berlangsung':
        statusColor = Colors.orange;
        break;
      case 'batal':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.blue;
    }

    return Container(
      padding: const EdgeInsets.all(16),
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
                decoration: BoxDecoration(color: statusColor.withAlpha(20), borderRadius: BorderRadius.circular(8)),
                child: Text(
                  agenda.status.toUpperCase(),
                  style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.w900, fontSize: 10),
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_horiz_rounded, color: Color(0xFF94A3B8)),
                onSelected: (value) {
                  if (value == 'delete') {
                    _confirmDelete(context, agenda);
                  } else if (value == 'edit') {
                    _showEditJadwal(context, agenda);
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'edit', child: Row(children: [Icon(Icons.edit_rounded, size: 18), SizedBox(width: 8), Text('Edit')])),
                  const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red), SizedBox(width: 8), Text('Hapus', style: TextStyle(color: Colors.red))])),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(agenda.title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
          if (agenda.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(agenda.description, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B))),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF94A3B8)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  agenda.location,
                  style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 16),
              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF94A3B8)),
              const SizedBox(width: 8),
              Text(
                '${DateFormat('HH:mm').format(agenda.date)} - ${DateFormat('HH:mm').format(agenda.endDate)}',
                style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, OrmawaAgenda agenda) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Agenda?'),
        content: Text('Apakah Anda yakin ingin menghapus "${agenda.title}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('BATAL')),
          TextButton(
            onPressed: () {
              context.read<OrmawaProvider>().deleteAgenda(agenda.id);
              Navigator.pop(context);
            },
            child: const Text('HAPUS', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showAddJadwal(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OrmawaFormJadwalScreen(selectedDate: _selectedDay ?? _focusedDay),
      ),
    );
  }

  void _showEditJadwal(BuildContext context, OrmawaAgenda agenda) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OrmawaFormJadwalScreen(selectedDate: agenda.date, agenda: agenda),
      ),
    );
  }
}

class OrmawaFormJadwalScreen extends StatefulWidget {
  final DateTime selectedDate;
  final OrmawaAgenda? agenda;
  const OrmawaFormJadwalScreen({super.key, required this.selectedDate, this.agenda});

  @override
  State<OrmawaFormJadwalScreen> createState() => _OrmawaFormJadwalScreenState();
}

class _OrmawaFormJadwalScreenState extends State<OrmawaFormJadwalScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  String _selectedStatus = 'Direncanakan';
  late DateTime _startDate;
  late TimeOfDay _startTime;
  late TimeOfDay _endTime;

  @override
  void initState() {
    super.initState();
    _startDate = widget.selectedDate;
    
    if (widget.agenda != null) {
      _titleController.text = widget.agenda!.title;
      _descriptionController.text = widget.agenda!.description;
      _locationController.text = widget.agenda!.location;
      _selectedStatus = widget.agenda!.status;
      _startTime = TimeOfDay.fromDateTime(widget.agenda!.date);
      _endTime = TimeOfDay.fromDateTime(widget.agenda!.endDate);
    } else {
      _startTime = TimeOfDay.now();
      _endTime = TimeOfDay(hour: (_startTime.hour + 2) % 24, minute: _startTime.minute);
    }
  }

  void _submit() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Judul tidak boleh kosong')));
      return;
    }

    final DateTime fullStartDate = DateTime(
      _startDate.year,
      _startDate.month,
      _startDate.day,
      _startTime.hour,
      _startTime.minute,
    );

    final DateTime fullEndDate = DateTime(
      _startDate.year,
      _startDate.month,
      _startDate.day,
      _endTime.hour,
      _endTime.minute,
    );

    if (fullEndDate.isBefore(fullStartDate)) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Waktu selesai tidak boleh sebelum waktu mulai')));
       return;
    }

    final data = {
      'Judul': _titleController.text,
      'Deskripsi': _descriptionController.text,
      'TanggalMulai': fullStartDate.toIso8601String(),
      'TanggalSelesai': fullEndDate.toIso8601String(),
      'Lokasi': _locationController.text,
      'Status': _selectedStatus,
    };

    try {
      if (widget.agenda != null) {
        await context.read<OrmawaProvider>().updateAgenda(widget.agenda!.id, data);
      } else {
        await context.read<OrmawaProvider>().addAgenda(data);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal menyimpan: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.agenda != null;
    
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: isEdit ? 'EDIT KEGIATAN' : 'JADWALKAN KEGIATAN',
            subtitle: 'EVENT REGISTRY',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader(isEdit),
                  const SizedBox(height: 32),
                  _buildTextField('NAMA KEGIATAN', 'Nama kegiatan...', _titleController, Icons.title_rounded),
                  const SizedBox(height: 20),
                  _buildDateTimePicker(),
                  const SizedBox(height: 20),
                  _buildTextField('LOKASI', 'Gedung / Ruang...', _locationController, Icons.location_on_rounded),
                  const SizedBox(height: 20),
                  _buildStatusDropdown(),
                  const SizedBox(height: 20),
                  _buildTextField('DESKRIPSI', 'Keterangan...', _descriptionController, Icons.description_rounded, maxLines: 3),
                  const SizedBox(height: 40),
                  _buildActionButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(bool isEdit) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(12)),
          child: Icon(isEdit ? Icons.edit_calendar_rounded : Icons.event_available_rounded, color: AppColors.primary),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('REGISTRASI AGENDA', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 8)),
              Text(isEdit ? 'PERBARUI DATA' : 'KEGIATAN BARU', style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(String label, String hint, TextEditingController controller, IconData icon, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: 20),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          ),
        ),
      ],
    );
  }

  Widget _buildDateTimePicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () async {
                  final date = await showDatePicker(context: context, initialDate: _startDate, firstDate: DateTime(2020), lastDate: DateTime(2030));
                  if (date != null) setState(() => _startDate = date);
                },
                child: _buildInfoBox('TANGGAL', DateFormat('dd/MM/yyyy').format(_startDate), Icons.calendar_month_rounded),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () async {
                  final time = await showTimePicker(context: context, initialTime: _startTime);
                  if (time != null) setState(() => _startTime = time);
                },
                child: _buildInfoBox('MULAI', _startTime.format(context), Icons.access_time_rounded),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: InkWell(
                onTap: () async {
                  final time = await showTimePicker(context: context, initialTime: _endTime);
                  if (time != null) setState(() => _endTime = time);
                },
                child: _buildInfoBox('SELESAI', _endTime.format(context), Icons.access_time_rounded),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoBox(String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Row(children: [Icon(icon, size: 18, color: Colors.grey), const SizedBox(width: 8), Text(value)]),
        ),
      ],
    );
  }

  Widget _buildStatusDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('STATUS', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedStatus,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.flag_rounded, size: 20),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          ),
          items: ['Direncanakan', 'Persiapan', 'Berlangsung', 'Terlaksana', 'Batal'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
          onChanged: (v) => setState(() => _selectedStatus = v!),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(child: TextButton(onPressed: () => Navigator.pop(context), child: const Text('BATAL'))),
        const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: _submit,
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF001F5C), padding: const EdgeInsets.all(16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: Text(widget.agenda != null ? 'PERBARUI AGENDA' : 'SIMPAN JADWAL', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }
}
