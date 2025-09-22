pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir() // start fresh
            }
        }

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

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    script {
                        bat 'docker build -t student-backend:latest .'
                    }
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    script {
                        bat 'docker build -t student-frontend:latest .'
                    }
                }
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} up -d --build"
                    bat "docker-compose -f ${env.DOCKER_COMPOSE_FILE} logs"
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
