import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/core/widgets/ormawa_list_header.dart';

class OrmawaKalenderScreen extends StatefulWidget {
  const OrmawaKalenderScreen({super.key});

  @override
  State<OrmawaKalenderScreen> createState() => _OrmawaKalenderScreenState();
}

class _OrmawaKalenderScreenState extends State<OrmawaKalenderScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _filterStatus = 'Semua';

  final List<String> _statusOptions = ['Semua', 'Direncanakan', 'Berlangsung', 'Selesai'];

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _searchController.addListener(() {
      setState(() => _searchQuery = _searchController.text.toLowerCase());
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().refreshData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<OrmawaAgenda> _getEventsForDay(
    DateTime day,
    List<OrmawaAgenda> allAgendas,
  ) {
    return allAgendas.where((agenda) {
      final matchesDate = isSameDay(agenda.date, day);
      final matchesStatus = _filterStatus == 'Semua' ||
          agenda.status.toLowerCase() == _filterStatus.toLowerCase();
      return matchesDate && matchesStatus;
    }).toList();
  }



  @override
  Widget build(BuildContext context) {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final selectedEvents = _getEventsForDay(
          _selectedDay ?? _focusedDay,
          provider.agendas,
        );

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: RefreshIndicator(
            onRefresh: () => context.read<OrmawaProvider>().refreshData(),
            child: CustomScrollView(
              slivers: [
              BkuAppBar(
                variant: AppBarVariant.ormawa,
                title: 'JADWAL KALENDER',
                subtitle: 'AGENDA & KEGIATAN',
                expandedHeight: 115.0,
                showBackButton: true,
                isExpandable: false,
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(top: 8, left: 20, right: 20, bottom: 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildCalendarCard(provider.agendas),
                      const SizedBox(height: 24),
                      OrmawaListHeader(
                        title: '${DateFormat('d MMMM').format(_selectedDay ?? _focusedDay).toUpperCase()} - ${selectedEvents.length} AGENDA',
                        searchHint: 'Cari agenda...',
                        searchController: _searchController,
                        onRefresh: () => context.read<OrmawaProvider>().refreshData(),
                        onFilterTap: () => _showFilterSheet(),
                        onChanged: (value) => setState(() => _searchQuery = value),
                      ),
                      const SizedBox(height: 16),
                      if (provider.isLoading)
                        const Center(child: CircularProgressIndicator())
                      else
                        _buildAgendaList(selectedEvents),
                    ],
                  ),
                ),
              ),
            ],
          ),
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _showAddJadwal(context),
            backgroundColor: AppColors.primary,
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: const Text(
              'Tambah Kegiatan',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
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
        eventLoader: (day) => _getEventsForDay(day, agendas).take(1).toList(),
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
          todayTextStyle: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
        headerStyle: HeaderStyle(
          formatButtonVisible: true,
          titleCentered: true,
          formatButtonDecoration: BoxDecoration(
            color: AppColors.primary.withAlpha(20),
            borderRadius: BorderRadius.circular(12),
          ),
          formatButtonTextStyle: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }


  Widget _buildAgendaList(List<OrmawaAgenda> agendas) {
    // Apply search filter
    final filteredAgendas = _searchQuery.isEmpty
        ? agendas
        : agendas.where((a) =>
            a.title.toLowerCase().contains(_searchQuery) ||
            a.location.toLowerCase().contains(_searchQuery)).toList();

    if (filteredAgendas.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40),
        width: double.infinity,
        child: Column(
          children: [
            Icon(Icons.search_off_rounded, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isEmpty ? 'Tidak ada agenda di tanggal ini' : 'Agenda tidak ditemukan',
              style: AppTextStyles.bodyMd.copyWith(color: Colors.grey[500]),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      padding: EdgeInsets.zero,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filteredAgendas.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final agenda = filteredAgendas[index];
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
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  agenda.status.toUpperCase(),
                  style: AppTextStyles.labelSm.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
                  ),
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(
                  Icons.more_horiz_rounded,
                  color: Color(0xFF94A3B8),
                ),
                onSelected: (value) {
                  if (value == 'delete') {
                    _confirmDelete(context, agenda);
                  } else if (value == 'edit') {
                    _showEditJadwal(context, agenda);
                  }
                },
                itemBuilder:
                    (context) => [
                      const PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            Icon(Icons.edit_rounded, size: 18),
                            SizedBox(width: 8),
                            Text('Edit'),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(
                              Icons.delete_outline_rounded,
                              size: 18,
                              color: Colors.red,
                            ),
                            SizedBox(width: 8),
                            Text('Hapus', style: TextStyle(color: Colors.red)),
                          ],
                        ),
                      ),
                    ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            agenda.title,
            style: AppTextStyles.bodyMd.copyWith(
              fontWeight: FontWeight.w900,
              fontSize: 16,
            ),
          ),
          if (agenda.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              agenda.description,
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF64748B),
              ),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.location_on_rounded,
                size: 14,
                color: Color(0xFF94A3B8),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  agenda.location,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF64748B),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 16),
              const Icon(
                Icons.access_time_rounded,
                size: 14,
                color: Color(0xFF94A3B8),
              ),
              const SizedBox(width: 8),
              Text(
                '${DateFormat('HH:mm').format(agenda.date)} - ${DateFormat('HH:mm').format(agenda.endDate)}',
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF64748B),
                ),
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
      builder:
          (context) => AlertDialog(
            title: const Text('Hapus Agenda?'),
            content: Text(
              'Apakah Anda yakin ingin menghapus "${agenda.title}"?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('BATAL'),
              ),
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
        builder:
            (context) => OrmawaFormJadwalScreen(
              selectedDate: _selectedDay ?? _focusedDay,
            ),
      ),
    );
  }

  void _showEditJadwal(BuildContext context, OrmawaAgenda agenda) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => OrmawaFormJadwalScreen(
              selectedDate: agenda.date,
              agenda: agenda,
            ),
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
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
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Filter Status', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _statusOptions.map((option) {
                final isSelected = _filterStatus == option;
                return GestureDetector(
                  onTap: () {
                    setState(() => _filterStatus = option);
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.primary.withAlpha(10),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(option, style: AppTextStyles.labelSm.copyWith(
                      color: isSelected ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.bold,
                    )),
                  ),
                );
              }).toList(),
            ),
            if (_filterStatus != 'Semua')
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: TextButton(
                  onPressed: () {
                    setState(() => _filterStatus = 'Semua');
                    Navigator.pop(context);
                  },
                  child: Text('Reset Filter', style: AppTextStyles.labelSm.copyWith(color: Colors.red)),
                ),
              ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class OrmawaFormJadwalScreen extends StatefulWidget {
  final DateTime selectedDate;
  final OrmawaAgenda? agenda;
  const OrmawaFormJadwalScreen({
    super.key,
    required this.selectedDate,
    this.agenda,
  });

  @override
  State<OrmawaFormJadwalScreen> createState() => _OrmawaFormJadwalScreenState();
}

