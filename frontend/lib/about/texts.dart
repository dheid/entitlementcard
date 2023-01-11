import 'package:ehrenamtskarte/build_config/build_config.dart' show buildConfig;
import 'package:flutter/material.dart';

@immutable
class Paragraph {
  const Paragraph({this.title, this.content});

  final String? content;
  final String? title;
}

List<Widget> toWidgets(ThemeData theme, List<Paragraph> paragraphs) {
  return paragraphs
      .map((e) {
        final title = e.title;
        final content = e.content;
        return [
          if (title != null) Text(title, style: theme.textTheme.headline6),
          if (content != null) Text(content, style: theme.textTheme.bodyText1)
        ];
      })
      .expand((i) => i)
      .toList();
}

List<Widget> getCopyrightText(BuildContext context) {
  return toWidgets(Theme.of(context), [
    const Paragraph(
      content: '''
Der Quelltext dieser App ist unter der MIT Lizenz veröffentlicht und kann unter https://github.com/digitalfabrik/ehrenamtskarte eingesehen werden.

MIT License

Copyright (c) 2021 The Digitale Ehrenamtskarte contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.''',
    )
  ]);
}

List<Widget> getDataPrivacyText(BuildContext context) {
  const content = [
    Paragraph(
      content: '''
Bei der Nutzung der App „Ehrenamtskarte“ für Smartphones und der Web-Application (zusammen „Apps“) erhebt die Tür an Tür – Digitalfabrik gGmbH (von nun an „Digitalfabrik“ oder „wir“) als Verantwortlicher Daten. In dieser Datenschutzerklärung erläutern wir, wie wir die erhobenen Daten verarbeiten. Personenbezogene Daten sind solche Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.)
''',
    ),
    Paragraph(
      title: '''
Welche Daten wir erheben und verarbeiten
''',
      content: '''
Bei jedem Zugriff auf Inhalte auf ehrenamtskarte.app oder der Aktualisierung der dazugehörigen App (Android/iOS/Windows) werden folgende Nutzungsdaten anonym, d.h. ohne Zuordnung zu einer bestimmten Person oder IP-Adresse, erhoben, wenn eine aktive Internetverbindung besteht:

• Datum und Uhrzeit des Abrufs;
• Name des aufgerufenen Internetdienstes, der aufgerufenen Ressource und der verwendeten Aktion;
• Abfrage, die der Client gestellt hat;
• übertragene Datenmenge;
• Meldung, ob der Abruf erfolgreich war;
• Browser-Identifikation (enthält in der Regel die Browserversion, sowie das Betriebssystem);
• Innerhalb der App eingegebene Suchen nach Adressen oder Vergünstigungen;
• Standort-Positionen, falls der Standort in den Apps freigegeben ist.

Sonstige Daten werden bei Ihrer Nutzung nicht automatisch erhoben und nicht an unsere Server gesendet. Nach dem Grundsatz der Datenvermeidung und der Datensparsamkeit, sowie dem Grundsatz der anonymen und pseudonymen Nutzung, wird nur das Minimum an Nutzungsdaten erhoben, soweit dies für den technischen Betrieb der Apps sowie die Ermittlung der aufgerufenen Inhalte erforderlich ist.

Die erhobenen Informationen können weder direkt noch mit Hilfe von Zusatzwissen auf eine bestimmte Person zurückgeführt werden. Die einzelnen Nutzer können somit nicht identifiziert werden. Wir erstellen keine Nutzungsprofile.
''',
    ),
    Paragraph(
      title: '''
Für welche Zwecke und auf welcher Rechtsgrundlage wir Ihre Daten verarbeiten
''',
      content: '''
Die Nutzung der Apps ist ohne Angabe Ihrer personenbezogenen Daten möglich.

Wenn Sie uns anrufen oder eine Anfrage per E-Mail stellen, verarbeiten wir die von Ihnen uns möglicherweise mitgeteilten personenbezogenen Daten nur für das berechtigte Interesse, Ihre Anfrage zu bearbeiten.
''',
    ),
    Paragraph(
      title: '''
An wen wir Ihre Daten weitergeben
''',
      content: '''
Daten, die beim Zugriff auf die Apps oder für einen speziellen Dienst erhoben werden, werden nur dann an Dritte außerhalb unseres Unternehmens übermittelt,

• soweit wir gesetzlich oder durch richterliche bzw. staatsanwaltliche Anordnung dazu verpflichtet sind oder,
• soweit die Weitergabe der Daten im Falle von Angriffen auf die Internetinfrastruktur unseres Unternehmens zur Rechts- oder Strafverfolgung erforderlich ist.

Eine Weitergabe der Daten zu kommerziellen Zwecken erfolgt nicht. Dabei gilt weiterhin, dass die Daten anonym sind, also keiner bestimmten oder bestimmbaren Person zugeordnet werden können.

Eine Übermittlung der Daten in andere Staaten erfolgt nicht. Der Serverstandort ist Deutschland.
''',
    ),
    Paragraph(
      title: '''
Wie lange wir Ihre Daten aufbewahren
''',
      content: '''
Die erhobenen Nutzungsdaten werden anonymisiert gespeichert solange sie für Auswertungen benötigt werden und anschließend vollständig gelöscht.

Wenn Sie uns eine Anfrage über die App schicken, speichern wir Ihre personenbezogenen Daten nur solange, wie dies für die Bearbeitung der Anfrage erforderlich ist. Abschließend löschen wir Ihre personenbezogenen Daten vollständig.

''',
    ),
    Paragraph(
      title: '''
Ihre Rechte
''',
      content: '''
Soweit wir personenbezogene Daten von Ihnen verarbeiten, haben Sie das Recht auf Auskunft über die von uns verarbeiteten personenbezogenen Daten sowie auf Berichtigung oder Löschung oder Einschränkung der Verarbeitung oder ein Widerspruchsrecht gegen die Verarbeitung. Zur Geltendmachung Ihrer Rechte wenden Sie sich einfach an die unten angegebenen Kontaktdaten.

Daneben haben Sie in Bezug auf die Verarbeitung personenbezogener Daten das Recht, sich bei der zuständigen Aufsichtsbeschwerde zu beschweren.

Eine ausschließlich auf einer automatisierten Verarbeitung beruhende Entscheidung findet nicht statt.
''',
    ),
    Paragraph(
      title: '''
Änderungen dieser Datenschutzerklärung
''',
      content: '''
Künftig kann diese Datenschutzerklärung geändert werden. Die jeweils aktuelle Version der Datenschutzerklärung finden Sie in unserer App.
''',
    ),
    Paragraph(
      title: '''
Datenschutzbeauftragter
''',
      content: '''
Wir haben einen Datenschutzbeauftragten ernannt. Dieser ist erreichbar unter:

Daniel Kehne
Tür an Tür – Digitalfabrik gGmbH
kehne@integreat-app.de
Wertachstrasse 29
86153 Augsburg
''',
    ),
    Paragraph(
      title: '''
Kontaktdaten des Verantwortlichen
''',
      content: '''
Wenn Sie uns kontaktieren möchten, etwa um eine datenschutzrechtliche Anfrage zu stellen oder Ihre Rechte geltend zu machen, können Sie uns per E-Mail, Telefon oder postalisch erreichen unter:

Tür an Tür – Digitalfabrik gGmbH
Wertachstrasse 29
86153 Augsburg
digitalfabrik@tuerantuer.de

Allgemeines zum Thema Datenschutz finden Sie auf der Website des Bayerischen Landesbeauftragten für den Datenschutz (https://www.datenschutz-bayern.de). 
  ''',
    )
  ];

  return content
      .map((e) {
        final title = e.title;
        final content = e.content;
        return [
          if (title != null) Text(title, style: Theme.of(context).textTheme.headline6),
          if (content != null) Text(content, style: Theme.of(context).textTheme.bodyText1)
        ];
      })
      .expand((i) => i)
      .toList();
}

List<Widget> getDisclaimerText(BuildContext context) {
  return toWidgets(Theme.of(context), [
    Paragraph(content: buildConfig.disclaimerText)
  ]);
}

List<Widget> getPublisherText(BuildContext context) {
  return toWidgets(Theme.of(context), [
    Paragraph(
      content: buildConfig.publisherText,
    )
  ]);
}
