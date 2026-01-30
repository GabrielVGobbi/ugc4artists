<?php

declare(strict_types=1);

namespace App\Modules\Payments\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class InstallPaymentsCommand extends Command
{
    protected $signature = 'payments:install
                            {--gateway= : Specific gateway to configure (asaas, iugu, etc.)}
                            {--table=users : The table to add the external ID column}
                            {--force : Overwrite existing files}
                            {--skip-migration : Skip migration creation}';

    protected $description = 'Install and configure the Payments module';

    private array $steps = [];

    public function handle(): int
    {
        $this->newLine();
        $this->components->info('🚀 Installing Payments Module...');
        $this->newLine();

        // Step 1: Check configuration
        $this->checkConfiguration();

        // Step 2: Check/Create migrations
        if (! $this->option('skip-migration')) {
            $this->handleMigrations();
        }

        // Step 3: Validate database columns
        $this->validateDatabaseColumns();

        // Step 4: Show summary
        $this->showSummary();

        return self::SUCCESS;
    }

    private function checkConfiguration(): void
    {
        $this->components->task('Checking configuration', function () {
            $configPath = config_path('payments.php');

            if (! File::exists($configPath)) {
                $this->steps[] = [
                    'type' => 'error',
                    'message' => 'Config file not found. Publish it with: php artisan vendor:publish --tag=payments-config',
                ];

                return false;
            }

            $gateways = config('payments.gateways', []);
            $enabledGateways = collect($gateways)
                ->filter(fn ($config) => $config['enabled'] ?? false)
                ->keys()
                ->toArray();

            if (empty($enabledGateways)) {
                $this->steps[] = [
                    'type' => 'warning',
                    'message' => 'No gateways enabled in config/payments.php',
                ];

                return false;
            }

            $this->steps[] = [
                'type' => 'success',
                'message' => 'Configuration found. Enabled gateways: ' . implode(', ', $enabledGateways),
            ];

            return true;
        });
    }

    private function handleMigrations(): void
    {
        $gateway = $this->option('gateway') ?? config('payments.default', 'asaas');
        $table = $this->option('table');

        $this->components->task("Checking migrations for gateway '{$gateway}'", function () use ($gateway, $table) {
            $column = config("payments.gateways.{$gateway}.customer.column_external_id", "{$gateway}_id");

            // Check if column already exists
            if (Schema::hasColumn($table, $column)) {
                $this->steps[] = [
                    'type' => 'success',
                    'message' => "Column '{$column}' already exists in table '{$table}'",
                ];

                return true;
            }

            // Check if migration already exists
            $migrationName = "add_{$column}_to_{$table}_table";
            $existingMigration = $this->findExistingMigration($migrationName);

            if ($existingMigration && ! $this->option('force')) {
                $this->steps[] = [
                    'type' => 'info',
                    'message' => "Migration already exists: {$existingMigration}",
                ];

                return true;
            }

            // Create migration
            $this->createMigration($gateway, $table, $column);

            return true;
        });

        // Ask to run migrations
        if ($this->confirm('Would you like to run the migrations now?', true)) {
            $this->call('migrate');
        }
    }

    private function findExistingMigration(string $name): ?string
    {
        $migrationsPath = database_path('migrations');
        $files = File::glob("{$migrationsPath}/*_{$name}.php");

        return $files ? basename($files[0]) : null;
    }

    private function createMigration(string $gateway, string $table, string $column): void
    {
        $timestamp = now()->format('Y_m_d_His');
        $migrationName = "add_{$column}_to_{$table}_table";
        $filename = "{$timestamp}_{$migrationName}.php";
        $path = database_path("migrations/{$filename}");

        $stub = $this->getMigrationStub($gateway, $table, $column);

        File::put($path, $stub);

        $this->steps[] = [
            'type' => 'success',
            'message' => "Migration created: {$filename}",
        ];
    }

