import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class OrmawaAppBar extends StatelessWidget {
  final String title;
  final String? label;
  final double expandedHeight;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final bool pinned;

  const OrmawaAppBar({
    super.key,
    required this.title,
    this.label,
    this.expandedHeight = 200.0,
    this.actions,
    this.leading,
    this.centerTitle = false,
    this.pinned = true,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: pinned,
      elevation: 0,
      backgroundColor: Colors.transparent,
      iconTheme: const IconThemeData(color: Colors.white),
      leading: leading,
      centerTitle: true,
      actions: [
        if (actions != null) ...actions!,
        const SizedBox(width: 8),
      ],
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
                  Color(0xFF00164E), // Deep dark blue
                  AppColors.primary, // Main brand blue
                  AppColors.primaryContainer, // Vibrant blue
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
                  padding: const EdgeInsets.only(bottom: 2),
                  child: Text(
                    title,
                    style: AppTextStyles.titleLg.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              background: Stack(
                children: [
                  // Decorative elements
                  Positioned(
                    top: -40,
                    right: -40,
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(8),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -20,
                    left: -20,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(5),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  
                  // Content with opacity based on scroll
                  Positioned.fill(
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 100),
                      opacity: percentage < 0.2 ? 0.0 : (percentage > 0.8 ? 1.0 : (percentage - 0.2) / 0.6),
                      child: Padding(
                        padding: const EdgeInsets.only(left: 20, right: 20, bottom: 45),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          if (label != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.white.withAlpha(25),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.white.withAlpha(30)),
                              ),
                              child: Text(
                                label!,
                                style: AppTextStyles.labelSm.copyWith(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                          ],
                          Text(
                            title,
                            style: AppTextStyles.titleLg.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 24, // Adjusted from 26
                              height: 1.1,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withAlpha(40),
                                  offset: const Offset(0, 3),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
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
