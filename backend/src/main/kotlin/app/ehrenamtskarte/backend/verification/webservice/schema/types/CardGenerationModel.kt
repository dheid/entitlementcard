package app.ehrenamtskarte.backend.verification.webservice.schema.types

import app.ehrenamtskarte.backend.verification.database.CodeType

data class CardGenerationModel constructor(
    val cardInfoHashBase64: String,
    val activationSecretBase64: String?,
    // Using Long because UInt is not supported, and a protobuf uint32 is not representable by a Kotlin Int
    val cardExpirationDay: Long?,
    val regionId: Int,
    val codeType: CodeType,
    val cardStartDay: Long?
)
