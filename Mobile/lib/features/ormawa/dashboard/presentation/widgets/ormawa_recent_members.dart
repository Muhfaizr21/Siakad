import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/unified_section_header.dart';
import 'package:bkuhub_mobile/core/widgets/unified_card.dart';
import 'package:bkuhub_mobile/features/ormawa/anggota/presentation/pages/ormawa_anggota_screen.dart';

class OrmawaRecentMembers extends StatelessWidget {
  const OrmawaRecentMembers({super.key});

  @override
  Widget build(BuildContext context) {
    final ormawa = context.watch<OrmawaProvider>();
    final members = ormawa.members;

    if (members.isEmpty) return const SizedBox.shrink();

    // Take max 8 members
    final recentMembers = members.take(8).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: UnifiedSectionHeader(
            title: 'Anggota Terbaru',
            onSeeAll: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const OrmawaAnggotaScreen(),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: UnifiedCard(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            child: SizedBox(
              height: 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: recentMembers.length,
                separatorBuilder: (context, index) => const SizedBox(width: 16),
                itemBuilder: (context, index) {
                  final member = recentMembers[index];
                  final name = member.name.isNotEmpty ? member.name : 'Unknown';
                  final firstName = name.split(' ').first;
                  final initial = name.substring(0, 1).toUpperCase();

                  return Column(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: const Color(0xFF003399).withAlpha(15),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF003399).withAlpha(30), width: 1.5),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          initial,
                          style: AppTextStyles.titleLg.copyWith(
                            color: const Color(0xFF003399),
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      SizedBox(
                        width: 60,
                        child: Text(
                          firstName,
                          style: AppTextStyles.labelSm.copyWith(
                            fontSize: 10,
                            color: Colors.grey[700],
                            fontWeight: FontWeight.w600,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}
