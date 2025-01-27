pipeline {
    agent {
        docker {
            image 'kadhir812/maven-abhishek-docker-agent:v2'
            args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    environment {
        FRONTEND_DIR = "frontend"
        BACKEND_DIR = "backend"
        K8S_MANIFEST_DIR = "k8s-manifests"
        SONAR_URL = "http://192.168.0.55:9000"
        DOCKER_REGISTRY = "kadhir812"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/frontend:${BUILD_NUMBER}"
        GIT_REPO_NAME = "End-to-End-CI-CD-Implementation"
        GIT_USER_NAME = "kadhir812"
        GIT_EMAIL = "kadhir555666@gmail.com"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'master', url: 'https://github.com/Kadhir812/End-to-End-CI-CD-Implementation.git'
            }
        }
        stage('Set Workspace Permissions') {
            steps {
                script {
                    sh 'chmod -R 755 ${WORKSPACE}'
                }
            }
        }
        stage('Start MongoDB in Minikube') {
            steps {
                script {
                    sh 'eval $(minikube docker-env)'
                    sh 'docker run -d --name mongodb --network ci-cd-network -p 27017:27017 mongo:7.0'
                }
            }
        }
        stage('Build and Test Backend') {
            steps {
                dir(BACKEND_DIR) {
                    sh 'mvn clean package'
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
                        sh '''
                        mvn sonar:sonar \
                            -Dsonar.login=${SONAR_AUTH_TOKEN} \
                            -Dsonar.host.url=${SONAR_URL}
                        '''
                    }
                }
            }
        }
        stage('Build and Push Backend Docker Image') {
            steps {
                dir(BACKEND_DIR) {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                        docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
                        docker build -t ${BACKEND_IMAGE} .
                        docker push ${BACKEND_IMAGE}
                        '''
                    }
                }
            }
        }
        stage('Build and Test Frontend') {
            steps {
                script {
                    docker.image('node:16').inside {
                        dir(FRONTEND_DIR) {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        stage('Build and Push Frontend Docker Image') {
            steps {
                dir(FRONTEND_DIR) {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                        docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
                        docker build -t ${FRONTEND_IMAGE} .
                        docker push ${FRONTEND_IMAGE}
                        '''
                    }
                }
            }
        }
        stage('Update and Commit Kubernetes Manifests') {
    steps {
        withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
            dir(K8S_MANIFEST_DIR) {
                script {
                    sh '''
                    # Ensure sensitive commands are not logged
                    set +x

                    # Configure Git
                    git config --global user.email "${GIT_EMAIL}"
                    git config --global user.name "${GIT_USER_NAME}"

                    # Update Kubernetes manifests with build number
                    sed -i "s|REPLACE_BACKEND_IMAGE|${BACKEND_IMAGE}:${BUILD_NUMBER}|g" backend-deployment.yaml
                    sed -i "s|REPLACE_FRONTEND_IMAGE|${FRONTEND_IMAGE}:${BUILD_NUMBER}|g" frontend-deployment.yaml

                    # Commit and push the changes
                    git add backend-deployment.yaml frontend-deployment.yaml
                    git commit -m "Update deployment images to backend: ${BACKEND_IMAGE}:${BUILD_NUMBER}, frontend: ${FRONTEND_IMAGE}:${BUILD_NUMBER} [Build: ${BUILD_NUMBER}]"

                    # Push securely to GitHub
                    git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:master

                    # Restore shell logging
                    set -x
                    '''
                }
            }
        }
    }
}
    post {
        always {
            echo 'Cleaning workspace...'
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
