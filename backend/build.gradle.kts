import java.lang.System.*

/*
 * This file was generated by the Gradle 'init' task.
 *
 * This generated file contains a sample Kotlin application project to get you started.
 */

/**
 * The exposed_version (taken from gradle.properties)
 */
val exposed_version: String by project

plugins {
    // Apply the Kotlin JVM plugin to add support for Kotlin.
    id("org.jetbrains.kotlin.jvm") version "1.3.72"

    // Apply the application plugin to add support for building a CLI application.
    application
}

repositories {
    // Use jcenter for resolving dependencies.
    // You can declare any Maven/Ivy/file repository here.
    jcenter()
    mavenCentral()
}

dependencies {
    implementation("com.github.ajalt.clikt:clikt:3.0.1")
    implementation("io.javalin:javalin:3.12.0")
    implementation("com.google.code.gson", "gson", "2.8.6")
    implementation("org.slf4j", "slf4j-simple", "1.7.30")

    implementation("com.expediagroup:graphql-kotlin-schema-generator:3.6.6")

    // Align versions of all Kotlin components
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))

    // Use the Kotlin JDK 8 standard library.
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

    // Use the Kotlin test library.
    testImplementation("org.jetbrains.kotlin:kotlin-test")

    // Use the Kotlin JUnit integration.
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
    
    implementation("org.jetbrains.exposed", "exposed-core", exposed_version)
    implementation("org.jetbrains.exposed", "exposed-dao", exposed_version)
    implementation("org.jetbrains.exposed", "exposed-jdbc", exposed_version)
    implementation("com.impossibl.pgjdbc-ng", "pgjdbc-ng", "0.8.6")
}

application {
    // Define the main class for the application.
    mainClassName = "xyz.elitese.ehrenamtskarte.EntryPointKt"
}

tasks.withType<JavaExec>().configureEach {
    systemProperties = properties
}
