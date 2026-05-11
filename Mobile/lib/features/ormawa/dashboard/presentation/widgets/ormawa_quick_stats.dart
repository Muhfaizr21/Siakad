import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:intl/intl.dart';

class OrmawaQuickStats extends StatelessWidget {
  const OrmawaQuickStats({super.key});

  @override
  Widget build(BuildContext context) {
    final ormawa = context.watch<OrmawaProvider>();
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: FadeInAnimation(
        delay: 0.4,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF003399), Color(0xFF001A4D)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF003399).withAlpha(60),
                blurRadius: 25,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                top: -50,
                right: -50,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(10),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _MiniStat(
                        title: 'Total Anggota',
                        value: ormawa.totalMembers.toString(),
                        icon: Icons.people_rounded,
                        color: Colors.purpleAccent,
                      ),
                      Container(width: 1, height: 40, color: Colors.white.withAlpha(30)),
                      _MiniStat(
                        title: 'Kas Organisasi',
                        value: NumberFormat.compactCurrency(
                          symbol: 'Rp',
                          locale: 'id_ID',
                          decimalDigits: 1,
                        ).format(ormawa.balance),
                        icon: Icons.account_balance_wallet_rounded,
                        color: Colors.greenAccent,
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Divider(color: Colors.white.withAlpha(20), height: 1),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _MiniStat(
                        title: 'Proposal Aktif',
                        value: ormawa.activeProposalsCount.toString(),
                        icon: Icons.description_rounded,
                        color: Colors.blueAccent,
                      ),
                      Container(width: 1, height: 40, color: Colors.white.withAlpha(30)),
                      _MiniStat(
                        title: 'Agenda Dekat',
                        value: ormawa.upcomingAgendasCount.toString(),
                        icon: Icons.event_rounded,
                        color: Colors.orangeAccent,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _MiniStat({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.labelSm.copyWith(color: Colors.white60, fontSize: 10),
              ),
              Text(
                value,
                style: AppTextStyles.titleLg.copyWith(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
