<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

#[Fillable(['user_id', 'fanpage_ids', 'content', 'image_url', 'scheduled_at', 'status', 'error_log'])]
class ScheduledPost extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fanpage_ids' => 'array',
            'scheduled_at' => 'datetime',
        ];
    }

    /**
     * Get the user that created the scheduled post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Publish this post immediately to all target fanpages.
     */
    public function publish(): bool
    {
        $fanpageIds = $this->fanpage_ids;
        if (empty($fanpageIds)) {
            $this->update([
                'status' => 'failed',
                'error_log' => 'No target Fanpages selected.',
            ]);
            return false;
        }

        $failedPages = [];
        $successPages = [];
        $errors = [];

        foreach ($fanpageIds as $fanpageId) {
            $fanpage = Fanpage::find($fanpageId);

            if (! $fanpage) {
                $failedPages[] = $fanpageId;
                $errors[] = "Fanpage ID {$fanpageId} not found in local database.";
                continue;
            }

            try {
                $pageToken = $fanpage->access_token;
                $fbPageId = $fanpage->fb_page_id;

                if ($pageToken === 'mock_page_token_123') {
                    Log::info("Mock Facebook Publish: Page ID {$fbPageId}, Content=\"{$this->content}\", Image=\"{$this->image_url}\"");
                    $successPages[] = $fbPageId;
                    continue;
                }

                if ($this->image_url) {
                    $response = Http::post("https://graph.facebook.com/v20.0/{$fbPageId}/photos", [
                        'url' => $this->image_url,
                        'caption' => $this->content,
                        'access_token' => $pageToken,
                    ]);
                } else {
                    $response = Http::post("https://graph.facebook.com/v20.0/{$fbPageId}/feed", [
                        'message' => $this->content,
                        'access_token' => $pageToken,
                    ]);
                }

                if ($response->successful()) {
                    $successPages[] = $fbPageId;
                } else {
                    $failedPages[] = $fbPageId;
                    $errors[] = "Fanpage ID {$fanpageId} (FB Page {$fbPageId}) failed: ".$response->body();
                    Log::error("Facebook Publish error for page {$fbPageId}: ".$response->body());
                }
            } catch (\Exception $e) {
                $failedPages[] = $fanpage->fb_page_id ?? $fanpageId;
                $errors[] = "Fanpage ID {$fanpageId} exception: ".$e->getMessage();
                Log::error("Facebook Publish exception for page {$fanpageId}: ".$e->getMessage());
            }
        }

        if (empty($failedPages)) {
            $this->update([
                'status' => 'published',
                'error_log' => null,
            ]);
            return true;
        } else {
            $this->update([
                'status' => 'failed',
                'error_log' => implode("\n", $errors),
            ]);
            return false;
        }
    }
}
