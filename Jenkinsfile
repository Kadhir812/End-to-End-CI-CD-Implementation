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
        SONAR_URL = "http://10.0.1.190:9000"
        DOCKER_REGISTRY = "kadhir812"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/todospring-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/todospring-frontend:${BUILD_NUMBER}"
        GIT_REPO_NAME = "End-to-End-CI-CD-Implementation"
        GIT_USER_NAME = "kadhir812"
        GIT_EMAIL = "kadhir555666@gmail.com"
        GIT_BRANCH = "master"
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
                sh 'chmod -R 755 ${WORKSPACE}'
            }
        }
        stage('Build and Test Backend') {
            steps {
                node {
                    dir(BACKEND_DIR) {
                        sh 'mvn clean package'
                        sh 'mvn test'
                    }
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
                    node {
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
        }
        stage('Build and Push Backend Docker Image') {
            steps {
                node {
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
        }
        stage('Build and Test Frontend') {
            steps {
                script {
                    docker.image('node:20').inside {
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
                node {
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
        }
        stage('Update Frontend Kubernetes Manifest') {
            steps {
                withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                    node {
                        dir(K8S_MANIFEST_DIR) {
                            sh '''
                            git config user.email "${GIT_EMAIL}"
                            git config user.name "${GIT_USER_NAME}"
                            git reset --hard HEAD
                            git clean -fd

                            if grep -q 'replaceFrontendImage' frontend-deployment.yaml; then
                                sed -i 's|replaceFrontendImage|'"${FRONTEND_IMAGE}"'|g' frontend-deployment.yaml
                            else
                                sed -i 's|image: .*todospring-frontend:.*|image: '"${FRONTEND_IMAGE}"'|g' frontend-deployment.yaml
                            fi

                            git add frontend-deployment.yaml
                            git commit -m "Update frontend deployment image to version ${BUILD_NUMBER}" || true
                            git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:${GIT_BRANCH}
                            '''
                        }
                    }
                }
            }
        }
        stage('Update Backend Kubernetes Manifest') {
            steps {
                withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                    node {
                        dir(K8S_MANIFEST_DIR) {
                            sh '''
                            git config user.email "${GIT_EMAIL}"
                            git config user.name "${GIT_USER_NAME}"
                            git reset --hard HEAD
                            git clean -fd

                            if grep -q 'replaceBackendImage' backend-deployment.yaml; then
                                sed -i 's|replaceBackendImage|'"${BACKEND_IMAGE}"'|g' backend-deployment.yaml
                            else
                                sed -i 's|image: .*todospring-backend:.*|image: '"${BACKEND_IMAGE}"'|g' backend-deployment.yaml
                            fi

                            git add backend-deployment.yaml
                            git commit -m "Update backend deployment image to version ${BUILD_NUMBER}" || true
                            git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:${GIT_BRANCH}
                            '''
                        }
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
