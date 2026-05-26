<?php

use App\Services\AnalyticsService;

test('it formats seconds to dashboard intervals correctly', function () {
    $service = new AnalyticsService;

    expect($service->formatSecondsToDashboardInterval(0))->toBe('N/A');
    expect($service->formatSecondsToDashboardInterval(-5))->toBe('N/A');
    expect($service->formatSecondsToDashboardInterval(30))->toBe('30 seg');
    expect($service->formatSecondsToDashboardInterval(150))->toBe('3 min');
    expect($service->formatSecondsToDashboardInterval(3599))->toBe('60 min');
    expect($service->formatSecondsToDashboardInterval(3600))->toBe('1 horas');
    expect($service->formatSecondsToDashboardInterval(7200))->toBe('2 horas');
    expect($service->formatSecondsToDashboardInterval(90000))->toBe('1 dia e 1h');
    expect($service->formatSecondsToDashboardInterval(172800))->toBe('2 dias');
    expect($service->formatSecondsToDashboardInterval(180000))->toBe('2 dias e 2h');
});

test('it formats seconds to signatory intervals correctly', function () {
    $service = new AnalyticsService;

    expect($service->formatSecondsToSignatoryInterval(0))->toBe('N/A');
    expect($service->formatSecondsToSignatoryInterval(-10))->toBe('N/A');
    expect($service->formatSecondsToSignatoryInterval(45))->toBe('45s');
    expect($service->formatSecondsToSignatoryInterval(120))->toBe('2m');
    expect($service->formatSecondsToSignatoryInterval(3600))->toBe('1h');
    expect($service->formatSecondsToSignatoryInterval(90000))->toBe('1 dia e 1h');
    expect($service->formatSecondsToSignatoryInterval(172800))->toBe('2 dias');
    expect($service->formatSecondsToSignatoryInterval(180000))->toBe('2 dias e 2h');
});
