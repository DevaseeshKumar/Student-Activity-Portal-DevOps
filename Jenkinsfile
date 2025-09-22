pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout SCM') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git'
            }
        }

        stage('Verify Docker') {
            steps {
                bat 'docker --version'
                bat 'docker-compose --version'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t student-backend:latest .'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat 'docker build -t student-frontend:latest .'
                }
            }
        }

        stage('Start Services') {
            steps {
                script {
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} down"
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} up -d --build"
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
            cleanWs()
        }
    }
}
