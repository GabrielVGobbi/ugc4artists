<?php

declare(strict_types=1);

namespace App\Modules\Payments\Console\Commands;

use App\Modules\Payments\Gateways\Asaas\AsaasManager;
use Illuminate\Console\Command;

class SetupAsaasWebhookCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'asaas:webhook:setup
                            {--url= : Custom webhook URL (defaults to APP_URL/webhook/asaas)}
                            {--list : List all configured webhooks}
                            {--delete= : Delete webhook by ID}';

    /**
     * The console command description.
     */
    protected $description = 'Setup or manage Asaas webhooks for this application';

    public function __construct(
        private AsaasManager $asaas,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('list')) {
            return $this->listWebhooks();
        }

        if ($deleteId = $this->option('delete')) {
            return $this->deleteWebhook($deleteId);
        }

        return $this->setupWebhook();
    }

    private function listWebhooks(): int
    {
        $this->info('Fetching webhooks from Asaas...');

        try {
            $response = $this->asaas->webhooks()->list();
            $webhooks = $response['data'] ?? [];

            if (empty($webhooks)) {
                $this->warn('No webhooks configured.');

                return self::SUCCESS;
            }

            $this->table(
                ['ID', 'Name', 'URL', 'Enabled', 'Events'],
                collect($webhooks)->map(fn ($w) => [
                    $w['id'],
                    $w['name'] ?? '-',
                    $w['url'],
                    $w['enabled'] ? 'Yes' : 'No',
                    count($w['events'] ?? []),
                ])->toArray(),
            );

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Failed to list webhooks: ' . $e->getMessage());

            return self::FAILURE;
        }
    }

    private function deleteWebhook(string $id): int
    {
        $this->info("Deleting webhook {$id}...");

        try {
            if ($this->asaas->webhooks()->delete($id)) {
                $this->info('Webhook deleted successfully.');

                return self::SUCCESS;
            }

            $this->error('Failed to delete webhook.');

            return self::FAILURE;
        } catch (\Throwable $e) {
            $this->error('Failed to delete webhook: ' . $e->getMessage());

            return self::FAILURE;
        }
    }

    private function setupWebhook(): int
    {
        $url = $this->option('url') ?: $this->asaas->webhooks()->getAppWebhookUrl();

        $this->info('Setting up Asaas webhook...');
        $this->line("URL: {$url}");

        $events = $this->asaas->webhooks()::ALL_RECOMMENDED_EVENTS;
        $this->line('Events: ' . count($events) . ' configured');

        if (! $this->confirm('Do you want to create/update this webhook?', true)) {
            $this->warn('Operation cancelled.');

            return self::SUCCESS;
        }

        try {
            $authToken = config('payments.gateways.asaas.webhook_secret');

            if (empty($authToken)) {
                $this->warn('ASAAS_WEBHOOK_SECRET is not configured. Webhook will be created without authentication token.');
                $this->line('It is recommended to set ASAAS_WEBHOOK_SECRET in your .env file for security.');
            }

            $result = $this->asaas->webhooks()->createOrUpdate(
                url: $url,
                events: $events,
                authToken: $authToken,
            );

            $this->info('Webhook configured successfully!');
            $this->table(
                ['Property', 'Value'],
                [
                    ['ID', $result['id'] ?? '-'],
                    ['Name', $result['name'] ?? '-'],
                    ['URL', $result['url'] ?? '-'],
                    ['Enabled', ($result['enabled'] ?? false) ? 'Yes' : 'No'],
                    ['Events', count($result['events'] ?? [])],
                    ['Has Auth Token', ($result['hasAuthToken'] ?? false) ? 'Yes' : 'No'],
                ],
            );

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Failed to setup webhook: ' . $e->getMessage());

            return self::FAILURE;
        }
    }
}
