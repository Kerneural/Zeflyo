<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = app(App\Services\GeminiService::class);
echo "Testing Gemini Service with User Inputs...\n";
try {
    $res = $service->generateQuickPresets('Khoá học autocad giá rẻ', 'aida');
    if ($res === null) {
        echo "FAILED: Result is NULL.\n";
    } else {
        echo "SUCCESS:\n";
        print_r($res);
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
