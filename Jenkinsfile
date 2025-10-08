pipeline {
    agent any

    environment {
        // Docker image names
        BACKEND_IMAGE = "studentportal-backend:latest"
        FRONTEND_IMAGE = "studentportal-frontend:latest"
        
        // SonarQube settings
        SONARQUBE_SERVER = "SonarQube" // Jenkins SonarQube server name
        SONAR_PROJECT_KEY = "StudentActivityPortal"
        SONAR_PROJECT_NAME = "StudentActivityPortal"
        SONAR_PROJECT_VERSION = "1.0"
    }

    tools {
        maven 'Maven-3.9.5' // Maven installation in Jenkins
        nodejs 'NodeJS-20'   // NodeJS installation in Jenkins
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/yourusername/StudentActivityPortal.git'
            }
        }

        stage('SonarQube Analysis') {
            environment {
                // Enable Sonar scanner
                scannerHome = tool 'SonarScanner'
            }
            steps {
                withSonarQubeEnv(SONARQUBE_SERVER) {
                    sh """
                    # Analyze backend (Java)
                    mvn clean verify sonar:sonar \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                        -Dsonar.projectVersion=${SONAR_PROJECT_VERSION} \
                        -Dsonar.sources=backend/src/main/java \
                        -Dsonar.java.binaries=backend/target/classes
                    """
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build backend Docker image
                sh "docker build -t ${BACKEND_IMAGE} ./backend"
                // Build frontend Docker image
                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

        stage('Run Docker Compose') {
            steps {
                sh 'docker-compose -f docker-compose.yml down'
                sh 'docker-compose -f docker-compose.yml up -d --build'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up dangling images...'
            sh 'docker system prune -f'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
