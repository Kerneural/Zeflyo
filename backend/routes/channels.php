<?php

use Illuminate\Support\Facades\Broadcast;

// Register broadcasting routes with Sanctum auth middleware for API clients
Broadcast::routes(['middleware' => ['api', 'auth:sanctum']]);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('fanpage.{fanpageId}', function ($user, $fanpageId) {
    return $user->fanpages()->where('id', $fanpageId)->exists();
});
