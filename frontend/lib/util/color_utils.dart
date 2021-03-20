import 'package:flutter/material.dart';
import 'package:tinycolor/tinycolor.dart';

import '../category_assets.dart';

Color getReadableOnColor(Color backgroundColor) {
  return backgroundColor.computeLuminance() > 0.5 ? Colors.black : Colors.white;
}

Color getReadableOnColorSecondary(Color backgroundColor) {
  return backgroundColor.computeLuminance() > 0.5
      ? Colors.black54
      : Colors.white54;
}

Color getDarkenedColorForCategory(int categoryId) {
  if (categoryId == null) {
    return null;
  }
  final categoryColor = categoryAssets[categoryId].color;
  Color categoryColorDark;
  if (categoryColor != null) {
    categoryColorDark = TinyColor(categoryColor).darken().color;
  }
  return categoryColorDark;
}