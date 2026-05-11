import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class StudentAgendaList extends StatelessWidget {
  const StudentAgendaList({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _AgendaCard(
          title: 'Ujian Tengah Semester',
          day: '13',
          month: 'Mei',
          location: 'Gedung Serba Guna',
          time: '08:00 - 10:00',
          color: Colors.blue,
          description: 'Pelaksanaan UTS Semester Genap TA 2025/2026. Jangan lupa bawa kartu ujian dan alat tulis lengkap.',
        ),
        const SizedBox(height: 16),
        _AgendaCard(
          title: 'Workshop PKM Nasional',
          day: '18',
          month: 'Mei',
          location: 'Auditorium Utama',
          time: '13:00 - Selesai',
          color: Colors.orange,
          description: 'Sesi kupas tuntas pembuatan proposal PKM yang lolos PIMNAS bersama mentor nasional.',
        ),
      ],
    );
  }
}

class _AgendaCard extends StatefulWidget {
  final String title;
  final String day;
  final String month;
  final String location;
  final String time;
  final Color color;
  final String description;

  const _AgendaCard({
    required this.title,
    required this.day,
    required this.month,
    required this.location,
    required this.time,
    required this.color,
    required this.description,
  });

  @override
  State<_AgendaCard> createState() => _AgendaCardState();
}

class _AgendaCardState extends State<_AgendaCard> {
  bool _isNotified = false;

  void _showAgendaDetail(BuildContext context) {
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
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: widget.color.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Agenda Kampus',
                    style: TextStyle(color: widget.color, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              widget.title,
              style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 16),
            _buildDetailInfo(Icons.calendar_today_rounded, '${widget.day} ${widget.month} 2026'),
            const SizedBox(height: 8),
            _buildDetailInfo(Icons.access_time_rounded, widget.time),
            const SizedBox(height: 8),
            _buildDetailInfo(Icons.location_on_rounded, widget.location),
            const SizedBox(height: 24),
            Text(
              'Deskripsi',
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              widget.description,
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline, height: 1.6),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() => _isNotified = !_isNotified);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(_isNotified ? 'Pengingat berhasil dipasang!' : 'Pengingat dibatalkan'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                },
                icon: Icon(_isNotified ? Icons.notifications_off_rounded : Icons.notifications_active_rounded),
                label: Text(_isNotified ? 'Batalkan Pengingat' : 'Ingatkan Saya'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isNotified ? Colors.grey[200] : AppColors.primary,
                  foregroundColor: _isNotified ? Colors.grey[700] : Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailInfo(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.outline),
        const SizedBox(width: 12),
        Text(text, style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showAgendaDetail(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.surfaceVariant),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 60,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: widget.color.withAlpha(15),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: widget.color.withAlpha(30)),
              ),
              child: Column(
                children: [
                  Text(
                    widget.day,
                    style: TextStyle(
                      color: widget.color,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    widget.month,
                    style: TextStyle(
                      color: widget.color,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    style: AppTextStyles.labelMd.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_rounded,
                        color: AppColors.outline,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        widget.location,
                        style: AppTextStyles.labelSm.copyWith(
                          color: AppColors.outline,
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(
                        Icons.access_time_filled_rounded,
                        color: AppColors.outline,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        widget.time,
                        style: AppTextStyles.labelSm.copyWith(
                          color: AppColors.outline,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Icon(
              _isNotified ? Icons.notifications_active_rounded : Icons.notifications_none_rounded,
              color: _isNotified ? widget.color : AppColors.outline.withAlpha(100),
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}
