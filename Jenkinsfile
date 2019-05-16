timestamps {
    node {

        properties([
            [$class: 'jenkins.model.BuildDiscarderProperty', strategy: [$class: 'LogRotator',
                artifactDaysToKeepStr: '5',
                artifactNumToKeepStr: '3',
                daysToKeepStr: '15',
                numToKeepStr: '3']
            ]]);

        withEnv(["JAVA_HOME=${ tool 'JDK8' }", "PATH+MAVEN=${tool 'Maven CURRENT'}/bin:${env.JAVA_HOME}/bin"]) {

            stage('Prepare') {
                 checkout scm
            }

            stage('Build') {
                echo "Building branch: ${env.BRANCH_NAME}"
                sh "mvn install -U -DskipTests -Dtest.skip.integrationtests=true -B -V -fae -q"
            }

            stage('Test') {
                echo "Running unit tests"
                sh "mvn -e clean test -B"
            }

            try {
                lock('flamingo-oracle') {

                    stage('Prepare Oracle') {
                         sh "sqlplus -l -S JENKINS_FLAMINGO/jenkins_flamingo@192.168.1.11:1521/orcl < ./.jenkins/clear-oracle-schema.sql"
                    }

                    stage('IntegrationTest') {
                        echo "Running integration tests on all modules except viewer-admin"
                        sh "mvn -e verify -B -Pjenkins -pl '!viewer-admin'"

                        echo "Running integration tests on viewer-admin module only"
                        sh "mvn -e verify -B -Pjenkins -pl 'viewer-admin'"
                    }
                }

            } finally {
                stage('Publish Results'){
                    junit allowEmptyResults: true, testResults: '**/target/surefire-reports/TEST-*.xml, **/target/failsafe-reports/TEST-*.xml'
                }
            }

             stage('Check Javadocs') {
                 sh "mvn javadoc:javadoc"
             }

             stage('Check Test Javadocs') {
                 sh "mvn javadoc:test-javadoc"
             }

            stage('OWASP Dependency Check') {
                sh "mvn org.owasp:dependency-check-maven:aggregate -DskipSystemScope=true -DnodeAuditAnalyzerEnabled=false -DnodeAnalyzerEnabled=false -Dformat=XML -DsuppressionFile=./.mvn/owasp-suppression.xml"

                dependencyCheckPublisher canComputeNew: false, defaultEncoding: '', healthy: '85', pattern: '**/dependency-check-report.xml', shouldDetectModules: true, unHealthy: ''
            }
        }
    }
}
