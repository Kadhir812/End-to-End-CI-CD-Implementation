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
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/todospring-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/todospring-frontend:${BUILD_NUMBER}"
        GIT_REPO_NAME = "End-to-End-CI-CD-Implementation"
        GIT_USER_NAME = "kadhir812"
        GIT_EMAIL = "kadhir555666@gmail.com"
        GIT_BRANCH = "master" // Fixed branch name
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout Code') {
            steps {
                git branch: "${GIT_BRANCH}", url: "https://github.com/${env.GIT_USER_NAME}/${env.GIT_REPO_NAME}.git"
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
                    sh '''
                    if ! docker ps | grep -q mongodb; then
                        docker run -d --name mongodb --network ci-cd-network -p 27017:27017 mongo:7.0
                    fi
                    '''
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
                dir(FRONTEND_DIR) {
                    script {
                        try {
                            sh 'npm ci'
                        } catch (Exception e) {
                            echo 'npm ci failed, falling back to npm install'
                            sh 'npm install'
                        }
                        sh 'npm run build'
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
        stage('Update Frontend Kubernetes Manifest') {
            environment {
                GIT_REPO_NAME = "End-to-End-CI-CD-Implementation"
                GIT_USER_NAME = "kadhir812"
            }
            steps {
                withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                    dir(K8S_MANIFEST_DIR) {
                        sh '''
                        git config user.email "${GIT_EMAIL}"
                        git config user.name "${GIT_USER_NAME}"
                        sed -i 's|replaceFrontendImage|'"${FRONTEND_IMAGE}"'|g' frontend-deployment.yaml
                        
                        git add frontend-deployment.yaml
                        git commit -m "Update frontend deployment image to version ${BUILD_NUMBER}"
                        git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:${GIT_BRANCH}
                        '''
                    }
                }
            }
        }
        stage('Update Backend Kubernetes Manifest') {
            environment {
                GIT_REPO_NAME = "End-to-End-CI-CD-Implementation"
                GIT_USER_NAME = "kadhir812"
            }
            steps {
                withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                    dir(K8S_MANIFEST_DIR) {
                        sh '''
                        git config user.email "${GIT_EMAIL}"
                        git config user.name "${GIT_USER_NAME}"
                        sed -i 's|replaceBackendImage|'"${BACKEND_IMAGE}"'|g' backend-deployment.yaml
                        git add backend-deployment.yaml
                        git commit -m "Update backend deployment image to version ${BUILD_NUMBER}"
                        git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:${GIT_BRANCH}
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
            echo 'Pipeline failed. Check the log for more details.'
        }
    }
}
