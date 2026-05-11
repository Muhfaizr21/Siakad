import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class PsychologistSecurityCard extends StatelessWidget {
  const PsychologistSecurityCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          _SettingsTile(
            icon: Icons.lock_person_rounded,
            title: 'Autentikasi Dua Faktor (2FA)',
            value: 'Aktif',
            color: AppColors.primary,
          ),
          const Divider(height: 1),
          _SettingsTile(
            icon: Icons.timer_off_rounded,
            title: 'Auto-Logout Sesi',
            value: '15 Menit',
            color: Colors.orange,
          ),
          const Divider(height: 1),
          _SettingsTile(
            icon: Icons.fingerprint_rounded,
            title: 'Biometric Login',
            value: 'Aktif',
            color: Colors.blue,
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(
        title,
        style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: AppTextStyles.labelMd.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
        ],
      ),
    );
  }
}
