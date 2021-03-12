package app.ehrenamtskarte.backend.common.webservice

import app.ehrenamtskarte.backend.auth.webservice.JwtService
import app.ehrenamtskarte.backend.auth.webservice.authGraphQlParams
import app.ehrenamtskarte.backend.regions.webservice.regionsGraphQlParams
import app.ehrenamtskarte.backend.stores.webservice.storesGraphQlParams
import app.ehrenamtskarte.backend.verification.webservice.verificationGraphQlParams
import com.auth0.jwt.exceptions.*
import com.expediagroup.graphql.toSchema
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import graphql.ExceptionWhileDataFetching
import graphql.ExecutionInput
import graphql.ExecutionResult
import graphql.GraphQL
import io.javalin.http.Context
import java.io.IOException

class GraphQLHandler(
    private val graphQLParams: GraphQLParams =
        storesGraphQlParams stitch verificationGraphQlParams stitch regionsGraphQlParams stitch authGraphQlParams
) {
    val graphQLSchema = toSchema(
        graphQLParams.config,
        graphQLParams.queries,
        graphQLParams.mutations,
        graphQLParams.subscriptions
    )
    private val graphQL = GraphQL.newGraphQL(graphQLSchema).build()!!

    private val mapper = jacksonObjectMapper()

    /**
     * Get payload from the request.
     */
    private fun getPayload(context: Context): Map<String, Any>? {
        return try {
            mapper.readValue<Map<String, Any>>(context.body())
        } catch (e: IOException) {
            throw IOException("Unable to parse GraphQL payload.")
        }
    }

    /**
     * Get the variables passed in the request.
     */
    private fun getVariables(payload: Map<String, *>) =
        payload.getOrElse("variables") { emptyMap<String, Any>() } as Map<String, Any>


    /**
     * Get any errors and data from [executionResult].
     */
    private fun getResult(executionResult: ExecutionResult): MutableMap<String, Any> {
        val result = mutableMapOf<String, Any>()

        if (executionResult.errors.isNotEmpty()) {
            // if we encounter duplicate errors while data fetching, only include one copy
            result["errors"] = executionResult.errors.distinctBy {
                if (it is ExceptionWhileDataFetching) {
                    it.exception
                } else {
                    it
                }
            }
        }

        try {
            // if data is null, get data will fail exceptionally
            result["data"] = executionResult.getData<Any>()
        } catch (e: Exception) {}

        return result
    }

    private fun getJwtTokenFromHeader(context: Context): String? {
        val header = context.header("Authorization") ?: return null
        val split = header.split(" ")
        return if (split.size != 2 || split[0] != "Bearer") null else split[1]
    }

    private fun getGraphQLContext(context: Context) =
        GraphQLContext(getJwtTokenFromHeader(context)?.let(JwtService::verifyToken))

    /**
     * Execute a query against schema
     */
    fun handle(context: Context) {
        val graphQLContext = try {
            getGraphQLContext(context)
        } catch (e: Exception) {
            when (e) {
                is JWTDecodeException, is AlgorithmMismatchException, is SignatureVerificationException,
                is InvalidClaimException, is TokenExpiredException -> {
                    context.status(401)
                    context.result("JWT invalid")
                    return
                }
                else -> throw e
            }
        }

        val payload = getPayload(context)
        payload?.let {
            // Execute the query against the schema
            val executionResult = graphQL.executeAsync(
                ExecutionInput.Builder()
                    .context(graphQLContext)
                    .query(payload["query"].toString())
                    .variables(getVariables(payload))
                    .dataLoaderRegistry(graphQLParams.dataLoaderRegistry)
            ).get()
            val result = getResult(executionResult)

            // write response as json
            context.json(result)
        }
        if (payload == null) {
            context.status(400)
            context.result("Something went wrong.")
        }
    }
}
