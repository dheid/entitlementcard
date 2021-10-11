import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';

import './detail/detail_view.dart';
import '../category_assets.dart';
import '../graphql/graphql_api.dart';
import '../map/preview/models.dart';

class AcceptingStoreSummary extends StatelessWidget {
  final AcceptingStoreSummaryModel store;
  final CoordinatesInput coordinates;
  final double wideDepictionThreshold;
  final bool showMapButtonOnDetails;
  final bool showLocation;

  const AcceptingStoreSummary(
      {Key key,
      this.store,
      this.coordinates,
      this.showMapButtonOnDetails,
      this.showLocation = true,
      this.wideDepictionThreshold = 400})
      : super(key: key);

  /// Returns the distance between `coordinates` and the physical store,
  /// or `null` if `coordinates` or `item.physicalStore` is `null`
  double get _distance {
    // ignore: avoid_returning_null
    if (coordinates == null || store.coordinates == null) return null;
    return calcDistance(coordinates.lat, coordinates.lng, store.coordinates.lat,
        store.coordinates.lng);
  }

  @override
  Widget build(BuildContext context) {
    final itemCategoryAsset = store.categoryId < categoryAssets.length
        ? categoryAssets[store.categoryId]
        : null;
    final categoryName = itemCategoryAsset?.name ?? "Unbekannte Kategorie";
    final categoryColor = itemCategoryAsset?.color;

    final useWideDepiction = MediaQuery.of(context).size.width > 400;

    return SafeArea(
      bottom: false,
      top: false,
      child: InkWell(
          onTap: () {
            _openDetailView(context);
          },
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Row(
              children: [
                if (useWideDepiction)
                  CategoryIconIndicator(
                    svgIconPath: itemCategoryAsset?.icon,
                    categoryName: categoryName,
                  )
                else
                  CategoryColorIndicator(categoryColor: categoryColor),
                StoreTextOverview(
                  store: store,
                  showTownName: _distance == null && showLocation,
                ),
                Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Row(
                      children: [
                        if (_distance != null)
                          DistanceText(distance: _distance),
                        Container(
                            child: Icon(Icons.keyboard_arrow_right,
                                size: 30.0,
                                color: Theme.of(context).disabledColor),
                            height: double.infinity),
                      ],
                    ))
              ],
            ),
          )),
    );
  }

  void _openDetailView(BuildContext context) {
    Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => DetailView(store.id,
              hideShowOnMapButton: !showMapButtonOnDetails),
        ));
  }
}

class CategoryIconIndicator extends StatelessWidget {
  final String svgIconPath;
  final String categoryName;
  final EdgeInsets padding;

  const CategoryIconIndicator(
      {Key key,
      this.svgIconPath,
      this.categoryName,
      this.padding = const EdgeInsets.symmetric(horizontal: 16)})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: svgIconPath != null
          ? SvgPicture.asset(svgIconPath,
              width: 30, semanticsLabel: categoryName ?? "Unbekannte Kategorie")
          : Icon(
              Icons.info,
              size: 30,
            ),
    );
  }
}

class CategoryColorIndicator extends StatelessWidget {
  final Color categoryColor;

  const CategoryColorIndicator({Key key, this.categoryColor}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 8),
      child: VerticalDivider(
        color: categoryColor ?? Theme.of(context).colorScheme.primary,
        thickness: 3,
      ),
    );
  }
}

class StoreTextOverview extends StatelessWidget {
  final AcceptingStoreSummaryModel store;
  final bool showTownName;

  const StoreTextOverview(
      {Key key, @required this.store, this.showTownName = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(store.name ?? "Akzeptanzstelle",
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyText1),
            SizedBox(height: 4),
            Text(store.description ?? "",
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyText2),
            if (showTownName && store.location != null)
              Text(store.location, maxLines: 1, overflow: TextOverflow.ellipsis)
          ]),
    );
  }
}

class DistanceText extends StatelessWidget {
  final double distance;

  const DistanceText({Key key, @required this.distance}) : super(key: key);

  static String _formatDistance(double d) {
    if (d < 1) {
      return "${(d * 100).round() * 10} m";
    } else if (d < 10) {
      return "${NumberFormat("##.0", "de").format(d)} km";
    } else {
      return "${NumberFormat("###,###", "de").format(d)} km";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(_formatDistance(distance),
          maxLines: 1, style: Theme.of(context).textTheme.bodyText2),
    );
  }
}

// from https://www.movable-type.co.uk/scripts/latlong.html
double calcDistance(double lat1, double lng1, double lat2, double lng2) {
  final R = 6371; // kilometers
  final phi1 = lat1 * pi / 180; // φ, λ in radians
  final phi2 = lat2 * pi / 180;
  final deltaPhi = (lat2 - lat1) * pi / 180;
  final deltaLambda = (lng2 - lng1) * pi / 180;

  final a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
      cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2);
  final c = 2 * atan2(sqrt(a), sqrt(1 - a));

  return R * c; // in metres
}