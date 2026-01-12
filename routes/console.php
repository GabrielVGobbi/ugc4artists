<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:clear', function () {
    $this->call('config:clear');
    $this->call('route:clear');
    $this->call('event:clear');
    $this->call('view:clear');
    $this->call('cache:clear');
    //TODO quando adicionar telescope, descomentar
    #$this->call('telescope:prune', ['--hours' => 48]);
    $this->info('Todos os caches foram limpos com sucesso!');
})->purpose('Clear application caches');

Artisan::command('app:clear-min', function () {
    $this->call('cache:clear');
    //TODO quando adicionar telescope, descomentar
    #$this->call('telescope:prune', ['--hours' => 48]);
    $this->info('Cache de aplicação limpo + Telescope prune!');
})->purpose('Clear application caches');

Schedule::command('app:clear')->dailyAt('06:00')->withoutOverlapping()->runInBackground();
Schedule::command('app:clear')->dailyAt('13:00')->withoutOverlapping()->runInBackground();

Schedule::command('app:clear-min')
    ->everyTwoHours()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('telescope:prune --hours=48')->daily();
