package app.ehrenamtskarte.backend.common.webservice

import io.javalin.Javalin
import io.javalin.http.staticfiles.Location

const val PORT = 7000

class WebService {
    fun start() {
        val app = Javalin.create { cfg ->
            cfg.enableDevLogging()
            cfg.enableCorsForAllOrigins()
            cfg.addStaticFiles("/graphiql", "/graphiql", Location.CLASSPATH)
        }.start(PORT)

        println("Server is running at http://localhost:${PORT}")
        println("Goto http://localhost:${PORT}/graphiql for a graphical editor")

        val graphQLHandler = GraphQLHandler()
        app.post("/") { ctx -> graphQLHandler.handle(ctx) }
    }
}