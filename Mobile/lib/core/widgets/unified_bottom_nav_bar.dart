import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/theme_provider.dart';

/// Navigation item definition
class BottomNavItem {
  final int index;
  final IconData icon;
  final IconData? activeIcon;
  final String label;

  const BottomNavItem({
    required this.index,
    required this.icon,
    this.activeIcon,
    required this.label,
  });
}

/// Predefined navigation sets for different roles
class BottomNavPresets {
  /// Navigation items for Mahasiswa (Student)
  static const List<BottomNavItem> mahasiswa = [
    BottomNavItem(index: 0, icon: Icons.grid_view_rounded, label: 'Home'),
    BottomNavItem(index: 1, icon: Icons.auto_awesome_rounded, label: 'Kencana'),
    BottomNavItem(index: 2, icon: Icons.emoji_events_rounded, label: 'Prestasi'),
    BottomNavItem(index: 3, icon: Icons.school_rounded, label: 'Beasiswa'),
    BottomNavItem(index: 4, icon: Icons.person_rounded, label: 'Profil'),
  ];

  /// Navigation items for Ormawa
  static const List<BottomNavItem> ormawa = [
    BottomNavItem(index: 0, icon: Icons.grid_view_rounded, label: 'Dashboard'),
    BottomNavItem(index: 1, icon: Icons.assignment_rounded, label: 'Proposal'),
    BottomNavItem(index: 2, icon: Icons.qr_code_scanner_rounded, label: 'Absensi'),
    BottomNavItem(index: 3, icon: Icons.account_balance_wallet_rounded, label: 'Keuangan'),
    BottomNavItem(index: 4, icon: Icons.menu_rounded, label: 'Menu Lainnya'),
  ];

  /// Navigation items for Psychologist
  static const List<BottomNavItem> psychologist = [
    BottomNavItem(index: 0, icon: Icons.dashboard_rounded, label: 'Home'),
    BottomNavItem(index: 1, icon: Icons.event_note_rounded, label: 'Booking'),
    BottomNavItem(index: 2, icon: Icons.people_alt_rounded, label: 'Pasien'),
    BottomNavItem(index: 3, icon: Icons.settings_rounded, label: 'Settings'),
  ];

  /// Navigation items for Tenaga Kesehatan
  static const List<BottomNavItem> tenagaKesehatan = [
    BottomNavItem(index: 0, icon: Icons.dashboard_rounded, label: 'Home'),
    BottomNavItem(index: 1, icon: Icons.schedule_rounded, label: 'Jadwal'),
    BottomNavItem(index: 2, icon: Icons.event_note_rounded, label: 'Booking'),
    BottomNavItem(index: 3, icon: Icons.people_alt_rounded, label: 'Pasien'),
    BottomNavItem(index: 4, icon: Icons.settings_rounded, label: 'Setelan'),
  ];
}

/// UnifiedBottomNavBar - Single bottom navigation bar for all roles
///
/// Uses ThemeProvider to get dynamic colors from backend API.
/// Replaces multiple bottom nav variants (CustomBottomNavBar, OrmawaBottomNavBar, etc.)
class UnifiedBottomNavBar extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;
  final List<BottomNavItem> items;
  final bool enableHaptic;

  const UnifiedBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.items = const [],
    this.enableHaptic = true,
  });

  /// Factory constructor for Mahasiswa
  factory UnifiedBottomNavBar.mahasiswa({
    Key? key,
    required int currentIndex,
    required Function(int) onTap,
  }) {
    return UnifiedBottomNavBar(
      key: key,
      currentIndex: currentIndex,
      onTap: onTap,
      items: BottomNavPresets.mahasiswa,
    );
  }

  /// Factory constructor for Ormawa
  factory UnifiedBottomNavBar.ormawa({
    Key? key,
    required int currentIndex,
    required Function(int) onTap,
  }) {
    return UnifiedBottomNavBar(
      key: key,
      currentIndex: currentIndex,
      onTap: onTap,
      items: BottomNavPresets.ormawa,
    );
  }

  /// Factory constructor for Psychologist
  factory UnifiedBottomNavBar.psychologist({
    Key? key,
    required int currentIndex,
    required Function(int) onTap,
  }) {
    return UnifiedBottomNavBar(
      key: key,
      currentIndex: currentIndex,
      onTap: onTap,
      items: BottomNavPresets.psychologist,
    );
  }

  /// Factory constructor for Tenaga Kesehatan
  factory UnifiedBottomNavBar.tenagaKesehatan({
    Key? key,
    required int currentIndex,
    required Function(int) onTap,
  }) {
    return UnifiedBottomNavBar(
      key: key,
      currentIndex: currentIndex,
      onTap: onTap,
      items: BottomNavPresets.tenagaKesehatan,
    );
  }

  @override
  State<UnifiedBottomNavBar> createState() => _UnifiedBottomNavBarState();
}

class _UnifiedBottomNavBarState extends State<UnifiedBottomNavBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 1.0, end: 1.2).chain(CurveTween(curve: Curves.easeOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1.2, end: 1.1).chain(CurveTween(curve: Curves.elasticOut)),
        weight: 50,
      ),
    ]).animate(_controller);

    _controller.forward();
  }

  @override
  void didUpdateWidget(UnifiedBottomNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.currentIndex != oldWidget.currentIndex) {
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final items = widget.items.isEmpty ? BottomNavPresets.mahasiswa : widget.items;

    return Container(
      height: 85,
      color: Colors.transparent,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          // Background Bar
          Container(
            height: 65,
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(10),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
          ),
          // Nav Items
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: items
                    .map((item) => _buildNavItem(
                          context,
                          themeProvider,
                          item,
                          widget.currentIndex == item.index,
                        ))
                    .toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    ThemeProvider themeProvider,
    BottomNavItem item,
    bool isSelected,
  ) {
    return Expanded(
      child: GestureDetector(
        onTap: () => widget.onTap(item.index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
              transform: Matrix4.translationValues(0, isSelected ? -15 : 0, 0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isSelected)
                    ScaleTransition(
                      scale: _scaleAnimation,
                      child: _buildIconBox(themeProvider, item, isSelected),
                    )
                  else
                    _buildIconBox(themeProvider, item, isSelected),

                  if (isSelected)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: themeProvider.primary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ),
            if (!isSelected) const SizedBox(height: 15),
          ],
        ),
      ),
    );
  }

  Widget _buildIconBox(
    ThemeProvider themeProvider,
    BottomNavItem item,
    bool isSelected,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isSelected ? themeProvider.primary : Colors.transparent,
        shape: BoxShape.circle,
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: themeProvider.primary.withAlpha(60),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                )
              ]
            : [],
      ),
      child: Icon(
        isSelected ? (item.activeIcon ?? item.icon) : item.icon,
        color: isSelected ? Colors.white : themeProvider.outline.withAlpha(150),
        size: 24,
      ),
    );
  }
}
