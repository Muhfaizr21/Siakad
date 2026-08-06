import 'package:flutter/material.dart';
import 'dart:convert';
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
                      child: _buildDynamicWelcomeCard(context, student, latest),
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
                    FadeInAnimation(delay: 0.4, child: _buildEmptyState(context, student)),
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
    Map<String, dynamic>? data;
    try {
      if (latest.notes.startsWith('{') && latest.notes.endsWith('}')) {
        data = jsonDecode(latest.notes) as Map<String, dynamic>;
      }
    } catch (_) {}

    final jamTidur = data?['jam_tidur'] ?? 8;
    final olahraga = data?['olahraga'] ?? 2;
    final air = data?['konsumsi_air'] ?? 2.0;
    final stres = data?['tingkat_stres'] ?? 5;

    return GridView.count(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.15,
      children: [
        _buildStatTile('Tinggi Badan', latest.height.toStringAsFixed(0), 'cm', Icons.straighten_rounded, Colors.blue),
        _buildStatTile('Berat Badan', latest.weight.toStringAsFixed(0), 'kg', Icons.monitor_weight_rounded, Colors.green),
        _buildStatTile('Tidur Harian', '$jamTidur', 'Jam', Icons.bedtime_rounded, Colors.teal),
        _buildStatTile('Olahraga', '$olahraga', 'x/Mgg', Icons.fitness_center_rounded, Colors.orange),
        _buildStatTile('Konsumsi Air', air.toStringAsFixed(1), 'L/Hari', Icons.water_drop_rounded, Colors.blueAccent),
        _buildStatTile('Tingkat Stres', '$stres', '/10', Icons.psychology_rounded, Colors.purple),
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
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: RichText(
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
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 24),
              Text('Detail Skrining', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
              Text('${record.date.day}/${record.date.month}/${record.date.year}', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              _buildDetailRow('Tinggi Badan', '${record.height.toStringAsFixed(0)} cm', Icons.height_rounded, Colors.blue),
              _buildDetailRow('Berat Badan', '${record.weight.toStringAsFixed(0)} kg', Icons.monitor_weight_rounded, Colors.green),
              _buildDetailRow('Tekanan Darah', record.bloodPressure, Icons.favorite_rounded, Colors.red),
              _buildDetailRow('Golongan Darah', record.bloodType, Icons.bloodtype_rounded, Colors.orange),
              if (record.gulaDarah != null)
                _buildDetailRow('Gula Darah', '${record.gulaDarah} mg/dL', Icons.water_drop_rounded, Colors.redAccent),
              _buildNotesSection(record),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotesSection(HealthRecord record) {
    if (record.notes.isEmpty) return const SizedBox.shrink();

    Map<String, dynamic>? data;
    try {
      if (record.notes.startsWith('{') && record.notes.endsWith('}')) {
        data = jsonDecode(record.notes) as Map<String, dynamic>;
      }
    } catch (_) {
      // Not JSON
    }

    if (data == null || data['is_screening_realistis'] != true) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          Text('Keluhan / Catatan:', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Text(
              record.notes,
              style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
        ],
      );
    }

    // It is realistic screening data! Let's display it beautifully!
    final jamTidur = data['jam_tidur'] ?? 8;
    final olahraga = data['olahraga'] ?? 0;
    final air = data['konsumsi_air'] ?? 2.0;
    final merokok = data['merokok'] ?? 'Tidak';
    final stres = data['tingkat_stres'] ?? 5;
    final mood = data['mood'] ?? 'Biasa Saja';
    final motivasi = data['motivasi_belajar'] ?? 'Biasa Saja';
    final List keluhanList = data['daftar_keluhan'] ?? [];
    final catatanTambahan = data['catatan_tambahan'] ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text('Gaya Hidup & Mental:', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.surfaceVariant),
          ),
          child: Column(
            children: [
              _buildDetailInfoRow('Tidur / Hari', '$jamTidur Jam', Icons.bedtime_rounded, Colors.teal),
              _buildDetailInfoRow('Olahraga / Minggu', '$olahraga Kali', Icons.fitness_center_rounded, Colors.teal),
              _buildDetailInfoRow('Konsumsi Air', '$air Liter', Icons.water_drop_rounded, Colors.teal),
              _buildDetailInfoRow('Merokok', merokok, Icons.smoke_free_rounded, Colors.teal),
              const Divider(height: 24, thickness: 1, color: AppColors.surfaceVariant),
              _buildDetailInfoRow('Tingkat Stres', '$stres / 10', Icons.psychology_rounded, Colors.purple),
              _buildDetailInfoRow('Mood', mood, Icons.mood_rounded, Colors.purple),
              _buildDetailInfoRow('Motivasi Belajar', motivasi, Icons.auto_stories_rounded, Colors.purple),
            ],
          ),
        ),
        if (keluhanList.isNotEmpty) ...[
          const SizedBox(height: 20),
          Text('Keluhan yang Dirasakan:', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: keluhanList.map((k) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.red.withAlpha(20),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.withAlpha(50)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.warning_amber_rounded, size: 14, color: Colors.red),
                    const SizedBox(width: 6),
                    Text(
                      k.toString(),
                      style: AppTextStyles.labelSm.copyWith(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
        if (catatanTambahan.toString().isNotEmpty) ...[
          const SizedBox(height: 20),
          Text('Catatan Tambahan:', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Text(
              catatanTambahan,
              style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDetailInfoRow(String label, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold, fontSize: 12)),
          const Spacer(),
          Text(value, style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 12)),
        ],
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

  Widget _buildEmptyState(BuildContext context, StudentProvider student) {
    final firstName = student.name.split(' ').first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        // 1. Premium Welcome Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [
                AppColors.primary,
                AppColors.primaryContainer,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withAlpha(20),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Halo, $firstName! 👋',
                      style: AppTextStyles.titleLg.copyWith(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Jaga kebugaran tubuhmu untuk performa belajar yang optimal. Mulai isi skrining kesehatan pertamamu!',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white.withAlpha(200),
                        fontSize: 11,
                        height: 1.4,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.spa_rounded,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 28),

        // 2. Translucent Stats Grid Preview
        Row(
          children: [
            Container(
              width: 4,
              height: 16,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Indikator yang Akan Dipantau',
              style: AppTextStyles.titleLg.copyWith(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.count(
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.15,
          children: [
            _buildEmptyStatTile('Tinggi Badan', 'cm', Icons.height_rounded, Colors.blue),
            _buildEmptyStatTile('Berat Badan', 'kg', Icons.monitor_weight_rounded, Colors.green),
            _buildEmptyStatTile('Tekanan Darah', 'mmHg', Icons.favorite_rounded, Colors.red),
            _buildEmptyStatTile('Golongan Darah', 'Tipe', Icons.bloodtype_rounded, Colors.orange),
          ],
        ),

        const SizedBox(height: 28),

        // 3. Quick Guide Timeline Steps
        Text(
          '3 Langkah Mudah Memulai',
          style: AppTextStyles.titleLg.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        _buildGuideStep(
          1,
          'Update Parameter Vital',
          'Ukur tekanan darah, detak jantung, suhu, serta berat badanmu.',
          Icons.edit_note_rounded,
          Colors.blue,
        ),
        _buildGuideStep(
          2,
          'Analisis BMI & Kesehatan',
          'Sistem langsung menghitung Indeks Massa Tubuh (BMI) idealmu.',
          Icons.calculate_rounded,
          Colors.teal,
        ),
        _buildGuideStep(
          3,
          'Dapatkan Rekomendasi Medis',
          'Dapatkan saran nutrisi dan tips olahraga terpersonalisasi.',
          Icons.health_and_safety_rounded,
          Colors.indigo,
        ),
      ],
    );
  }

  Widget _buildEmptyStatTile(String label, String unit, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: color.withAlpha(20),
          width: 1.5,
          style: BorderStyle.solid,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          Padding(
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
                        color: color.withAlpha(10),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, color: color.withAlpha(120), size: 18),
                    ),
                    Icon(Icons.lock_outline_rounded, color: AppColors.outline.withAlpha(60), size: 14),
                  ],
                ),
                const Spacer(),
                Text(
                  label,
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.outline.withAlpha(150),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '--',
                      style: AppTextStyles.labelMd.copyWith(
                        fontWeight: FontWeight.w900,
                        fontSize: 22,
                        color: AppColors.primary.withAlpha(60),
                      ),
                    ),
                    Text(
                      ' $unit',
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.outline.withAlpha(80),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuideStep(int number, String title, String desc, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(50)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withAlpha(15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelMd.copyWith(
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.outline,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  int _calculateHealthScore(HealthRecord r) {
    double score = 100;
    
    // BMI deductions
    double bmi = r.bmi;
    if (bmi >= 30) {
      score -= 25;
    } else if (bmi >= 25 || bmi < 18.5) {
      score -= 12;
    }

    // BP deductions
    final parts = r.bloodPressure.split('/');
    if (parts.length == 2) {
      int sys = int.tryParse(parts[0]) ?? 120;
      int dia = int.tryParse(parts[1]) ?? 80;
      if (sys >= 140 || dia >= 90) {
        score -= 18;
      } else if (sys >= 130 || dia >= 80) {
        score -= 10;
      }
    }

    // Lifestyle & mental deductions from notes json
    if (r.notes.startsWith('{')) {
      try {
        final data = jsonDecode(r.notes);
        
        // sleep
        int sleep = data['jam_tidur'] ?? 8;
        if (sleep < 7) {
          score -= (7 - sleep) * 4;
        } else if (sleep > 9) {
          score -= (sleep - 9) * 4;
        }
        
        // water
        double water = double.tryParse(data['konsumsi_air'].toString()) ?? 2.0;
        if (water < 2.0) {
          score -= ((2.0 - water) / 0.5) * 5;
        }

        // sports
        int sports = data['olahraga'] ?? 0;
        if (sports < 2) {
          score -= (2 - sports) * 6;
        }

        // stress
        int stress = data['tingkat_stres'] ?? 5;
        if (stress > 4) {
          score -= (stress - 4) * 4;
        }

        // smoking
        String smoking = data['merokok'] ?? 'Tidak';
        if (smoking.toLowerCase() == 'ya') {
          score -= 15;
        }

        // symptoms
        final symptoms = data['daftar_keluhan'] as List?;
        if (symptoms != null) {
          score -= symptoms.length * 6;
        }
      } catch (_) {}
    }

    if (score < 10) score = 10;
    if (score > 100) score = 100;
    return score.toInt();
  }

  Widget _buildDynamicWelcomeCard(BuildContext context, StudentProvider student, HealthRecord latest) {
    final firstName = student.name.split(' ').first;
    
    // Determine status text, message based on health record, while maintaining our premium blue app gradient
    final List<Color> gradientColors = [AppColors.primary, const Color(0xFF1E40AF)];
    String statusText;
    String message;
    
    switch (latest.bmiStatus) {
      case 'Normal':
        statusText = 'Sangat Baik & Ideal';
        message = 'Keren! Kondisi fisikmu berada di batas optimal. Pertahankan pola hidup sehatmu!';
        break;
      case 'Underweight':
        statusText = 'Berat Badan Kurang';
        message = 'Status gizimu underweight. Yuk, perbaiki nutrisi harian dan asupan kalori proteinmu!';
        break;
      case 'Overweight':
        statusText = 'Kelebihan Berat Badan';
        message = 'Kondisi tubuhmu overweight. Coba batasi makanan manis dan rutin olahraga ringan ya!';
        break;
      case 'Obese':
        statusText = 'Perhatian Khusus (Obesitas)';
        message = 'Kategori obesitas terdeteksi. Sebaiknya jadwalkan konsultasi dengan klinik kampus.';
        break;
      default:
        statusText = 'Kondisi Terpantau';
        message = 'Terus pantau kesehatan fisikmu secara berkala di BKUHub.';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: gradientColors[0].withAlpha(30),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Halo, $firstName! 👋',
                  style: AppTextStyles.titleLg.copyWith(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(50),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'Kondisimu: $statusText',
                    style: AppTextStyles.labelSm.copyWith(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  message,
                  style: AppTextStyles.labelSm.copyWith(
                    color: Colors.white.withAlpha(220),
                    fontSize: 11,
                    height: 1.4,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  value: _calculateHealthScore(latest) / 100.0,
                  strokeWidth: 5,
                  backgroundColor: Colors.white.withAlpha(40),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${_calculateHealthScore(latest)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const Text(
                    'SKOR',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 7,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

}
