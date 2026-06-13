import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/theme_provider.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

enum AppBarVariant { student, ormawa, secondary, psychologist, nakes }

class BkuAppBar extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final Widget? leading;
  final double expandedHeight;
  final bool pinned;
  final AppBarVariant variant;
  final bool showBackButton;
  final VoidCallback? onBack;
  final Widget? child; // Custom content below title in background
  final bool showNotification;
  final Widget? profileImage;
  final bool showProfileOnCollapse;
  final bool isExpandable;
  final String? info;
  final int notificationCount;

  final void Function(BuildContext, AppBarVariant)? onNotificationTap;
  final VoidCallback? onProfileTap;
  static void Function(BuildContext, AppBarVariant)? defaultOnNotificationTap;

  const BkuAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.info,
    this.actions,
    this.leading,
    this.expandedHeight = 200.0,
    this.pinned = true,
    this.variant = AppBarVariant.student,
    this.showBackButton = false,
    this.onBack,
    this.child,
    this.showNotification = true,
    this.profileImage,
    this.showProfileOnCollapse = false,
    this.isExpandable = true,
    this.onNotificationTap,
    this.onProfileTap,
    this.notificationCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final List<Color> gradientColors = _getGradientColors(context);

    // Jalur 1: FIXED APP BAR (Untuk Halaman Selain Dashboard)
    if (!isExpandable) {
      return SliverAppBar(
        pinned: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
        automaticallyImplyLeading: false,
        leading:
            leading ??
            (showBackButton
                ? IconButton(
                  onPressed: onBack ?? () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    size: 20,
                    color: Colors.white,
                  ),
                )
                : null),
        titleSpacing: 0,
        title: Padding(
          padding: EdgeInsets.only(left: showBackButton ? 0 : 20),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title.toUpperCase(),
                      style: AppTextStyles.titleLg.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: -0.2,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                    if (info != null)
                      Text(
                        info!,
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.white.withAlpha(160),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          if (actions != null) ...actions!,
          if (showNotification)
            IconButton(
              onPressed: () {
                if (onNotificationTap != null) {
                  onNotificationTap!(context, variant);
                } else if (defaultOnNotificationTap != null) {
                  defaultOnNotificationTap!(context, variant);
                }
              },
              icon: const Icon(
                Icons.notifications_outlined,
                color: Colors.white,
                size: 24,
              ),
            ),
          const SizedBox(width: 8),
        ],
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: gradientColors,
            ),
            borderRadius: const BorderRadius.vertical(
              bottom: Radius.circular(32),
            ),
          ),
        ),
      );
    }

    // Jalur 2: EXPANDABLE APP BAR (Untuk Dashboard)
    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: pinned,
      stretch: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      leading:
          leading ??
          (showBackButton
              ? IconButton(
                onPressed: onBack ?? () => Navigator.pop(context),
                icon: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 20,
                  color: Colors.white,
                ),
              )
              : null),
      actions: [
        if (actions != null) ...actions!,
        if (showNotification)
          Padding(
            padding: EdgeInsets.only(bottom: showProfileOnCollapse ? 8 : 4),
            child: Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  onPressed: () {
                    if (onNotificationTap != null) {
                      onNotificationTap!(context, variant);
                    } else if (defaultOnNotificationTap != null) {
                      defaultOnNotificationTap!(context, variant);
                    }
                  },
                  icon: const Icon(
                    Icons.notifications_outlined,
                    size: 24,
                    color: Colors.white,
                  ),
                  tooltip: 'Notifikasi',
                ),
                if (notificationCount > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        notificationCount > 9 ? '9+' : '$notificationCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        const SizedBox(width: 12),
      ],
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: gradientColors,
          ),
          borderRadius: const BorderRadius.vertical(
            bottom: Radius.circular(32),
          ),
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final double currentHeight = constraints.biggest.height;
            final double toolbarBaseHeight = kToolbarHeight + topPadding;
            final double percentage =
                (currentHeight - toolbarBaseHeight) /
                (expandedHeight - toolbarBaseHeight);
            final bool isCollapsed = percentage <= 0.4;

            return FlexibleSpaceBar(
              expandedTitleScale: 1.0,
              stretchModes: const [StretchMode.zoomBackground],
              centerTitle: false,
              titlePadding: EdgeInsets.zero,
              title: IgnorePointer(
                ignoring: !isCollapsed,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 200),
                  opacity: isCollapsed ? 1.0 : 0.0,
                  child: Container(
                    padding: EdgeInsets.only(
                      left: showBackButton ? 72 : 20,
                      bottom: 20,
                    ),
                    alignment: Alignment.bottomLeft,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (showProfileOnCollapse && profileImage != null) ...[
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withAlpha(80),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(30),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: SizedBox.expand(
                                child: FittedBox(
                                  fit: BoxFit.cover,
                                  child: profileImage!,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                title.toUpperCase(),
                                style: AppTextStyles.titleLg.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                  letterSpacing: -0.2,
                                ),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                              ),
                              if (info != null && showProfileOnCollapse)
                                Text(
                                  info!,
                                  style: AppTextStyles.labelSm.copyWith(
                                    color: Colors.white.withAlpha(160),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 1,
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              background: Stack(
                children: [
                  // Dekorasi Lingkaran
                  Positioned(
                    top: -50,
                    right: -50,
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withAlpha(10),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -30,
                    left: -30,
                    child: Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withAlpha(8),
                      ),
                    ),
                  ),
                  // Konten Expanded
                  Opacity(
                    opacity: (percentage * 2.5).clamp(0.0, 1.0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: SingleChildScrollView(
                        physics: const NeverScrollableScrollPhysics(),
                        child: Padding(
                          padding: EdgeInsets.only(
                            top: topPadding + 20,
                            bottom: 20,
                            left: 20,
                            right: 20,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              GestureDetector(
                                onTap: onProfileTap,
                                behavior: HitTestBehavior.opaque,
                                child: Row(
                                  children: [
                                    if (profileImage != null) ...[
                                      Container(
                                        width: 60,
                                        height: 60,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: Colors.white.withAlpha(100),
                                            width: 2,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withAlpha(40),
                                              blurRadius: 12,
                                              offset: const Offset(0, 4),
                                            ),
                                          ],
                                        ),
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(
                                            30,
                                          ),
                                          child: profileImage!,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                    ],
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          if (subtitle != null)
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 10,
                                                    vertical: 4,
                                                  ),
                                              margin: const EdgeInsets.only(
                                                bottom: 4,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withAlpha(
                                                  40,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                subtitle!.toUpperCase(),
                                                style: AppTextStyles.labelSm
                                                    .copyWith(
                                                      color: Colors.white,
                                                      fontSize: 9,
                                                      fontWeight:
                                                          FontWeight.w900,
                                                      letterSpacing: 0.5,
                                                    ),
                                              ),
                                            ),
                                          Text(
                                            title.toUpperCase(),
                                            style: AppTextStyles.titleLg
                                                .copyWith(
                                                  color: Colors.white,
                                                  fontSize: 22,
                                                  fontWeight: FontWeight.w900,
                                                  letterSpacing: -0.5,
                                                ),
                                          ),
                                          if (info != null) ...[
                                            const SizedBox(height: 4),
                                            Text(
                                              info!,
                                              style: AppTextStyles.labelSm
                                                  .copyWith(
                                                    color: Colors.white
                                                        .withAlpha(180),
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w600,
                                                    letterSpacing: 0.5,
                                                  ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // ── child widget (e.g. AvailabilityToggle) ──
                              if (child != null) ...[
                                const SizedBox(height: 16),
                                child!,
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  List<Color> _getGradientColors(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();

    switch (variant) {
      case AppBarVariant.student:
        return themeProvider.primaryGradient;
      case AppBarVariant.ormawa:
        return themeProvider.primaryGradient;
      case AppBarVariant.secondary:
        return themeProvider.secondaryGradient;
      case AppBarVariant.psychologist:
        return themeProvider.primaryGradient;
      case AppBarVariant.nakes:
        return themeProvider.primaryGradient;
    }
  }
}

class BkuStaticAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBack;
  final AppBarVariant variant;

  const BkuStaticAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showBackButton = true,
    this.onBack,
    this.variant = AppBarVariant.student,
  });

  @override
  Widget build(BuildContext context) {
    final List<Color> gradientColors = _getGradientColors(context);

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradientColors,
        ),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: gradientColors.first.withAlpha(40),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.only(bottom: 24, top: 8),
          child: Row(
            children: [
              if (showBackButton)
                IconButton(
                  onPressed: onBack ?? () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                )
              else
                const SizedBox(width: 20),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.titleLg.copyWith(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              if (actions != null) ...actions!,
              const SizedBox(width: 12),
            ],
          ),
        ),
      ),
    );
  }

  List<Color> _getGradientColors(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();

    switch (variant) {
      case AppBarVariant.student:
        return themeProvider.primaryGradient;
      case AppBarVariant.ormawa:
        return themeProvider.primaryGradient;
      case AppBarVariant.secondary:
        return themeProvider.secondaryGradient;
      case AppBarVariant.psychologist:
        return themeProvider.primaryGradient;
      case AppBarVariant.nakes:
        return themeProvider.primaryGradient;
    }
  }

  @override
  Size get preferredSize => const Size.fromHeight(100);
}
