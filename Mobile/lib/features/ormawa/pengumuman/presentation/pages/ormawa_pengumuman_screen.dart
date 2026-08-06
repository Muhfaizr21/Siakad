import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_announcement.dart';
import 'package:bkuhub_mobile/core/widgets/ormawa_list_header.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class OrmawaPengumumanScreen extends StatefulWidget {
  const OrmawaPengumumanScreen({super.key});

  @override
  State<OrmawaPengumumanScreen> createState() => _OrmawaPengumumanScreenState();
}

class _OrmawaPengumumanScreenState extends State<OrmawaPengumumanScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _filterTarget = 'Semua';

  final List<String> _targetOptions = ['Semua', 'Umum', 'Kegiatan', 'Penting', 'Informasi'];

  Color _getCategoryColor(String target) {
    switch (target.toLowerCase()) {
      case 'umum':
        return const Color(0xFF64748B);
      case 'kegiatan':
        return const Color(0xFF2563EB);
      case 'penting':
        return const Color(0xFFEF4444);
      case 'info':
      case 'informasi':
        return const Color(0xFF0EA5E9);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _getCategoryLabel(String target) {
    switch (target.toLowerCase()) {
      case 'umum':
        return 'UMUM';
      case 'kegiatan':
        return 'KEGIATAN';
      case 'penting':
        return 'PENTING';
      case 'info':
      case 'informasi':
        return 'INFORMASI';
      default:
        return target.toUpperCase();
    }
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<OrmawaProvider>().refreshData());
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: () => context.read<OrmawaProvider>().refreshData(),
        child: CustomScrollView(
          slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'PUSAT PENGUMUMAN',
            subtitle: 'INFORMASI',
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
                  _buildSummaryGrid(),
                  const SizedBox(height: 24),
                  OrmawaListHeader(
                    title: 'REKAPITULASI SIARAN',
                    searchHint: 'Cari judul pengumuman...',
                    searchController: _searchController,
                    onRefresh: () => context.read<OrmawaProvider>().refreshData(),
                    onFilterTap: () => _showFilterSheet(),
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
                  const SizedBox(height: 16),
                  _buildPengumumanList(),
                ],
              ),
            ),
          ),
        ],
      ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddPengumuman(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.campaign_rounded, color: Colors.white),
        label: const Text('Buat Pengumuman', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildSummaryGrid() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final announcements = provider.announcements;
        final total = announcements.length;
        final now = DateTime.now();
        final active = announcements.where((e) => 
          (e.tanggalMulai == null || e.tanggalMulai!.isBefore(now)) && 
          (e.tanggalSelesai == null || e.tanggalSelesai!.isAfter(now))
        ).length;
        final archived = total - active;

        return GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.1,
          children: [
            _buildStatCard('Total', total.toString(), Icons.record_voice_over_rounded, Colors.cyan),
            _buildStatCard('Aktif', active.toString(), Icons.check_circle_rounded, Colors.green),
            _buildStatCard('Arsip', archived.toString(), Icons.archive_rounded, Colors.grey),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
          Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 9)),
        ],
      ),
    );
  }


  Widget _buildPengumumanList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final filteredList = provider.announcements.where((item) {
          final matchesSearch = item.judul.toLowerCase().contains(_searchQuery) || item.isi.toLowerCase().contains(_searchQuery);
          
          if (_filterTarget == 'Semua') {
            return matchesSearch;
          }
          
          final String normFilter = _filterTarget.toLowerCase();
          final String normItem = item.target.toLowerCase();
          
          bool matchesFilter = false;
          if (normFilter == 'informasi') {
            matchesFilter = (normItem == 'info' || normItem == 'informasi');
          } else {
            matchesFilter = (normItem == normFilter);
          }
          
          return matchesSearch && matchesFilter;
        }).toList();

        if (filteredList.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.campaign_outlined, size: 48, color: Colors.grey.withAlpha(50)),
                  const SizedBox(height: 16),
                  Text('Tidak ada pengumuman ditemukan', style: AppTextStyles.labelMd.copyWith(color: Colors.grey)),
                ],
              ),
            ),
          );
        }

        return ListView.separated(
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filteredList.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final announcement = filteredList[index];
            return _buildPengumumanCard(announcement);
          },
        );
      },
    );
  }

  Widget _buildPengumumanCard(OrmawaAnnouncement announcement) {
    final color = _getCategoryColor(announcement.target);
    final label = _getCategoryLabel(announcement.target);
    
    final displayDate = announcement.tanggalMulai ?? announcement.createdAt;
    String dateStr = 'Beberapa saat lalu';
    bool isScheduled = false;
    if (displayDate != null) {
      dateStr = DateFormat('dd MMM yyyy', 'id').format(displayDate);
      if (announcement.tanggalMulai != null && announcement.tanggalMulai!.isAfter(DateTime.now())) {
        isScheduled = true;
      }
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
                decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(8)),
                child: Text(label, style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 10)),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_horiz_rounded, color: Color(0xFF94A3B8)),
                onSelected: (value) async {
                  if (value == 'edit') {
                    _showEditPengumuman(context, announcement);
                  } else if (value == 'delete') {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Hapus Pengumuman?'),
                        content: const Text('Data yang dihapus tidak dapat dikembalikan.'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
                          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Hapus', style: TextStyle(color: Colors.red))),
                        ],
                      ),
                    );
                    if (confirm == true) {
                      if (context.mounted) await context.read<OrmawaProvider>().deleteAnnouncement(announcement.id);
                    }
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'edit', child: Text('Edit')),
                  const PopupMenuItem(value: 'delete', child: Text('Hapus', style: TextStyle(color: Colors.red))),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(announcement.judul, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
          const SizedBox(height: 8),
          Text(
            announcement.isi,
            style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF64748B), height: 1.4),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(
                isScheduled ? Icons.schedule_rounded : Icons.access_time_rounded,
                size: 14,
                color: isScheduled ? Colors.amber[700] : const Color(0xFF94A3B8),
              ),
              const SizedBox(width: 8),
              Text(
                isScheduled ? 'Dijadwalkan: $dateStr' : dateStr,
                style: AppTextStyles.labelSm.copyWith(
                  color: isScheduled ? Colors.amber[800] : const Color(0xFF64748B),
                  fontWeight: isScheduled ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => _showAnnouncementDetail(announcement),
                child: _buildIconButton(Icons.visibility_outlined, Colors.blue),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAnnouncementDetail(OrmawaAnnouncement announcement) {
    final label = _getCategoryLabel(announcement.target);

    final displayDate = announcement.tanggalMulai ?? announcement.createdAt;
    bool isScheduled = false;
    String dateLabel = 'Diterbitkan pada';
    if (displayDate != null) {
      if (announcement.tanggalMulai != null && announcement.tanggalMulai!.isAfter(DateTime.now())) {
        isScheduled = true;
        dateLabel = 'Dijadwalkan rilis pada';
      }
    }

    LinearGradient categoryGradient;
    switch (announcement.target.toLowerCase()) {
      case 'umum':
        categoryGradient = const LinearGradient(
          colors: [Color(0xFF64748B), Color(0xFF475569)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        break;
      case 'kegiatan':
        categoryGradient = const LinearGradient(
          colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        break;
      case 'penting':
        categoryGradient = const LinearGradient(
          colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        break;
      case 'info':
      case 'informasi':
        categoryGradient = const LinearGradient(
          colors: [Color(0xFF0EA5E9), Color(0xFF0284C7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        break;
      default:
        categoryGradient = const LinearGradient(
          colors: [Color(0xFF64748B), Color(0xFF475569)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header Banner
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: categoryGradient,
              ),
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          label,
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 10,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'SIARAN ANN-${announcement.id}',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.white.withOpacity(0.6),
                          fontWeight: FontWeight.w900,
                          fontSize: 10,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    announcement.judul,
                    style: AppTextStyles.titleLg.copyWith(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      height: 1.3,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        isScheduled ? Icons.schedule_rounded : Icons.calendar_month_rounded,
                        size: 14,
                        color: Colors.white.withOpacity(0.8),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        displayDate != null
                            ? '$dateLabel ${DateFormat('dd MMMM yyyy, HH:mm', 'id').format(displayDate)}'
                            : '',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.white.withOpacity(0.8),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Middle Content Section (Scrollable)
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Metadata cards row
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withOpacity(0.08),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.admin_panel_settings_rounded,
                                      color: AppColors.primary,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'OLEH ORMAWA',
                                          style: AppTextStyles.labelSm.copyWith(
                                            color: const Color(0xFF94A3B8),
                                            fontSize: 8,
                                            fontWeight: FontWeight.w900,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Badan Pengurus Harian',
                                          style: AppTextStyles.bodyMd.copyWith(
                                            color: const Color(0xFF334155),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withOpacity(0.08),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.people_alt_rounded,
                                      color: Colors.green,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'TARGET PEMBACA',
                                          style: AppTextStyles.labelSm.copyWith(
                                            color: const Color(0xFF94A3B8),
                                            fontSize: 8,
                                            fontWeight: FontWeight.w900,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Seluruh Anggota',
                                          style: AppTextStyles.bodyMd.copyWith(
                                            color: const Color(0xFF334155),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Content Header and Box
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ISI PENGUMUMAN RESMI',
                            style: AppTextStyles.labelSm.copyWith(
                              color: const Color(0xFF94A3B8),
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              announcement.isi,
                              style: AppTextStyles.bodyMd.copyWith(
                                color: const Color(0xFF475569),
                                height: 1.6,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Bottom Buttons Bar
            Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Text(
                          'TUTUP',
                          style: AppTextStyles.labelMd.copyWith(
                            color: const Color(0xFF64748B),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _showEditPengumuman(context, announcement);
                        },
                        icon: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 20),
                        label: const Text(
                          'EDIT PENGUMUMAN',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF001F5C),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: color, size: 18),
    );
  }


  void _showAddPengumuman(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreatePengumumanScreen()),
    );
  }

  void _showEditPengumuman(BuildContext context, OrmawaAnnouncement announcement) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => OrmawaCreatePengumumanScreen(announcement: announcement)),
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
            Text('Filter Kategori', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _targetOptions.map((option) {
                final isSelected = _filterTarget == option;
                return GestureDetector(
                  onTap: () {
                    setState(() => _filterTarget = option);
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
            if (_filterTarget != 'Semua')
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: TextButton(
                  onPressed: () {
                    setState(() => _filterTarget = 'Semua');
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

class OrmawaCreatePengumumanScreen extends StatefulWidget {
  final OrmawaAnnouncement? announcement;

  const OrmawaCreatePengumumanScreen({super.key, this.announcement});

  @override
  State<OrmawaCreatePengumumanScreen> createState() => _OrmawaCreatePengumumanScreenState();
}

class _OrmawaCreatePengumumanScreenState extends State<OrmawaCreatePengumumanScreen> {
  final TextEditingController _judulController = TextEditingController();
  final TextEditingController _isiController = TextEditingController();
  String _selectedTarget = 'umum';
  bool _isSubmitting = false;
  DateTime? _selectedTanggalMulai;

  bool get isEditing => widget.announcement != null;

  @override
  void initState() {
    super.initState();
    if (isEditing) {
      _judulController.text = widget.announcement!.judul;
      _isiController.text = widget.announcement!.isi;
      
      final originalTarget = widget.announcement!.target.toLowerCase();
      if (originalTarget == 'informasi') {
        _selectedTarget = 'info';
      } else {
        _selectedTarget = originalTarget;
      }
      _selectedTanggalMulai = widget.announcement!.tanggalMulai;
    } else {
      _selectedTarget = 'umum';
    }
  }

  @override
  Widget build(BuildContext context) {
    final ormawaId = context.read<OrmawaProvider>().ormawaId;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: isEditing ? 'EDIT PENGUMUMAN' : 'BUAT PENGUMUMAN BARU',
            subtitle: 'PUBLIKASI INFORMASI',
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
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.campaign_rounded, color: AppColors.primary),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                              child: Text('ANNOUNCEMENT', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 8)),
                            ),
                            Text('BUAT PENGUMUMAN BARU', style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Publikasikan informasi penting untuk seluruh anggota.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                  const SizedBox(height: 32),
                  _buildInputField('JUDUL PENGUMUMAN', 'Masukkan judul pengumuman...', Icons.title_rounded, controller: _judulController),
                  const SizedBox(height: 20),
                  _buildCategorySelector(),
                  const SizedBox(height: 20),
                  _buildDateField('TANGGAL RILIS (OPSIONAL)', 'Pilih tanggal rilis...', Icons.calendar_month_rounded, _selectedTanggalMulai, (date) {
                    setState(() {
                      _selectedTanggalMulai = date;
                    });
                  }),
                  const SizedBox(height: 20),
                  _buildInputField('ISI PENGUMUMAN', 'Tuliskan isi pengumuman di sini...', Icons.description_rounded, maxLines: 8, controller: _isiController),
                  const SizedBox(height: 40),
                  if (_isSubmitting)
                    const Center(child: CircularProgressIndicator())
                  else
                    Row(
                      children: [
                        Expanded(
                          child: TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text('BATALKAN', style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 2,
                          child: SizedBox(
                            height: 56,
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                if (_judulController.text.isEmpty || _isiController.text.isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Judul dan Isi wajib diisi')));
                                  return;
                                }

                                setState(() => _isSubmitting = true);
                                try {
                                  final provider = context.read<OrmawaProvider>();
                                  if (isEditing) {
                                    await provider.updateAnnouncement(widget.announcement!.id, {
                                      'Judul': _judulController.text,
                                      'Isi': _isiController.text,
                                      'Target': _selectedTarget,
                                      'TanggalMulai': _selectedTanggalMulai?.toIso8601String(),
                                    });
                                  } else {
                                    await provider.createAnnouncement({
                                      'OrmawaID': int.parse(ormawaId!),
                                      'Judul': _judulController.text,
                                      'Isi': _isiController.text,
                                      'Target': _selectedTarget,
                                      'TanggalMulai': _selectedTanggalMulai?.toIso8601String(),
                                    });
                                  }
                                  if (context.mounted) Navigator.pop(context);
                                } catch (e) {
                                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                                } finally {
                                  setState(() => _isSubmitting = false);
                                }
                              },
                              icon: Icon(isEditing ? Icons.save_rounded : Icons.send_rounded, color: Colors.white),
                              label: Text(isEditing ? 'SIMPAN PERUBAHAN' : 'PUBLISH SEKARANG', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF001F5C),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                              ),
                            ),
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
    );
  }

  Widget _buildInputField(String label, String hint, IconData icon, {int maxLines = 1, required TextEditingController controller}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment: maxLines > 1 ? CrossAxisAlignment.start : CrossAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: maxLines > 1 ? 12 : 0),
                child: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  maxLines: maxLines,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategorySelector() {
    final categories = [
      {'id': 'umum', 'label': 'UMUM', 'icon': Icons.feed_rounded, 'color': const Color(0xFF64748B)},
      {'id': 'kegiatan', 'label': 'KEGIATAN', 'icon': Icons.event_rounded, 'color': const Color(0xFF2563EB)},
      {'id': 'penting', 'label': 'PENTING', 'icon': Icons.warning_rounded, 'color': const Color(0xFFEF4444)},
      {'id': 'info', 'label': 'INFORMASI', 'icon': Icons.info_rounded, 'color': const Color(0xFF0EA5E9)},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'PILIH KATEGORI SIARAN',
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 3.5,
          ),
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final cat = categories[index];
            final id = cat['id'] as String;
            final label = cat['label'] as String;
            final icon = cat['icon'] as IconData;
            final baseColor = cat['color'] as Color;
            final isSelected = _selectedTarget.toLowerCase() == id;

            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedTarget = id;
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected ? baseColor : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: baseColor.withAlpha(50),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          )
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      icon,
                      size: 16,
                      color: isSelected ? Colors.white : baseColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      label,
                      style: AppTextStyles.labelSm.copyWith(
                        color: isSelected ? Colors.white : const Color(0xFF475569),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDateField(String label, String hint, IconData icon, DateTime? date, Function(DateTime) onDateSelected) {
    final displayStr = date != null ? DateFormat('dd MMMM yyyy', 'id').format(date) : hint;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5)),
        const SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: date ?? DateTime.now(),
              firstDate: DateTime(2020),
              lastDate: DateTime(2101),
              builder: (context, child) {
                return Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme: ColorScheme.light(
                      primary: AppColors.primary,
                      onPrimary: Colors.white,
                      onSurface: AppColors.neutral800,
                    ),
                  ),
                  child: child!,
                );
              },
            );
            if (picked != null) {
              onDateSelected(picked);
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Icon(icon, color: const Color(0xFF94A3B8), size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    displayStr,
                    style: AppTextStyles.bodyMd.copyWith(
                      color: date != null ? AppColors.neutral800 : const Color(0xFF94A3B8),
                      fontWeight: date != null ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
                if (date != null)
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedTanggalMulai = null;
                      });
                    },
                    child: const Icon(Icons.clear_rounded, color: Colors.red, size: 20),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
