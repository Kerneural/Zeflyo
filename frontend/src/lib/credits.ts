/**
 * syncCredits — Real-time credit balance synchronization utility
 *
 * Call this after any successful AI API response that returns a
 * `credits_remaining` field. It updates localStorage and fires the
 * `zeflyo_profile_updated` event so the Sidebar credit counter
 * refreshes instantly without a full page reload.
 *
 * Usage:
 *   const data = await res.json();
 *   syncCredits(data.credits_remaining);
 */
export function syncCredits(creditsRemaining: number | undefined): void {
  if (creditsRemaining === undefined || creditsRemaining === null) return;

  try {
    const raw = localStorage.getItem("zeflyo_user");
    if (!raw) return;

    const user = JSON.parse(raw);
    user.credits = creditsRemaining;
    localStorage.setItem("zeflyo_user", JSON.stringify(user));

    // Notify Sidebar and any other listeners to re-render with the new credit value
    window.dispatchEvent(new Event("zeflyo_profile_updated"));
  } catch (e) {
    console.error("[syncCredits] Failed to update credits in localStorage:", e);
  }
}

/**
 * handleApiCreditError — Centralized 402 Payment Required handler
 *
 * Checks if an API response is a 402 and returns the error message
 * for display. Returns null if the response is not a credit error.
 *
 * Usage:
 *   const creditErr = await handleApiCreditError(res);
 *   if (creditErr) { showNotification("error", creditErr); return; }
 */
export async function handleApiCreditError(res: Response): Promise<string | null> {
  if (res.status === 402) {
    try {
      const body = await res.json();
      return body.error || "Bạn không đủ Credits để thực hiện tính năng AI này.";
    } catch {
      return "Bạn không đủ Credits để thực hiện tính năng AI này.";
    }
  }
  return null;
}
