pipeline {
    agent any

    environment {
        DEP_CHECK_DIR = "backend/target/dependency-check-data"
        SONARQUBE_URL = "http://localhost:9000"
        SONARQUBE_TOKEN = credentials('sonar-token') // Jenkins credential
        DOCKER_IMAGE_NAME = "studentportal-backend"
        MONITORING_NETWORK = "monitoring"
    }

    options {
        skipDefaultCheckout true
        timestamps()
    }

    stages {

        stage('Clean Workspace') {
            steps {
                echo "🧹 Cleaning workspace before build..."
                cleanWs()
            }
        }

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
                    // Allow auto-update on first run
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                        -DdataDirectory=%DEP_CHECK_DIR% ^
                        -Dformat=HTML,CSV,JSON ^
                        -DautoUpdate=true ^
                        -DfailBuildOnCVSS=11
                    """
                    // Generate PDF report if HTML exists
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
                dir('backend') {
                    bat """
                    docker run --rm ^
                        -e SONAR_HOST_URL=%SONARQUBE_URL% ^
                        -e SONAR_TOKEN=%SONARQUBE_TOKEN% ^
                        -v "%CD%:/usr/src" ^
                        sonarsource/sonar-scanner-cli ^
                        -Dsonar.projectKey=student-activity-portal ^
                        -Dsonar.sources=src ^
                        -Dsonar.java.binaries=target/classes ^
                        -Dsonar.language=java
                    """
                }
            }
        }

        stage('Build Docker Image & Trivy Scan') {
            steps {
                echo "🐳 Building Docker image..."
                bat "docker build -t %DOCKER_IMAGE_NAME% ./backend"

                echo "🛡️ Scanning Docker image for vulnerabilities with Trivy..."
                bat """
                docker run --rm ^
                    -v /var/run/docker.sock:/var/run/docker.sock ^
                    -v %CD%:/root/.cache/ ^
                    aquasec/trivy:latest image %DOCKER_IMAGE_NAME% ^
                    --format table --severity HIGH,CRITICAL
                """
            }
        }

        stage('Start Monitoring (Prometheus + Grafana)') {
            steps {
                echo "📈 Starting Prometheus and Grafana..."
                bat """
                docker network create %MONITORING_NETWORK% || echo "Network exists"
                docker run -d --name prometheus --network %MONITORING_NETWORK% -p 9090:9090 prom/prometheus
                docker run -d --name grafana --network %MONITORING_NETWORK% -p 3000:3000 grafana/grafana
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
            echo "🧹 Cleaning workspace after build..."
            cleanWs()
        }
    }
}
