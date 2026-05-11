import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/create_proposal_screen.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_detail_screen.dart';

class OrmawaProposalScreen extends StatefulWidget {
  final bool showBackButton;
  const OrmawaProposalScreen({super.key, this.showBackButton = true});

  @override
  State<OrmawaProposalScreen> createState() => _OrmawaProposalScreenState();
}

class _OrmawaProposalScreenState extends State<OrmawaProposalScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final allProposals = ormawaProvider.proposals;
    
    final filteredProposals = allProposals.where((p) {
      return p.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
             p.code.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 70),
        child: FadeInAnimation(
          delay: 1.0,
          child: FloatingActionButton.extended(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CreateProposalScreen()),
              );
            },
            backgroundColor: AppColors.primary,
            elevation: 8,
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: Text('Buat Proposal', style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
      body: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        slivers: [
          BkuAppBar(
            title: 'MANAJEMEN PROPOSAL',
            subtitle: 'PROPOSAL & SURAT',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: widget.showBackButton,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                _buildProposalStats(ormawaProvider),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _buildSearchAndFilter(),
                ),
                const SizedBox(height: 32),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Daftar Proposal',
                        style: AppTextStyles.titleLg.copyWith(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Total: ${filteredProposals.length}',
                          style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                if (filteredProposals.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.search_off_rounded, size: 60, color: AppColors.outline.withAlpha(50)),
                          const SizedBox(height: 16),
                          Text(
                            'Proposal tidak ditemukan',
                            style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildProposalItem(filteredProposals[index], index),
                childCount: filteredProposals.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(
            child: SizedBox(height: 150),
          ),
        ],
      ),
    );
  }

  Widget _buildProposalStats(OrmawaProvider provider) {
    final proposals = provider.proposals;
    final diajukan = proposals.where((p) => p.status.toLowerCase() == 'diajukan').length;
    final disetujui = proposals.where((p) => p.status.toLowerCase() == 'disetujui' || p.status.toLowerCase() == 'disetujui_fakultas').length;
    final ditolak = proposals.where((p) => p.status.toLowerCase() == 'ditolak').length;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: FadeInAnimation(
        delay: 0.3,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withAlpha(12),
                blurRadius: 30,
                offset: const Offset(0, 15),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatMetric('Semua', proposals.length.toString(), Colors.blue, Icons.all_inbox_rounded),
              _buildMetricDivider(),
              _buildStatMetric('Proses', diajukan.toString(), Colors.orange, Icons.hourglass_empty_rounded),
              _buildMetricDivider(),
              _buildStatMetric('Selesai', disetujui.toString(), Colors.green, Icons.check_circle_outline_rounded),
              _buildMetricDivider(),
              _buildStatMetric('Ditolak', ditolak.toString(), Colors.red, Icons.cancel_outlined),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricDivider() {
    return Container(
      width: 1.5,
      height: 35,
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(1),
      ),
    );
  }

  Widget _buildStatMetric(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF94A3B8),
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilter() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: AppColors.outline, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value;
                      });
                    },
                    decoration: InputDecoration(
                      hintText: 'Cari proposal...',
                      hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
                if (_searchQuery.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 18),
                    onPressed: () {
                      setState(() {
                        _searchController.clear();
                        _searchQuery = '';
                      });
                    },
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: () {
            // Show Filter Bottom Sheet
          },
          child: Container(
            height: 50,
            width: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.filter_list_rounded, color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildProposalItem(OrmawaProposal proposal, int index) {
    final currencyFormatter = NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0);
    final dateFormatter = DateFormat('dd MMM yyyy');

    Color statusColor;
    switch (proposal.status.toUpperCase()) {
      case 'DISETUJUI':
      case 'DISETUJUI_FAKULTAS':
        statusColor = Colors.green;
        break;
      case 'DITOLAK':
        statusColor = Colors.red;
        break;
      case 'PROSES':
      case 'DIAJUKAN':
        statusColor = Colors.orange;
        break;
      default:
        statusColor = Colors.blue;
    }

    return FadeInAnimation(
      delay: 0.1 * (index % 5),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.description_rounded, color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        proposal.title,
                        style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${proposal.code} • ${dateFormatter.format(proposal.date).toUpperCase()}',
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    proposal.status.toUpperCase(),
                    style: AppTextStyles.labelSm.copyWith(color: statusColor, fontSize: 8, fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Divider(color: Color(0xFFF1F5F9), height: 1),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ANGGARAN', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 9, fontWeight: FontWeight.w900)),
                    Text(currencyFormatter.format(proposal.budget), style: AppTextStyles.bodyLg.copyWith(color: Colors.green[700], fontWeight: FontWeight.w900)),
                  ],
                ),
                Row(
                  children: [
                    _buildActionButton(Icons.visibility_outlined, Colors.blue, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => OrmawaProposalDetailScreen(proposal: proposal)),
                      );
                    }),
                    const SizedBox(width: 8),
                    _buildActionButton(Icons.edit_outlined, Colors.teal, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => CreateProposalScreen(initialProposal: proposal)),
                      );
                    }),
                    const SizedBox(width: 8),
                    _buildActionButton(Icons.delete_outline_rounded, Colors.red, () {
                      _showDeleteConfirmation(context, proposal);
                    }),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withAlpha(15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, OrmawaProposal proposal) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Hapus Proposal?', style: AppTextStyles.titleLg.copyWith(fontSize: 18)),
        content: Text('Apakah Anda yakin ingin menghapus proposal "${proposal.title}"? Tindakan ini tidak dapat dibatalkan.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('BATAL', style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
          ),
          ElevatedButton(
            onPressed: () async {
              final provider = Provider.of<OrmawaProvider>(context, listen: false);
              await provider.deleteProposal(proposal.id);
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Proposal berhasil dihapus'), backgroundColor: Colors.red),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: Text('HAPUS', style: AppTextStyles.labelMd.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
