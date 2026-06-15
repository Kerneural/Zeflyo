# 🎯 PLAN.md — Zeflyo 2-Week Tốc Chiến Roadmap
> *Last updated: 2026-06-15 | Duration: 14 Days (Local Dev -> Staging -> Production)*

---

## 👥 Team Roles & Risks Management

- **Bạn (PM & DevOps/Cloud)**: 100% DevOps pipeline, Docker-compose local, Ngrok tunnels, Terraform AWS setup, GitHub Actions CI/CD (lint, test, Trivy scan, deploy), and Git-gatekeeping.
- **Thành viên 2 (Dev Cứng - Fullstack & Security Lead/Pentest/SOC)**: Core Live Chat Hub backend & Next.js frontend UI, OpenAI ChatGPT integrations, secure coding, OWASP API pentesting, and CloudWatch security audit logging.
- **Thành viên 3 (Fullstack Developer)**: Standalone features: **Post Scheduler** (CRUD + console schedule publisher) and **Auto-reply configuration settings panel**.
  - *Integration Strategy*: Feature code is isolated in separate folders/routes, kept independent from the core webhook and broadcasting pipelines. All PRs require double approval from PM and Security Lead.

---

## 📅 IMPLEMENTATION STATUS & ROADMAP

### Phase 1: Setup & Core Auth (Day 1 - 3)
- [x] Write project plan [plan.md](file:///r:/_Projects/Eurus_Workspace/Zeflyo/docs/plan.md) and [implementation_plan.md](file:///C:/Users/ACER/.gemini/antigravity-ide/brain/0db0bc85-e913-4c3e-af7a-005ff44c8899/implementation_plan.md).
- [ ] DevOps: Setup local `docker-compose.yml` (Laravel, Nginx, MySQL, Redis, Soketi) & local setup instructions.
- [ ] DevOps: Set up VPC and initial RDS/ECS placeholders using Terraform.
- [ ] Backend: Initialize Laravel 11. Implement Facebook Socialite Login OAuth & Fanpage Connection.
- [ ] Frontend: Initialize Next.js. Design basic layout, login UI, and Page Connection UI.

### Phase 2: Webhooks & Queue Processing (Day 4 - 6)
- [ ] DevOps: Setup Ngrok/Tunnel for local Webhook callback testing.
- [ ] Backend: Webhook verification endpoint and API payload ingestion.
- [ ] Backend: Setup Laravel Horizon & Redis queues to parse incoming Facebook comments/messages asynchronously.

### Phase 3: Live Chat UI & Real-Time Sync (Day 7 - 9)
- [ ] DevOps: Setup Pusher client connections / broadcast credentials.
- [ ] Backend: Implement Laravel Broadcasting events to trigger real-time messages. API load chat history.
- [ ] Frontend: Live Chat Hub UI (Next.js) displaying dynamic inbox and active conversation bubbles. Laravel Echo WebSockets integration.

### Phase 4: Automation & AI Engine (Day 10 - 11)
- [ ] Backend: Build keyword-based auto-reply rules engine.
- [ ] Backend: Integrate OpenAI ChatGPT API for intelligent automated responses.
- [ ] Fullstack (Thành viên 3): Build Post Scheduler feature (Form UI + DB schema `scheduled_posts` + `php artisan posts:publish` task run every minute via Laravel scheduler).
- [ ] Security (Thành viên 2): Security review, DB field encryption for tokens, and API pentesting on local.

### Phase 5: CI/CD AWS Deploy & Monitoring (Day 12 - 14)
- [ ] DevOps: Complete Terraform scripts. Set up GitHub Actions CI/CD (Pest test, Larastan, Trivy scan, ECR upload, ECS rolling update deploy).
- [ ] DevOps: Deploy Next.js to S3 + CloudFront CDN.
- [ ] DevOps/Security: Setup CloudWatch log groups, alerting metric filters, and Dashboard.
- [ ] Team: Final QA, demo run, bug fixes, freeze code, and release project.