<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProcessoAssinaturaController;
use App\Http\Controllers\ProcessoController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\SignatarioController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(AuthMiddleware::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::inertia('sign-in', 'auth/sign-in')->name('auth.sign-in');
    });

    Route::prefix('dashboard')->group(function () {
        Route::get('home', [DashboardController::class, 'index'])->name('dashboard.home');
        Route::get('relatorios', [RelatorioController::class, 'index'])->name('dashboard.relatorios');

        Route::controller(SignatarioController::class)->group(function () {
            Route::get('signatarios', 'getAll')->name('dashboard.signatarios');
        });

        Route::controller(ProcessoController::class)->group(function () {
            Route::get('processos', 'getAll')->name('dashboard.processos');
        });
    });
});

Route::get('/processos/validar/{token}', [ProcessoAssinaturaController::class, 'show'])->name('processos.validar');
Route::post('/processos/validar/{token}', [ProcessoAssinaturaController::class, 'responder'])->name('processos.responder');
