import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          _buildSliverHeader(context, student),
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 12),
                
                // 0. Profile Completeness Tracker
                FadeInAnimation(
                  delay: 0.1,
                  child: _buildCompletenessTracker(),
                ),

                const SizedBox(height: 24),

                // 1. Quick Actions Grid
                FadeInAnimation(
                  delay: 0.15,
                  child: _buildQuickActions(context, student),
                ),

                const SizedBox(height: 24),

                // 2. Data Pribadi Mahasiswa
                FadeInAnimation(
                  delay: 0.2,
                  child: _buildMenuSection(context, 'Data Pribadi Mahasiswa', [
                    _buildMenuItem(context, 'Email Institusi', student.email, Icons.alternate_email_rounded, Colors.blue, () {}),
                    _buildMenuItem(context, 'Nomor WhatsApp', student.phone, Icons.phone_android_rounded, Colors.green, () {}),
                    _buildMenuItem(context, 'Tempat, Tgl Lahir', student.birthPlaceDate, Icons.cake_rounded, Colors.pink, () {}),
                    _buildMenuItem(context, 'Alamat Domisili', student.address, Icons.location_on_rounded, Colors.orange, () {}),
                  ]),
                ),

                const SizedBox(height: 24),
                
                // 3. Informasi Akademik
                FadeInAnimation(
                  delay: 0.3,
                  child: _buildMenuSection(context, 'Informasi Akademik', [
                    _buildMenuItem(context, 'Fakultas', student.fakultas, Icons.account_balance_rounded, Colors.indigo, () {}),
                    _buildMenuItem(context, 'Tahun Angkatan', 'Angkatan ${student.intakeYear}', Icons.school_rounded, Colors.teal, () {}),
                    _buildMenuItem(context, 'Kartu Mahasiswa Digital', 'Lihat QR Code & ID', Icons.qr_code_scanner_rounded, Colors.blue, () => _showDigitalID(context, student)),
                    _buildMenuItem(context, 'Transkrip Nilai', 'IPK Saat Ini: 3.85', Icons.description_rounded, Colors.deepPurple, () => _showTranscriptSummary(context)),
                  ]),
                ),
                
                const SizedBox(height: 24),
                
                // 4. Status Organisasi & Kepemimpinan
                FadeInAnimation(
                  delay: 0.4,
                  child: _buildMenuSection(context, 'Kepemimpinan & Kegiatan', [
                    _buildMenuItem(context, 'Jabatan Aktif', 'Ketua Umum - BEM KBM', Icons.stars_rounded, Colors.amber, () {}),
                    _buildMenuItem(context, 'Portofolio Digital', 'Lihat Jejak Organisasi', Icons.auto_stories_rounded, Colors.cyan, () => context.push(AppRoutes.organisasi)),
                    _buildMenuItem(context, 'E-Sertifikat', '5 Sertifikat Tervalidasi', Icons.verified_rounded, Colors.green, () {}),
                  ]),
                ),
                
                const SizedBox(height: 24),
                
                // 5. Pengaturan & Keamanan
                FadeInAnimation(
                  delay: 0.5,
                  child: _buildMenuSection(context, 'Pengaturan Akun', [
                    _buildMenuItem(context, 'Keamanan Akun', 'Ubah Password & PIN', Icons.lock_outline_rounded, Colors.redAccent, () {}),
                    _buildMenuItem(context, 'Notifikasi', 'Atur Peringatan Kuliah', Icons.notifications_none_rounded, Colors.purple, () {}),
                  ]),
                ),
                
                const SizedBox(height: 40),
                FadeInAnimation(delay: 0.6, child: _buildLogoutButton(context)),
                const SizedBox(height: 120),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverHeader(BuildContext context, StudentProvider student) {
    return SliverAppBar(
      expandedHeight: 320.0,
      pinned: true,
      elevation: 0,
      stretch: true,
      backgroundColor: Colors.transparent, // Transparan biar gradasi di bawahnya kelihatan
      iconTheme: const IconThemeData(color: Colors.white),
      flexibleSpace: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.primary, Color(0xFF001A4D)],
          ),
        ),
        child: FlexibleSpaceBar(
          stretchModes: const [StretchMode.zoomBackground],
          centerTitle: true,
          title: LayoutBuilder(
            builder: (context, constraints) {
              final isCollapsed = constraints.biggest.height <= kToolbarHeight + MediaQuery.of(context).padding.top;
              return AnimatedOpacity(
                duration: const Duration(milliseconds: 200),
                opacity: isCollapsed ? 1.0 : 0.0,
                child: Text(
                  student.name,
                  style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              );
            },
          ),
          background: Stack(
            alignment: Alignment.center,
            children: [
              // Premium Decorative Circles
              Positioned(
                right: -40,
                top: -40,
                child: Icon(Icons.circle, size: 200, color: Colors.white.withAlpha(10)),
              ),
              Positioned(
                left: -30,
                top: 40,
                child: Icon(Icons.circle, size: 100, color: Colors.white.withAlpha(8)),
              ),
              // Container Background yang Terbagi: Atas Transparan (biar gradasi luar kelihatan), Bawah Putih
              Column(
                children: [
                  const Expanded(
                    child: SizedBox.expand(),
                  ),
                  Container(
                    height: 45, // Setengah tinggi dari stats card + padding
                    color: const Color(0xFFF8FAFC), // Warna putih yang sama dengan body
                  ),
                ],
              ),
            // User Profile Info
            Positioned(
              top: 60,
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Colors.white, Colors.white24],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 20)],
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                          child: CircleAvatar(
                            radius: 40,
                            backgroundColor: AppColors.primary.withAlpha(10),
                            child: const Icon(Icons.person_rounded, size: 48, color: AppColors.primary),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                            child: const Icon(Icons.edit_rounded, size: 12, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    student.name, 
                    style: AppTextStyles.headlineMd.copyWith(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        student.nim, 
                        style: AppTextStyles.labelMd.copyWith(color: Colors.white70, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.green.withAlpha(50),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.green.withAlpha(50)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 10),
                            const SizedBox(width: 4),
                            Text('AKTIF', style: AppTextStyles.labelSm.copyWith(color: Colors.green, fontSize: 8, fontWeight: FontWeight.w900)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(30), 
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: Text(
                      student.prodi.toUpperCase(), 
                      style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5),
                    ),
                  ),
                ],
              ),
            ),
            // Stats Card - Dipasang tepat di garis pemisah biru dan putih
            Positioned(
              bottom: 5,
              left: 0,
              right: 0,
              child: _buildAcademicStats(student),
            ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAcademicStats(StudentProvider student) {
    return FadeInAnimation(
      delay: 0.1,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24),
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(12), 
              blurRadius: 25, 
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem(student.ipk.toStringAsFixed(2), 'IPK TOTAL'),
            Container(width: 1, height: 35, color: const Color(0xFFF1F5F9)),
            _buildStatItem(student.totalSks.toString(), 'SKS LULUS'),
            Container(width: 1, height: 35, color: const Color(0xFFF1F5F9)),
            _buildStatItem(student.semester.toString(), 'SEMESTER'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 20)),
        const SizedBox(height: 4),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
      ],
    );
  }

  Widget _buildCompletenessTracker() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Kelengkapan Profil', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
              Text('90%', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: 0.9,
              backgroundColor: AppColors.surfaceVariant,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Lengkapi data diri Anda untuk mempermudah administrasi.',
            style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, StudentProvider student) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildActionItem(context, Icons.qr_code_rounded, 'KTM Digital', () => _showDigitalID(context, student)),
          _buildActionItem(context, Icons.insert_drive_file_rounded, 'Transkrip', () => _showTranscriptSummary(context)),
          _buildActionItem(context, Icons.verified_user_rounded, 'Sertifikat', () {}),
          _buildActionItem(context, Icons.favorite_rounded, 'Kesehatan', () => context.push(AppRoutes.health)),
        ],
      ),
    );
  }

  Widget _buildActionItem(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant),
              boxShadow: [BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 10)],
            ),
            child: Icon(icon, color: AppColors.primary, size: 24),
          ),
          const SizedBox(height: 8),
          Text(label, style: AppTextStyles.labelSm.copyWith(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context, String title, List<Widget> items) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 12),
            child: Text(
              title, 
              style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.w900, letterSpacing: 1),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: const Color(0xFFF1F5F9)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(2), 
                  blurRadius: 10, 
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: Column(children: items),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: color.withAlpha(15), borderRadius: BorderRadius.circular(14)),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B))),
      subtitle: Text(subtitle, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 11)),
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1), size: 20),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        width: double.infinity,
        height: 64,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withAlpha(20),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ElevatedButton.icon(
          onPressed: () => _showLogoutDialog(context),
          icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 20),
          label: Text(
            'Keluar dari Akun', 
            style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF4D4D),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 0,
          ),
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(28),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withAlpha(15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.logout_rounded, color: Colors.red, size: 36),
            ),
            const SizedBox(height: 20),
            Text(
              'Keluar Aplikasi?',
              style: AppTextStyles.titleLg.copyWith(
                fontWeight: FontWeight.w900,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Sesi Anda akan diakhiri. Anda perlu login kembali untuk mengakses data akademik.',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, height: 1.5),
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      side: BorderSide(color: Colors.grey.withAlpha(60)),
                    ),
                    child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      context.go(AppRoutes.login);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: const Text('Keluar', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showDigitalID(BuildContext context, StudentProvider student) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
        padding: const EdgeInsets.fromLTRB(32, 16, 32, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 24),
            Flexible(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Kartu Mahasiswa Digital', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [BoxShadow(color: Colors.black.withAlpha(8), blurRadius: 25)],
                        border: Border.all(color: AppColors.primary.withAlpha(10)),
                      ),
                      child: Column(
                        children: [
                          Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.asset(
                                'assets/images/logoBKU.jpg',
                                width: 40,
                                height: 40,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                          Image.network('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${student.nim}', height: 180, width: 180),
                          const SizedBox(height: 20),
                          Text(student.name, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 18), textAlign: TextAlign.center),
                          const SizedBox(height: 4),
                          Text(student.nim, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Gunakan QR Code ini untuk keperluan administrasi, perpustakaan, dan presensi di lingkungan kampus BKU.',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary, 
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  elevation: 0,
                ),
                child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTranscriptSummary(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
        padding: const EdgeInsets.fromLTRB(32, 16, 32, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            Text('Ringkasan Transkrip', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            const SizedBox(height: 24),
            Flexible(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildTranscriptRow('Semester 1', '3.80'),
                    _buildTranscriptRow('Semester 2', '3.90'),
                    _buildTranscriptRow('Semester 3', '3.75'),
                    _buildTranscriptRow('Semester 4', '3.88'),
                    _buildTranscriptRow('Semester 5', '3.92'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.orange.withAlpha(10), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.orange.withAlpha(20))),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.orange),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Data ini bersifat sementara, silakan hubungi BAAK untuk transkrip resmi.', 
                      style: AppTextStyles.labelSm.copyWith(color: Colors.orange[800], fontStyle: FontStyle.italic, fontWeight: FontWeight.w600, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildTranscriptRow(String semester, String ipk) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(semester, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w600)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), borderRadius: BorderRadius.circular(10)),
            child: Text(ipk, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
          ),
        ],
      ),
    );
  }


}
