pipeline {
    agent any

    tools {
        maven 'Maven_3.9.9' // Replace with your Jenkins Maven installation name
    }

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
                    echo '🔍 Running OWASP Dependency-Check locally...'
                    bat '''
                        mvn org.owasp:dependency-check-maven:check ^
                        -Dformat=ALL ^
                        -Ddependency-check.failOnError=false ^
                        -Ddependency-check.autoUpdate=true || exit 0
                    '''

                    // Archive all generated reports
                    archiveArtifacts artifacts: 'target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Publish Dependency-Check Reports & Graphs') {
            steps {
                script {
                    echo '📊 Publishing HTML report and severity trend graphs...'

                    // Publish HTML report
                    publishHTML([allowMissing: true,
                                 alwaysLinkToLastBuild: true,
                                 keepAll: true,
                                 reportDir: 'target',
                                 reportFiles: 'dependency-check-report.html',
                                 reportName: 'OWASP Dependency-Check Report'])

                    // Generate graphs for Critical, High, Medium, Low severities using Plot Plugin
                    plot csvFileName: 'target/dependency-check-report.csv',
                         group: 'Dependency-Check',
                         title: 'Critical Vulnerabilities Trend',
                         style: 'line'

                    plot csvFileName: 'target/dependency-check-report.csv',
                         group: 'Dependency-Check',
                         title: 'High Vulnerabilities Trend',
                         style: 'line'

                    plot csvFileName: 'target/dependency-check-report.csv',
                         group: 'Dependency-Check',
                         title: 'Medium Vulnerabilities Trend',
                         style: 'line'

                    plot csvFileName: 'target/dependency-check-report.csv',
                         group: 'Dependency-Check',
                         title: 'Low Vulnerabilities Trend',
                         style: 'line'
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo "🧪 Running Maven tests..."
                bat 'mvn test'
                junit '**/target/surefire-reports/*.xml'
            }
        }

        stage('Start Docker Services') {
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
