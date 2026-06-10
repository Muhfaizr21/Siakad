import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/unified_card.dart';
import 'package:bkuhub_mobile/core/services/proposal_pdf_service.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/create_proposal_screen.dart';
import 'package:intl/intl.dart';

class OrmawaProposalDetailScreen extends StatelessWidget {
  final OrmawaProposal proposal;

  const OrmawaProposalDetailScreen({super.key, required this.proposal});

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'disetujui':
      case 'selesai':
      case 'disetujui_univ':
      case 'disetujui_fakultas':
        return Colors.green;
      case 'ditolak':
        return Colors.red;
      case 'revisi':
        return Colors.orange;
      case 'diajukan':
      default:
        return Colors.blue;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'disetujui_fakultas':
        return 'Disetujui Fakultas';
      case 'disetujui_univ':
        return 'Disetujui Universitas';
      case 'revisi':
        return 'Perlu Revisi';
      case 'diajukan':
        return 'Menunggu Review';
      case 'ditolak':
        return 'Ditolak';
      case 'selesai':
        return 'Selesai';
      default:
        return status.toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(proposal.status);
    final statusText = _getStatusText(proposal.status);
    final isRevisi = proposal.status.toLowerCase() == 'revisi';
    final isDitolak = proposal.status.toLowerCase() == 'ditolak';

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
                onPressed: () async {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Menyiapkan dokumen PDF...'),
                      behavior: SnackBarBehavior.floating,
                      duration: Duration(seconds: 1),
                    ),
                  );
                  await ProposalPdfService.generateAndPrintPdf(proposal);
                },
                icon: const Icon(Icons.print_rounded, color: Colors.white),
                tooltip: 'Cetak Proposal',
              ),
              IconButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Membuka menu bagikan...'),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                icon: const Icon(Icons.share_rounded, color: Colors.white),
                tooltip: 'Bagikan',
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(statusColor, statusText),
                  
                  if ((isRevisi || isDitolak) && proposal.catatan != null && proposal.catatan!.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    _buildReviewerNote(proposal.catatan!),
                  ],

                  const SizedBox(height: 32),
                  _buildSectionTitle('Informasi Dasar'),
                  const SizedBox(height: 16),
                  UnifiedCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        _buildInfoItem(Icons.title_rounded, 'Judul Proposal', proposal.title, color: Colors.blue),
                        _buildInfoItem(Icons.foundation_rounded, 'Landasan Kegiatan', proposal.landasanKegiatan ?? '-', color: Colors.indigo),
                        _buildInfoItem(Icons.category_rounded, 'Bentuk Kegiatan', proposal.bentukKegiatan ?? '-', color: Colors.purple),
                        _buildInfoItem(Icons.person_rounded, 'Penanggung Jawab', proposal.pjKegiatan ?? '-', color: Colors.teal, isLast: true),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  _buildSectionTitle('Pelaksanaan & Target'),
                  const SizedBox(height: 16),
                  UnifiedCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        _buildInfoItem(Icons.calendar_today_rounded, 'Tanggal Pengajuan', DateFormat('dd MMMM yyyy').format(proposal.date), color: Colors.orange),
                        _buildInfoItem(Icons.access_time_rounded, 'Jadwal Pelaksanaan', proposal.jadwalPelaksanaan ?? '-', color: Colors.deepOrange),
                        _buildInfoItem(Icons.handshake_rounded, 'Mitra Kerja', proposal.mitra ?? '-', color: Colors.amber),
                        _buildInfoItem(Icons.group_rounded, 'Sasaran Kegiatan', proposal.sasaranKegiatan ?? '-', color: Colors.redAccent, isLast: true),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  _buildSectionTitle('Keuangan'),
                  const SizedBox(height: 16),
                  UnifiedCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        _buildInfoItem(Icons.payments_rounded, 'Total Anggaran', 'Rp ${NumberFormat('#,###', 'id_ID').format(proposal.budget)}', color: Colors.green),
                        _buildInfoItem(Icons.account_balance_wallet_rounded, 'Sumber Dana', proposal.sumberDana ?? '-', color: Colors.lightGreen, isLast: true),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  _buildSectionTitle('Deskripsi & Analisis'),
                  const SizedBox(height: 16),
                  UnifiedCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTextContent('Latar Belakang', proposal.latarBelakang),
                        _buildTextContent('Tujuan Kegiatan', proposal.tujuanKegiatan),
                        _buildTextContent('Indikator Keberhasilan', proposal.indikatorKeberhasilan),
                        _buildTextContent('Deskripsi Singkat', proposal.description, isLast: true),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  _buildSectionTitle('Status Verifikasi'),
                  const SizedBox(height: 16),
                  _buildStatusTimeline(proposal.status),
                  
                  const SizedBox(height: 32),
                  _buildSectionTitle('Lampiran & Dokumen'),
                  const SizedBox(height: 16),
                  if (proposal.fileUrl != null && proposal.fileUrl!.isNotEmpty)
                    _buildFileCard('Dokumen_Proposal.pdf', 'Klik untuk mengunduh')
                  else
                    Text(
                      'Tidak ada dokumen terlampir',
                      style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontStyle: FontStyle.italic),
                    ),
                    
                  const SizedBox(height: 40),
                  if (isRevisi) _buildReSubmitButton(context),
                  if (!isRevisi) _buildBottomActions(context),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewerNote(String catatan) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.orange.withAlpha(20),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange.withAlpha(50)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_rounded, color: Colors.orange, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Catatan Reviewer',
                  style: AppTextStyles.labelSm.copyWith(color: Colors.orange[800], fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  catatan,
                  style: AppTextStyles.bodyMd.copyWith(color: Colors.orange[900]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextContent(String title, String? content, {bool isLast = false}) {
    if (content == null || content.isEmpty) return const SizedBox();
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                title.toUpperCase(),
                style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Text(
              content,
              style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF1E293B), height: 1.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    final status = currentStatus.toLowerCase();
    
    bool isSubmitted = true;
    bool isFakultas = status == 'disetujui_fakultas' || status == 'disetujui_univ' || status == 'selesai';
    bool isUniv = status == 'disetujui_univ' || status == 'selesai';
    bool isRevisi = status == 'revisi';
    bool isDitolak = status == 'ditolak';

    return UnifiedCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildTimelineStep('Proposal Diajukan', 'Menunggu respon Fakultas', isSubmitted, true),
          _buildTimelineStep(
            isRevisi ? 'Revisi Fakultas' : (isDitolak && !isFakultas ? 'Ditolak Fakultas' : 'Persetujuan Fakultas'), 
            isRevisi ? 'Perlu perbaikan proposal' : (isDitolak && !isFakultas ? 'Proposal tidak disetujui' : 'Sedang dalam pengecekan'), 
            isFakultas || isRevisi || isDitolak, 
            true,
            isError: isDitolak && !isFakultas,
            isWarning: isRevisi,
          ),
          _buildTimelineStep(
            (isDitolak && isFakultas) ? 'Ditolak Universitas' : 'Persetujuan Universitas',
            (isDitolak && isFakultas) ? 'Proposal tidak disetujui' : (isUniv ? 'Proposal telah disahkan' : 'Tahap finalisasi di tingkat Univ'),
            isUniv || (isDitolak && isFakultas),
            false,
            isError: (isDitolak && isFakultas),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String title, String subtitle, bool isDone, bool showLine, {bool isError = false, bool isWarning = false}) {
    Color indicatorColor = Colors.green;
    if (isError) indicatorColor = Colors.red;
    if (isWarning) indicatorColor = Colors.orange;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isDone ? indicatorColor : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: isDone ? Colors.transparent : const Color(0xFFCBD5E1), width: 2),
              ),
              child: isDone ? Icon(
                isError ? Icons.close : (isWarning ? Icons.edit : Icons.check), 
                size: 14, 
                color: Colors.white
              ) : null,
            ),
            if (showLine)
              Container(
                width: 2,
                height: 40,
                color: isDone ? indicatorColor.withAlpha(50) : const Color(0xFFCBD5E1),
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
                  color: isDone ? (isError ? Colors.red : (isWarning ? Colors.orange : Colors.black)) : const Color(0xFF94A3B8),
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

  Widget _buildReSubmitButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateProposalScreen(initialProposal: proposal),
            ),
          );
        },
        icon: const Icon(Icons.edit_document, color: Colors.white),
        label: const Text('PERBAIKI PROPOSAL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.orange,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(20)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.support_agent_rounded, color: AppColors.primary, size: 32),
          ),
          const SizedBox(height: 16),
          Text(
            'Butuh Bantuan?',
            style: AppTextStyles.titleLg.copyWith(fontSize: 18, color: const Color(0xFF1E293B)),
          ),
          const SizedBox(height: 8),
          Text(
            'Persetujuan dan revisi proposal hanya dapat dilakukan oleh Pihak Kampus. Silakan hubungi admin jika ada kendala.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF64748B), height: 1.5),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 20),
              label: const Text('HUBUNGI ADMIN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(Color statusColor, String statusText) {
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
                  statusText.toUpperCase(),
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: AppTextStyles.labelMd.copyWith(
            fontWeight: FontWeight.w900,
            color: const Color(0xFF1E293B),
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 4),
        Container(width: 40, height: 3, decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(2))),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value, {Color color = AppColors.primary, bool isLast = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontSize: 11)),
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
    return UnifiedCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
