pipeline {
    agent {
        docker {
            image 'abhishekf5/maven-abhishek-docker-agent:v1'
            args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    environment {
        FRONTEND_DIR = "frontend"
        BACKEND_DIR = "backend"
        K8S_MANIFEST_DIR = "k8s-manifests"
        SONAR_URL = "http://localhost:9000"
        DOCKER_REGISTRY = "kadhir812"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/frontend:${BUILD_NUMBER}"
        ARGOCD_SERVER = "http://argocd-server:8080"  // ArgoCD Server URL
        ARGOCD_APP_NAME = "my-app"  // ArgoCD Application name
        ARGOCD_USER = "admin"  // ArgoCD user (default: admin)
        ARGOCD_PASSWORD = "argocd-server-password"  // ArgoCD password
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/three-tier-app.git'
            }
        }
        stage('Start MongoDB in Minikube') {
            steps {
                script {
                    // Set the Docker environment to Minikube
                    sh 'eval $(minikube docker-env)'
                    
                    // Run MongoDB container in Minikube
                    sh 'docker run -d --name mongodb --network host -p 27017:27017 mongo:5.0'
                }
            }
        }
        stage('Build and Test Backend') {
            steps {
                dir(BACKEND_DIR) {
                    // Clean and build the Spring Boot Maven project
                    sh 'mvn clean package'
                    // Run unit tests and generate reports
                    sh 'mvn test'
                }
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        stage('Static Code Analysis (Backend)') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                    dir(BACKEND_DIR) {
                        sh """
                        mvn sonar:sonar \
                            -Dsonar.login=${SONAR_AUTH_TOKEN} \
                            -Dsonar.host.url=${SONAR_URL}
                        """
                    }
                }
            }
        }
        stage('Build and Push Backend Docker Image') {
            steps {
                dir(BACKEND_DIR) {
                    sh """
                    docker build -t ${BACKEND_IMAGE} .
                    docker push ${BACKEND_IMAGE}
                    """
                }
            }
        }
        stage('Build and Test Frontend') {
            steps {
                dir(FRONTEND_DIR) {
                    // Install dependencies and build the Vite app
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        stage('Build and Push Frontend Docker Image') {
            steps {
                dir(FRONTEND_DIR) {
                    sh """
                    docker build -t ${FRONTEND_IMAGE} .
                    docker push ${FRONTEND_IMAGE}
                    """
                }
            }
        }
        stage('Update Kubernetes Manifests') {
            steps {
                dir(K8S_MANIFEST_DIR) {
                    // Replace image tags dynamically in the Kubernetes manifests
                    sh """
                    sed -i "s|REPLACE_BACKEND_IMAGE|${BACKEND_IMAGE}|g" backend-deployment.yaml
                    sed -i "s|REPLACE_FRONTEND_IMAGE|${FRONTEND_IMAGE}|g" frontend-deployment.yaml
                    """
                }
            }
        }
        stage('Sync with ArgoCD to Deploy') {
            steps {
                script {
                    // Login to ArgoCD
                    sh """
                    argocd login ${ARGOCD_SERVER} --username ${ARGOCD_USER} --password ${ARGOCD_PASSWORD} --insecure
                    """

                    // Sync the ArgoCD application to apply changes
                    sh """
                    argocd app sync ${ARGOCD_APP_NAME}
                    """

                    // Optionally, wait for the deployment to finish
                    sh """
                    argocd app wait ${ARGOCD_APP_NAME} --sync
                    """
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for more details.'
        }
    }
}
