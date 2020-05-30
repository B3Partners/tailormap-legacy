timestamps {
    node {

        properties([
            [$class: 'jenkins.model.BuildDiscarderProperty', strategy: [$class: 'LogRotator',
                artifactDaysToKeepStr: '5',
                artifactNumToKeepStr: '5',
                daysToKeepStr: '15',
                numToKeepStr: '5']
            ]]);

        final def jdks = [/*'OpenJDK11',*/'JDK8']

        stage("Prepare") {
             checkout scm
        }

        jdks.eachWithIndex { jdk, indexOfJdk ->
            final String jdkTestName = jdk.toString()

            withEnv(["JAVA_HOME=${ tool jdkTestName }", "PATH+MAVEN=${tool 'Maven CURRENT'}/bin:${env.JAVA_HOME}/bin"]) {

                echo "Using JDK: ${jdkTestName}"

                stage("Build: ${jdkTestName}") {
                    echo "Building branch: ${env.BRANCH_NAME}"
                    sh "mvn clean install -U -DskipTests -Dtest.skip.integrationtests=true -B -V -fae -q"
                }

                stage("Test: ${jdkTestName}") {
                    echo "Running unit tests"
                    sh "mvn -e clean test -B"
                }

                lock('flamingo-oracle') {
                    try {
                        timeout(90) {
                            stage("Prepare Oracle: ${indexOfJdk}") {
                                sh ".jenkins/start-oracle.sh"
                                /* no need for this as we have a pristine oracle container... */
                                /* sh "sqlplus -l -S JENKINS_FLAMINGO/jenkins_flamingo@192.168.1.26:15211/XE < ./.jenkins/clear-oracle-schema.sql" */
                            }
                            lock('tomcat-tcp9090') {
                                stage("IntegrationTest: ${jdkTestName}") {
                                    echo "Running integration tests on all modules except viewer-admin"
                                    sh "mvn -e verify -B -Pjenkins -pl '!viewer-admin'"

                                    echo "Running integration tests on viewer-admin module only"
                                    sh "mvn -e verify -B -Pjenkins -pl 'viewer-admin'"
                                }
                            }
                        }
                    } finally {
                        sh "docker stop oracle-flamingo"
                    }
                }

                if (jdkTestName == 'OpenJDK11') {
                    stage("cleanup Java 11 packages") {
                        echo "Removing Java 11 built artifacts from local repository"
                        sh "mvn build-helper:remove-project-artifact"
                    }
                }
            }
        }

        stage('Publish Test Results') {
            junit allowEmptyResults: true, testResults: '**/target/surefire-reports/TEST-*.xml, **/target/failsafe-reports/TEST-*.xml'
        }
        stage('Publish Test Coverage results') {
            jacoco exclusionPattern: '**/*Test.class', execPattern: '**/target/**.exec'
            sh "curl -s https://codecov.io/bash | bash"
        }

        withEnv(["JAVA_HOME=${ tool 'JDK8' }", "PATH+MAVEN=${tool 'Maven CURRENT'}/bin:${env.JAVA_HOME}/bin"]) {
            stage('Check Javadocs') {
                sh "mvn javadoc:javadoc"
            }

            stage('Check Test Javadocs') {
                sh "mvn javadoc:test-javadoc"
            }

            stage('OWASP Dependency Check') {
                sh "mvn org.owasp:dependency-check-maven:aggregate"
                dependencyCheckPublisher failedNewCritical: 1, unstableNewHigh: 1, unstableNewLow: 1, unstableNewMedium: 1
            }
        }
    }
}
