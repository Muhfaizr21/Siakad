import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class OrmawaSettingsAppBar extends StatelessWidget {
  const OrmawaSettingsAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    const expandedHeight = 220.0;

    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      leading: Navigator.canPop(context) 
        ? IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
          )
        : null,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(20),
        child: Container(
          height: 20,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(32),
              topRight: Radius.circular(32),
            ),
          ),
        ),
      ),
      flexibleSpace: LayoutBuilder(
        builder: (context, constraints) {
          final double percentage = (constraints.biggest.height - (kToolbarHeight + topPadding)) / (expandedHeight - (kToolbarHeight + topPadding));
          final bool isCollapsed = percentage <= 0.1;

          return Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF00164E),
                  AppColors.primary,
                  AppColors.primaryContainer,
                ],
              ),
            ),
            child: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground],
              centerTitle: true,
              titlePadding: EdgeInsets.zero,
              title: AnimatedOpacity(
                duration: const Duration(milliseconds: 200),
                opacity: isCollapsed ? 1.0 : 0.0,
                child: Container(
                  height: kToolbarHeight,
                  alignment: Alignment.center,
                  child: Text(
                    'Pengaturan Portal',
                    style: AppTextStyles.titleLg.copyWith(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              background: Stack(
                children: [
                  // Decorative circles
                  Positioned(
                    top: -20,
                    right: -20,
                    child: Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(10),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -30,
                    left: -10,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(5),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  
                  // Profile Content
                  Positioned.fill(
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 100),
                      opacity: percentage < 0.2 ? 0.0 : (percentage > 0.8 ? 1.0 : (percentage - 0.2) / 0.6),
                      child: Container(
                        width: double.infinity,
                        padding: EdgeInsets.only(top: topPadding + 40),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                              child: const CircleAvatar(
                                radius: 40,
                                backgroundColor: Color(0xFFF1F5F9),
                                child: Icon(Icons.groups_rounded, color: AppColors.primary, size: 35),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'BEM KBM UBK',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(color: Colors.white.withAlpha(30), borderRadius: BorderRadius.circular(12)),
                              child: Text(
                                'Ormawa Level Universitas',
                                textAlign: TextAlign.center,
                                style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
