pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git'
            }
        }

        stage('Build Maven Package') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Dependency Vulnerability Scan') {
            steps {
                dir('backend') {
                    script {
                        echo '🔍 Running OWASP Dependency-Check (offline mode)...'
                        bat '''
                            mvn org.owasp:dependency-check-maven:check ^
                            -Dformat=HTML,CSV,JSON ^
                            -Ddependency-check.failOnError=false ^
                            -Ddependency-check.failBuildOnCVSS=11 ^
                            -Ddependency-check.autoUpdate=false ^
                            -Ddependency-check.offline=true || exit 0
                        '''
                        // Archive the reports
                        archiveArtifacts artifacts: 'target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
                    }
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
                    echo '🚀 Starting services via Docker Compose...'
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
