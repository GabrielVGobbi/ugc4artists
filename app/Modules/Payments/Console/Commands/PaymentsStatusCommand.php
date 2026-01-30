<?php

declare(strict_types=1);

namespace App\Modules\Payments\Console\Commands;

use App\Modules\Payments\Core\Contracts\HasPaymentCustomerContract;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class PaymentsStatusCommand extends Command
{
    protected $signature = 'payments:status
                            {--table=users : The table to check}
                            {--model=App\\Models\\User : The model class to check}';

    protected $description = 'Check the status of the Payments module configuration';

    public function handle(): int
    {
        $this->newLine();
        $this->components->info('🔍 Payments Module Status');
        $this->newLine();

        $this->checkConfig();
        $this->checkGateways();
        $this->checkModel();
        $this->checkDatabaseColumns();

        $this->newLine();

        return self::SUCCESS;
    }

    private function checkConfig(): void
    {
        $this->components->twoColumnDetail(
            'Config File',
            file_exists(config_path('payments.php'))
                ? '<fg=green>✓ Found</>'
                : '<fg=red>✗ Missing</>'
        );

        $this->components->twoColumnDetail(
            'Default Gateway',
            '<fg=cyan>' . config('payments.default', 'not set') . '</>'
        );

        $this->components->twoColumnDetail(
            'Test Mode',
            config('payments.test_mode')
                ? '<fg=yellow>Yes (Sandbox)</>'
                : '<fg=green>No (Production)</>'
        );

        $this->components->twoColumnDetail(
            'Logging Enabled',
            config('payments.logging.enabled')
                ? '<fg=green>Yes</>'
                : '<fg=gray>No</>'
        );
    }

    private function checkGateways(): void
    {
        $this->newLine();
        $this->line('  <fg=white;options=bold>Gateways:</>');

        $gateways = config('payments.gateways', []);

        foreach ($gateways as $name => $config) {
            $enabled = $config['enabled'] ?? false;
            $hasApiKey = ! empty($config['api_key']);
            $column = $config['customer']['column_external_id'] ?? "{$name}_id";

            $status = match (true) {
                ! $enabled => '<fg=gray>Disabled</>',
                ! $hasApiKey => '<fg=red>✗ No API Key</>',
                default => '<fg=green>✓ Ready</>',
            };

            $this->components->twoColumnDetail(
                "    {$name}",
                "{$status} <fg=gray>(column: {$column})</>"
            );
        }
    }

    private function checkModel(): void
    {
        $this->newLine();
        $this->line('  <fg=white;options=bold>Model Configuration:</>');

        $modelClass = $this->option('model');

        if (! class_exists($modelClass)) {
            $this->components->twoColumnDetail(
                "    {$modelClass}",
                '<fg=red>✗ Class not found</>'
            );

            return;
        }

        $implementsContract = in_array(
            HasPaymentCustomerContract::class,
            class_implements($modelClass) ?: []
        );

        $usesTrait = in_array(
            \App\Modules\Payments\Core\Traits\HasPayments::class,
            class_uses_recursive($modelClass) ?: []
        );

        $this->components->twoColumnDetail(
            '    Implements HasPaymentCustomerContract',
            $implementsContract
                ? '<fg=green>✓ Yes</>'
                : '<fg=yellow>⚠ No</>'
        );

        $this->components->twoColumnDetail(
            '    Uses HasPayments trait',
            $usesTrait
                ? '<fg=green>✓ Yes</>'
                : '<fg=yellow>⚠ No</>'
        );
    }

    private function checkDatabaseColumns(): void
    {
        $this->newLine();
        $this->line('  <fg=white;options=bold>Database Columns:</>');

        $table = $this->option('table');

        if (! Schema::hasTable($table)) {
            $this->components->twoColumnDetail(
                "    Table '{$table}'",
                '<fg=red>✗ Not found</>'
            );

            return;
        }

        $gateways = config('payments.gateways', []);

        foreach ($gateways as $name => $config) {
            if (! ($config['enabled'] ?? false)) {
                continue;
            }

            $column = $config['customer']['column_external_id'] ?? "{$name}_id";
            $exists = Schema::hasColumn($table, $column);

            $this->components->twoColumnDetail(
                "    {$table}.{$column}",
                $exists
                    ? '<fg=green>✓ Exists</>'
                    : '<fg=red>✗ Missing</>'
            );
        }
    }
}
