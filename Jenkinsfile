node {
    properties([
        [$class: 'jenkins.model.BuildDiscarderProperty', strategy: [$class: 'LogRotator',
            artifactDaysToKeepStr: '5',
            artifactNumToKeepStr: '5',
            daysToKeepStr: '15',
            numToKeepStr: '5']
        ]]); 

    withEnv(["JAVA_HOME=${ tool 'OpenJDK11' }", "PATH+MAVEN=${tool 'Maven CURRENT'}/bin:${env.JAVA_HOME}/bin"]) {
        stage("Prepare") {
            checkout scm
            sh "wget http://cert.pkioverheid.nl/EVRootCA.cer"
            try {
                sh "keytool -importcert -file ./EVRootCA.cer -alias EVRootCA -keystore $JAVA_HOME/lib/security/cacerts -storepass 'changeit' -v -noprompt -trustcacerts"
            } catch (err) {
                /* possibly already imported cert */
                echo err.getMessage()
            }
        }
        stage("Build") {
            echo "Building branch: ${env.BRANCH_NAME}"
            sh "mvn clean install -U -DskipTests -Dtest.skip.integrationtests=true -B -V -fae -q"
        }
        stage("Test") {
            echo "Running unit tests"
            sh "mvn -e test -B"
        }
        stage("Integration Test") {
            echo "Running unit tests"
            sh "mvn -e verify -B"
        }
        stage('Publish Test Results') {
            junit allowEmptyResults: true, testResults: '**/target/surefire-reports/TEST-*.xml, **/target/failsafe-reports/TEST-*.xml'
        }
        stage('Publish Test Coverage results') {
            jacoco exclusionPattern: '**/*Test.class', execPattern: '**/target/**.exec'
            sh "curl -s https://codecov.io/bash | bash"
        }
        if (env.BRANCH_NAME == 'master' && env.NODE_NAME == 'built-in') {
            stage("Docker image build & push") {
                echo "Create a docker image of the master branch when running on the master node"
                sh "mvn install -Dmaven.test.skip=true -B -V -e -fae -q"
                sh "mvn deploy -B -pl :docker -P docker"
            }
        }
        stage('OWASP Dependency Check') {
            sh "mvn org.owasp:dependency-check-maven:aggregate"
            dependencyCheckPublisher failedNewCritical: 1, unstableNewHigh: 1, unstableNewLow: 1, unstableNewMedium: 1
        }
    }
}
