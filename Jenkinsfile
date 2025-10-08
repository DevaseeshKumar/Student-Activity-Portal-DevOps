pipeline {
    agent any
    environment {
        SONARQUBE_TOKEN = credentials('sonar-token') // replace with your actual credential ID
    }
    stages {
        stage('Clean Workspace') {
            steps {
                echo '🧹 Cleaning workspace before build...'
                cleanWs()
            }
        }

        stage('Checkout SCM') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git']]
                ])
            }
        }

        stage('Build Maven Package') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Dependency Vulnerability Scan (Dummy)') {
            steps {
                echo '🔍 Skipping OWASP Dependency-Check (dummy data)...'
                dir('backend/target') {
                    writeFile file: 'dependency-check-report.html', text: '<html><body><h1>Dummy OWASP Report</h1></body></html>'
                    writeFile file: 'dependency-check-report.json', text: '{}'
                    writeFile file: 'dependency-check-report.csv', text: 'File,Dependency,Version,Severity'
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                echo '⚡ Running SonarQube analysis (dummy placeholder)...'
                // Replace with actual SonarQube commands if needed
                // dir('backend') { bat "mvn sonar:sonar -Dsonar.login=${SONARQUBE_TOKEN}" }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                echo '✅ Skipping Quality Gate (dummy data)'
            }
        }

        stage('Build Docker Image & Trivy Scan') {
            steps {
                echo '🐳 Building Docker image & skipping Trivy scan (dummy)...'
                // Example docker build:
                // bat 'docker build -t student-portal-backend:latest backend/'
            }
        }

        stage('Start Monitoring (Prometheus + Grafana)') {
            steps {
                echo '📊 Starting Prometheus and Grafana (dummy step)...'
            }
        }

        stage('Start Application Services') {
            steps {
                echo '🚀 Starting application services (dummy step)...'
            }
        }

        stage('Archive Reports') {
            steps {
                echo '📁 Archiving reports...'
                archiveArtifacts artifacts: 'backend/target/dependency-check-report.*', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning workspace after build...'
            cleanWs()
        }
        success {
            echo '✅ Pipeline finished successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
    }
}
