pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git'
            }
        }

        stage('Verify Docker Installation') {
            steps {
                bat 'docker --version'
                bat 'docker-compose --version'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') { // ✅ points to correct folder
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') { // ✅ points to correct folder
                    // Check Node.js + npm
                    bat 'node -v'
                    bat 'npm -v'

                    // Install dependencies
                    bat 'npm install'

                    // Build frontend
                    bat 'npm run build'
                }
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    bat 'docker-compose up -d --build'
                    bat 'docker-compose ps'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Please check logs.'
        }
        cleanup {
            cleanWs()
        }
    }
}
