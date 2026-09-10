pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = 'localhost:5100'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Docker & AWS') {
            steps {
                bat 'docker --version'
                bat 'docker ps'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'floci-aws',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat 'aws --version'
                    bat 'aws --endpoint-url http://localhost:4566 --region %AWS_REGION% sts get-caller-identity'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                bat 'docker build -t microservices-frontend:%IMAGE_TAG% ./frontend'
            }
        }

        stage('Build User Service') {
            steps {
                bat 'docker build -t microservices-user:%IMAGE_TAG% ./user-service'
            }
        }

        stage('Build Product Service') {
            steps {
                bat 'docker build -t microservices-product:%IMAGE_TAG% ./product-service'
            }
        }

        stage('Build Order Service') {
            steps {
                bat 'docker build -t microservices-order:%IMAGE_TAG% ./order-service'
            }
        }

        stage('Login to Floci ECR') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'floci-aws',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat '''
                        aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr get-login-password | docker login --username AWS --password-stdin %ECR_REGISTRY%
                    '''
                }
            }
        }
        stage('Create ECR Repositories') {
    steps {
        withCredentials([
            usernamePassword(
                credentialsId: 'floci-aws',
                usernameVariable: 'AWS_ACCESS_KEY_ID',
                passwordVariable: 'AWS_SECRET_ACCESS_KEY'
            )
        ]) {
            bat '''
                echo Creating Floci ECR repositories if they do not exist...

                aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr describe-repositories --repository-names microservices-frontend >nul 2>&1 || aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr create-repository --repository-name microservices-frontend

                aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr describe-repositories --repository-names microservices-user >nul 2>&1 || aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr create-repository --repository-name microservices-user

                aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr describe-repositories --repository-names microservices-product >nul 2>&1 || aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr create-repository --repository-name microservices-product

                aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr describe-repositories --repository-names microservices-order >nul 2>&1 || aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr create-repository --repository-name microservices-order

                echo ECR repository check completed.
            '''
        }
    }
}

        stage('Push Images to Floci ECR') {
            steps {
                bat 'docker tag microservices-frontend:%IMAGE_TAG% %ECR_REGISTRY%/microservices-frontend:%IMAGE_TAG%'
                bat 'docker tag microservices-user:%IMAGE_TAG% %ECR_REGISTRY%/microservices-user:%IMAGE_TAG%'
                bat 'docker tag microservices-product:%IMAGE_TAG% %ECR_REGISTRY%/microservices-product:%IMAGE_TAG%'
                bat 'docker tag microservices-order:%IMAGE_TAG% %ECR_REGISTRY%/microservices-order:%IMAGE_TAG%'

                bat 'docker push %ECR_REGISTRY%/microservices-frontend:%IMAGE_TAG%'
                bat 'docker push %ECR_REGISTRY%/microservices-user:%IMAGE_TAG%'
                bat 'docker push %ECR_REGISTRY%/microservices-product:%IMAGE_TAG%'
                bat 'docker push %ECR_REGISTRY%/microservices-order:%IMAGE_TAG%'
            }
        }

        stage('Deploy') {
    steps {
        withCredentials([
            usernamePassword(
                credentialsId: 'floci-aws',
                usernameVariable: 'AWS_ACCESS_KEY_ID',
                passwordVariable: 'AWS_SECRET_ACCESS_KEY'
            )
        ]) {
            bat '''
                echo Deploying version %IMAGE_TAG%

                aws --endpoint-url http://localhost:4566 --region %AWS_REGION% ecr get-login-password | docker login --username AWS --password-stdin %ECR_REGISTRY%

                docker compose -f deploy\\docker-compose.prod.yml pull

                docker compose -f deploy\\docker-compose.prod.yml up -d --remove-orphans
            '''
        }
    }
}

        stage('Health Check') {
            steps {
                bat '''
                    echo Checking Frontend...
                    curl.exe -f http://localhost:8090

                    echo Checking User Service...
                    curl.exe -f http://localhost:5001

                    echo Checking Product Service...
                    curl.exe -f http://localhost:5002/health

                    echo Checking Order Service...
                    curl.exe -f http://localhost:5003/health

                    echo Checking Order Database...
                    curl.exe -f http://localhost:5003/health/db

                    echo Checking Docker containers...
                    docker compose -f deploy\\docker-compose.prod.yml ps
                '''
            }
        }
    }
}