import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:intl/intl.dart';

import 'package:bkuhub_mobile/core/theme/app_colors.dart';

class OrmawaQuickStats extends StatelessWidget {
  const OrmawaQuickStats({super.key});

  @override
  Widget build(BuildContext context) {
    final ormawa = context.watch<OrmawaProvider>();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.primaryContainer],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF003399).withAlpha(60),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem(
                  icon: Icons.description_rounded,
                  title: 'Proposal Aktif',
                  value: ormawa.activeProposalsCount.toString(),
                ),
                Container(width: 1, height: 40, color: Colors.white.withAlpha(50)),
                _buildStatItem(
                  icon: Icons.people_rounded,
                  title: 'Total Anggota',
                  value: ormawa.totalMembers.toString(),
                ),
                Container(width: 1, height: 40, color: Colors.white.withAlpha(50)),
                _buildStatItem(
                  icon: Icons.checklist_rounded,
                  title: 'Approval Rate',
                  value: '${ormawa.approvalRate}%',
                ),
              ],
            ),
            const SizedBox(height: 20),
            Divider(color: Colors.white.withAlpha(50), height: 1),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  icon: Icons.account_balance_wallet_rounded,
                  title: 'Kas Organisasi',
                  value: NumberFormat.compactCurrency(
                    symbol: 'Rp',
                    locale: 'id_ID',
                    decimalDigits: 1,
                  ).format(ormawa.balance),
                ),
                Container(width: 1, height: 40, color: Colors.white.withAlpha(50)),
                _buildStatItem(
                  icon: Icons.event_rounded,
                  title: 'Agenda Dekat',
                  value: ormawa.upcomingAgendasCount.toString(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Expanded(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(30),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: AppTextStyles.labelSm.copyWith(
              color: Colors.white.withAlpha(200),
              fontSize: 10,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
