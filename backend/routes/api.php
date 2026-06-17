<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\FacebookAuthController;
use App\Http\Controllers\FanpageController;

Route::post('/auth/facebook/callback', [FacebookAuthController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/fanpages', [FanpageController::class, 'index']);
    Route::post('/fanpages/{fanpage}/toggle', [FanpageController::class, 'toggleActive']);
});

