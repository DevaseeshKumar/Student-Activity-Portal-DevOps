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
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'node -v'
                    bat 'npm -v'
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    bat 'docker-compose -f docker-compose.yml up -d --build'
                    bat 'docker-compose -f docker-compose.yml ps'
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
