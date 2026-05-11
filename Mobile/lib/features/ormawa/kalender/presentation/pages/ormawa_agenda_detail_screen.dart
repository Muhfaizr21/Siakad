import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:intl/intl.dart';

import 'package:bkuhub_mobile/features/ormawa/absensi/presentation/pages/ormawa_absensi_screen.dart';

class OrmawaAgendaDetailScreen extends StatelessWidget {
  final OrmawaAgenda agenda;

  const OrmawaAgendaDetailScreen({super.key, required this.agenda});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'DETAIL AGENDA',
            subtitle: agenda.id,
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Informasi Kegiatan'),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        _buildInfoItem(Icons.event_note_rounded, 'Nama Kegiatan', agenda.title, isBold: true),
                        const Divider(height: 32, color: Color(0xFFE2E8F0)),
                        _buildInfoItem(Icons.calendar_today_rounded, 'Waktu Pelaksanaan', DateFormat('EEEE, dd MMMM yyyy').format(agenda.date)),
                        const SizedBox(height: 16),
                        _buildInfoItem(Icons.access_time_rounded, 'Jam', DateFormat('HH:mm').format(agenda.date) + ' WIB'),
                        const SizedBox(height: 16),
                        _buildInfoItem(Icons.location_on_rounded, 'Lokasi', agenda.location),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Deskripsi'),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.blue.withAlpha(5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.blue.withAlpha(10)),
                    ),
                    child: Text(
                      agenda.description,
                      style: AppTextStyles.bodyMd.copyWith(color: Colors.black87, height: 1.6),
                    ),
                  ),
                  const SizedBox(height: 40),
                  _buildBottomActions(context),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue.withAlpha(15), Colors.blue.withAlpha(5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.blue.withAlpha(20)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.blue.withAlpha(20), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: const Icon(Icons.calendar_month_rounded, color: Colors.blue, size: 28),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  agenda.status.toUpperCase(),
                  style: AppTextStyles.labelSm.copyWith(
                    color: Colors.blue,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Satu Agenda Terjadwal',
                  style: AppTextStyles.bodyMd.copyWith(color: Colors.black54, fontWeight: FontWeight.bold),
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
      style: AppTextStyles.labelMd.copyWith(
        fontWeight: FontWeight.w900,
        color: const Color(0xFF1E293B),
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value, {bool isBold = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Icon(icon, size: 18, color: AppColors.primary),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
              const SizedBox(height: 4),
              Text(
                value,
                style: AppTextStyles.bodyMd.copyWith(
                  fontWeight: isBold ? FontWeight.w900 : FontWeight.bold,
                  color: const Color(0xFF1E293B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 60,
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
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 8,
          shadowColor: AppColors.primary.withAlpha(100),
        ),
      ),
    );
  }
}
