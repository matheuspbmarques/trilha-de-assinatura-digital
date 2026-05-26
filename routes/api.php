<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SignatarioController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::controller(AuthController::class)->group(function () {
        Route::post('sign-in', 'signIn')->name('api.auth.sign-in');
        Route::get('sign-out', 'signOut')->name('api.auth.sign-out');
    });
});

Route::prefix('signatarios')->group(function () {
    Route::controller(SignatarioController::class)->group(function () {
        Route::post(null, 'create')->name('api.signatario.create');
        Route::put('{id}', 'update')->name('api.signatario.update');
    });
});
