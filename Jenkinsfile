pipeline {
    agent any

    environment {
        // Add any environment variables if needed
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                git branch: 'main', url: 'https://github.com/DevaseeshKumar/StudentActivityPortal_TermPaper.git'
            }
        }

        stage('Build Maven Package') {
            steps {
                echo 'Building Maven package (skipping tests)...'
                bat 'mvn clean package -DskipTests'
            }
        }

        stage('Dependency Vulnerability Scan') {
            steps {
                script {
                    echo 'Running OWASP Dependency-Check (HTML, PDF, JSON reports)...'

                    // HTML Report
                    bat '''
                        mvn org.owasp:dependency-check-maven:check ^
                            -Ddependency-check.failOnError=false ^
                            -Ddependency-check.failBuildOnCVSS=11 ^
                            -Ddependency-check.autoUpdate=false ^
                            -Ddependency-check.ossindex.skip=true ^
                            -Dformat=HTML ^
                            -DoutputDirectory=target/dependency-check-report
                    '''

                    // PDF Report
                    bat '''
                        mvn org.owasp:dependency-check-maven:check ^
                            -Ddependency-check.failOnError=false ^
                            -Ddependency-check.failBuildOnCVSS=11 ^
                            -Ddependency-check.autoUpdate=false ^
                            -Ddependency-check.ossindex.skip=true ^
                            -Dformat=PDF ^
                            -DoutputDirectory=target/dependency-check-report
                    '''

                    // JSON Report
                    bat '''
                        mvn org.owasp:dependency-check-maven:check ^
                            -Ddependency-check.failOnError=false ^
                            -Ddependency-check.failBuildOnCVSS=11 ^
                            -Ddependency-check.autoUpdate=false ^
                            -Ddependency-check.ossindex.skip=true ^
                            -Dformat=JSON ^
                            -DoutputDirectory=target/dependency-check-report
                    '''

                    archiveArtifacts artifacts: 'target/dependency-check-report/*.*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Test') {
            steps {
                echo "Running tests (skipped in this pipeline)"
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    echo 'Starting services using Docker Compose...'
                    bat 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Please check the logs.'
        }
        cleanup {
            cleanWs()
        }
    }
}
