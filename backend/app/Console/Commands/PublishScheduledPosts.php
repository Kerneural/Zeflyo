<?php

namespace App\Console\Commands;

use App\Models\Fanpage;
use App\Models\ScheduledPost;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PublishScheduledPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'posts:publish';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish scheduled posts to Facebook pages.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting scheduled posts publishing...');

        $posts = ScheduledPost::where('status', 'pending')
            ->where('scheduled_at', '<=', Carbon::now())
            ->get();

        if ($posts->isEmpty()) {
            $this->info('No pending scheduled posts to publish.');

            return 0;
        }

        $this->info("Found {$posts->count()} posts to process.");

        foreach ($posts as $post) {
            $this->info("Processing post ID {$post->id}...");
            $success = $post->publish();
            if ($success) {
                $this->info("Post ID {$post->id} published successfully to all target pages.");
            } else {
                $this->error("Post ID {$post->id} failed to publish. Check error logs.");
            }
        }

        $this->info('Scheduled posts processing completed.');

        return 0;
    }
}
