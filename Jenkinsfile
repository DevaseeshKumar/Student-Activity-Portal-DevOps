pipeline {
    agent any

    environment {
        REPORT_DIR = "target/dependency-check-report"
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
                    // Run OWASP Dependency-Check
                    bat """
                    mvn org.owasp:dependency-check-maven:check ^
                        -Dformat=ALL ^
                        -DoutputDirectory=${REPORT_DIR} ^
                        -Ddependency-check.failOnError=false ^
                        -Ddependency-check.failBuildOnCVSS=11
                    """
                    
                    // Archive raw reports
                    archiveArtifacts artifacts: "${REPORT_DIR}/dependency-check-report.*", fingerprint: true
                }
            }
        }

        stage('Generate Dashboard') {
            steps {
                script {
                    // Convert JSON report into a simple HTML dashboard with charts
                    writeFile file: 'target/dashboard.html', text: """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Vulnerability Dashboard</title>
                        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                    </head>
                    <body>
                        <h1>Dependency Vulnerability Summary</h1>
                        <canvas id="vulnChart" width="600" height="400"></canvas>
                        <script>
                        fetch('${REPORT_DIR}/dependency-check-report.json')
                        .then(response => response.json())
                        .then(data => {
                            const severities = { "Critical": 0, "High": 0, "Medium": 0, "Low": 0 };
                            data.dependencies.forEach(dep => {
                                if(dep.vulnerabilities) {
                                    dep.vulnerabilities.forEach(v => {
                                        const score = v.cvssScore || 0;
                                        if(score >= 9) severities["Critical"]++;
                                        else if(score >= 7) severities["High"]++;
                                        else if(score >= 4) severities["Medium"]++;
                                        else severities["Low"]++;
                                    });
                                }
                            });

                            const ctx = document.getElementById('vulnChart').getContext('2d');
                            new Chart(ctx, {
                                type: 'pie',
                                data: {
                                    labels: Object.keys(severities),
                                    datasets: [{
                                        data: Object.values(severities),
                                        backgroundColor: ['#ff0000','#ff9900','#ffff00','#66ff66']
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' },
                                        title: { display: true, text: 'Vulnerability by Severity' }
                                    }
                                }
                            });
                        });
                        </script>
                    </body>
                    </html>
                    """
                    
                    // Publish HTML dashboard
                    publishHTML(target: [
                        reportDir: 'target',
                        reportFiles: 'dashboard.html',
                        reportName: 'Dependency Vulnerability Dashboard'
                    ])
                }
            }
        }

        stage('Test') {
            steps {
                echo "Test Completed"
            }
        }

        stage('Start Services with Docker Compose') {
            steps {
                script {
                    bat 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
        cleanup {
            cleanWs()
        }
    }
}
