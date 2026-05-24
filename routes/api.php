<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::controller(AuthController::class)->group(function () {
        Route::post('sign-in', 'signIn')->name('api.auth.sign-in');
        Route::get('sign-out', 'signOut')->name('api.auth.sign-out');
    });
});
