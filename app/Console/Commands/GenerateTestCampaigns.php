<?php

namespace App\Console\Commands;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\User;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Generate test campaigns with various statuses.
 *
 * Usage examples:
 * - Generate 10 campaigns with all statuses: php artisan campaigns:generate
 * - Generate 5 APPROVED campaigns: php artisan campaigns:generate --count=5 --status=approved
 * - Generate campaigns for specific user: php artisan campaigns:generate --user=1
 * - Generate with specific creators: php artisan campaigns:generate --creators=1,2,3
 * - One campaign per status: php artisan campaigns:generate --one-per-status
 */
class GenerateTestCampaigns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:generate
                            {--count=10 : Number of campaigns to generate}
                            {--status= : Specific status (draft, under_review, approved, refused, etc)}
                            {--user= : User ID who owns the campaigns}
                            {--creators= : Comma-separated creator IDs to assign}
                            {--reviewer= : Admin user ID for reviews}
                            {--one-per-status : Generate one campaign for each status}
                            {--with-payment : Mark campaigns as paid}
                            {--clean : Delete all existing test campaigns first}
                            {--delete-all : Delete ALL campaigns (requires confirmation)}
                            {--force : Skip confirmation prompts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate test campaigns with various statuses for testing';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Handle delete-all option first (if no generation is needed)
        if ($this->option('delete-all') && !$this->option('count') && !$this->option('one-per-status')) {
            return $this->deleteAllCampaigns();
        }

        $this->info('🚀 Starting campaign generation...');

        // Delete all campaigns if requested
        if ($this->option('delete-all')) {
            $result = $this->deleteAllCampaigns();
            if ($result === Command::FAILURE) {
                return Command::FAILURE;
            }
        }
        // Or clean only test campaigns
        elseif ($this->option('clean')) {
            $this->cleanTestCampaigns();
        }

        // Get or create users
        $owner = $this->getOwner();
        $reviewer = $this->getReviewer();
        $creators = $this->getCreators();

        if (!$owner) {
            $this->error('❌ Failed to get or create owner user');
            return Command::FAILURE;
        }

        // Determine statuses to generate
        $statuses = $this->getStatusesToGenerate();

        $this->info("📊 Configuration:");
        $this->line("   Owner: {$owner->name} (ID: {$owner->id})");
        $this->line("   Reviewer: {$reviewer->name} (ID: {$reviewer->id})");
        $this->line("   Creators: " . $creators->pluck('name')->join(', '));
        $this->line("   Statuses: " . collect($statuses)->map(fn($s) => $s->value)->join(', '));
        $this->newLine();

        // Generate campaigns
        $createdCount = 0;
        $progressBar = $this->output->createProgressBar(count($statuses));
        $progressBar->start();

        foreach ($statuses as $status) {
            $campaign = $this->createCampaignWithStatus(
                status: $status,
                owner: $owner,
                reviewer: $reviewer,
                creators: $creators,
                withPayment: $this->option('with-payment')
            );

            if ($campaign) {
                $createdCount++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully generated {$createdCount} test campaigns!");
        $this->line("   You can view them at: /admin/campaigns");

        return Command::SUCCESS;
    }

    /**
     * Clean existing test campaigns.
     */
    protected function cleanTestCampaigns(): void
    {
        $this->warn('🧹 Cleaning existing test campaigns...');

        $count = Campaign::where('name', 'like', '[TEST]%')->forceDelete();

        $this->line("   Deleted {$count} test campaigns");
    }

    /**
     * Delete ALL campaigns with confirmation.
     */
    protected function deleteAllCampaigns(): int
    {
        $totalCount = Campaign::withTrashed()->count();

        if ($totalCount === 0) {
            $this->info('ℹ️  No campaigns to delete.');
            return Command::SUCCESS;
        }

        $this->warn('⚠️  WARNING: You are about to delete ALL campaigns!');
        $this->line("   Total campaigns in database: {$totalCount}");
        $this->newLine();

        // Skip confirmation if --force is used
        if (!$this->option('force')) {
            if (!$this->confirm('Are you absolutely sure you want to delete ALL campaigns? This cannot be undone!', false)) {
                $this->info('❌ Operation cancelled.');
                return Command::FAILURE;
            }

            // Double confirmation for safety
            if (!$this->confirm('Last chance! Type "yes" to confirm deletion', false)) {
                $this->info('❌ Operation cancelled.');
                return Command::FAILURE;
            }
        }

        $this->warn('🗑️  Deleting all campaigns...');

        // Delete with progress bar
        $campaigns = Campaign::withTrashed()->get();
        $progressBar = $this->output->createProgressBar($campaigns->count());
        $progressBar->start();

        $deleted = 0;
        foreach ($campaigns as $campaign) {
            $campaign->forceDelete();
            $deleted++;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully deleted {$deleted} campaigns!");

        return Command::SUCCESS;
    }

    /**
     * Get or create campaign owner.
     */
    protected function getOwner(): ?User
    {
        if ($userId = $this->option('user')) {
            return User::find($userId);
        }

        // Get or create a test brand user (campaign owner)
        return User::firstOrCreate(
            ['email' => 'test-brand@ugc.com'],
            [
                'name' => 'Test Brand',
                'password' => bcrypt('password'),
                'account_type' => UserRoleType::BRAND,
            ]
        );
    }

    /**
     * Get or create admin reviewer.
     */
    protected function getReviewer(): User
    {
        if ($reviewerId = $this->option('reviewer')) {
            $reviewer = User::find($reviewerId);
            if ($reviewer) {
                return $reviewer;
            }
        }

        // Get first brand user with admin role or create one
        $admin = User::whereHas('roles', function ($query) {
            $query->where('slug', 'admin');
        })->first();

        if (!$admin) {
            // Fallback: use any brand user or create one
            $admin = User::where('account_type', UserRoleType::BRAND)->first();

            if (!$admin) {
                $admin = User::create([
                    'name' => 'Test Admin',
                    'email' => 'test-admin@ugc.com',
                    'password' => bcrypt('password'),
                    'account_type' => UserRoleType::BRAND,
                ]);
            }
        }

        return $admin;
    }

    /**
     * Get or create test creators.
     */
    protected function getCreators()
    {
        if ($creatorIds = $this->option('creators')) {
            $ids = explode(',', $creatorIds);
            return User::whereIn('id', $ids)->get();
        }

        // Get or create 3 test creators
        $creators = collect();

        for ($i = 1; $i <= 3; $i++) {
            $creator = User::firstOrCreate(
                ['email' => "test-creator{$i}@ugc.com"],
                [
                    'name' => "Test Creator {$i}",
                    'password' => bcrypt('password'),
                    'account_type' => UserRoleType::CREATOR,
                ]
            );
            $creators->push($creator);
        }

        return $creators;
    }

    /**
     * Get statuses to generate.
     */
    protected function getStatusesToGenerate(): array
    {
        if ($this->option('one-per-status')) {
            return CampaignStatus::cases();
        }

        if ($statusValue = $this->option('status')) {
            $status = CampaignStatus::tryFrom($statusValue);
            if (!$status) {
                $this->error("❌ Invalid status: {$statusValue}");
                $this->line("   Available: " . collect(CampaignStatus::cases())->map(fn($s) => $s->value)->join(', '));
                exit(1);
            }

            return array_fill(0, (int) $this->option('count'), $status);
        }

        // Random statuses
        $count = (int) $this->option('count');
        $statuses = [];
        $cases = CampaignStatus::cases();

        for ($i = 0; $i < $count; $i++) {
            $statuses[] = $cases[array_rand($cases)];
        }

        return $statuses;
    }

    /**
     * Create a campaign with specific status.
     */
    protected function createCampaignWithStatus(
        CampaignStatus $status,
        User $owner,
        User $reviewer,
        $creators,
        bool $withPayment
    ): ?Campaign {
        try {
            // Create base campaign
            $campaign = Campaign::create([
                'user_id' => $owner->id,
                'name' => "[TEST] Campaign - {$status->getLabelText()} - " . Str::random(5),
                'description' => "Test campaign in {$status->value} status. Generated for testing purposes.",
                'brand_instagram' => '@test_brand',
                'product_or_service' => 'Test Product',
                'objective' => 'Test Objective',
                'kind' => 'influencers',
                'influencer_post_mode' => 'profile',
                'briefing_mode' => 'has_briefing',
                'content_platforms' => ['instagram', 'tiktok'],
                'creator_profile_type' => 'both',
                'filter_gender' => 'both',
                'slots_to_approve' => 3,
                'price_per_influencer' => rand(300, 1000),
                'applications_open_date' => now(),
                'applications_close_date' => now()->addDays(7),
                'payment_date' => now()->addDays(14),
                'publication_plan' => 'basic',
                'publication_fee' => rand(100, 500),
                'terms_accepted' => true,
                'status' => CampaignStatus::DRAFT, // Start as draft
            ]);

            // Transition to target status with proper data
            $this->transitionToStatus($campaign, $status, $reviewer, $creators, $withPayment);

            return $campaign->fresh();
        } catch (\Exception $e) {
            $this->error("❌ Failed to create campaign: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Transition campaign to target status with proper data.
     */
    protected function transitionToStatus(
        Campaign $campaign,
        CampaignStatus $targetStatus,
        User $reviewer,
        $creators,
        bool $withPayment
    ): void {
        // If already at target status, return
        if ($campaign->status === $targetStatus) {
            return;
        }

        // Define the path to reach target status
        $path = $this->getTransitionPath($targetStatus);

        foreach ($path as $status) {
            match ($status) {
                CampaignStatus::AWAITING_PAYMENT => $this->toAwaitingPayment($campaign, $withPayment),
                CampaignStatus::UNDER_REVIEW => $this->toUnderReview($campaign, $withPayment),
                CampaignStatus::APPROVED => $this->toApproved($campaign, $reviewer, $creators),
                CampaignStatus::REFUSED => $this->toRefused($campaign, $reviewer),
                CampaignStatus::SENT_TO_CREATORS => $this->toSentToCreators($campaign),
                CampaignStatus::IN_PROGRESS => $this->toInProgress($campaign),
                CampaignStatus::COMPLETED => $this->toCompleted($campaign),
                CampaignStatus::CANCELLED => $this->toCancelled($campaign),
                default => null,
            };
        }
    }

    /**
     * Get transition path to reach target status.
     */
    protected function getTransitionPath(CampaignStatus $target): array
    {
        return match ($target) {
            CampaignStatus::DRAFT => [],
            CampaignStatus::AWAITING_PAYMENT => [CampaignStatus::AWAITING_PAYMENT],
            CampaignStatus::UNDER_REVIEW => [CampaignStatus::AWAITING_PAYMENT, CampaignStatus::UNDER_REVIEW],
            CampaignStatus::APPROVED => [CampaignStatus::AWAITING_PAYMENT, CampaignStatus::UNDER_REVIEW, CampaignStatus::APPROVED],
            CampaignStatus::REFUSED => [CampaignStatus::AWAITING_PAYMENT, CampaignStatus::UNDER_REVIEW, CampaignStatus::REFUSED],
            CampaignStatus::SENT_TO_CREATORS => [CampaignStatus::AWAITING_PAYMENT, CampaignStatus::UNDER_REVIEW, CampaignStatus::APPROVED, CampaignStatus::SENT_TO_CREATORS],
            CampaignStatus::IN_PROGRESS => [CampaignStatus::AWAITING_PAYMENT, CampaignStatus::UNDER_REVIEW, CampaignStatus::APPROVED, CampaignStatus::SENT_TO_CREATORS, CampaignStatus::IN_PROGRESS],
            CampaignStatus::COMPLETED => [CampaignStatus::AWAITING_PAYMENT, CampaignStatus::UNDER_REVIEW, CampaignStatus::APPROVED, CampaignStatus::SENT_TO_CREATORS, CampaignStatus::IN_PROGRESS, CampaignStatus::COMPLETED],
            CampaignStatus::CANCELLED => [CampaignStatus::CANCELLED],
        };
    }

    protected function toAwaitingPayment(Campaign $campaign, bool $withPayment): void
    {
        $campaign->update([
            'status' => CampaignStatus::AWAITING_PAYMENT,
            'submitted_at' => now(),
        ]);
    }

    protected function toUnderReview(Campaign $campaign, bool $withPayment): void
    {
        $campaign->update([
            'status' => CampaignStatus::UNDER_REVIEW,
            'reviewed_at' => now(),
            'publication_paid_at' => $withPayment ? now() : null,
            'publication_payment_method' => $withPayment ? 'pix' : null,
        ]);
    }

    protected function toApproved(Campaign $campaign, User $reviewer, $creators): void
    {
        $campaign->approvedCreators()->sync($creators->pluck('id'));

        $campaign->update([
            'status' => CampaignStatus::APPROVED,
            'approved_at' => now(),
            'reviewed_by' => $reviewer->id,
            'approved_creators_count' => $creators->count(),
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);
    }

    protected function toRefused(Campaign $campaign, User $reviewer): void
    {
        $campaign->approvedCreators()->sync([]);

        $campaign->update([
            'status' => CampaignStatus::REFUSED,
            'rejected_at' => now(),
            'rejection_reason' => 'Test refusal reason - This is a test campaign',
            'reviewed_by' => $reviewer->id,
            'approved_at' => null,
            'approved_creators_count' => 0,
        ]);
    }

    protected function toSentToCreators(Campaign $campaign): void
    {
        $campaign->update([
            'status' => CampaignStatus::SENT_TO_CREATORS,
            'publication_paid_at' => $campaign->publication_paid_at ?? now(),
        ]);
    }

    protected function toInProgress(Campaign $campaign): void
    {
        $campaign->update([
            'status' => CampaignStatus::IN_PROGRESS,
            'started_at' => now(),
        ]);
    }

    protected function toCompleted(Campaign $campaign): void
    {
        $campaign->update([
            'status' => CampaignStatus::COMPLETED,
            'completed_at' => now(),
        ]);
    }

    protected function toCancelled(Campaign $campaign): void
    {
        $campaign->update([
            'status' => CampaignStatus::CANCELLED,
            'cancelled_at' => now(),
            'rejection_reason' => 'Test cancellation - This is a test campaign',
        ]);
    }
}
