import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:maplibre_gl/mapbox_gl.dart';

import 'location_button.dart';
import 'map/map_controller.dart';
import 'map/map_with_futures.dart';
import 'preview/accepting_store_preview.dart';

class PhysicalStoreFeatureData {
  final int id;
  final LatLng coordinates;
  final int categoryId;

  PhysicalStoreFeatureData(this.id, this.coordinates, this.categoryId);
}

typedef OnMapCreatedCallback = void Function(MapPageController controller);

class MapPage extends StatefulWidget {
  final OnMapCreatedCallback onMapCreated;

  const MapPage({Key key, this.onMapCreated}) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return _MapPageState();
  }
}

abstract class MapPageController {
  Future<void> showAcceptingStore(PhysicalStoreFeatureData data);

  Future<void> stopShowingAcceptingStore();
}

class _MapPageState extends State<MapPage>
    implements MapPageController {
  int _selectedAcceptingStoreId;
  MapController _controller;

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Stack(children: [
        MapWithFutures(
          onFeatureClick: _onFeatureClick,
          onNoFeatureClick: stopShowingAcceptingStore,
          onFeatureClickLayerFilter: const ["physical_stores"],
          onMapCreated: (controller) {
            controller.setTelemetryEnabled(enabled: false);
            setState(() => _controller = controller);
            if (widget.onMapCreated != null) widget.onMapCreated(this);
          },
        ),
        Column(mainAxisAlignment: MainAxisAlignment.end, children: [
          LocationButton(mapController: _controller),
          AnimatedSize(
            duration: const Duration(milliseconds: 200),
            child: IntrinsicHeight(
              child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: _selectedAcceptingStoreId != null
                      ? AcceptingStorePreview(
                          _selectedAcceptingStoreId
                        )
                      : null),
            ),
          ),
        ])
      ]),
    );
  }

  @override
  Future<void> showAcceptingStore(PhysicalStoreFeatureData data,
      {bool selectedAcceptingStoreInMap = false}) async {
    setState(() {
      _selectedAcceptingStoreId = data.id;
    });
    if (data.coordinates != null) {
      if (data.categoryId != null) {
        await _controller.setSymbol(data.coordinates, data.categoryId);
      }
      if (selectedAcceptingStoreInMap) {
        await _controller.bringCameraToLocation(data.coordinates);
      } else {
        await _controller.bringCameraToLocation(data.coordinates,
            zoomLevel: 13);
      }
    }
  }

  @override
  Future<void> stopShowingAcceptingStore() async {
    setState(() => _selectedAcceptingStoreId = null);
    await _controller.removeSymbol();
  }

  Future<void> _onFeatureClick(dynamic feature) async =>
      showAcceptingStore(_extractPhysicalStoreData(feature),
          selectedAcceptingStoreInMap: true);

  PhysicalStoreFeatureData _extractPhysicalStoreData(dynamic feature) =>
      PhysicalStoreFeatureData(
        _getIntOrNull(feature["properties"]["id"]),
        _getLatLngOrNull(feature["geometry"]["coordinates"]),
        _getIntOrNull(feature["properties"]["categoryId"]),
      );

  int _getIntOrNull(dynamic maybeInt) => (maybeInt is int) ? maybeInt : null;

  LatLng _getLatLngOrNull(dynamic coordinates) {
    if (coordinates is! List) return null;
    if (!(coordinates[0] is double && coordinates[1] is double)) return null;
    return LatLng(coordinates[1], coordinates[0]);
  }
}
