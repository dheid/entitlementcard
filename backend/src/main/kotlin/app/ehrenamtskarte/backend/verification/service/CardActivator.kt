package app.ehrenamtskarte.backend.verification.service

import app.ehrenamtskarte.backend.verification.database.TOTP_SECRET_LENGTH
import at.favre.lib.crypto.bcrypt.BCrypt
import com.eatthepath.otp.TimeBasedOneTimePasswordGenerator
import javax.crypto.KeyGenerator

object CardActivator {
    private const val cost = 11

    @Synchronized
    public fun generateTotpSecret(): ByteArray {
        // https://tools.ietf.org/html/rfc6238#section-3 - R3 (TOTP uses HTOP)
        // https://tools.ietf.org/html/rfc4226#section-4 - R6 (How long should a shared secret be?
        // -> 160bit)
        // https://tools.ietf.org/html/rfc4226#section-7.5 - Random Generation (How to generate a
        // secret? -> Random))))
        val algorithm = TimeBasedOneTimePasswordGenerator.TOTP_ALGORITHM_HMAC_SHA256
        val keyGenerator = KeyGenerator.getInstance(algorithm)
        keyGenerator.init(TOTP_SECRET_LENGTH * 8)

        return keyGenerator.generateKey().encoded
    }

    public fun hashActivationSecret(rawActivationSecret: ByteArray): ByteArray =
            BCrypt.withDefaults().hash(cost, rawActivationSecret)

    public fun verifyActivationSecret(
            rawActivationSecret: ByteArray,
            activationSecretHash: ByteArray
    ): Boolean = BCrypt.verifyer().verify(rawActivationSecret, activationSecretHash).verified
}
