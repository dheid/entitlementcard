package app.ehrenamtskarte.backend.regions.webservice.schema

import app.ehrenamtskarte.backend.common.webservice.DEFAULT_PROJECT
import app.ehrenamtskarte.backend.common.webservice.GraphQLContext
import app.ehrenamtskarte.backend.common.webservice.schema.IdsParams
import app.ehrenamtskarte.backend.projects.database.ProjectEntity
import app.ehrenamtskarte.backend.projects.database.Projects
import app.ehrenamtskarte.backend.regions.database.repos.RegionsRepository
import app.ehrenamtskarte.backend.regions.webservice.schema.types.Region
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import graphql.schema.DataFetchingEnvironment
import org.jetbrains.exposed.sql.transactions.transaction

@Suppress("unused")
class RegionsQueryService {

    @GraphQLDescription("Return list of all regions in the given project.")
    fun regionsInProject(project: String): List<Region> = transaction {
        RegionsRepository.findAllInProject(project).map {
            Region(it.id.value, it.prefix, it.name, it.regionIdentifier, it.dataPrivacyPolicy)
        }
    }

    @GraphQLDescription("Returns regions queried by ids in the given project.")
    fun regionsByIdInProject(project: String, ids: List<Int>): List<Region?> = transaction {
        RegionsRepository.findByIdsInProject(project, ids).map {
            if (it == null) {
                null
            } else {
                Region(it.id.value, it.prefix, it.name, it.regionIdentifier, it.dataPrivacyPolicy)
            }
        }
    }

    @GraphQLDescription("Returns region data for specific region.")
    fun regionByRegionId(regionId: Int): Region = transaction {
        val regionEntity = RegionsRepository.findRegionById(regionId)
        Region(
            regionEntity.id.value,
            regionEntity.prefix,
            regionEntity.name,
            regionEntity.regionIdentifier,
            regionEntity.dataPrivacyPolicy,
        )
    }

    @GraphQLDescription("Returns region by postal code. Works only for the EAK project in which each region has an appropriate regionIdentifier.")
    fun regionByPostalCode(dfe: DataFetchingEnvironment, postalCode: String, project: String): Region = transaction {
        val regionIdentifier = dfe.getContext<GraphQLContext>().regionIdentifierByPostalCode[postalCode]
            ?: throw Exception("Region couldn't be found")
        val projectEntity = ProjectEntity.find { Projects.project eq project }.firstOrNull()
            ?: throw Exception("Project couldn't be found")
        val regionEntity = RegionsRepository.findRegionByRegionIdentifier(regionIdentifier, projectEntity.id)
        Region(
            regionEntity.id.value,
            regionEntity.prefix,
            regionEntity.name,
            regionEntity.regionIdentifier,
            regionEntity.dataPrivacyPolicy,
        )
    }

    @Deprecated("Deprecated in favor of project specific query", ReplaceWith("regionsInProject"))
    @GraphQLDescription("Return list of all regions in the eak bayern project.")
    fun regions(): List<Region> = regionsInProject(DEFAULT_PROJECT)

    @Deprecated("Deprecated in favor of project specific query", ReplaceWith("regionsByIdInProject"))
    @GraphQLDescription("Returns regions queried by ids in the eak bayern project.")
    fun regionsById(params: IdsParams) = regionsByIdInProject(DEFAULT_PROJECT, params.ids)
}
