import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../../core/providers/ormawa_provider.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_text_styles.dart';
import '../../../../../core/widgets/bku_app_bar.dart';
import 'create_transaction_screen.dart';

class OrmawaFinanceScreen extends StatefulWidget {
  final bool showBackButton;
  const OrmawaFinanceScreen({super.key, this.showBackButton = true});

  @override
  State<OrmawaFinanceScreen> createState() => _OrmawaFinanceScreenState();
}

class _OrmawaFinanceScreenState extends State<OrmawaFinanceScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<OrmawaProvider>().getFinance());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'BUKU KAS',
            subtitle: 'FINANCIAL MANAGEMENT',
            variant: AppBarVariant.ormawa,
            expandedHeight: 180.0,
            showBackButton: widget.showBackButton,
          ),

          // Summary Cards
          SliverToBoxAdapter(child: _buildSummaryHeader()),

          // Transaction List
          _buildTransactionList(),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateTransactionScreen(),
            ),
          ).then((_) => context.read<OrmawaProvider>().getFinance());
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'TRANSAKSI BARU',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildSummaryHeader() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final transactions = provider.financeList;
        double totalMasuk = 0;
        double totalKeluar = 0;

        for (var t in transactions) {
          if (t.type == 'pemasukan') {
            totalMasuk += t.nominal;
          } else {
            totalKeluar += t.nominal;
          }
        }

        final balance = totalMasuk - totalKeluar;

        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Main Balance Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primary,
                      AppColors.primary.withAlpha(200),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(50),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL SALDO KAS',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white70,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      NumberFormat.currency(
                        locale: 'id',
                        symbol: 'Rp ',
                        decimalDigits: 0,
                      ).format(balance),
                      style: AppTextStyles.titleLg.copyWith(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // In/Out Mini Cards
              Row(
                children: [
                  Expanded(
                    child: _buildMiniStatCard(
                      'PEMASUKAN',
                      totalMasuk,
                      Colors.green,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildMiniStatCard(
                      'PENGELUARAN',
                      totalKeluar,
                      Colors.red,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'RIWAYAT MUTASI',
                    style: AppTextStyles.titleMd.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  TextButton(
                    onPressed: () => provider.getFinance(),
                    child: Text(
                      'Refresh',
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMiniStatCard(String label, double amount, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withAlpha(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: color,
              fontSize: 8,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            NumberFormat.currency(
              locale: 'id',
              symbol: 'Rp',
              decimalDigits: 0,
            ).format(amount),
            style: AppTextStyles.labelMd.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final transactions = provider.financeList;

        if (transactions.isEmpty) {
          return const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.only(top: 100),
              child: Center(child: Text('Belum ada riwayat transaksi')),
            ),
          );
        }

        return SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate((context, index) {
              final t = transactions[index];
              final isIncome = t.type == 'pemasukan';

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: (isIncome ? Colors.green : Colors.red).withAlpha(
                          10,
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isIncome
                            ? Icons.arrow_downward_rounded
                            : Icons.arrow_upward_rounded,
                        color: isIncome ? Colors.green : Colors.red,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            t.description,
                            style: AppTextStyles.labelMd.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${t.category} • ${DateFormat('dd MMM yyyy').format(t.date)}',
                            style: AppTextStyles.labelSm.copyWith(
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${isIncome ? '+' : '-'} ${NumberFormat.currency(locale: 'id', symbol: '', decimalDigits: 0).format(t.nominal)}',
                      style: AppTextStyles.labelMd.copyWith(
                        color: isIncome ? Colors.green : Colors.red,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              );
            }, childCount: transactions.length),
          ),
        );
      },
    );
  }
}
