<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$setups = DB::table('auto_setups')->get();
$topics = DB::table('topics')->get();

echo json_encode([
    'setups' => $setups,
    'topics' => $topics,
]);