class _OrmawaFormJadwalScreenState extends State<OrmawaFormJadwalScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  
  final _landasanController = TextEditingController();
  final _bentukController = TextEditingController();
  final _mitraController = TextEditingController();
  final _latarBelakangController = TextEditingController();
  final _tujuanController = TextEditingController();
  final _jadwalController = TextEditingController();
  final _sasaranController = TextEditingController();
  final _indikatorController = TextEditingController();
  final _sumberDanaController = TextEditingController();
  final _estimasiDanaController = TextEditingController();
  final _pjController = TextEditingController();

  String _selectedStatus = 'Direncanakan';
  late DateTime _startDate;
  late TimeOfDay _startTime;
  late TimeOfDay _endTime;

  final List<String> _statuses = ['Direncanakan', 'Persiapan', 'Berlangsung', 'Terlaksana', 'Batal'];

  @override
  void initState() {
    super.initState();
    _startDate = widget.selectedDate;

    if (widget.agenda != null) {
      _titleController.text = widget.agenda!.title;
      _descriptionController.text = widget.agenda!.description;
      _locationController.text = widget.agenda!.location;
      
      final rawStatus = widget.agenda!.status;
      if (_statuses.any((s) => s.toLowerCase() == rawStatus.toLowerCase())) {
        _selectedStatus = _statuses.firstWhere((s) => s.toLowerCase() == rawStatus.toLowerCase());
      } else {
        _selectedStatus = _statuses.first;
      }
      
      _startTime = TimeOfDay.fromDateTime(widget.agenda!.date);
      _endTime = TimeOfDay.fromDateTime(widget.agenda!.endDate);

      _landasanController.text = widget.agenda!.landasanKegiatan ?? '';
      _bentukController.text = widget.agenda!.bentukKegiatan ?? '';
      _mitraController.text = widget.agenda!.mitra ?? '';
      _latarBelakangController.text = widget.agenda!.latarBelakang ?? '';
      _tujuanController.text = widget.agenda!.tujuanKegiatan ?? '';
      _jadwalController.text = widget.agenda!.jadwalPelaksanaan ?? '';
      _sasaranController.text = widget.agenda!.sasaranKegiatan ?? '';
      _indikatorController.text = widget.agenda!.indikatorKeberhasilan ?? '';
      _sumberDanaController.text = widget.agenda!.sumberDana ?? '';
      _pjController.text = widget.agenda!.pjKegiatan ?? '';

      if (widget.agenda!.estimasiDana != null && widget.agenda!.estimasiDana! > 0) {
        _estimasiDanaController.text = _formatCurrencyValue(widget.agenda!.estimasiDana!);
      }
    } else {
      _startTime = TimeOfDay.now();
      _endTime = TimeOfDay(
        hour: (_startTime.hour + 2) % 24,
        minute: _startTime.minute,
      );
    }
  }

  String _formatCurrencyValue(double val) {
    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(val);
  }

  void _onEstimasiDanaChanged(String val) {
    if (val.isEmpty) return;
    final clean = val.replaceAll(RegExp(r'[^0-9]'), '');
    final number = int.tryParse(clean) ?? 0;
    final formatted = _formatCurrencyValue(number.toDouble());
    _estimasiDanaController.value = TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  void _submit() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Nama kegiatan tidak boleh kosong')));
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Waktu selesai tidak boleh sebelum waktu mulai')),
      );
      return;
    }

    final cleanDana = _estimasiDanaController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final double estimasiDana = double.tryParse(cleanDana) ?? 0.0;

    final data = {
      'Judul': _titleController.text.trim(),
      'Deskripsi': _descriptionController.text.trim(),
      'TanggalMulai': fullStartDate.toIso8601String(),
      'TanggalSelesai': fullEndDate.toIso8601String(),
      'Lokasi': _locationController.text.trim(),
      'Status': _selectedStatus.toLowerCase() == 'direncanakan' ? 'terjadwal' : _selectedStatus.toLowerCase(),
      'LandasanKegiatan': _landasanController.text.trim(),
      'BentukKegiatan': _bentukController.text.trim(),
      'Mitra': _mitraController.text.trim(),
      'LatarBelakang': _latarBelakangController.text.trim(),
      'TujuanKegiatan': _tujuanController.text.trim(),
      'JadwalPelaksanaan': _jadwalController.text.trim().isNotEmpty 
          ? _jadwalController.text.trim() 
          : "${DateFormat('EEEE, dd MMMM yyyy').format(fullStartDate)}, ${_startTime.format(context)} - ${_endTime.format(context)} WIB",
      'SasaranKegiatan': _sasaranController.text.trim(),
      'IndikatorKeberhasilan': _indikatorController.text.trim(),
      'SumberDana': _sumberDanaController.text.trim(),
      'EstimasiDana': estimasiDana,
      'PJKegiatan': _pjController.text.trim(),
    };

    try {
      if (widget.agenda != null) {
        await context.read<OrmawaProvider>().updateAgenda(
          widget.agenda!.id,
          data,
        );
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
            expandedHeight: 115.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(top: 16, left: 24, right: 24, bottom: 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader(isEdit),
                  const SizedBox(height: 24),
                  
                  // SECTION 1: INFORMASI UTAMA
                  _buildFormSectionTitle('1. INFORMASI UTAMA'),
                  const SizedBox(height: 12),
                  _buildTextField('NAMA KEGIATAN *', 'Contoh: Rapat Kerja Anggota...', _titleController, Icons.title_rounded),
                  const SizedBox(height: 16),
                  _buildTextField('PENANGGUNG JAWAB (PJ)', 'Nama PJ kegiatan...', _pjController, Icons.person_outline_rounded),
                  const SizedBox(height: 16),
                  _buildTextField('LOKASI / RUANG', 'Contoh: Aula Serbaguna Lt. 2...', _locationController, Icons.location_on_outlined),
                  const SizedBox(height: 16),
                  _buildStatusDropdown(),
                  const SizedBox(height: 20),
                  _buildDateTimePicker(),
                  
                  const SizedBox(height: 32),
                  
                  // SECTION 2: PARAMETER OPERASIONAL
                  _buildFormSectionTitle('2. PARAMETER OPERASIONAL'),
                  const SizedBox(height: 12),
                  _buildTextField('LANDASAN KEGIATAN', 'Contoh: GBHP Organisasi 2026...', _landasanController, Icons.gavel_rounded),
                  const SizedBox(height: 16),
                  _buildTextField('BENTUK KEGIATAN', 'Contoh: Seminar / Workshop...', _bentukController, Icons.category_outlined),
                  const SizedBox(height: 16),
                  _buildTextField('SASARAN KEGIATAN', 'Contoh: Seluruh mahasiswa baru...', _sasaranController, Icons.track_changes_rounded),
                  const SizedBox(height: 16),
                  _buildTextField('MITRA KERJA', 'Contoh: Sponsor, UKM lain...', _mitraController, Icons.handshake_outlined),
                  const SizedBox(height: 16),
                  _buildTextField('SUMBER DANA', 'Contoh: Dana kemahasiswaan...', _sumberDanaController, Icons.account_balance_wallet_outlined),
                  const SizedBox(height: 16),
                  _buildTextField('INDIKATOR KEBERHASILAN', 'Contoh: Target kehadiran 80%...', _indikatorController, Icons.emoji_events_outlined),
                  const SizedBox(height: 16),
                  _buildCurrencyField('ESTIMASI ANGGARAN (RP)', 'Contoh: Rp 5.000.000', _estimasiDanaController, Icons.payments_outlined),
                  
                  const SizedBox(height: 32),

                  // SECTION 3: DESKRIPSI & NARASI
                  _buildFormSectionTitle('3. DESKRIPSI & NARASI'),
                  const SizedBox(height: 12),
                  _buildTextField('LATAR BELAKANG', 'Tuliskan latar belakang singkat...', _latarBelakangController, Icons.article_outlined, maxLines: 4),
                  const SizedBox(height: 16),
                  _buildTextField('TUJUAN KEGIATAN', 'Tuliskan tujuan kegiatan...', _tujuanController, Icons.flag_outlined, maxLines: 3),
                  const SizedBox(height: 16),
                  _buildTextField('DESKRIPSI DETAIL & MEKANISME', 'Detail alur / mekanisme agenda...', _descriptionController, Icons.description_outlined, maxLines: 4),
                  
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

  Widget _buildFormSectionTitle(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        title,
        style: AppTextStyles.labelSm.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.0,
          fontSize: 11,
        ),
      ),
    );
  }

  Widget _buildSectionHeader(bool isEdit) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(15),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isEdit ? Icons.edit_calendar_rounded : Icons.event_available_rounded,
            color: AppColors.primary,
            size: 26,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'REGISTRASI AGENDA KEGIATAN',
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF94A3B8),
                  fontWeight: FontWeight.w900,
                  fontSize: 9,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                isEdit ? 'PERBARUI AGENDA' : 'BUAT KEGIATAN BARU',
                style: AppTextStyles.titleLg.copyWith(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF1E293B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    String label,
    String hint,
    TextEditingController controller,
    IconData icon, {
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
            prefixIcon: Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrencyField(
    String label,
    String hint,
    TextEditingController controller,
    IconData icon,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          onChanged: _onEstimasiDanaChanged,
          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
            prefixIcon: Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildDateTimePicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: _startDate,
              firstDate: DateTime(2020),
              lastDate: DateTime(2030),
            );
            if (date != null) setState(() => _startDate = date);
          },
          child: _buildInfoBox(
            'TANGGAL PELAKSANAAN',
            DateFormat('EEEE, dd MMMM yyyy').format(_startDate),
            Icons.calendar_month_rounded,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () async {
                  final time = await showTimePicker(
                    context: context,
                    initialTime: _startTime,
                  );
                  if (time != null) setState(() => _startTime = time);
                },
                child: _buildInfoBox(
                  'JAM MULAI',
                  _startTime.format(context),
                  Icons.access_time_rounded,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: InkWell(
                onTap: () async {
                  final time = await showTimePicker(
                    context: context,
                    initialTime: _endTime,
                  );
                  if (time != null) setState(() => _endTime = time);
                },
                child: _buildInfoBox(
                  'JAM SELESAI',
                  _endTime.format(context),
                  Icons.access_time_rounded,
                ),
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
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
              const SizedBox(width: 12),
              Text(
                value,
                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 13),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'STATUS AGENDA',
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButtonFormField<String>(
              value: _selectedStatus,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.flag_rounded, size: 20, color: Color(0xFF94A3B8)),
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 14),
              items: _statuses.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _selectedStatus = v!),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => Navigator.pop(context),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              side: const BorderSide(color: Color(0xFFCBD5E1)),
            ),
            child: const Text('BATAL', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 4,
              shadowColor: AppColors.primary.withAlpha(50),
            ),
            child: Text(
              widget.agenda != null ? 'PERBARUI AGENDA' : 'SIMPAN JADWAL',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
