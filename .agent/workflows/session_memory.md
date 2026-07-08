# 💾 SESSION MEMORY — Zeflyo Project
> Last Checkpoint: 2026-07-08 | Status: Unified Post Scheduler, Spacious Preview Modal, and AI Concurrency Anti-Spam protection fully deployed.

---

## ⚡ Active Tasks Completed (Những việc ĐÃ HOÀN THÀNH trong session)
*   **Post Scheduler & AI Campaign Merge [frontend]:**
    *   Merged the separate `autopost` campaign manager and `scheduler` post scheduler into a single, cohesive route under [scheduler/page.tsx](file:///r:/_Projects/Eurus_Workspace/Zeflyo/frontend/src/app/scheduler/page.tsx).
    *   Consolidated the sidebar in [Sidebar.tsx](file:///r:/_Projects/Eurus_Workspace/Zeflyo/frontend/src/components/Sidebar.tsx) to map cleanly to the subtab switchers (`/scheduler?tab=setup` and `/scheduler?tab=list`).
    *   Implemented `mounted` hydration state check to bypass Next.js server/client hydration mismatch warnings (caused by third-party browser translator extensions injecting elements).
*   **Facebook-Style Live Edit & Review Modal [frontend]:**
    *   Rebuilt the edit/view modal at the bottom of [scheduler/page.tsx](file:///r:/_Projects/Eurus_Workspace/Zeflyo/frontend/src/app/scheduler/page.tsx) to be tall and spacious (`max-w-7xl h-[85vh] max-h-[850px] flex flex-col justify-between`).
    *   Textarea and the mock Facebook feed card stretch dynamically to fill 100% height, using `flex-1 min-h-0 overflow-y-auto` to scroll long content gracefully.
    *   Enlarged the editor textarea size to `text-sm` for optimal screen usability.
*   **API Concurrency Lock & Anti-Spam Throttling [backend]:**
    *   Added a Cache-based concurrency locking check (`auto_setup_topics_lock_{id}` and `auto_setup_gen_lock_{id}`) in [TopicController.php](file:///r:/_Projects/Eurus_Workspace/Zeflyo/backend/app/Http/Controllers/TopicController.php) to prevent duplicate clicks and concurrent API spamming for the same campaign.
    *   Imposed a strict limit of **15 pending topics max** processed in a single batch content generation call to avoid request timeout and API key rate limit exhaustion.
    *   Introduced a **1.2s delay (`usleep(1200000)`)** between sequential AI generations in the batch loop. This distributes API load evenly and fits perfectly within the rotated 3 Free API keys' 45 RPM combined capacity.
*   **Deployment and Service Refresh [devops]:**
    *   Successfully compiled the static bundle via `npm run build`, packaged into `out.zip`, and deployed changes to DO VPS `165.232.163.188` using direct `git pull` + container restarts.

## 🧠 Semantic Context Essence (Tinh túy kiến thức & Quyết định thiết kế)
*   **Next.js SSR Hydration Guard**: Standard `typeof window !== 'undefined'` checks during initial render can cause mismatch if client HTML has attributes modified by extensions (like `bis_skin_checked` or translation tags). Standardizing a `mounted` state check ensures SSR outputs a simple skeleton or matches server output until client hydration.
*   **Spacious Viewport Constraints**: Modal interfaces with scrollable inputs must avoid absolute heights that overflow the screen. Combining `flex flex-col` and `min-h-0` inside columns ensures the editor stretches dynamically to the exact window bounds without pushing action buttons off-screen.
*   **AI Anti-Spam Control**: Batch requests to free APIs must be rate-limited programmatically (concurrency locks + delay limits) to guarantee zero 429 failures without requiring an excessive rotation list.

## 🔜 Next Steps (3 hành động kỹ thuật trực tiếp kế tiếp)
- [ ] **Step 1:** Add test cases for campaign execution worker queue in staging environment.
- [ ] **Step 2:** Refactor additional presets customization options if business niche prompt suggestions require specific framework modifications (AIDA, PAS, BAB).
- [ ] **Step 3:** Support multi-image or video media upload attachments within the single scheduler queue array.
