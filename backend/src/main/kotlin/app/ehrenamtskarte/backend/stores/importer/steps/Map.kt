package app.ehrenamtskarte.backend.stores.importer.steps

import app.ehrenamtskarte.backend.common.COUNTRY_CODE
import app.ehrenamtskarte.backend.stores.importer.PipelineStep
import app.ehrenamtskarte.backend.stores.importer.replaceNa
import app.ehrenamtskarte.backend.stores.importer.types.AcceptingStore
import app.ehrenamtskarte.backend.stores.importer.types.LbeAcceptingStore
import org.slf4j.Logger

const val MISCELLANEOUS_CATEGORY = 9
const val ALTERNATIVE_MISCELLANEOUS_CATEGORY = 99

class Map(private val logger: Logger) : PipelineStep<List<LbeAcceptingStore>, List<AcceptingStore>>() {

    override fun execute(input: List<LbeAcceptingStore>) = input.mapNotNull {
        try {
            AcceptingStore(
                it.name!!.trim(),
                COUNTRY_CODE,
                it.location!!.trim(),
                cleanPostalCode(it.postalCode),
                it.street.clean(),
                it.houseNumber.clean(),
                it.longitude.safeToDouble(),
                it.latitude.safeToDouble(),
                categoryId(it.category!!),
                it.email.clean(),
                it.telephone.clean(),
                it.homepage.clean(),
                it.discount.clean()
            )
        } catch (e: Exception) {
            logger.info("Exception occurred while mapping $it", e)
            null
        }
    }

    private fun String?.safeToDouble(): Double? {
        return this?.clean()?.replace(",", ".")?.toDouble()
    }

    private fun categoryId(category: String): Int {
        val int = category.toInt()
        return if (int == ALTERNATIVE_MISCELLANEOUS_CATEGORY) MISCELLANEOUS_CATEGORY else int
    }

    private fun String?.clean(): String? {
        return this?.replaceNa()?.trim()
    }

    private fun cleanPostalCode(postalCode: String?): String? {
        if (postalCode == null) return null
        val fiveDigitRegex = """\d{5}""".toRegex()
        return fiveDigitRegex.find(postalCode)?.value
    }

}