    private function getMigrationStub(string $gateway, string $table, string $column): string
    {
        $className = 'Add' . Str::studly($column) . 'To' . Str::studly($table) . 'Table';

        return <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration adds the external gateway ID column for the {$gateway} payment gateway.
     * The column stores the customer ID from the payment gateway (e.g., 'cus_xxxxx' for Asaas).
     */
    public function up(): void
    {
        Schema::table('{$table}', function (Blueprint \$table) {
            \$table->string('{$column}')
                ->nullable()
                ->after('id')
                ->index()
                ->comment('{$gateway} customer external ID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('{$table}', function (Blueprint \$table) {
            \$table->dropColumn('{$column}');
        });
    }
};
PHP;
    }

    private function validateDatabaseColumns(): void
    {
        $table = $this->option('table');
        $gateways = config('payments.gateways', []);

        $this->components->task('Validating database columns', function () use ($table, $gateways) {
            $missingColumns = [];

            foreach ($gateways as $gateway => $config) {
                if (! ($config['enabled'] ?? false)) {
                    continue;
                }

                $column = $config['customer']['column_external_id'] ?? "{$gateway}_id";

                if (! Schema::hasColumn($table, $column)) {
                    $missingColumns[] = [
                        'gateway' => $gateway,
                        'column' => $column,
                    ];
                }
            }

            if (! empty($missingColumns)) {
                foreach ($missingColumns as $missing) {
                    $this->steps[] = [
                        'type' => 'warning',
                        'message' => "Missing column '{$missing['column']}' for gateway '{$missing['gateway']}' in table '{$table}'",
                    ];
                }

                return false;
            }

            $this->steps[] = [
                'type' => 'success',
                'message' => "All required columns exist in table '{$table}'",
            ];

            return true;
        });
    }

    private function showSummary(): void
    {
        $this->newLine();
        $this->components->info('📋 Installation Summary');
        $this->newLine();

        foreach ($this->steps as $step) {
            match ($step['type']) {
                'success' => $this->components->twoColumnDetail(
                    '<fg=green>✓</> ' . $step['message'],
                    '<fg=green>OK</>'
                ),
                'warning' => $this->components->twoColumnDetail(
                    '<fg=yellow>⚠</> ' . $step['message'],
                    '<fg=yellow>WARNING</>'
                ),
                'error' => $this->components->twoColumnDetail(
                    '<fg=red>✗</> ' . $step['message'],
                    '<fg=red>ERROR</>'
                ),
                'info' => $this->components->twoColumnDetail(
                    '<fg=blue>ℹ</> ' . $step['message'],
                    '<fg=blue>INFO</>'
                ),
                default => null,
            };
        }

        $this->newLine();
        $this->showNextSteps();
    }

    private function showNextSteps(): void
    {
        $this->components->info('📌 Next Steps');
        $this->newLine();

        $this->line('  1. Ensure your User model uses the HasPayments trait:');
        $this->newLine();
        $this->line('     <fg=gray>use App\Modules\Payments\Core\Traits\HasPayments;</>');
        $this->line('     <fg=gray>use App\Modules\Payments\Core\Contracts\HasPaymentCustomerContract;</>');
        $this->newLine();
        $this->line('     <fg=gray>class User extends Authenticatable implements HasPaymentCustomerContract</>');
        $this->line('     <fg=gray>{</>');
        $this->line('     <fg=gray>    use HasPayments;</>');
        $this->line('     <fg=gray>}</>');
        $this->newLine();

        $this->line('  2. Configure your .env file:');
        $this->newLine();
        $this->line('     <fg=gray>PAYMENT_GATEWAY=asaas</>');
        $this->line('     <fg=gray>ASAAS_API_KEY=your_api_key</>');
        $this->line('     <fg=gray>ASAAS_SANDBOX=true</>');
        $this->newLine();

        $this->line('  3. Use the payment module:');
        $this->newLine();
        $this->line('     <fg=gray>use App\Modules\Payments\Facades\Asaas;</>');
        $this->newLine();
        $this->line('     <fg=gray>$customer = Asaas::customers()->firstOrCreate(</>');
        $this->line('     <fg=gray>    CustomerRequest::fromUser($user)</>');
        $this->line('     <fg=gray>);</>');
        $this->newLine();
    }
}
