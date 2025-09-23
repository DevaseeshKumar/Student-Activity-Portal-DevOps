pipeline {
    agent any

    environment {
        REPORT_DIR = 'target/dependency-check-report'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                git branch: 'main', url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git'
            }
        }

        stage('Build Maven Package') {
            steps {
                echo 'Building Maven package...'
                bat 'mvn clean package -DskipTests'
            }
        }

        stage('Dependency Vulnerability Scan') {
            steps {
                echo 'Running OWASP Dependency-Check...'
                bat """
                    mvn org.owasp:dependency-check-maven:check ^
                    -Dformat=XML ^
                    -DoutputDirectory=${REPORT_DIR} ^
                    -Ddependency-check.failOnError=false ^
                    -Ddependency-check.failBuildOnCVSS=11 ^
                    -Ddependency-check.autoUpdate=false
                """
            }
        }

        stage('Publish Dependency-Check Report') {
            steps {
                echo 'Publishing Dependency-Check results in Jenkins...'
                dependencyCheckPublisher pattern: "${REPORT_DIR}/dependency-check-report.xml"
            }
        }

        stage('Generate Vulnerability Chart') {
            steps {
                script {
                    echo 'Parsing Dependency-Check XML for chart...'
                    def xmlContent = readFile("${REPORT_DIR}/dependency-check-report.xml")

                    // Count vulnerabilities by severity
                    def critical = (xmlContent =~ /<severity>Critical<\/severity>/).size()
                    def high     = (xmlContent =~ /<severity>High<\/severity>/).size()
                    def medium   = (xmlContent =~ /<severity>Medium<\/severity>/).size()
                    def low      = (xmlContent =~ /<severity>Low<\/severity>/).size()

                    // Write CSV for Jenkins Plot plugin
                    writeFile file: 'vuln-data.csv', text: """
Severity,Count
Critical,${critical}
High,${high}
Medium,${medium}
Low,${low}
""".trim()
                }

                // Generate bar chart in Jenkins
                plot csvFileName: 'vuln-data.csv',
                     title: 'Dependency Vulnerabilities by Severity',
                     style: 'bar',
                     yaxis: 'Count',
                     group: 'Dependency Vulnerabilities'
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                echo 'Starting services via Docker Compose...'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs!'
        }
        cleanup {
            cleanWs()
        }
    }
}
