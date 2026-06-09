import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';

import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_detail_screen.dart';
import 'package:bkuhub_mobile/core/widgets/unified_card.dart';

class OrmawaProposalList extends StatelessWidget {
  const OrmawaProposalList({super.key});

  @override
  Widget build(BuildContext context) {
    final proposals = context.watch<OrmawaProvider>().proposals;

    if (proposals.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 40),
          child: Text('Belum ada proposal terbaru', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: proposals.length > 3 ? 3 : proposals.length,
      itemBuilder: (context, index) {
        final proposal = proposals[index];
        
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

        return FadeInAnimation(
          delay: 0.9 + (index * 0.1),
          child: UnifiedCard(
            margin: const EdgeInsets.only(bottom: 16),
            borderRadius: 24.0,
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.description_outlined, color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            proposal.title,
                            style: AppTextStyles.bodyMd.copyWith(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: const Color(0xFF1E293B),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            proposal.code,
                            style: AppTextStyles.labelSm.copyWith(
                              color: AppColors.outline,
                              fontWeight: FontWeight.bold,
                            ),
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
                        style: AppTextStyles.labelSm.copyWith(
                          color: statusColor.withOpacity(0.9),
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, size: 14, color: AppColors.outline),
                        const SizedBox(width: 6),
                        Text(
                          DateFormat('dd MMM yyyy, HH:mm').format(proposal.date),
                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => OrmawaProposalDetailScreen(proposal: proposal),
                          ),
                        );
                      },
                      child: Row(
                        children: [
                          Text(
                            'Lihat Detail',
                            style: AppTextStyles.labelSm.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(width: 2),
                          const Icon(Icons.arrow_forward_rounded, color: AppColors.primary, size: 14),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
