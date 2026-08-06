import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';

class BkuShimmer extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;
  final BoxShape shape;

  const BkuShimmer({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
    this.shape = BoxShape.rectangle,
  });

  const BkuShimmer.circle({
    super.key,
    required double size,
  })  : width = size,
        height = size,
        borderRadius = null,
        shape = BoxShape.circle;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceContainerHigh,
      highlightColor: AppColors.surfaceContainerLowest,
      period: const Duration(milliseconds: 1500),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: shape == BoxShape.circle ? null : (borderRadius ?? BorderRadius.circular(12)),
          shape: shape,
        ),
      ),
    );
  }
}

class BkuShimmerCard extends StatelessWidget {
  final double height;
  final double? width;
  const BkuShimmerCard({super.key, required this.height, this.width});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width ?? double.infinity,
      height: height,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const BkuShimmer(width: 50, height: 50, borderRadius: BorderRadius.all(Radius.circular(16))),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                BkuShimmer(width: MediaQuery.of(context).size.width * 0.4, height: 14),
                const SizedBox(height: 8),
                BkuShimmer(width: MediaQuery.of(context).size.width * 0.25, height: 10),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class BkuShimmerList extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const BkuShimmerList({
    super.key,
    this.itemCount = 5,
    this.itemHeight = 100,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: itemCount,
      itemBuilder: (context, index) => BkuShimmerCard(height: itemHeight),
    );
  }
}
