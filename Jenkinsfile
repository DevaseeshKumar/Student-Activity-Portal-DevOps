pipeline {
    agent any

    environment {
        REPORT_DIR = 'backend/target/dependency-check-report'
        DATA_DIR = 'backend/dependency-check-data'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git'
            }
        }

        stage('Build Maven Package') {
            steps {
                echo 'Building Maven package...'
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Dependency Vulnerability Scan') {
            steps {
                echo 'Running OWASP Dependency-Check (local cache)...'
                dir('backend') {
                    bat """
                        mvn org.owasp:dependency-check-maven:check ^
                        -DdataDirectory=${DATA_DIR} ^
                        -Dformat=ALL ^
                        -DoutputDirectory=${REPORT_DIR} ^
                        -Ddependency-check.failOnError=false ^
                        -Ddependency-check.failBuildOnCVSS=11 ^
                        -Ddependency-check.autoUpdate=false
                    """
                }
            }
        }

        stage('Publish Dependency-Check HTML Report') {
            steps {
                echo 'Publishing Dependency-Check HTML report in Jenkins...'
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${REPORT_DIR}",
                    reportFiles: 'dependency-check-report.html',
                    reportName: 'Dependency-Check Report'
                ])
            }
        }

        stage('Publish Dependency-Check Trend') {
            steps {
                echo 'Publishing Dependency-Check Trend report in Jenkins...'
                dependencyCheckPublisher pattern: "${REPORT_DIR}/dependency-check-report.xml"
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                echo 'Starting services via Docker Compose...'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs!'
        }
        cleanup {
            cleanWs()
        }
    }
}
