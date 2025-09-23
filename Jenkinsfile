pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/DevaseeshKumar/StudentActivityPortal_TermPaper.git'
            }
        }

        stage('Build Maven Package') {
            steps {
                bat 'mvn clean package -DskipTests'
            }
        }

        stage('Dependency Vulnerability Scan') {
            steps {
                script {
                    echo 'Running OWASP Dependency-Check (build will not fail on errors)...'
                    bat '''
                        mvn org.owasp:dependency-check-maven:check ^
                        -Dformat=ALL ^
                        -Ddependency-check.failOnError=false ^
                        -Ddependency-check.failBuildOnCVSS=11 ^
                        -Ddependency-check.autoUpdate=false || exit 0
                    '''
                    archiveArtifacts artifacts: 'target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Test') {
            steps {
                echo "Running tests (placeholder)"
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    echo 'Starting services via Docker Compose...'
                    bat 'docker-compose up -d --build'
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
