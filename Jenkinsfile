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
                    echo "🔍 Running OWASP Dependency-Check..."
                    // Run OWASP scan without failing pipeline on errors
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                    -DdataDirectory=%DEP_CHECK_DIR% ^
                    -Dformat=HTML,CSV,JSON ^
                    -DautoUpdate=true ^
                    -Doffline=false ^
                    -DfailOnError=false ^
                    -DfailBuildOnCVSS=11 || exit 0
                    """
                    // Convert HTML report to PDF only if wkhtmltopdf exists
                    bat """
                    if exist wkhtmltopdf (
                        wkhtmltopdf target/dependency-check-report.html target/dependency-check-report.pdf
                    ) else (
                        echo "⚠️ wkhtmltopdf not found, skipping PDF conversion."
                    )
                    """
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
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
        always {
            cleanWs()
        }
    }
}
