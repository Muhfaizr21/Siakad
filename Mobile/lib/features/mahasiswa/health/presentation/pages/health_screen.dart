import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/health_record.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/mahasiswa/health/presentation/pages/report_health_screen.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class HealthScreen extends StatefulWidget {
  const HealthScreen({super.key});

  @override
  State<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends State<HealthScreen> {
  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final latest = student.latestHealthRecord;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            title: 'Skrining Kesehatan',
            subtitle: 'LAYANAN KESEHATAN MAHASISWA',
            variant: AppBarVariant.student,
            expandedHeight: 160,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  if (latest != null) ...[
                    FadeInAnimation(
                      delay: 0.1,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Halo Tegar,', style: AppTextStyles.titleLg.copyWith(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.primary)),
                          Row(
                            children: [
                              Text('Kesehatanmu hari ini: ', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
                              Text(
                                latest.bmiStatus == 'Normal' ? 'Sangat Baik' : latest.bmiStatus, 
                                style: AppTextStyles.labelSm.copyWith(color: latest.bmiColor, fontWeight: FontWeight.w900)
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    FadeInAnimation(delay: 0.2, child: _buildBMIIndicator(latest)),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.3,
                      child: Row(
                        children: [
                          Container(width: 4, height: 18, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
                          const SizedBox(width: 10),
                          Text('Kondisi Tubuh Saat Ini', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    FadeInAnimation(delay: 0.4, child: _buildStatsGrid(latest)),
                    const SizedBox(height: 32),
                    FadeInAnimation(delay: 0.5, child: _buildHealthInsights(latest)),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.6,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Riwayat Skrining', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                          TextButton(onPressed: () {}, child: Text('Lihat Semua', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...List.generate(student.healthRecords.length, (index) => 
                      FadeInAnimation(
                        delay: 0.7 + (index * 0.1),
                        child: _buildHistoryCard(context, student.healthRecords[index]),
                      )
                    ),
                  ] else
                    FadeInAnimation(delay: 0.4, child: _buildEmptyState(context)),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FadeInAnimation(
        delay: 1.0,
        child: FloatingActionButton.extended(
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ReportHealthScreen())),
          backgroundColor: AppColors.primary,
          elevation: 4,
          icon: const Icon(Icons.add_rounded, color: Colors.white),
          label: Text('Update Data', style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildBMIIndicator(HealthRecord latest) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(20)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Indeks Massa Tubuh (BMI)', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(latest.bmi.toStringAsFixed(1), style: AppTextStyles.headlineMd.copyWith(fontSize: 32, fontWeight: FontWeight.w900, color: AppColors.primary)),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: latest.bmiColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: latest.bmiColor.withAlpha(50)),
                        ),
                        child: Text(
                          latest.bmiStatus.toUpperCase(),
                          style: AppTextStyles.labelSm.copyWith(color: latest.bmiColor, fontWeight: FontWeight.w900, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              _buildHealthBadge(latest.bmiStatus, latest.bmiColor),
            ],
          ),
          const SizedBox(height: 24),
          _buildBMISlider(latest.bmi),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: latest.bmiColor.withAlpha(10), borderRadius: BorderRadius.circular(16)),
            child: Text(
              _getBMIMessage(latest.bmiStatus),
              textAlign: TextAlign.center,
              style: AppTextStyles.labelSm.copyWith(color: latest.bmiColor, height: 1.4, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBMISlider(double bmi) {
    double progress = (bmi - 15) / (35 - 15);
    progress = progress.clamp(0.0, 1.0);

    return Column(
      children: [
        LayoutBuilder(
          builder: (context, constraints) => Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                height: 10,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(5),
                  gradient: const LinearGradient(
                    colors: [Colors.blue, Colors.green, Colors.orange, Colors.red],
                  ),
                ),
              ),
              Positioned(
                left: (constraints.maxWidth * progress - 4).clamp(0.0, constraints.maxWidth - 8),
                top: 1,
                child: Container(
                  height: 8,
                  width: 8,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Colors.black.withAlpha(50), blurRadius: 4),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: ['15', '20', '25', '30', '35'].map((v) => Text(v, style: AppTextStyles.labelSm.copyWith(fontSize: 10, color: AppColors.outline))).toList(),
        ),
      ],
    );
  }

  Widget _buildHealthBadge(String status, Color color) {
    String emoji;
    switch (status) {
      case 'Underweight': emoji = '🥗'; break;
      case 'Normal': emoji = '😊'; break;
      case 'Overweight': emoji = '🏃‍♂️'; break;
      case 'Obese': emoji = '⚠️'; break;
      default: emoji = '✨';
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(emoji, style: const TextStyle(fontSize: 32)),
        ),
        const SizedBox(height: 4),
        Text(
          status == 'Normal' ? 'BAIK' : status.toUpperCase(), 
          style: AppTextStyles.labelSm.copyWith(color: color, fontSize: 8, fontWeight: FontWeight.w900)
        ),
      ],
    );
  }

  String _getBMIMessage(String status) {
    switch (status) {
      case 'Underweight': return 'Berat badanmu kurang. Yuk, mulai perbaiki nutrisi harianmu!';
      case 'Normal': return 'Keren! Kondisi tubuhmu ideal. Pertahankan pola hidup sehatmu!';
      case 'Overweight': return 'Sedikit kelebihan berat badan. Coba kurangi konsumsi gula dan rutin olahraga ya.';
      case 'Obese': return 'Kondisi obesitas perlu perhatian khusus. Konsultasikan dengan tim medis kampus yuk.';
      default: return 'Tetap pantau kesehatanmu setiap hari.';
    }
  }

  Widget _buildStatsGrid(HealthRecord latest) {
    return GridView.count(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.4,
      children: [
        _buildStatTile('Tekanan Darah', latest.bloodPressure, 'mmHg', Icons.favorite_rounded, Colors.red),
        _buildStatTile('Detak Jantung', latest.heartRate.toString(), 'bpm', Icons.monitor_heart_rounded, Colors.orange),
        _buildStatTile('Suhu Tubuh', latest.temperature.toString(), '°C', Icons.thermostat_rounded, Colors.blue),
        _buildStatTile('Berat Badan', latest.weight.toString(), 'kg', Icons.monitor_weight_rounded, Colors.green),
      ],
    );
  }

  Widget _buildStatTile(String label, String value, String unit, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: color.withAlpha(20), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(5),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withAlpha(15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 18),
                ),
                Icon(Icons.trending_up_rounded, color: Colors.green.withAlpha(100), size: 14),
              ],
            ),
            const Spacer(),
            Text(
              label, 
              style: AppTextStyles.labelSm.copyWith(
                color: AppColors.outline, 
                fontSize: 11, 
                fontWeight: FontWeight.bold,
                letterSpacing: -0.2,
              )
            ),
            const SizedBox(height: 4),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: value,
                    style: AppTextStyles.labelMd.copyWith(
                      fontWeight: FontWeight.w900, 
                      fontSize: 22, 
                      color: AppColors.primary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  TextSpan(
                    text: ' $unit',
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.outline, 
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthInsights(HealthRecord latest) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Saran Kesehatan', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildInsightCard(
                'Nutrisi Harian', 
                latest.bmiStatus == 'Normal' ? 'Pertahankan asupan serat & proteinmu.' : 'Atur kalori sesuai kebutuhan tubuhmu.', 
                Icons.restaurant_rounded, 
                Colors.orange,
              ),
              _buildInsightCard(
                'Aktivitas Fisik', 
                'Jalan santai 30 menit setiap pagi sangat baik.', 
                Icons.directions_run_rounded, 
                Colors.blue,
              ),
              _buildInsightCard(
                'Kualitas Tidur', 
                'Pastikan tidur 7-8 jam untuk regenerasi sel.', 
                Icons.bedtime_rounded, 
                Colors.indigo,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInsightCard(String title, String desc, IconData icon, Color color) {
    return Container(
      width: 220,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withAlpha(20), color.withAlpha(5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withAlpha(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
          const SizedBox(height: 4),
          Text(desc, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, height: 1.3, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(BuildContext context, HealthRecord record) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showHistoryDetail(context, record),
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(10), 
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(Icons.analytics_rounded, size: 24, color: AppColors.primary),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${record.date.day}/${record.date.month}/${record.date.year}', 
                        style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'BMI: ${record.bmi.toStringAsFixed(1)} • ${record.weight} kg', 
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: record.bmiColor.withAlpha(15), 
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    record.bmiStatus, 
                    style: AppTextStyles.labelSm.copyWith(
                      color: record.bmiColor, 
                      fontSize: 9, 
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showHistoryDetail(BuildContext context, HealthRecord record) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            Text('Detail Skrining', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            Text('${record.date.day}/${record.date.month}/${record.date.year}', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            _buildDetailRow('Tinggi Badan', '${record.height} cm', Icons.height_rounded, Colors.blue),
            _buildDetailRow('Berat Badan', '${record.weight} kg', Icons.monitor_weight_rounded, Colors.green),
            _buildDetailRow('Tekanan Darah', record.bloodPressure, Icons.favorite_rounded, Colors.red),
            _buildDetailRow('Detak Jantung', '${record.heartRate} bpm', Icons.monitor_heart_rounded, Colors.orange),
            _buildDetailRow('Suhu Tubuh', '${record.temperature} °C', Icons.thermostat_rounded, Colors.cyan),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Text(label, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
          const Spacer(),
          Text(value, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 60),
          Icon(Icons.monitor_heart_outlined, size: 80, color: AppColors.outline.withAlpha(50)),
          const SizedBox(height: 24),
          Text('Belum ada data kesehatan', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Klik "Update Data" untuk mulai memantau kondisimu.', textAlign: TextAlign.center, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        ],
      ),
    );
  }

}
