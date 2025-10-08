pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')  // Your SonarQube token
    }

    stages {
        stage('Checkout SCM') {
            steps {
                // Replace 'github-credentials-id' with the actual Jenkins credential ID
                git branch: 'main',
                    url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git',
                    credentialsId: 'github-credentials-id'
            }
        }

        stage('Build with Maven') {
            steps {
                bat "mvn clean install"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('MySonarQube') {
                    bat "mvn sonar:sonar -Dsonar.login=${env.SONAR_TOKEN}"
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
                bat "docker build -t sap-image ."
            }
        }

        stage('Run Docker Container') {
            steps {
                bat "docker run -d --name sap-container -p 8080:8080 sap-image"
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            bat "docker stop sap-container || exit 0"
            bat "docker rm sap-container || exit 0"
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}
