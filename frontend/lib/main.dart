import 'package:ehrenamtskarte/app.dart';
import 'package:ehrenamtskarte/configuration/definitions.dart';
import 'package:ehrenamtskarte/settings_provider.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  debugPrint('Environment: $appEnvironment');

  runApp(SettingsProvider(child: const App()));
}
