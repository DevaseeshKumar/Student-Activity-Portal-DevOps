pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token') // Jenkins credential ID
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/YourUsername/Student-Activity-Portal-DevOps.git'
            }
        }

        stage('Build with Maven') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('backend') {
                    withSonarQubeEnv('MySonarQube') { // Must match Jenkins SonarQube server name
                        bat "mvn sonar:sonar -Dsonar.projectKey=StudentActivityPortal -Dsonar.host.url=http://localhost:9000 -Dsonar.login=${SONAR_TOKEN}"
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

        stage('Build Docker Image') {
            steps {
                script {
                    bat 'docker build -t student-activity-portal:latest ./backend'
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    bat 'docker run -d -p 8080:8080 --name sap-container student-activity-portal:latest'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            bat 'docker stop sap-container || exit 0'
            bat 'docker rm sap-container || exit 0'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
