timestamps {
    node {

        withEnv(["JAVA_HOME=${ tool 'JDK8' }", "PATH+MAVEN=${tool 'Maven 3.3.9'}/bin:${env.JAVA_HOME}/bin"]) {

            stage('Prepare') {
                 checkout scm
                 sh "sqlplus -l -S jenkins_flamingo/jenkins_flamingo@192.168.1.41:1521/DB01 < ./.jenkins/clear-oracle-schema.sql"
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

                stage('viewer IntegrationTest') {
                    echo "Running integration tests on all modules except viewer-admin"
                    sh "mvn -e verify -B -Pjenkins -pl '!viewer-admin'"
                }

                stage('viewer-admin IntegrationTest') {
                    echo "Running integration tests on viewer-admin module only"
                    sh "mvn -e verify -B -Pjenkins -pl 'viewer-admin'"
                }

            } finally {

                stage('Publish Results'){
                    junit allowEmptyResults: true, testResults: '**/target/surefire-reports/TEST-*.xml, **/target/failsafe-reports/TEST-*.xml'
                }

            }
        }
    }
}
