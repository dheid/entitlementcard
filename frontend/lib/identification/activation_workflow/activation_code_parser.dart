import 'dart:typed_data';

import 'package:ehrenamtskarte/identification/qr_code_scanner/qr_code_processor.dart';
import 'package:ehrenamtskarte/identification/qr_content_parser.dart';
import 'package:ehrenamtskarte/identification/verification_workflow/verification_qr_code_processor.dart';
import 'package:ehrenamtskarte/proto/card.pb.dart';

class QRCodeInvalidTotpSecretException extends QrCodeParseException {
  QRCodeInvalidTotpSecretException() : super('invalid totp secret');
}

class QRCodeMissingExpiryException extends QrCodeFieldMissingException {
  QRCodeMissingExpiryException() : super('expirationDate');
}

class ActivationCodeParser {
  const ActivationCodeParser();

  DynamicActivationCode parseQrCodeContent(Uint8List rawContent) {
    final QrCode qrCode = rawContent.parseQRCodeContent();

    if (!qrCode.hasDynamicActivationCode()) {
      throw QrCodeWrongTypeException();
    }

    final DynamicActivationCode activationCode = qrCode.dynamicActivationCode;

    assertConsistentCardInfo(activationCode.info);
    _assertConsistentDynamicActivationCode(activationCode);

    return activationCode;
  }

  void _assertConsistentDynamicActivationCode(DynamicActivationCode code) {
    if (!code.hasPepper()) {
      throw QrCodeFieldMissingException('pepper');
    }
    if (!code.hasActivationSecret()) {
      throw QrCodeFieldMissingException('activationSecret');
    }
  }
}
