import 'dart:developer';

import 'package:ehrenamtskarte/configuration/settings_model.dart';
import 'package:ehrenamtskarte/identification/base_card_details.dart';
import 'package:ehrenamtskarte/identification/card_details.dart';
import 'package:ehrenamtskarte/identification/card_details_model.dart';
import 'package:ehrenamtskarte/identification/identification_qr_content_parser.dart';
import 'package:ehrenamtskarte/intro_slides/intro_screen.dart';
import 'package:ehrenamtskarte/qr_code_scanner/qr_code_processor.dart';
import 'package:ehrenamtskarte/routing.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// this data includes a Base32 encoded random key created with openssl
// for testing, so this is intended
final validEakDetails = CardDetails(
  "Jane Doe",
  "aGVsbG8gdGhpcyBpcyBhIHRlc3Q=",
  1677542400,
  CardType.standard,
  42,
  "MZLBSF6VHD56ROVG55J6OKJCZIPVDPCX",
);

class DevSettingsView extends StatelessWidget {
  const DevSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = Provider.of<SettingsModel>(context);
    return Padding(
      padding: const EdgeInsets.all(15.0),
      child: Column(
        children: [
          ListTile(
            title: const Text('Reset EAK'),
            onTap: () => _resetEakData(context),
          ),
          ListTile(
            title: const Text('Set valid EAK data'),
            onTap: () => _setValidEakData(context),
          ),
          ListTile(
            title: const Text('Set base64 card'),
            onTap: () => _showRawCardInput(context),
          ),
          ListTile(
            title: const Text('Show Intro Slides'),
            onTap: () => _showInfoSlides(context),
          ),
          ListTile(
            title: const Text('Log sample exception'),
            onTap: () => log("Sample exception.", error: Exception("Sample exception...")),
          ),
          ListTile(
            title: const Text('Inspect settings'),
            onTap: () {
              showDialog<bool>(
                context: context,
                builder: (context) =>
                    SimpleDialog(title: const Text("Settings"), children: [Text(settings.toString())]),
              );
            },
          ),
        ],
      ),
    );
  }

  Future<void> _resetEakData(BuildContext context) async {
    Provider.of<CardDetailsModel>(context, listen: false).clearCardDetails();
  }

  Future<void> _setValidEakData(BuildContext context) async {
    Provider.of<CardDetailsModel>(context, listen: false).setCardDetails(validEakDetails);
  }

  Future<void> _showRawCardInput(BuildContext context) async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        final base64Controller = TextEditingController();
        return AlertDialog(
          scrollable: true,
          title: const Text('Set base64 card'),
          content: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Form(
              child: Column(
                children: <Widget>[
                  const SelectableText(
                      "Create a QR code from a PDF: pdftoppm ehrenamtskarten.pdf | zbarimg -q --raw  -"),
                  TextFormField(
                    controller: base64Controller,
                    decoration: const InputDecoration(
                      labelText: 'Base64 data',
                      icon: Icon(Icons.card_membership),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              child: const Text("Submit"),
              onPressed: () {
                final messengerState = ScaffoldMessenger.of(context);
                final provider = Provider.of<CardDetailsModel>(context, listen: false);
                try {
                  IdentificationQrContentParser(provider).processQrCodeContent(base64Controller.text);
                  messengerState.showSnackBar(
                    const SnackBar(
                      content: Text("Card set"),
                    ),
                  );
                  Navigator.pop(context);
                } on QrCodeParseException catch (e, _) {
                  messengerState.showSnackBar(
                    SnackBar(
                      content: Text(e.reason),
                    ),
                  );
                }
              },
            )
          ],
        );
      },
    );
  }

  void _showInfoSlides(BuildContext context) {
    Navigator.push(
      context,
      AppRoute(
        builder: (context) => const IntroScreen(),
      ),
    );
  }
}
