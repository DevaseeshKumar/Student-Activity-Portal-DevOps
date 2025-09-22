pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR-TOKEN') // Replace with your Jenkins credential ID for SonarQube
        GIT_CREDENTIALS = 'github-token'  // Replace with your Jenkins Git credential ID
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DevaseeshKumar/Student-Activity-Portal-DevOps.git',
                    credentialsId: "${env.GIT_CREDENTIALS}"
            }
        }

        stage('Write .env') {
            steps {
                script {
                    writeFile file: '.env', text: "SONAR_TOKEN=${env.SONAR_TOKEN}"
                }
            }
        }

        stage('SonarQube Analysis - Backend') {
            steps {
                dir('backend') {
                    // Wrap with catchError to prevent pipeline from stopping
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        withSonarQubeEnv('MySonarQube') { // Replace 'MySonarQube' with your configured server name
                            bat 'mvn clean verify sonar:sonar'
                        }
                    }
                }
            }
        }

        stage('Snyk Scan - Backend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        bat 'snyk test --all-projects'
                    }
                }
            }
        }

        stage('Snyk Scan - Frontend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        bat 'snyk test --all-projects'
                    }
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'snyk-to-html -o snyk-report.html'
                }
            }
        }

        stage('Start Backend & Frontend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    parallel(
                        backend: { dir('backend') { bat 'mvn spring-boot:run' } },
                        frontend: { dir('frontend') { bat 'npm start' } }
                    )
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'docker scan myapp:latest'
                }
            }
        }
    }

    post {
        always {
            echo "📂 Archiving Snyk HTML reports..."
            archiveArtifacts artifacts: 'snyk-report.html', allowEmptyArchive: true
            cleanWs()
        }

        failure {
            echo "❌ Pipeline failed. Check Jenkins logs."
        }
    }
}
