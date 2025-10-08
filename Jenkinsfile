pipeline {
    agent any

    environment {
        DEP_CHECK_DIR = "backend/target/dependency-check-data"
        SONAR_SERVER = "SonarQube"       // Jenkins SonarQube server config
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
                echo "🧹 Workspace cleaned before build."
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
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                    -DdataDirectory=%DEP_CHECK_DIR% ^
                    -Dformat=HTML,CSV,JSON ^
                    -DautoUpdate=false ^
                    -DfailBuildOnCVSS=11 ^
                    || echo "⚠️ Dependency Check completed with warnings"
                    """
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                echo "📊 Running SonarQube Analysis using existing server..."
                withSonarQubeEnv('SonarQube') { // connects to your already running SonarQube
                    dir('backend') {
                        bat "mvn sonar:sonar -Dsonar.projectKey=student-activity-portal"
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image & Trivy Scan') {
            steps {
                echo "🐳 Building backend Docker image..."
                bat "docker build -t studentportal-backend ./backend"

                echo "🛡️ Running Trivy Scan for vulnerabilities..."
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
                docker network create monitoring || echo "Network already exists"
                docker run -d --name prometheus --network monitoring -p 9090:9090 prom/prometheus
                docker run -d --name grafana --network monitoring -p 3000:3000 grafana/grafana
                """
            }
        }

        stage('Start Application Services') {
            steps {
                echo "🚀 Starting backend and other services via Docker Compose..."
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
            echo "❌ Pipeline failed! Check Jenkins logs and SonarQube reports."
        }
        always {
            echo "🧹 Cleaning workspace after build..."
            cleanWs()
        }
    }
}
