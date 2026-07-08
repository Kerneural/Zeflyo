<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

#[Fillable(['user_id', 'fanpage_ids', 'content', 'image_url', 'media_gallery', 'scheduled_at', 'status', 'error_log'])]
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
            'media_gallery' => 'array',
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
                    Log::info("Mock Facebook Publish: Page ID {$fbPageId}, Content=\"{$this->content}\", Image=\"{$this->image_url}\", Media Gallery=" . json_encode($this->media_gallery));
                    $successPages[] = $fbPageId;
                    continue;
                }

                $mediaItems = $this->media_gallery ?? [];
                
                // Fallback to image_url if media_gallery is empty
                if (empty($mediaItems) && $this->image_url) {
                    $mediaItems = [['url' => $this->image_url, 'type' => 'image']];
                }

                if (count($mediaItems) > 0) {
                    // Check if there's a video item. If yes, publish the first video.
                    $videoItem = collect($mediaItems)->first(fn($item) => ($item['type'] ?? '') === 'video');

                    if ($videoItem) {
                        $response = Http::post("https://graph.facebook.com/v20.0/{$fbPageId}/videos", [
                            'file_url' => $videoItem['url'],
                            'description' => $this->content,
                            'access_token' => $pageToken,
                        ]);
                    } elseif (count($mediaItems) === 1) {
                        $imgUrl = $mediaItems[0]['url'] ?? $mediaItems[0];
                        $response = Http::post("https://graph.facebook.com/v20.0/{$fbPageId}/photos", [
                            'url' => $imgUrl,
                            'caption' => $this->content,
                            'access_token' => $pageToken,
                        ]);
                    } else {
                        // Multi-photo publication flow
                        $attachedMedia = [];
                        $uploadErrors = [];

                        foreach ($mediaItems as $item) {
                            $imgUrl = $item['url'] ?? $item;
                            $photoRes = Http::post("https://graph.facebook.com/v20.0/{$fbPageId}/photos", [
                                'url' => $imgUrl,
                                'published' => false,
                                'access_token' => $pageToken,
                            ]);

                            if ($photoRes->successful() && $photoRes->json('id')) {
                                $attachedMedia[] = ['media_fbid' => $photoRes->json('id')];
                            } else {
                                $uploadErrors[] = "Failed uploading photo {$imgUrl}: " . $photoRes->body();
                            }
                        }

                        if (count($attachedMedia) > 0) {
                            $response = Http::post("https://graph.facebook.com/v20.0/{$fbPageId}/feed", [
                                'message' => $this->content,
                                'attached_media' => $attachedMedia,
                                'access_token' => $pageToken,
                            ]);
                        } else {
                            throw new \Exception("All photo uploads failed: " . implode('; ', $uploadErrors));
                        }
                    }
                } else {
                    // Text-only post
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
