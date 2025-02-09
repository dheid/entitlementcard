package app.ehrenamtskarte.backend.auth.webservice.schema

import app.ehrenamtskarte.backend.auth.database.AdministratorEntity
import app.ehrenamtskarte.backend.auth.database.Administrators
import app.ehrenamtskarte.backend.auth.database.repos.AdministratorsRepository
import app.ehrenamtskarte.backend.common.webservice.GraphQLContext
import app.ehrenamtskarte.backend.exception.webservice.exceptions.InvalidLinkException
import app.ehrenamtskarte.backend.exception.webservice.exceptions.PasswordResetKeyExpiredException
import app.ehrenamtskarte.backend.mail.Mailer
import app.ehrenamtskarte.backend.projects.database.Projects
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import graphql.schema.DataFetchingEnvironment
import org.jetbrains.exposed.sql.LowerCase
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant

@Suppress("unused")
class ResetPasswordMutationService {
    @GraphQLDescription("Sends a mail that allows the administrator to reset their password.")
    fun sendResetMail(dfe: DataFetchingEnvironment, project: String, email: String): Boolean {
        val backendConfig = dfe.getContext<GraphQLContext>().backendConfiguration
        val projectConfig = backendConfig.projects.first { it.id == project }
        transaction {
            val user = Administrators.innerJoin(Projects).slice(Administrators.columns)
                .select((Projects.project eq project) and (LowerCase(Administrators.email) eq email.lowercase())and (Administrators.deleted eq false))
                .singleOrNull()?.let { AdministratorEntity.wrapRow(it) }
            // We don't send error messages for empty collection to the user to avoid scraping of mail addresses
            if (user != null) {
                val key = AdministratorsRepository.setNewPasswordResetKey(user)
                Mailer.sendResetPasswodMail(backendConfig, projectConfig, key, email)
            }
        }
        return true
    }

    @GraphQLDescription("Reset the administrator's password")
    fun resetPassword(project: String, email: String, passwordResetKey: String, newPassword: String): Boolean {
        transaction {
            val user = Administrators.innerJoin(Projects).slice(Administrators.columns)
                .select((Projects.project eq project) and (LowerCase(Administrators.email) eq email.lowercase()) and (Administrators.deleted eq false))
                .single().let { AdministratorEntity.wrapRow(it) }

            if (user.passwordResetKeyExpiry!!.isBefore(Instant.now())) {
                throw PasswordResetKeyExpiredException()
            } else if (user.passwordResetKey != passwordResetKey) {
                throw InvalidLinkException()
            }

            AdministratorsRepository.changePassword(user, newPassword)
        }
        return true
    }
}
