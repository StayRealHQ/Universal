plugins {
  id("com.google.gms.google-services") version "4.4.2" apply false
}

buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath("com.android.tools.build:gradle:8.8.0")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
  }
}

allprojects {
  repositories {
    google()
    mavenCentral()
  }
}

tasks.register("clean").configure {
  delete("build")
}
