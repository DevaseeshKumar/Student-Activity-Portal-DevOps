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
                        echo '🔍 Running OWASP Dependency-Check...'
                        bat '''
                            mvn org.owasp:dependency-check-maven:check ^
                            -Dformat=ALL ^
                            -Ddependency-check.failOnError=false ^
                            -Ddependency-check.failBuildOnCVSS=11 ^
                            -Ddependency-check.autoUpdate=false || exit 0
                        '''
                        // Archive all reports
                        archiveArtifacts artifacts: 'target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Generate Visuals & PDF') {
            steps {
                dir('backend') {
                    script {
                        echo '📊 Generating charts & PDF report...'
                        
                        // Ensure Python script generates charts and PDF
                        bat '''
                            python ../scripts/dependency_visuals.py ^
                            target/dependency-check-report.json ^
                            reports/vulnerability_charts ^
                            reports/vulnerability_report.pdf
                        '''
                        
                        // Archive charts and PDF
                        archiveArtifacts artifacts: 'reports/vulnerability_charts/*.*', fingerprint: true, allowEmptyArchive: true
                        archiveArtifacts artifacts: 'reports/vulnerability_report.pdf', fingerprint: true, allowEmptyArchive: true
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
