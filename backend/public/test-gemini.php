<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking Users Table Schema...\n";
try {
    $columns = Schema::getColumnListing('users');
    print_r($columns);

    $user = App\Models\User::first();
    if ($user) {
        echo "First User:\n";
        echo "ID: " . $user->id . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Credits: " . $user->credits . "\n";
    } else {
        echo "No users found.\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
