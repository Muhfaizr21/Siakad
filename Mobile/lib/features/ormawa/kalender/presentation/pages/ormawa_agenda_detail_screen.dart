import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/features/ormawa/absensi/presentation/pages/ormawa_absensi_screen.dart';

String formatRp(double? val) {
  if (val == null || val == 0.0) return 'Rp 0';
  final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
  return formatter.format(val);
}

class OrmawaAgendaDetailScreen extends StatelessWidget {
  final OrmawaAgenda agenda;

  const OrmawaAgendaDetailScreen({super.key, required this.agenda});

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'terlaksana':
      case 'selesai':
        return Colors.green;
      case 'berlangsung':
        return Colors.orange;
      case 'batal':
      case 'dibatalkan':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(agenda.status);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'DETAIL AGENDA',
            subtitle: agenda.title.toUpperCase(),
            variant: AppBarVariant.ormawa,
            expandedHeight: 115.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(top: 8, left: 20, right: 20, bottom: 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(statusColor),
                  const SizedBox(height: 24),
                  
                  _buildSectionTitle('Informasi Utama'),
                  const SizedBox(height: 12),
                  _buildMainInfoGrid(statusColor),
                  
                  const SizedBox(height: 24),
                  _buildSectionTitle('Detail Kegiatan'),
                  const SizedBox(height: 12),
                  _buildTechnicalDetailsCard(),

                  const SizedBox(height: 24),
                  if (agenda.latarBelakang?.isNotEmpty == true) ...[
                    _buildSectionTitle('Latar Belakang'),
                    const SizedBox(height: 12),
                    _buildNarrativeCard(agenda.latarBelakang!),
                    const SizedBox(height: 24),
                  ],

                  if (agenda.tujuanKegiatan?.isNotEmpty == true) ...[
                    _buildSectionTitle('Tujuan Kegiatan'),
                    const SizedBox(height: 12),
                    _buildNarrativeCard(agenda.tujuanKegiatan!),
                    const SizedBox(height: 24),
                  ],

                  if (agenda.description.isNotEmpty) ...[
                    _buildSectionTitle('Deskripsi & Mekanisme'),
                    const SizedBox(height: 12),
                    _buildNarrativeCard(agenda.description),
                    const SizedBox(height: 32),
                  ],

                  _buildBottomActions(context),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(Color statusColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: statusColor.withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.calendar_month_rounded, color: statusColor, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'STATUS AGENDA',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.0,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withAlpha(15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: statusColor.withAlpha(30)),
                      ),
                      child: Text(
                        agenda.status.toUpperCase(),
                        style: AppTextStyles.labelSm.copyWith(color: statusColor, fontWeight: FontWeight.w900, fontSize: 9, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  agenda.title,
                  style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF1E293B), fontWeight: FontWeight.w900, fontSize: 15),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.labelSm.copyWith(
        color: const Color(0xFF64748B),
        fontWeight: FontWeight.w900,
        letterSpacing: 1.0,
      ),
    );
  }

  Widget _buildMainInfoGrid(Color statusColor) {
    final startTimeStr = DateFormat('HH:mm').format(agenda.date);
    final endTimeStr = DateFormat('HH:mm').format(agenda.endDate);
    final dateStr = DateFormat('EEEE, dd MMMM yyyy').format(agenda.date);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          _buildGridItem(Icons.calendar_today_rounded, 'Hari & Tanggal', dateStr, isBold: true),
          const Divider(height: 24, color: Color(0xFFF1F5F9)),
          _buildGridItem(Icons.access_time_rounded, 'Waktu Pelaksanaan', '$startTimeStr - $endTimeStr WIB'),
          const Divider(height: 24, color: Color(0xFFF1F5F9)),
          _buildGridItem(Icons.location_on_rounded, 'Lokasi / Ruangan', agenda.location.isNotEmpty ? agenda.location : 'Belum ditentukan'),
          if (agenda.pjKegiatan?.isNotEmpty == true) ...[
            const Divider(height: 24, color: Color(0xFFF1F5F9)),
            _buildGridItem(Icons.person_rounded, 'Penanggung Jawab', agenda.pjKegiatan!),
          ],
          if (agenda.estimasiDana != null && agenda.estimasiDana! > 0) ...[
            const Divider(height: 24, color: Color(0xFFF1F5F9)),
            _buildGridItem(
              Icons.payments_rounded,
              'Estimasi Anggaran',
              formatRp(agenda.estimasiDana),
              valueColor: Colors.green[700],
              isBold: true,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildGridItem(IconData icon, String label, String value, {bool isBold = false, Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(
                value,
                style: AppTextStyles.bodyMd.copyWith(
                  fontWeight: isBold ? FontWeight.w900 : FontWeight.bold,
                  color: valueColor ?? const Color(0xFF1E293B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTechnicalDetailsCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          _buildTechnicalItem('Landasan Kegiatan', agenda.landasanKegiatan?.isNotEmpty == true ? agenda.landasanKegiatan! : '—'),
          const Divider(height: 20, color: Color(0xFFF8FAFC)),
          _buildTechnicalItem('Bentuk Kegiatan', agenda.bentukKegiatan?.isNotEmpty == true ? agenda.bentukKegiatan! : '—'),
          const Divider(height: 20, color: Color(0xFFF8FAFC)),
          _buildTechnicalItem('Sasaran Kegiatan', agenda.sasaranKegiatan?.isNotEmpty == true ? agenda.sasaranKegiatan! : '—'),
          const Divider(height: 20, color: Color(0xFFF8FAFC)),
          _buildTechnicalItem('Mitra Kerja', agenda.mitra?.isNotEmpty == true ? agenda.mitra! : '—'),
          const Divider(height: 20, color: Color(0xFFF8FAFC)),
          _buildTechnicalItem('Sumber Dana', agenda.sumberDana?.isNotEmpty == true ? agenda.sumberDana! : '—'),
          const Divider(height: 20, color: Color(0xFFF8FAFC)),
          _buildTechnicalItem('Indikator Keberhasilan', agenda.indikatorKeberhasilan?.isNotEmpty == true ? agenda.indikatorKeberhasilan! : '—'),
        ],
      ),
    );
  }

  Widget _buildTechnicalItem(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 4,
          child: Text(label, style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 12)),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 5,
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildNarrativeCard(String content) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        content,
        style: const TextStyle(color: Color(0xFF334155), height: 1.6, fontSize: 13, fontWeight: FontWeight.w500),
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const OrmawaAbsensiScreen()),
          );
        },
        icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white),
        label: const Text(
          'BUKA ABSENSI KEGIATAN',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 8,
          shadowColor: AppColors.primary.withAlpha(50),
        ),
      ),
    );
  }
}
