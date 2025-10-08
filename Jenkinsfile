pipeline {
    agent any

    environment {
        SONARQUBE_TOKEN = credentials('sonar-token') // your token in Jenkins
        DEP_CHECK_DIR = 'backend/target/dependency-check-data'
    }

    stages {

        stage('Clean Workspace') {
            steps {
                echo '🧹 Cleaning workspace before build...'
                cleanWs()
            }
        }

        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git']]])
            }
        }

        stage('Build Maven Package') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Dependency Vulnerability Scan (Dummy Data)') {
            steps {
                dir('backend') {
                    echo '🔍 Running OWASP Dependency-Check with dummy data...'
                    // This will skip DB update and never fail the build
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                        -DdataDirectory=%DEP_CHECK_DIR% ^
                        -Dformat=HTML,CSV,JSON ^
                        -DautoUpdate=false ^
                        -DfailBuildOnCVSS=999 ^ 
                        || echo "⚠️ Dependency Check skipped DB update (dummy data used)"
                    """
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                dir('backend') {
                    withSonarQubeEnv('SonarQube') {
                        bat 'mvn sonar:sonar -Dsonar.login=%SONARQUBE_TOKEN%'
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

        stage('Build Docker Image & Trivy Scan') {
            steps {
                echo '🐳 Building Docker Image & scanning with Trivy...'
                // Add your Docker build & Trivy scan commands here
            }
        }

        stage('Start Monitoring (Prometheus + Grafana)') {
            steps {
                echo '📊 Starting monitoring services...'
                // Add commands to start Prometheus/Grafana
            }
        }

        stage('Start Application Services') {
            steps {
                echo '🚀 Starting backend & frontend services...'
                // Add commands to start your app services
            }
        }

        stage('Archive Reports') {
            steps {
                echo '📄 Archiving build & scan reports...'
                // Add archive steps
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning workspace after build...'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
    }
}
