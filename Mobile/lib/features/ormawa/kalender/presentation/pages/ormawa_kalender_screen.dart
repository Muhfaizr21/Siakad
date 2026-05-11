import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class OrmawaKalenderScreen extends StatefulWidget {
  const OrmawaKalenderScreen({super.key});

  @override
  State<OrmawaKalenderScreen> createState() => _OrmawaKalenderScreenState();
}

class _OrmawaKalenderScreenState extends State<OrmawaKalenderScreen> {
  @override
  Widget build(BuildContext context) {
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
                  _buildSummaryGrid(),
                  const SizedBox(height: 32),
                  _buildHeaderActions(),
                  const SizedBox(height: 20),
                  _buildAgendaList(),
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
  }

  Widget _buildSummaryGrid() {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.1,
      children: [
        _buildStatCard('Total', '12', Icons.event_note_rounded, Colors.blue),
        _buildStatCard('Mendatang', '5', Icons.upcoming_rounded, Colors.orange),
        _buildStatCard('Selesai', '7', Icons.task_alt_rounded, Colors.green),
      ],
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
              'AGENDA KEGIATAN',
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
                  const Icon(Icons.filter_list_rounded, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Text('Status', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
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
                  decoration: InputDecoration(
                    hintText: 'Cari nama atau lokasi...',
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

  Widget _buildAgendaList() {
    // Mock data based on the requirements
    final agendas = [
      {
        'title': 'Rapat Kerja Tahunan',
        'date': '12 Mei 2024',
        'location': 'Aula Gedung A',
        'status': 'Terjadwal',
        'color': Colors.blue,
      },
      {
        'title': 'Workshop Farmasi Klinis',
        'date': '15 Mei 2024',
        'location': 'Lab Simulasi',
        'status': 'Berlangsung',
        'color': Colors.orange,
      },
      {
        'title': 'Seminar Nasional BKU',
        'date': '20 Mei 2024',
        'location': 'Grand Ballroom',
        'status': 'Selesai',
        'color': Colors.green,
      },
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: agendas.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final agenda = agendas[index];
        return _buildAgendaCard(
          agenda['title'] as String,
          agenda['date'] as String,
          agenda['location'] as String,
          agenda['status'] as String,
          agenda['color'] as Color,
        );
      },
    );
  }

  Widget _buildAgendaCard(String title, String date, String location, String status, Color color) {
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
                child: Text(status, style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 10)),
              ),
              const Icon(Icons.more_horiz_rounded, color: Color(0xFF94A3B8)),
            ],
          ),
          const SizedBox(height: 12),
          Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded, size: 14, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 8),
                    Text(date, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B))),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 8),
                    Flexible(child: Text(location, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)), overflow: TextOverflow.ellipsis)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }


  void _showAddJadwal(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreateJadwalScreen()),
    );
  }
}

class OrmawaCreateJadwalScreen extends StatelessWidget {
  const OrmawaCreateJadwalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'JADWALKAN KEGIATAN',
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
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.event_available_rounded, color: AppColors.primary),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                              child: Text('EVENT REGISTRY', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 8)),
                            ),
                            Text('JADWALKAN KEGIATAN', style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Tambahkan agenda dan kegiatan resmi ormawa.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                  const SizedBox(height: 32),
                  _buildInputField('NAMA KEGIATAN', 'Nama kegiatan resmi...', Icons.title_rounded),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(child: _buildDatePickerField('TANGGAL MULAI', 'mm/dd/yyyy')),
                      const SizedBox(width: 16),
                      Expanded(child: _buildDatePickerField('TANGGAL SELESAI', 'mm/dd/yyyy')),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildInputField('LOKASI', 'Gedung / Ruang...', Icons.location_on_rounded),
                  const SizedBox(height: 20),
                  _buildDropdownField('STATUS', 'Terjadwal', Icons.flag_rounded),
                  const SizedBox(height: 20),
                  _buildInputField('DESKRIPSI', 'Informasi tambahan kegiatan...', Icons.description_rounded, maxLines: 4),
                  const SizedBox(height: 40),
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
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.save_rounded, color: Colors.white),
                            label: const Text('SIMPAN JADWAL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

  Widget _buildInputField(String label, String hint, IconData icon, {int maxLines = 1}) {
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

  Widget _buildDatePickerField(String label, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(hint, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
              ),
              const Icon(Icons.calendar_month_rounded, color: Color(0xFF94A3B8), size: 20),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField(String label, String hint, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5)),
        const SizedBox(height: 8),
        Container(
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
                child: Text(hint, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
              ),
              const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8), size: 20),
            ],
          ),
        ),
      ],
    );
  }
}
