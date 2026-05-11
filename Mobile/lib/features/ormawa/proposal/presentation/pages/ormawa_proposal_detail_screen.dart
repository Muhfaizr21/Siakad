import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:intl/intl.dart';

class OrmawaProposalDetailScreen extends StatelessWidget {
  final OrmawaProposal proposal;

  const OrmawaProposalDetailScreen({super.key, required this.proposal});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    switch (proposal.status) {
      case 'Disetujui':
        statusColor = Colors.green;
        break;
      case 'Ditolak':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.orange;
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'DETAIL PROPOSAL',
            subtitle: proposal.code,
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
            actions: [
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.share_rounded, color: Colors.white),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(statusColor),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Informasi Dasar'),
                  const SizedBox(height: 16),
                  _buildInfoItem(Icons.title_rounded, 'Judul Proposal', proposal.title),
                  _buildInfoItem(Icons.calendar_today_rounded, 'Tanggal Pengajuan', DateFormat('dd MMMM yyyy, HH:mm').format(proposal.date)),
                  _buildInfoItem(Icons.person_rounded, 'Diajukan Oleh', 'Sekretaris Umum'),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Status Verifikasi Kampus'),
                  const SizedBox(height: 16),
                  _buildStatusTimeline(proposal.status),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Lampiran & Dokumen'),
                  const SizedBox(height: 16),
                  _buildFileCard('Proposal_Kegiatan.pdf', '2.4 MB'),
                  _buildFileCard('RAB_Festival.xlsx', '1.1 MB'),
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

  Widget _buildStatusTimeline(String currentStatus) {
    bool isSubmitted = true;
    bool isReviewing = currentStatus == 'Disetujui' || currentStatus == 'Ditolak';
    bool isApproved = currentStatus == 'Disetujui';
    bool isRejected = currentStatus == 'Ditolak';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          _buildTimelineStep('Proposal Diajukan', 'Menunggu respon awal', isSubmitted, true),
          _buildTimelineStep('Review Kemahasiswaan', 'Sedang dalam pengecekan berkas', isReviewing, true),
          _buildTimelineStep(
            isRejected ? 'Proposal Ditolak' : 'Persetujuan Kampus',
            isRejected ? 'Silahkan cek catatan revisi' : (isApproved ? 'Proposal telah disahkan' : 'Tahap finalisasi'),
            isApproved || isRejected,
            false,
            isError: isRejected,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String title, String subtitle, bool isDone, bool showLine, {bool isError = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isDone ? (isError ? Colors.red : Colors.green) : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: isDone ? Colors.transparent : const Color(0xFFCBD5E1), width: 2),
              ),
              child: isDone ? Icon(isError ? Icons.close : Icons.check, size: 14, color: Colors.white) : null,
            ),
            if (showLine)
              Container(
                width: 2,
                height: 40,
                color: isDone ? (isError ? Colors.red.withAlpha(50) : Colors.green.withAlpha(50)) : const Color(0xFFCBD5E1),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.bodyMd.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDone ? (isError ? Colors.red : Colors.black) : const Color(0xFF94A3B8),
                ),
              ),
              Text(
                subtitle,
                style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 11),
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
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.help_outline_rounded, color: Colors.white),
              label: const Text('HUBUNGI ADMIN KAMPUS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Persetujuan hanya dapat dilakukan oleh Pihak Kampus.',
            style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10, fontStyle: FontStyle.italic),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(Color statusColor) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: statusColor.withAlpha(10),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: statusColor.withAlpha(20)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: statusColor.withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.description_rounded, color: statusColor, size: 28),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  proposal.status.toUpperCase(),
                  style: AppTextStyles.labelSm.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Status Pengajuan Saat Ini',
                  style: AppTextStyles.bodyMd.copyWith(color: Colors.black54),
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

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
                const SizedBox(height: 4),
                Text(value, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFileCard(String fileName, String size) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file_rounded, color: AppColors.primary, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(fileName, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                Text(size, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
              ],
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.download_rounded, color: AppColors.primary),
          ),
        ],
      ),
    );
  }
}
