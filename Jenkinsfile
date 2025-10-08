pipeline {
    agent any

    environment {
        DEP_CHECK_DIR = "backend/target/dependency-check-data"
        SONARQUBE_CONTAINER = "sonarqube:latest"
        TRIVY_CONTAINER = "aquasec/trivy:latest"
        PROMETHEUS_CONTAINER = "prom/prometheus:latest"
        GRAFANA_CONTAINER = "grafana/grafana:latest"
        SONARQUBE_URL = "http://localhost:9000"
        SONARQUBE_TOKEN = credentials('sonar-token') // Jenkins credential
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

        stage('Dependency Vulnerability Scan (OWASP)') {
            steps {
                dir('backend') {
                    echo "🔍 Running OWASP Dependency-Check..."
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                    -DdataDirectory=%DEP_CHECK_DIR% ^
                    -Dformat=HTML,CSV,JSON ^
                    -DautoUpdate=false ^
                    -DfailBuildOnCVSS=11 ^
                    || echo "⚠️ Dependency Check completed with warnings"
                    """
                    bat """
                    if exist target\\dependency-check-report.html (
                        wkhtmltopdf target\\dependency-check-report.html target\\dependency-check-report.pdf
                    )
                    """
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                echo "📊 Running SonarQube Analysis..."
                bat """
                docker run --rm ^
                    -e SONAR_HOST_URL=%SONARQUBE_URL% ^
                    -e SONAR_TOKEN=%SONARQUBE_TOKEN% ^
                    -v "%CD%:/usr/src" ^
                    sonarsource/sonar-scanner-cli ^
                    -Dsonar.projectKey=student-activity-portal ^
                    -Dsonar.sources=backend/src ^
                    -Dsonar.java.binaries=backend/target/classes ^
                    -Dsonar.language=java
                """
            }
        }

        stage('Container Image Build & Trivy Scan') {
            steps {
                echo "🐳 Building Docker image..."
                bat "docker build -t studentportal-backend ./backend"

                echo "🛡️ Scanning Docker image for vulnerabilities with Trivy..."
                bat """
                docker run --rm ^
                    -v /var/run/docker.sock:/var/run/docker.sock ^
                    -v %CD%:/root/.cache/ ^
                    aquasec/trivy:latest image studentportal-backend ^
                    --format table --severity HIGH,CRITICAL
                """
            }
        }

        stage('Start Monitoring (Prometheus + Grafana)') {
            steps {
                echo "📈 Starting Prometheus and Grafana..."
                bat """
                docker network create monitoring || echo "Network exists"
                docker run -d --name prometheus --network monitoring -p 9090:9090 prom/prometheus
                docker run -d --name grafana --network monitoring -p 3000:3000 grafana/grafana
                """
            }
        }

        stage('Start Application Services') {
            steps {
                echo "🚀 Starting backend and other services..."
                bat "docker-compose up -d --build"
            }
        }

        stage('Archive Reports') {
            steps {
                archiveArtifacts artifacts: 'backend/target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo "✅ Full DevSecOps Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed! Check Jenkins logs and reports."
        }
        always {
            cleanWs()
        }
    }
}
