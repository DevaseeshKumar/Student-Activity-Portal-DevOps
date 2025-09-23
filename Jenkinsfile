pipeline {
    agent any

    environment {
        REPORT_DIR = 'backend/target/dependency-check-report'
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
                echo 'Running OWASP Dependency-Check...'
                dir('backend') {
                    bat """
                        mvn org.owasp:dependency-check-maven:check ^
                        -Dformat=ALL ^
                        -DoutputDirectory=${REPORT_DIR} ^
                        -Ddependency-check.failOnError=false ^
                        -Ddependency-check.failBuildOnCVSS=11 ^
                        -Ddependency-check.autoUpdate=false
                    """
                }
            }
        }

        stage('Publish Dependency-Check Report') {
            steps {
                echo 'Publishing Dependency-Check results in Jenkins...'
                dependencyCheckPublisher pattern: "${REPORT_DIR}/dependency-check-report.xml"
            }
        }

        stage('Archive HTML Report') {
            steps {
                echo 'Archiving Dependency-Check HTML report for visualization...'
                dir('backend') {
                    archiveArtifacts artifacts: "${REPORT_DIR}/dependency-check-report.html", fingerprint: true
                }
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
