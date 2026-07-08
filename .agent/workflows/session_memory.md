# 💾 SESSION MEMORY — Zeflyo Project
> Last Checkpoint: 2026-07-08 | Status: Unified Scheduler UI, Spacious Preview Modal, Anti-Spam Rate Limiting, 5 Gemini Keys, and fully functional Credit Deduction System deployed to production.

---

## ⚡ Active Tasks Completed (Những việc ĐÃ HOÀN THÀNH trong session)

*   **Post Scheduler & AI Campaign Merge [frontend]:**
    *   Merged `autopost` and `scheduler` into a single unified page at [scheduler/page.tsx](file:///r:/_Projects/Eurus_Workspace/Zeflyo/frontend/src/app/scheduler/page.tsx).
    *   Consolidated sidebar in [Sidebar.tsx](file:///r:/_Projects/Eurus_Workspace/Zeflyo/frontend/src/components/Sidebar.tsx).
    *   Implemented `mounted` hydration guard to fix SSR mismatch warnings.

*   **Facebook-Style Live Edit & Review Modal [frontend]:**
    *   Spacious `max-w-7xl h-[85vh]` 2-column modal — left column editor (flex-1 textarea), right column Facebook feed mockup.
    *   Full-height stretch with `flex-1 min-h-0 overflow-y-auto` for both content and image areas.

*   **API Anti-Spam Throttling [backend]:**
    *   Concurrency locks: `auto_setup_topics_lock_{id}` (60s) and `auto_setup_gen_lock_{id}` (180s) using Laravel Cache.
    *   Batch limit of **15 topics** per request to avoid PHP timeout.
    *   **1.2s delay** (`usleep(1200000)`) between sequential Gemini API calls in batch loop.

*   **Gemini API Key Expansion [backend]:**
    *   Configured **5 rotated API keys** in `GEMINI_API_KEY` via comma-separated list in `.env` on both local and VPS.
    *   Combined theoretical capacity: **75 RPM / 7,500 RPD** across 5 Free Tier keys.

*   **Full Credits System Implementation [backend]:**
    All 6 AI endpoints now check and deduct credits in [PostSchedulerController.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/app/Http/Controllers/PostSchedulerController.php), [TopicController.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/app/Http/Controllers/TopicController.php), and [ProcessFacebookWebhookJob.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/app/Jobs/ProcessFacebookWebhookJob.php):

    | Endpoint / Feature | Min Credits | Deduction |
    |---|---|---|
    | `POST /posts/generate-ai` | 1 | -1 per call |
    | `POST /posts/generate-ai-stream` | 1 | -1 upfront |
    | `POST /posts/quick-presets` | 1 | -1 on success |
    | `POST /auto-setups/{id}/generate-topics` | 5 | -5 on success |
    | `POST /topics/{id}/generate-content` | 1 | -1 on success |
    | `POST /auto-setups/{id}/generate-all-contents` | 1 | -1 per post, stops if credits run out |
    | AI Auto-Reply (Webhook Job) | 1 | -1 per AI reply; keyword replies = FREE |

    - Returns HTTP `402 Payment Required` if user has insufficient credits.
    - Batch generation uses `$user->fresh()->credits` inside loop to refresh DB value mid-loop.
    - AI Auto-Reply skips silently and logs a warning if the fanpage owner has 0 credits.

*   **Deployment and Service Refresh [devops]:**
    *   All changes pulled via `git pull` on VPS, then `docker compose restart app worker` applied.

---

## 🧠 Semantic Context Essence (Tinh túy kiến thức & Quyết định thiết kế)

*   **Credit HTTP Status**: Used `402 Payment Required` (not `403 Forbidden`) for insufficient-credit errors. This is semantically correct and lets the frontend distinguish payment issues from authorization issues.
*   **Batch Credit Deduction**: In `generateAllContents`, credit is deducted **per successfully generated post** inside the loop (not upfront), and the loop calls `$user->fresh()` before each iteration to prevent race conditions from stale in-memory state.
*   **SSE Stream Credit**: For streaming, credit must be deducted **before** opening the stream (not inside the closure) because once `response()->stream()` starts, PHP headers are sent and a 402 response can no longer be issued.
*   **AI Auto-Reply Credit Ownership**: The fanpage `user` (owner) is charged, not the customer. Keyword rules trigger zero-cost replies.
*   **Next.js SSR Hydration Guard**: A `mounted` state check prevents browser extension attribute injection from triggering React hydration mismatch warnings.
*   **Spacious Modal Viewport Pattern**: `flex flex-col min-h-0` on column containers + `flex-1 min-h-0 overflow-y-auto` on content areas ensures full-height stretch without overflow.

---

## 🔜 Next Steps (3 hành động kỹ thuật trực tiếp kế tiếp)

- [ ] **Step 1:** Show real-time credit balance in frontend UI after each AI action (re-fetch `/api/user/profile` or return updated credits in AI response payloads).
- [ ] **Step 2:** Add test cases for campaign execution worker queue in staging environment.
- [ ] **Step 3:** Support multi-image or video media upload attachments within the single scheduler post queue.
