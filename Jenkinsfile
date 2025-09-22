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
                dir('SpringBootRestAPIJPAProject') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('student-frontend') {
                    // Checking Node.js and npm versions
                    bat 'node -v'
                    bat 'npm -v'

                    // Verifying frontend directory contents
                    bat 'dir'

                    // Installing npm dependencies
                    bat 'npm install'
                    
                    // Running the build
                    bat 'npm run build'
                }
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    bat 'docker-compose up -d --build'
                    bat 'docker-compose logs'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
        cleanup {
            cleanWs()
        }
    }
}