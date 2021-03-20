import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import '../../graphql/graphql_api.dart';
import '../../identification/base_card_details.dart';
import '../../identification/card/eak_card.dart';
import '../../identification/card/id_card.dart';
import 'verification_result_dialog.dart';

class PositiveVerificationResultDialog extends StatelessWidget {
  final BaseCardDetails cardDetails;

  PositiveVerificationResultDialog({Key key, this.cardDetails})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final regionsQuery = GetRegionsByIdQuery(
        variables: GetRegionsByIdArguments(
            ids: IdsParamsInput(ids: [cardDetails.regionId])));

    return Query(
        options: QueryOptions(
            document: regionsQuery.document,
            variables: regionsQuery.getVariablesMap()),
        builder: (result, {refetch, fetchMore}) {
          var region = result.isConcrete
              ? regionsQuery.parse(result.data).regionsById[0]
              : null;
          return VerificationResultDialog(
              title: "Karte ist gültig",
              icon: Icons.verified_user,
              iconColor: Colors.green,
              child: IdCard(
                child: EakCard(
                    cardDetails: cardDetails,
                    region: Region(region.prefix, region.name)),
              ));
        });
  }

  static Future<void> show(BuildContext context, BaseCardDetails cardDetails) =>
      showDialog(
          context: context,
          builder: (_) =>
              PositiveVerificationResultDialog(cardDetails: cardDetails));
}