pipeline {
    agent any
    environment {
        SONAR_AUTH_TOKEN = credentials('sonar-token')
        SONAR_HOST_URL = 'http://your-sonarqube-url' // replace with your SonarQube URL
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
                git url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git', branch: 'main'
            }
        }

        stage('Build Maven Package') {
            steps {
                dir('backend') {
                    bat "mvn clean package -DskipTests"
                }
            }
        }

        stage('Dependency Vulnerability Scan (Dummy)') {
            steps {
                echo "🔍 Skipping OWASP Dependency-Check (dummy data)..."
                dir('backend/target') {
                    writeFile file: 'dependency-check-report.html', text: '<html><body>Dummy Report</body></html>'
                    writeFile file: 'dependency-check-report.json', text: '{}'
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                echo "⚡ Running real SonarQube analysis..."
                dir('backend') {
                    withSonarQubeEnv('MySonarQubeServer') {
                        bat "mvn sonar:sonar -Dsonar.projectKey=StudentActivityPortal -Dsonar.host.url=${env.SONAR_HOST_URL} -Dsonar.login=${env.SONAR_AUTH_TOKEN}"
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image & Trivy Scan') {
            steps {
                echo "🐳 Building Docker image..."
                dir('backend') {
                    bat "docker build -t student-activity-portal:latest ."
                    echo "🔒 Optional Trivy scan can be added here if needed..."
                }
            }
        }

        stage('Start Monitoring (Prometheus + Grafana)') {
            steps {
                echo "📊 Starting Prometheus and Grafana (dummy step)..."
            }
        }

        stage('Start Application Services') {
            steps {
                echo "🚀 Starting application services (dummy step)..."
            }
        }

        stage('Archive Reports') {
            steps {
                echo "📁 Archiving reports..."
                archiveArtifacts artifacts: 'backend/target/dependency-check-report.html', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning workspace after build..."
            cleanWs()
        }
        success {
            echo "✅ Pipeline finished successfully!"
        }
        failure {
            echo "❌ Pipeline failed! Check logs for details."
        }
    }
}
