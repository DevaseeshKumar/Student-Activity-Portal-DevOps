pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {

        // Clean workspace to avoid Git ownership issues
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        // Checkout code from GitHub
        stage('Checkout SCM') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git'
            }
        }

        // Verify Docker installation
        stage('Verify Docker') {
            steps {
                bat 'docker --version'
                bat 'docker-compose --version'
            }
        }

        // Build backend Docker image (Spring Boot)
        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t student-backend:latest .'
                }
            }
        }

        // Build frontend Docker image (MERN / Vite)
        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat 'docker build -t student-frontend:latest .'
                }
            }
        }

        // Start all services using Docker Compose
        stage('Start Services') {
            steps {
                script {
                    // Ensure any previous containers are removed
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} down"
                    // Start services in detached mode
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} up -d --build"
                    // Show logs briefly
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} logs --tail=50"
                }
            }
        }

    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }

        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }

        always {
            // Ensure workspace cleanup runs inside node
            node {
                cleanWs()
            }
        }
    }
}
