---
name: github_actions_ci
description: Cấu hình và vận hành hệ thống CI/CD chạy kiểm thử và tự động deploy ứng dụng Laravel lên AWS ECS Fargate.
---

# GitHub Actions CI/CD Skill

Quy trình tự động hóa kiểm định và triển khai dự án Zeflyo sử dụng GitHub Actions, giúp bạn tự động hóa việc kiểm tra chất lượng code và deploy an toàn lên AWS.

---

## 1. Cấu hình CI/CD Pipeline (`.github/workflows/deploy.yml`)

```yaml
name: CI/CD Production

on:
  push:
    branches: [main]

jobs:
  test:
    name: Run Pest Tests & Static Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, xml, ctype, iconv, pdo, sqlite, pdo_sqlite
          coverage: none

      - name: Install PHP Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader

      - name: Run Pest (Unit/Feature Tests)
        run: php artisan test

      - name: Run Larastan (Static Analysis)
        run: ./vendor/bin/phpstan analyse --memory-limit=2G

  security_scan:
    name: Docker Image & Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          format: 'table'
          severity: 'HIGH,CRITICAL'

  deploy:
    name: Build & Push to ECR, Deploy to ECS
    runs-on: ubuntu-latest
    needs: security_scan
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: zeflyo-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push -a $ECR_REGISTRY/$ECR_REPOSITORY

      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: task-definition.json
          service: zeflyo-service
          cluster: zeflyo-cluster
          wait-for-service-stability: true
```

## 2. Quy tắc vận hành và Bảo mật

*   **Quản lý Secret an toàn**: Tuyệt đối không hardcode AWS Keys trong mã nguồn. Cấu hình các key này trong phần `Settings -> Secrets and variables -> Actions` của repository GitHub.
*   **Deploy không gián đoạn (Rolling Update)**: ECS Fargate tự động chạy container mới song song và kiểm tra sức khỏe (Health Check) thành công trước khi tắt container cũ.
*   **Security Gates**: Bước `Trivy Scan` có nhiệm vụ chặn hoàn toàn việc deploy nếu phát hiện thư viện hoặc Docker base image có lỗ hổng bảo mật cấp độ `HIGH` hoặc `CRITICAL`.
