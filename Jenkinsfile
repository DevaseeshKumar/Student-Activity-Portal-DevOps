pipeline {
    agent any
    environment {
        DEP_CHECK_DIR = "backend/target/dependency-check-data"
    }
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }
        stage('Build Maven Package') {
            steps {
                dir('backend') {
                    bat "mvn clean package -DskipTests"
                }
            }
        }
        stage('Dependency Vulnerability Scan') {
            steps {
                dir('backend') {
                    echo "🔍 Running OWASP Dependency-Check (offline mode)..."
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                    -DdataDirectory=%DEP_CHECK_DIR% ^
                    -Dformat=HTML,CSV,JSON ^
                    -DautoUpdate=false ^
                    -Doffline=true ^
                    -DfailBuildOnCVSS=11 || exit 0
                    """
                    // Convert HTML report to PDF (requires wkhtmltopdf installed)
                    bat "wkhtmltopdf target/dependency-check-report.html target/dependency-check-report.pdf"
                }
            }
        }
        stage('Archive OWASP Reports') {
            steps {
                archiveArtifacts artifacts: 'backend/target/dependency-check-report.*', fingerprint: true
            }
        }
        stage('Start Services with Docker Compose') {
            steps {
                echo "🚀 Starting services via Docker Compose..."
                bat "docker-compose up -d --build"
            }
        }
    }
    post {
        success {
            echo "✅ Pipeline executed successfully!"
        }
        always {
            cleanWs()
        }
    }
}
