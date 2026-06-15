# 🛑 Anti-Rationalization Guardrails for Antigravity Agent (Zeflyo)
> *Adapted from Addy Osmani's `agent-skills` repository to enforce production-grade discipline.*

AI coding agents often fail not due to coding ability, but due to **cognitive shortcutting (rationalization)**—skipping critical planning, testing, security auditing, or API specification steps. 

This document lists the common excuses you (the Agent) might make during this 2-week Zeflyo sprint, and the strict realities/quality gates you must follow instead.

---

## 🛡️ DevOps & Cloud Rationalizations

| Rationalization (The Agent's Excuse) | Reality (The Corrective Engineering Standard) |
| :--- | :--- |
| *"I will create the AWS resource (e.g., RDS database, S3 bucket) via the AWS Web Console first to save time, and write the Terraform code later."* | **Strictly Forbidden.** This creates "infrastructure drift". Any resource created manually is undocumented and cannot be automated. All AWS resources across both Staging and Production **must be defined in Terraform from the beginning**. |
| *"The CI pipeline has Trivy scanning, so I don't need to manually check the Dockerfile for security."* | **Incorrect.** Trivy scans package dependencies for known CVEs. It cannot detect structural security flaws like running as `root` user, exposing secrets in environment variables, or leaving debug ports open. Manually review and secure the Dockerfile using multi-stage builds. |
| *"We can turn off ECS logging or skip CloudWatch dashboard setup because it's a short 2-week intern project."* | **No.** An unmonitored container application is a black box. A DevOps CV must showcase **observability**. CloudWatch Logs, alarm thresholds, and metrics dashboards are mandatory to verify health. |

---

## 💻 Code & API Development Rationalizations

| Rationalization (The Agent's Excuse) | Reality (The Corrective Engineering Standard) |
| :--- | :--- |
| *"I don't need to write a Pest test for this simple Facebook Webhook parsing logic, it's just a JSON read."* | **Incorrect.** Facebook Webhook payloads are complex and change over time. Edge cases like empty messages, attachments, reaction events, or SQL injection vectors can break the parser. Write Pest tests verifying all edge cases. |
| *"I will write the API endpoint first, and the frontend developer can check the source code to see the JSON request/response structure."* | **Forbidden.** Decoupled team development requires strict **API Contracts** (Specs) first. Define the JSON structure in [plan.md](file:///r:/_Projects/Eurus_Workspace/Zeflyo/docs/plan.md) or a spec document before coding the backend API, so the Next.js developer is not blocked. |
| *"The auto-reply logic matches keywords locally, so it will scale and work perfectly on AWS Fargate."* | **No.** Webhook processing is high-frequency. A synchronous DB write or external API call inside the controller will block the process and cause Facebook to timeout (retry storm). The webhook *must* push to Redis Queue (Laravel Job) and exit in <3s. |

---

## 👥 Team & PM Gatekeeping Rationalizations

| Rationalization (The Agent's Excuse) | Reality (The Corrective Engineering Standard) |
| :--- | :--- |
| *"The changes are in a modular feature branch (e.g., Post Scheduler or Settings UI), so if tests pass, we can merge it without a thorough review."* | **No.** Every Pull Request, regardless of scope, must undergo rigorous code review by the PM and Security Lead. Ensure that feature migrations, helper methods, or route definitions do not inadvertently modify, leak, or conflict with the core Webhook receiver, database schemas, or WebSocket broadcasting systems. |
| *"I will allow a quick direct merge to `staging` because the deadline is tight."* | **Forbidden.** Branch protection is absolute. Any bypass of the PR review process violates standard SDLC, risks breaking the staging server, and compromises the team's learning workflow. |
