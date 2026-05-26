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

        Route::controller(RelatorioController::class)->group(function () {
            Route::get('relatorios', 'index')->name('dashboard.relatorios');
            Route::post('relatorios/consolidar', 'consolidar')->name('dashboard.relatorios.consolidar');
            Route::post('relatorios/simular-datalake', 'simularDatalake')->name('dashboard.relatorios.simular-datalake');
            Route::get('relatorios/download-csv', 'downloadCsv')->name('dashboard.relatorios.download-csv');
            Route::get('relatorios/download-json', 'downloadJson')->name('dashboard.relatorios.download-json');
        });

        Route::controller(SignatarioController::class)->group(function () {
            Route::get('signatarios', 'getAll')->name('dashboard.signatarios');
        });

        Route::controller(ProcessoController::class)->group(function () {
            Route::get('processos', 'getAll')->name('dashboard.processos');
            Route::post('processos/{id}/cancelar', 'cancelar')->name('dashboard.processos.cancelar');
            Route::post('processos/{id}/reenviar-email/{relationId}', 'reenviarEmail')->name('dashboard.processos.reenviar-email');
        });
    });
});

Route::get('/processos/validar/{token}', [ProcessoAssinaturaController::class, 'show'])->name('processos.validar');
Route::post('/processos/validar/{token}', [ProcessoAssinaturaController::class, 'responder'])->name('processos.responder');
