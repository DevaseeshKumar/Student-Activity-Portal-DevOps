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
                    echo "🔍 Running OWASP Dependency-Check in offline mode..."
                    // Run scan in offline mode, do not fail pipeline
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                    -DdataDirectory=%DEP_CHECK_DIR% ^
                    -Dformat=HTML,CSV,JSON ^
                    -DautoUpdate=false ^
                    -Doffline=true ^
                    -DfailOnError=false ^
                    -DfailBuildOnCVSS=11 || echo "⚠️ OWASP Dependency-Check failed but continuing..."
                    """
                    
                    // Optional PDF conversion if wkhtmltopdf is installed
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
                // Safely archive reports even if missing
                archiveArtifacts artifacts: 'backend/target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
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
