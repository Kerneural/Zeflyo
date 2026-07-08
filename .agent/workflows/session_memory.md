# 💾 SESSION MEMORY — Zeflyo Project
> Last Checkpoint: 2026-07-08 | Status: Unified Scheduler UI, Spacious Preview Modal, Anti-Spam Rate Limiting, 5 Gemini Keys, Credits System, Multi-Media Attachments, and Framework Presets deployed to production.

---

## ⚡ Active Tasks Completed (Những việc ĐÃ HOÀN THÀNH trong session)

*   **Real-time Credits Synchronization [frontend & backend]:**
    *   Added `credits_remaining` response property to all AI-related JSON endpoints (`/api/posts/generate-ai`, `/api/posts/quick-presets`, `/api/auto-setups/{id}/generate-topics`, `/api/topics/{id}/generate-content`, `/api/auto-setups/{id}/generate-all-contents`).
    *   Created frontend credits utility at [credits.ts](file:///r:/_Projects/Eurus_Workspace/Zeflyo/frontend/src/lib/credits.ts) to handle `localStorage` updates and dispatch the `zeflyo_profile_updated` event to refresh sidebar UI dynamically.
    *   Integrated credits sync and `402 Payment Required` checking into all AI call sites.
    *   For SSE streams, triggered an immediate background `/api/user` profile re-fetch upon opening the stream to sync local credit balance.

*   **Multi-image and Video Upload Support [frontend & backend]:**
    *   Created database migration adding `media_gallery` (JSON) to `scheduled_posts` and `topics` tables.
    *   Updated `UploadController.php` to accept video uploads up to 50MB and return correct mime and file type indicators (`image` or `video`).
    *   Overhauled `ScheduledPost` and `Topic` models/controllers to support uploading, storing, and publishing multi-image and video posts using Facebook's multi-photo/video publishing Graph APIs.
    *   Overhauled the scheduler's media section to support dragging/uploading multiple files, deleting items from the gallery, and typing manual URLs.
    *   Implemented full-featured Facebook-style grid layouts in live mockup preview (displaying 1, 2, 3, or 4+ images with "+N" counters and video play tags).

*   **Framework-Tailored Prompt Presets [frontend & backend]:**
    *   Updated `/api/posts/quick-presets` endpoint and `GeminiService@generateQuickPresets` to receive `framework` parameter (`aida`, `pas`, `bab`).
    *   Tailored suggested topic labels, detailed topic prompts, and marketing goals directly according to the chosen formula.

*   **Deployment and Test Validation [devops]:**
    *   Fixed PHPUnit tests by configuring the default test factory user to start with 100 credits, ensuring all 49 automated tests pass.
    *   Pushed changes to GitHub `main` branch, successfully pulled and executed migrations on production VPS, and restarted OCTANE/worker app containers.

---

## 🧠 Semantic Context Essence (Tinh túy kiến thức & Quyết định thiết kế)

*   **Facebook Multi-photo Publishing Flow**: To publish multiple photos in a single feed post, you must upload each photo individually with `published=false` to obtain the `media_fbid`, and then publish the main status to `/feed` with `attached_media` containing the list of photo IDs.
*   **Facebook Video Publishing**: To publish a video post, call `POST /{fbPageId}/videos` with `file_url` (direct public link) and `description` containing the post caption text.
*   **Credits synchronization in SSE**: Because SSE returns stream content chunk-by-chunk rather than raw JSON, we fetch `/api/user` instantly on stream startup to refresh the user's credits balance in the sidebar.

---

## 🔜 Next Steps (3 hành động kỹ thuật trực tiếp kế tiếp)

- [ ] **Step 1:** Add media upload size and type limit indicators in UI to guide users.
- [ ] **Step 2:** Test full campaign scheduling of a mixed-media queue (images/videos) in production.
- [ ] **Step 3:** Implement customizable publishing notifications for successful/failed schedules.
