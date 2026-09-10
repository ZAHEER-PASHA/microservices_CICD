terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = "test"
  secret_key = "test"

  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true

  endpoints {
    ecr = "http://localhost:4566"
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "microservices-frontend"
}

resource "aws_ecr_repository" "user" {
  name = "microservices-user"
}

resource "aws_ecr_repository" "product" {
  name = "microservices-product"
}

resource "aws_ecr_repository" "order" {
  name = "microservices-order"
}