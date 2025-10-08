pipeline {
    agent any

    environment {
        SONAR_AUTH_TOKEN = credentials('sonar-token') // Jenkins secret for SonarQube
        SONAR_HOST_URL = 'http://localhost:9000'      // Your SonarQube server URL
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
                    echo "🔨 Building Maven package..."
                    bat "mvn clean package -DskipTests"
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                echo "⚡ Running SonarQube analysis..."
                dir('backend') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.projectKey=StudentActivityPortal -Dsonar.host.url=${env.SONAR_HOST_URL} -Dsonar.login=${env.SONAR_AUTH_TOKEN}"
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                echo "⏱ Waiting for SonarQube Quality Gate..."
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image..."
                dir('backend') {
                    bat "docker build -t student-activity-portal:latest ."
                }
            }
        }

        stage('Archive Reports') {
            steps {
                echo "📁 Archiving backend artifact..."
                archiveArtifacts artifacts: 'backend/target/backend-0.0.1-SNAPSHOT.war', allowEmptyArchive: true
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
