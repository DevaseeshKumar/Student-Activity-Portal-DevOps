pipeline {
    agent any
    environment {
        DEP_CHECK_DIR = "backend/target/dependency-check-data"
        SONARQUBE_SERVER = 'MySonarQube' // Name of your SonarQube server in Jenkins
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

        // stage('Dependency Vulnerability Scan') {
        //     steps {
        //         dir('backend') {
        //             echo "🔍 Running OWASP Dependency-Check in offline mode..."
        //             script {
        //                 try {
        //                     bat """
        //                     mvn org.owasp:dependency-check-maven:check ^
        //                     -DdataDirectory=%DEP_CHECK_DIR% ^
        //                     -Dformat=HTML,CSV,JSON ^
        //                     -DautoUpdate=false ^
        //                     -Doffline=true ^
        //                     -DfailOnError=false ^
        //                     -DfailBuildOnCVSS=11
        //                     """
        //                 } catch (err) {
        //                     echo "⚠️ Dependency-Check failed, continuing pipeline..."
        //                 }
        //             }

        //             // Attempt PDF conversion only if HTML exists
        //             bat """
        //             if exist target\\dependency-check-report.html (
        //                 wkhtmltopdf target\\dependency-check-report.html target\\dependency-check-report.pdf
        //             ) else (
        //                 echo "⚠️ HTML report not found, skipping PDF conversion."
        //             )
        //             """
        //         }
        //     }
        // }

        stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('MySonarQube') {
            script {
                def scannerHome = tool 'SonarScanner'
                dir('backend') {
                    bat """
                    "${scannerHome}\\bin\\sonar-scanner.bat" ^
                    -Dsonar.projectKey=StudentActivityPortal ^
                    -Dsonar.sources=src ^
                    -Dsonar.java.binaries=target ^
                    -Dsonar.login=%SONAR_AUTH_TOKEN%
                    """
                }
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
