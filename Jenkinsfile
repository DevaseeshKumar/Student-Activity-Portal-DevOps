pipeline {
    agent any
    environment {
        DEP_CHECK_DIR = "backend/target/dependency-check-data"
        SONARQUBE_SERVER = "SonarQube"       // Jenkins SonarQube server name
        SONAR_PROJECT_KEY = "StudentActivityPortal"
        SONAR_PROJECT_NAME = "StudentActivityPortal"
        SONAR_PROJECT_VERSION = "1.0"
    }
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Build Maven Package') {
            steps {
                dir('backend') {
                    bat "mvn clean package -DskipTests"
                }
            }
        }

        stage('Dependency Vulnerability Scan') {
            steps {
                dir('backend') {
                    echo "🔍 Running OWASP Dependency-Check in offline mode..."
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^ 
                    -DdataDirectory=%DEP_CHECK_DIR% ^ 
                    -Dformat=HTML,CSV,JSON ^ 
                    -DautoUpdate=false ^ 
                    -Doffline=true ^ 
                    -DfailOnError=false ^ 
                    -DfailBuildOnCVSS=11 ^ 
                    || echo "⚠️ Dependency-Check offline run, report may be incomplete"
                    """
                    bat """
                    if exist target\\dependency-check-report.html (
                        wkhtmltopdf target\\dependency-check-report.html target\\dependency-check-report.pdf
                    ) else (
                        echo "⚠️ HTML report not found, skipping PDF conversion."
                    )
                    """
                }
            }
        }

        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'SonarScanner' // Make sure SonarScanner is installed in Jenkins
            }
            steps {
                dir('backend') {
                    withSonarQubeEnv(SONARQUBE_SERVER) {
                        bat """
                        mvn sonar:sonar ^
                        -Dsonar.projectKey=%SONAR_PROJECT_KEY% ^
                        -Dsonar.projectName=%SONAR_PROJECT_NAME% ^
                        -Dsonar.projectVersion=%SONAR_PROJECT_VERSION% ^
                        -Dsonar.sources=src/main/java ^
                        -Dsonar.java.binaries=target/classes
                        """
                    }
                }
            }
        }

        stage('Archive OWASP Reports') {
            steps {
                archiveArtifacts artifacts: 'backend/target/dependency-check-report.*', fingerprint: true, allowEmptyArchive: true
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                echo "🚀 Starting services via Docker Compose..."
                bat "docker-compose up -d --build"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline executed successfully!"
        }
        always {
            cleanWs()
        }
    }
}
