import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class OrmawaAbsensiScreen extends StatefulWidget {
  const OrmawaAbsensiScreen({super.key});

  @override
  State<OrmawaAbsensiScreen> createState() => _OrmawaAbsensiScreenState();
}

class _OrmawaAbsensiScreenState extends State<OrmawaAbsensiScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'MANAJEMEN PRESENSI',
            subtitle: 'PRESENSI & KEHADIRAN',
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
                  _buildStatsRow(),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'DAFTAR KEGIATAN',
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF475569),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.filter_list_rounded, size: 18),
                        label: const Text('Filter'),
                        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildSearchField(),
                  const SizedBox(height: 20),
                  _buildAbsensiCard(
                    'Rapat Koordinasi BEM',
                    '12 Mei 2024 • 14:00',
                    '48/50 Hadir',
                    'AKTIF',
                    Colors.green,
                  ),
                  const SizedBox(height: 16),
                  _buildAbsensiCard(
                    'Seminar Kewirausahaan',
                    '10 Mei 2024 • 09:00',
                    '120/150 Hadir',
                    'SELESAI',
                    Colors.blue,
                  ),
                  const SizedBox(height: 16),
                  _buildAbsensiCard(
                    'Latihan Rutin UKM Seni',
                    '08 Mei 2024 • 16:00',
                    '15/20 Hadir',
                    'SELESAI',
                    Colors.blue,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateAbsensi(context),
        backgroundColor: AppColors.primary,
        elevation: 4,
        icon: const Icon(Icons.add_a_photo_rounded, color: Colors.white),
        label: const Text('Presensi Baru', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        _buildStatCard('Total Agenda', '12', Icons.assignment_rounded, Colors.blue),
        const SizedBox(width: 12),
        _buildStatCard('Hari Ini', '2', Icons.today_rounded, Colors.orange),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withAlpha(10), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 16),
            Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 24, fontWeight: FontWeight.w900)),
            Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
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
                hintText: 'Cari nama kegiatan...',
                hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                border: InputBorder.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAbsensiCard(String title, String time, String attendance, String status, Color statusColor) {
    return Container(
      padding: const EdgeInsets.all(20),
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
                decoration: BoxDecoration(color: statusColor.withAlpha(10), borderRadius: BorderRadius.circular(8)),
                child: Text(
                  status,
                  style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.w900, fontSize: 10),
                ),
              ),
              const Icon(Icons.more_horiz_rounded, color: Color(0xFF94A3B8)),
            ],
          ),
          const SizedBox(height: 16),
          Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Text(time, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Kehadiran', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
                  Text(attendance, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
                ],
              ),
              Row(
                children: [
                  OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => OrmawaAbsensiDetailScreen(title: title),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    child: const Text('Detail', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => OrmawaAbsensiScannerScreen(title: title),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                    child: const Text('Scan QR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCreateAbsensi(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreateAbsensiScreen()),
    );
  }
}

class OrmawaCreateAbsensiScreen extends StatelessWidget {
  const OrmawaCreateAbsensiScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Buat Presensi Baru', style: AppTextStyles.titleLg.copyWith(fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Detail Presensi', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            Text('Sistem akan men-generate kode QR unik untuk kegiatan ini.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
            const SizedBox(height: 32),
            _buildInputField('Nama Kegiatan', 'Contoh: Rapat Koordinasi Mingguan', Icons.event_rounded),
            const SizedBox(height: 16),
            _buildInputField('Lokasi / Tempat', 'Contoh: Ruang Rapat Lt. 2', Icons.location_on_rounded),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildInputField('Tanggal', '12/05/2024', Icons.calendar_today_rounded)),
                const SizedBox(width: 16),
                Expanded(child: _buildInputField('Waktu', '14:00', Icons.access_time_rounded)),
              ],
            ),
            const SizedBox(height: 16),
            _buildInputField('Deskripsi (Opsional)', 'Tuliskan catatan tambahan...', Icons.description_rounded, maxLines: 3),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 8,
                  shadowColor: AppColors.primary.withAlpha(50),
                ),
                child: const Text('Generate QR Code', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField(String label, String hint, IconData icon, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
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
}
class OrmawaAbsensiDetailScreen extends StatelessWidget {
  final String title;
  const OrmawaAbsensiDetailScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Detail Kehadiran', style: AppTextStyles.titleLg.copyWith(fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.download_rounded)),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900)),
                    Text('Total: 48 Peserta Terdeteksi', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: Colors.green.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                  child: Text('96%', style: AppTextStyles.labelSm.copyWith(color: Colors.green, fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: 10,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: AppColors.primary.withAlpha(10),
                        child: Text('${index + 1}', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Peserta Absensi #${index + 1}', style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                            Text('BKU2024${100 + index}', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 11)),
                          ],
                        ),
                      ),
                      Text('14:${10 + index}', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class OrmawaAbsensiScannerScreen extends StatefulWidget {
  final String title;
  const OrmawaAbsensiScannerScreen({super.key, required this.title});

  @override
  State<OrmawaAbsensiScannerScreen> createState() => _OrmawaAbsensiScannerScreenState();
}

class _OrmawaAbsensiScannerScreenState extends State<OrmawaAbsensiScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background "Camera" Simulation
          Container(
            width: double.infinity,
            height: double.infinity,
            color: const Color(0xFF1E293B),
            child: const Center(
              child: Icon(Icons.camera_alt_rounded, color: Colors.white24, size: 80),
            ),
          ),
          // Scanner Overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Stack(
                children: [
                  AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                      return Positioned(
                        top: _controller.value * 250,
                        left: 0,
                        right: 0,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            boxShadow: [
                              BoxShadow(color: AppColors.primary.withAlpha(200), blurRadius: 10, spreadRadius: 2),
                            ],
                            gradient: const LinearGradient(colors: [Colors.transparent, AppColors.primary, Colors.transparent]),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          // Back Button
          Positioned(
            top: 50,
            left: 20,
            child: IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            ),
          ),
          // Bottom Info
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Text(
                  'SCAN QR CODE',
                  style: AppTextStyles.labelMd.copyWith(color: Colors.white, letterSpacing: 2, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.title,
                  style: AppTextStyles.bodyMd.copyWith(color: Colors.white70),
                ),
                const SizedBox(height: 40),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(30)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.flashlight_on_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 12),
                      Text('Senter', style: AppTextStyles.labelMd.copyWith(color: Colors.white)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
