<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking System Notifications Table...\n";
try {
    $count = DB::table('system_notifications')->count();
    echo "Count: $count\n";
    $notifications = DB::table('system_notifications')->get();
    print_r($notifications);
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
