<?php

use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(AuthMiddleware::class)->group(function() {
    Route::prefix('auth')->group(function() {
        Route::inertia('sign-in', 'auth/sign-in')->name('auth.sign-in');
    });

    Route::prefix('dashboard')->group(function () {
        Route::inertia('home', 'dashboard/home')->name('dashboard.home');
        Route::inertia('signatarios', 'dashboard/signatarios')->name('dashboard.signatarios');
    });
});
