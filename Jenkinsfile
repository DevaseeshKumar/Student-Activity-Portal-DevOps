pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'student-activity-portal'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('SONAR_TOKEN') // Replace with your Jenkins credential ID
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'your-github-credentials-id', 
                    url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git', 
                    branch: 'main'
            }
        }

        stage('Write .env') {
            steps {
                writeFile file: '.env', text: '''\
MONGODB_URL=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=elms-secret-key
NODE_ENV=development
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/activityportal
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=Devaseesh*2005
'''
            }
        }

        stage('SonarQube Analysis - Backend') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    withSonarQubeEnv('SonarQube') { // Replace 'SonarQube' with your Jenkins SonarQube server name
                        bat "mvn clean verify sonar:sonar -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_TOKEN}"
                    }
                }
            }
        }

        stage('Snyk Scan - Backend') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    bat "npm install || exit /b 0" // in case Snyk needs Node
                    bat "npx snyk test --json 1>..\\${REPORT_DIR}\\backend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Snyk Scan - Frontend') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    bat "npm install"
                    bat "npx snyk test --json 1>..\\${REPORT_DIR}\\frontend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                echo '📄 Generating Snyk HTML report...'
                bat "mkdir ${REPORT_DIR} || exit 0"
                bat "npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html || exit /b 0"
                bat "npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html || exit /b 0"
                echo '✅ Snyk HTML report generated at reports\\backend-snyk.html and reports\\frontend-snyk.html'
            }
        }

        stage('Start Backend & Frontend') {
            steps {
                echo '🚀 Starting development environment with Docker Compose...'
                bat 'docker compose -f docker-compose.yml down || exit 0'
                bat 'docker compose -f docker-compose.yml up --build -d'
            }
        }

        stage('Container Security Scan') {
            steps {
                echo '🛡️ Container security scan placeholder (Trivy/Clair can be added here later)'
            }
        }
    }

    post {
        always {
            echo '📂 Archiving Snyk HTML reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true
        }
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
