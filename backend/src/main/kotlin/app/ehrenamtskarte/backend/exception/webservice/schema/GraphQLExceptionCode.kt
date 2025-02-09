package app.ehrenamtskarte.backend.exception.webservice.schema

enum class GraphQLExceptionCode {
    EMAIL_ALREADY_EXISTS,
    INVALID_CARD_HASH,
    INVALID_CODE_TYPE,
    INVALID_CREDENTIALS,
    INVALID_DATA_POLICY_SIZE,
    INVALID_FILE_SIZE,
    INVALID_FILE_TYPE,
    INVALID_JSON,
    INVALID_LINK,
    INVALID_PASSWORD,
    INVALID_PASSWORD_RESET_LINK,
    INVALID_ROLE,
    MAIL_NOT_SENT,
    PASSWORD_RESET_KEY_EXPIRED,
    REGION_NOT_FOUND,
    REGION_NOT_ACTIVATED_FOR_APPLICATION
}
