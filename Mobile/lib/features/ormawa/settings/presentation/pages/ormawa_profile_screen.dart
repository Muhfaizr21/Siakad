import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';

class OrmawaProfileScreen extends StatelessWidget {
  const OrmawaProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.neutral100,
      body: Consumer<OrmawaProvider>(
        builder: (context, provider, child) {
          final member = provider.currentMember;

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              const BkuAppBar(
                variant: AppBarVariant.ormawa,
                title: 'PROFIL PRIBADI',
                subtitle: 'INFO & KONTAK SAYA',
                expandedHeight: 160.0,
                showBackButton: true,
                isExpandable: false,
              ),
              SliverToBoxAdapter(
                child: member != null
                    ? _buildProfileContent(context, member)
                    : _buildEmptyState(),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProfileContent(BuildContext context, OrmawaMember member) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeaderCard(member),
          const SizedBox(height: 24),
          _buildSectionTitle('INFORMASI ORMAWA'),
          const SizedBox(height: 12),
          _buildInfoCard(
            children: [
              _buildInfoRow(Icons.badge_rounded, 'Jabatan / Role', member.role, Colors.indigo),
              _buildDivider(),
              _buildInfoRow(Icons.group_work_rounded, 'Divisi', member.division, Colors.blue),
              _buildDivider(),
              _buildInfoRow(Icons.verified_user_rounded, 'Status', _capitalize(member.status), 
                member.status.toLowerCase() == 'aktif' ? Colors.green : Colors.orange),
              if (member.periode != null && member.periode!.isNotEmpty) ...[
                _buildDivider(),
                _buildInfoRow(Icons.date_range_rounded, 'Periode', member.periode!, Colors.purple),
              ],
            ],
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('KONTAK & DATA DIRI'),
          const SizedBox(height: 12),
          _buildInfoCard(
            children: [
              _buildInfoRow(Icons.email_rounded, 'Email Kampus', member.email ?? 'Belum diatur', Colors.redAccent),
              _buildDivider(),
              _buildInfoRow(Icons.phone_rounded, 'No Handphone', member.phone ?? 'Belum diatur', Colors.teal),
              if (member.joinedAt != null) ...[
                _buildDivider(),
                _buildInfoRow(Icons.access_time_rounded, 'Bergabung Sejak', 
                  '${member.joinedAt!.day}/${member.joinedAt!.month}/${member.joinedAt!.year}', Colors.blueGrey),
              ]
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(OrmawaMember member) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.neutral200),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(10),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: AppColors.primary.withAlpha(20),
            backgroundImage: member.fotoUrl != null && member.fotoUrl!.isNotEmpty
                ? NetworkImage(member.fotoUrl!)
                : null,
            child: member.fotoUrl == null || member.fotoUrl!.isEmpty
                ? Text(
                    member.name.isNotEmpty ? member.name[0].toUpperCase() : '?',
                    style: AppTextStyles.headlineLarge.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 16),
          Text(
            _capitalizeEachWord(member.name),
            style: AppTextStyles.titleLg.copyWith(
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.neutral100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              member.nim,
              style: AppTextStyles.labelLg.copyWith(
                color: AppColors.neutral600,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: AppTextStyles.overline.copyWith(
          color: AppColors.neutral500,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildInfoCard({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String title, String value, Color iconColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: AppTextStyles.titleMd.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.neutral900,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return const Divider(
      height: 1,
      thickness: 1,
      indent: 76,
      endIndent: 20,
      color: AppColors.neutral200,
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(40.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 60),
          Icon(
            Icons.person_off_rounded,
            size: 80,
            color: AppColors.neutral300,
          ),
          const SizedBox(height: 24),
          Text(
            'Data Profil Tidak Ditemukan',
            style: AppTextStyles.titleLg.copyWith(
              color: AppColors.neutral700,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Gagal memuat informasi pribadi Anda. Pastikan Anda sudah terdaftar sebagai pengurus.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMd.copyWith(
              color: AppColors.neutral500,
            ),
          ),
        ],
      ),
    );
  }

  String _capitalize(String s) => s.isEmpty ? '' : '${s[0].toUpperCase()}${s.substring(1).toLowerCase()}';

  String _capitalizeEachWord(String s) {
    if (s.isEmpty) return '';
    return s.split(' ').map((word) {
      if (word.isEmpty) return '';
      return '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}';
    }).join(' ');
  }
}
