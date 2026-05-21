import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_flutter/qr_flutter.dart';

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
          Consumer<OrmawaProvider>(
            builder: (context, provider, child) {
              final agendas = provider.agendas;
              
              if (provider.isLoading && agendas.isEmpty) {
                return const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              if (agendas.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.event_busy_rounded, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text('Belum ada agenda kegiatan', style: AppTextStyles.labelMd.copyWith(color: Colors.grey)),
                      ],
                    ),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.all(20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final agenda = agendas[index];
                      // Logic untuk menentukan status berdasarkan waktu
                      final now = DateTime.now();
                      final isPast = agenda.date.isBefore(now.subtract(const Duration(days: 1)));
                      final status = isPast ? 'SELESAI' : 'AKTIF';
                      final statusColor = isPast ? Colors.blue : Colors.green;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _buildAbsensiCard(
                          agenda.id,
                          agenda.title,
                          '${agenda.date.day}/${agenda.date.month}/${agenda.date.year} • ${agenda.date.hour}:${agenda.date.minute}',
                          'Lihat Peserta', // Kita akan fetch jumlah real di detail
                          status,
                          statusColor,
                        ),
                      );
                    },
                    childCount: agendas.length,
                  ),
                ),
              );
            },
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

  // ignore: unused_element
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

  Widget _buildAbsensiCard(String id, String title, String time, String attendance, String status, Color statusColor) {
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
                          builder: (context) => OrmawaAbsensiDetailScreen(title: title, eventId: id),
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
                          builder: (context) => OrmawaAbsensiScannerScreen(title: title, eventId: id),
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

class OrmawaCreateAbsensiScreen extends StatefulWidget {
  const OrmawaCreateAbsensiScreen({super.key});

  @override
  State<OrmawaCreateAbsensiScreen> createState() => _OrmawaCreateAbsensiScreenState();
}

class _OrmawaCreateAbsensiScreenState extends State<OrmawaCreateAbsensiScreen> {
  String? _selectedEventId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Generate QR Presensi', style: AppTextStyles.titleLg.copyWith(fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Consumer<OrmawaProvider>(
        builder: (context, provider, child) {
          final agendas = provider.agendas;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Pilih Kegiatan', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text('Pilih agenda yang ingin diaktifkan presensinya.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                const SizedBox(height: 32),
                
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      hint: const Text('Pilih Agenda'),
                      value: _selectedEventId,
                      items: agendas.map((e) => DropdownMenuItem(
                        value: e.id,
                        child: Text(e.title),
                      )).toList(),
                      onChanged: (val) => setState(() => _selectedEventId = val),
                    ),
                  ),
                ),

                if (_selectedEventId != null) ...[
                  const SizedBox(height: 40),
                  Center(
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 20, offset: const Offset(0, 10)),
                            ],
                          ),
                          child: QrImageView(
                            data: _selectedEventId!,
                            version: QrVersions.auto,
                            size: 200.0,
                            foregroundColor: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Scan QR ini untuk Absensi',
                          style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF475569)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          agendas.firstWhere((e) => e.id == _selectedEventId).title,
                          style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ),
                ],
                
                const SizedBox(height: 60),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 8,
                    ),
                    child: const Text('Selesai', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
class OrmawaAbsensiDetailScreen extends StatefulWidget {
  final String title;
  final String eventId;
  const OrmawaAbsensiDetailScreen({super.key, required this.title, required this.eventId});

  @override
  State<OrmawaAbsensiDetailScreen> createState() => _OrmawaAbsensiDetailScreenState();
}

class _OrmawaAbsensiDetailScreenState extends State<OrmawaAbsensiDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().fetchAttendance(widget.eventId);
    });
  }

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
          IconButton(
            onPressed: () => context.read<OrmawaProvider>().fetchAttendance(widget.eventId),
            icon: const Icon(Icons.refresh_rounded),
          ),
          IconButton(onPressed: () {}, icon: const Icon(Icons.download_rounded)),
        ],
      ),
      body: Consumer<OrmawaProvider>(
        builder: (context, provider, child) {
          final list = provider.attendanceList;
          
          if (provider.isLoading && list.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          return Column(
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
                        Text(widget.title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900)),
                        Text('Total: ${list.length} Peserta Terdeteksi', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                      ],
                    ),
                    if (list.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.green.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                      child: Text('OK', style: AppTextStyles.labelSm.copyWith(color: Colors.green, fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: list.isEmpty 
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.person_off_rounded, size: 64, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text('Belum ada data kehadiran', style: AppTextStyles.labelSm.copyWith(color: Colors.grey)),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: list.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = list[index];
                        final timeStr = '${item.waktuHadir.hour.toString().padLeft(2, '0')}:${item.waktuHadir.minute.toString().padLeft(2, '0')}';
                        
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
                                    Text(item.mahasiswaName ?? 'Mahasiswa #${item.mahasiswaId}', style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                                    Text('ID: ${item.mahasiswaId}', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 11)),
                                  ],
                                ),
                              ),
                              Text(timeStr, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      },
                    ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class OrmawaAbsensiScannerScreen extends StatefulWidget {
  final String title;
  final String eventId;
  const OrmawaAbsensiScannerScreen({super.key, required this.title, required this.eventId});

  @override
  State<OrmawaAbsensiScannerScreen> createState() => _OrmawaAbsensiScannerScreenState();
}

class _OrmawaAbsensiScannerScreenState extends State<OrmawaAbsensiScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isScanning = true;

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

  void _onDetect(BarcodeCapture capture) async {
    if (!_isScanning) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final code = barcode.rawValue;
      if (code != null && code == widget.eventId) {
        setState(() => _isScanning = false);
        
        try {
          await context.read<OrmawaProvider>().submitAttendance(widget.eventId, 'hadir');
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Absensi berhasil dicatat!'), backgroundColor: Colors.green),
            );
            Navigator.pop(context);
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Gagal absensi: $e'), backgroundColor: Colors.red),
            );
            setState(() => _isScanning = true);
          }
        }
        break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          MobileScanner(
            onDetect: _onDetect,
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
                      const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 12),
                      Text('Arahkan Kamera ke QR', style: AppTextStyles.labelMd.copyWith(color: Colors.white)),
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
