<?php

use App\Http\Controllers\ProcessoController;
use App\Http\Controllers\SignatarioController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(AuthMiddleware::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::inertia('sign-in', 'auth/sign-in')->name('auth.sign-in');
    });

    Route::prefix('dashboard')->group(function () {
        Route::inertia('home', 'dashboard/home')->name('dashboard.home');

        Route::controller(SignatarioController::class)->group(function () {
            Route::get('signatarios', 'getAll')->name('dashboard.signatarios');
        });

    Route::controller(ProcessoController::class)->group(function () {
            Route::get('processos', 'getAll')->name('dashboard.processos');
        });
    });
});

Route::get('/processos/validar/{token}', [App\Http\Controllers\ProcessoAssinaturaController::class, 'show'])->name('processos.validar');
Route::post('/processos/validar/{token}', [App\Http\Controllers\ProcessoAssinaturaController::class, 'responder'])->name('processos.responder');

