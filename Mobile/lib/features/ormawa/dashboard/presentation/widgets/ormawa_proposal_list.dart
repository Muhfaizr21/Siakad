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
        final statusLower = proposal.status.toLowerCase();
        
        Color statusColor;
        IconData statusIcon;
        List<Color> gradientColors;

        if (statusLower.contains('disetujui') || statusLower == 'selesai') {
          statusColor = const Color(0xFF10B981); // Emerald green
          statusIcon = Icons.check_circle_rounded;
          gradientColors = [const Color(0xFFD1FAE5), const Color(0xFFA7F3D0)];
        } else if (statusLower.contains('tolak') || statusLower == 'batal') {
          statusColor = const Color(0xFFEF4444); // Red
          statusIcon = Icons.cancel_rounded;
          gradientColors = [const Color(0xFFFEE2E2), const Color(0xFFFECACA)];
        } else if (statusLower.contains('revisi')) {
          statusColor = const Color(0xFFF59E0B); // Amber
          statusIcon = Icons.edit_document;
          gradientColors = [const Color(0xFFFEF3C7), const Color(0xFFFDE68A)];
        } else {
          statusColor = const Color(0xFF3B82F6); // Blue
          statusIcon = Icons.file_present_rounded;
          gradientColors = [const Color(0xFFDBEAFE), const Color(0xFFBFDBFE)];
        }

        return FadeInAnimation(
          delay: 0.9 + (index * 0.1),
          child: UnifiedCard(
            margin: const EdgeInsets.only(bottom: 16),
            borderRadius: 24.0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: gradientColors,
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(statusIcon, color: statusColor, size: 22),
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
                                color: const Color(0xFF003399),
                                fontWeight: FontWeight.w800,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(width: 2),
                            const Icon(Icons.arrow_forward_rounded, color: Color(0xFF003399), size: 14),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
