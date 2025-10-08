pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')  // your SonarQube token
        GIT_CREDENTIALS = 'github-credentials-id' // Jenkins GitHub credentials ID
    }

    stages {

        stage('Checkout SCM') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git',
                    credentialsId: "${GIT_CREDENTIALS}"
            }
        }

        stage('Build with Maven') {
            steps {
                dir('backend') {  // change 'backend' to folder containing your pom.xml
                    bat 'mvn clean install'
                }
            }
        }

        stage('SonarQube Analysis') {
            environment {
                PATH = "${tool 'Maven 3'}/bin:${env.PATH}"
            }
            steps {
                dir('backend') {
                    withSonarQubeEnv('MySonarQube') {
                        bat "mvn sonar:sonar -Dsonar.login=${SONAR_TOKEN}"
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t sap-image .'
            }
        }

        stage('Run Docker Container') {
            steps {
                bat 'docker stop sap-container || exit 0'
                bat 'docker rm sap-container || exit 0'
                bat 'docker run -d --name sap-container -p 8080:8080 sap-image'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            bat 'docker stop sap-container || exit 0'
            bat 'docker rm sap-container || exit 0'
        }
        failure {
            echo 'Pipeline failed!'
        }
        success {
            echo 'Pipeline succeeded!'
        }
    }
}
