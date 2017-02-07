timestamps {
    node {
        withEnv(["JAVA_HOME=${ tool 'JDK8' }", "PATH+MAVEN=${tool 'Maven 3.3.9'}/bin:${env.JAVA_HOME}/bin"]) {
            stage('Prepare') {
                 // git 'https://github.com/flamingo-geocms/flamingo.git'
                 git branch: 'jenkins-ci', credentialsId: '824987a7-c70c-45ce-ac42-147969e3ed51', url: 'https://github.com/flamingo-geocms/flamingo.git'
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

            stage('IntegrationTest') {
                echo "run integration tests on all modules except viewer-admin"
                sh "mvn -e clean verify -B -Pjenkins -pl '!viewer-admin'"
            }

            stage('ViewerAdminIntegrationTest') {
                echo "run integration tests on viewer-admin module only"
                sh "mvn -e clean verify -B -Pjenkins -pl 'viewer-admin'"
            }

            stage('Publish Results'){
                junit allowEmptyResults: true, testResults: '**/target/surefire-reports/TEST-*.xml, **/target/failsafe-reports/TEST-*.xml'
            }
        }
    }
}
