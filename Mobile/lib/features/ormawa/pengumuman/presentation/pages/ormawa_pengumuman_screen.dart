import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_announcement.dart';
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

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<OrmawaProvider>().getAnnouncements());
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
      body: CustomScrollView(
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
                  const SizedBox(height: 32),
                  _buildHeaderActions(),
                  const SizedBox(height: 20),
                  _buildPengumumanList(),
                ],
              ),
            ),
          ),
        ],
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

  Widget _buildHeaderActions() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'REKAPITULASI SIARAN',
              style: AppTextStyles.labelMd.copyWith(
                color: const Color(0xFF475569),
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.category_rounded, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Text('Kategori', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari judul pengumuman...',
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

  Widget _buildPengumumanList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final filteredList = provider.announcements.where((item) {
          return item.judul.toLowerCase().contains(_searchQuery) || item.isi.toLowerCase().contains(_searchQuery);
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
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filteredList.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final announcement = filteredList[index];
            Color statusColor = Colors.blue;
            if (announcement.target == 'Internal') statusColor = Colors.indigo;
            if (announcement.target == 'Informasi') statusColor = Colors.orange;

            return _buildPengumumanCard(announcement, statusColor);
          },
        );
      },
    );
  }

  Widget _buildPengumumanCard(OrmawaAnnouncement announcement, Color color) {
    String dateStr = 'Beberapa saat lalu';
    if (announcement.createdAt != null) {
      dateStr = DateFormat('dd MMM yyyy').format(announcement.createdAt!);
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
                child: Text(announcement.target.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 10)),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_horiz_rounded, color: Color(0xFF94A3B8)),
                onSelected: (value) async {
                  if (value == 'delete') {
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
              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF94A3B8)),
              const SizedBox(width: 8),
              Text(dateStr, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B))),
              const Spacer(),
              GestureDetector(
                onTap: () => _showAnnouncementDetail(announcement, color),
                child: _buildIconButton(Icons.visibility_outlined, Colors.blue),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAnnouncementDetail(OrmawaAnnouncement announcement, Color color) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(8)),
              child: Text(announcement.target.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900)),
            ),
            const SizedBox(height: 16),
            Text(announcement.judul, style: AppTextStyles.titleLg.copyWith(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            Text(
              announcement.createdAt != null ? DateFormat('dd MMM yyyy HH:mm').format(announcement.createdAt!) : '',
              style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  announcement.isi,
                  style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF475569), height: 1.6, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('TUTUP', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
}

class OrmawaCreatePengumumanScreen extends StatefulWidget {
  const OrmawaCreatePengumumanScreen({super.key});

  @override
  State<OrmawaCreatePengumumanScreen> createState() => _OrmawaCreatePengumumanScreenState();
}

class _OrmawaCreatePengumumanScreenState extends State<OrmawaCreatePengumumanScreen> {
  final TextEditingController _judulController = TextEditingController();
  final TextEditingController _isiController = TextEditingController();
  String _selectedTarget = 'Umum';
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final ormawaId = context.read<OrmawaProvider>().ormawaId;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'BUAT PENGUMUMAN BARU',
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
                  _buildDropdownField('TARGET AUDIENS', _selectedTarget, Icons.category_rounded, ['Umum', 'Informasi', 'Internal']),
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
                                  await context.read<OrmawaProvider>().createAnnouncement({
                                    'OrmawaID': int.parse(ormawaId!),
                                    'Judul': _judulController.text,
                                    'Isi': _isiController.text,
                                    'Target': _selectedTarget,
                                  });
                                  if (context.mounted) Navigator.pop(context);
                                } catch (e) {
                                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                                } finally {
                                  setState(() => _isSubmitting = false);
                                }
                              },
                              icon: const Icon(Icons.send_rounded, color: Colors.white),
                              label: const Text('PUBLISH SEKARANG', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

  Widget _buildDropdownField(String label, String current, IconData icon, List<String> options) {
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
            children: [
              Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: current,
                    items: options.map((String value) {
                      return DropdownMenuItem<String>(value: value, child: Text(value));
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _selectedTarget = value!);
                    },
                    style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569)),
                    icon: const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8), size: 20),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
