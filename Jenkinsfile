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
                    echo '🔍 Running OWASP Dependency-Check (build will not fail on errors)...'
                    bat '''
                        mvn org.owasp:dependency-check-maven:check ^
                        -Dformat=ALL ^
                        -Ddependency-check.failOnError=false ^
                        -Ddependency-check.failBuildOnCVSS=11 ^
                        -Ddependency-check.autoUpdate=false || exit 0
                    '''
                    
                    // Archive all report formats
                    archiveArtifacts artifacts: 'target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Publish Dependency-Check Report & Graphs') {
            steps {
                script {
                    echo '📊 Publishing HTML report and trend graphs...'

                    // Publish HTML report
                    publishHTML([allowMissing: true,
                                 alwaysLinkToLastBuild: true,
                                 keepAll: true,
                                 reportDir: 'target',
                                 reportFiles: 'dependency-check-report.html',
                                 reportName: 'OWASP Dependency-Check Report'])

                    // Generate trend graph using CSV
                    plot csvFileName: 'target/dependency-check-report.csv',
                         group: 'Dependency-Check',
                         title: 'Critical Vulnerabilities Trend',
                         style: 'line'
                }
            }
        }

        stage('Test') {
            steps {
                echo "🧪 Running tests..."
                bat 'mvn test'
                
                // Publish JUnit reports
                junit '**/target/surefire-reports/*.xml'
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                echo '🐳 Starting services via Docker Compose...'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs for details.'
        }
        cleanup {
            cleanWs()
        }
    }
}
