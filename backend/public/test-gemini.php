<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = app(App\Services\GeminiService::class);
echo "Testing Gemini Service...\n";
try {
    $res = $service->generateQuickPresets('Spa làm đẹp');
    if ($res === null) {
        echo "FAILED: Result is NULL.\n";
        // Let's log keys rotation state or try a simple call
        $keys = config('services.gemini.key');
        $model = config('services.gemini.model');
        echo "Model: $model\n";
        echo "Keys Count: " . count(array_filter(array_map('trim', explode(',', $keys)))) . "\n";
    } else {
        echo "SUCCESS:\n";
        print_r($res);
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
