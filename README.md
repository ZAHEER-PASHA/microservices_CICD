create repositories in floci using

aws --endpoint-url http://localhost:4566 --region us-east-1 ecr create-repository --repository-name microservices-frontend

aws --endpoint-url http://localhost:4566 --region us-east-1 ecr create-repository --repository-name microservices-user

aws --endpoint-url http://localhost:4566 --region us-east-1 ecr create-repository --repository-name microservices-product

aws --endpoint-url http://localhost:4566 --region us-east-1 ecr create-repository --repository-name microservices-order


make sure all the repositories availabe

aws --endpoint-url http://localhost:4566 --region us-east-1 ecr describe-repositories

create floci-ecr-registry by 

docker run -d `
  --name floci-ecr-registry `
  -p 5100:5000 `
  registry:2

  Now the registry data survives if you remove/recreate the container:

  docker run -d `
  --name floci-ecr-registry `
  -p 5100:5000 `
  -v floci-ecr-data:/var/lib/registry `
  registry:2


to stop containers
docker compose -f deploy\docker-compose.prod.yml down