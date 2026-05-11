import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/ormawa/finance/presentation/pages/create_transaction_screen.dart';

class OrmawaFinanceScreen extends StatefulWidget {
  final bool showBackButton;
  const OrmawaFinanceScreen({super.key, this.showBackButton = true});

  @override
  State<OrmawaFinanceScreen> createState() => _OrmawaFinanceScreenState();
}

class _OrmawaFinanceScreenState extends State<OrmawaFinanceScreen> {
  @override
  Widget build(BuildContext context) {
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
                MaterialPageRoute(builder: (context) => const CreateTransactionScreen()),
              );
            },
            backgroundColor: AppColors.primary,
            elevation: 8,
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: Text('Catat Transaksi', style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
      body: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'BUKU KAS & KEUANGAN',
            subtitle: 'KEUANGAN',
            expandedHeight: 160.0,
            showBackButton: widget.showBackButton,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                _buildFinanceOverview(),
                const SizedBox(height: 32),
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
                        'MUTASI KAS',
                        style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF64748B), letterSpacing: 1),
                      ),
                      Text(
                        'Total: 15 Transaksi',
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildTransactionItem(index),
                childCount: 15,
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

  Widget _buildFinanceOverview() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: FadeInAnimation(
        delay: 0.3,
        child: Column(
          children: [
            Container(
              width: double.infinity,
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
                    right: -20,
                    top: -20,
                    child: Icon(Icons.account_balance_wallet_rounded, color: Colors.white.withAlpha(20), size: 100),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SALDO KAS SAAT INI',
                        style: AppTextStyles.labelSm.copyWith(color: Colors.white60, fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 9),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Rp 10.000.000',
                        style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white.withAlpha(30), borderRadius: BorderRadius.circular(10)),
                        child: Text(
                          'Update: 07 Mei 2026',
                          style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildSecondaryFinanceCard('TOTAL PEMASUKAN', 'Rp 0', Colors.green, Icons.arrow_downward_rounded),
                const SizedBox(width: 16),
                _buildSecondaryFinanceCard('TOTAL PENGELUARAN', 'Rp 0', Colors.red, Icons.arrow_upward_rounded),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecondaryFinanceCard(String title, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(3),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: color.withAlpha(10), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 16),
            ),
            const SizedBox(height: 12),
            Text(title, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 8, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(value, style: AppTextStyles.titleLg.copyWith(color: const Color(0xFF1E293B), fontSize: 14, fontWeight: FontWeight.w900)),
          ],
        ),
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
                    decoration: InputDecoration(
                      hintText: 'Cari transaksi...',
                      hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Container(
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
      ],
    );
  }

  Widget _buildTransactionItem(int index) {
    final isOut = index % 2 == 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isOut ? Colors.red.withAlpha(10) : Colors.green.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(isOut ? Icons.arrow_outward_rounded : Icons.arrow_downward_rounded, color: isOut ? Colors.red : Colors.green, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isOut ? 'Pembayaran Perlengkapan' : 'Pemasukan Kas',
                  style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                ),
                const SizedBox(height: 2),
                Text(
                  '2${index % 9 + 1} Apr 2026 • Kas Umum',
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isOut ? '-' : '+'}Rp ${(index + 1) * 100}.000',
                style: AppTextStyles.bodyMd.copyWith(color: isOut ? Colors.red : Colors.green, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: (isOut ? Colors.red : Colors.green).withAlpha(10),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isOut ? 'KELUAR' : 'MASUK',
                  style: AppTextStyles.labelSm.copyWith(color: isOut ? Colors.red : Colors.green, fontSize: 8, fontWeight: FontWeight.w900),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
