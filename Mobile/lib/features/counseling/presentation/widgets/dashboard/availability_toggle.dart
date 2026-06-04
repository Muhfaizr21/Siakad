import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class AvailabilityToggle extends StatelessWidget {
  final bool isAvailable;
  final ValueChanged<bool> onToggle;

  const AvailabilityToggle({
    super.key,
    required this.isAvailable,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onToggle(!isAvailable),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isAvailable
              ? Colors.white.withAlpha(50)
              : Colors.white.withAlpha(20),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isAvailable
                ? Colors.white.withAlpha(80)
                : Colors.white.withAlpha(40),
            width: 1.5,
          ),
          boxShadow: isAvailable
              ? [
                  BoxShadow(
                    color: Colors.greenAccent.withAlpha(40),
                    blurRadius: 15,
                    spreadRadius: -5,
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Pulse Indicator
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: isAvailable ? Colors.greenAccent : Colors.grey[400],
                shape: BoxShape.circle,
                boxShadow: isAvailable
                    ? [
                        BoxShadow(
                          color: Colors.greenAccent.withAlpha(150),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ]
                    : [],
              ),
            ),
            const SizedBox(width: 12),
            Text(
              isAvailable ? 'Siap Melayani' : 'Sedang Istirahat',
              style: AppTextStyles.labelMd.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(width: 24),
            // Custom Toggle
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 52,
              height: 28,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isAvailable
                    ? Colors.white.withAlpha(60)
                    : Colors.black.withAlpha(40),
                borderRadius: BorderRadius.circular(20),
              ),
              child: AnimatedAlign(
                duration: const Duration(milliseconds: 300),
                alignment: isAvailable
                    ? Alignment.centerRight
                    : Alignment.centerLeft,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 4,
                        offset: Offset(0, 2),
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
  }
}
