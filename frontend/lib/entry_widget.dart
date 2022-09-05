import 'package:ehrenamtskarte/widgets/error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'configuration/configuration.dart';
import 'configuration/settings_model.dart';
import 'home/home_page.dart';
import 'intro_slides/intro_screen.dart';
import 'themes.dart';

const introRouteName = "/intro";
const homeRouteName = "/home";

class EntryWidget extends StatelessWidget {
  const EntryWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final configuration = Configuration.of(context);
    final settings = Provider.of<SettingsModel>(context);

    return FutureBuilder<SettingsModel>(
      future: settings.initialize(),
      builder: (context, snapshot) {
        final settings = snapshot.data;
        final error = snapshot.error;
        if (snapshot.hasError && error != null) {
          return ErrorMessage(error.toString());
        } else if (snapshot.hasData && settings != null) {
          final routes = <String, WidgetBuilder>{
            introRouteName: (context) => IntroScreen(
                  onFinishedCallback: () => settings.setFirstStart(enabled: false),
                ),
            homeRouteName: (context) => HomePage(
                  showVerification: configuration.showVerification,
                )
          };

          final String initialRoute = settings.firstStart ? introRouteName : homeRouteName;

          return MaterialApp(
            title: 'Ehrenamtskarte',
            theme: lightTheme,
            darkTheme: darkTheme,
            themeMode: ThemeMode.system,
            debugShowCheckedModeBanner: false,
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [Locale('de')],
            locale: const Locale('de'),
            initialRoute: initialRoute,
            routes: routes,
          );
        } else {
          return Container();
        }
      },
    );
  }
}
