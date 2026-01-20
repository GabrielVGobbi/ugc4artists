<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardAppController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        // Mock data - será substituído por dados reais do banco posteriormente
        $stats = [
            'totalCampaigns' => 142,
            'activeCampaigns' => 38,
            'totalArtists' => 1284,
            'totalBrands' => 76,
            'totalRevenue' => 842350,
            'pendingProposals' => 23,
            'revenueGrowth' => 12.5,
            'campaignsGrowth' => 8.3,
        ];

        $topArtists = [
            [
                'id' => 1,
                'name' => 'Marina Silva',
                'genre' => 'Pop/Eletrônico',
                'avatar' => 'https://ui-avatars.com/api/?name=Marina+Silva&background=FF4D00&color=fff',
                'matchPercentage' => 98,
                'isActive' => true,
                'engagement' => '245K',
            ],
            [
                'id' => 2,
                'name' => 'Pedro Santos',
                'genre' => 'Hip Hop/Trap',
                'avatar' => 'https://ui-avatars.com/api/?name=Pedro+Santos&background=0A0A0A&color=fff',
                'matchPercentage' => 94,
                'isActive' => false,
                'engagement' => '189K',
            ],
            [
                'id' => 3,
                'name' => 'Julia Mendes',
                'genre' => 'MPB/Indie',
                'avatar' => 'https://ui-avatars.com/api/?name=Julia+Mendes&background=FF4D00&color=fff',
                'matchPercentage' => 91,
                'isActive' => true,
                'engagement' => '167K',
            ],
        ];

        $recentCampaigns = [
            [
                'id' => 1,
                'title' => 'Verão Autêntico 2025',
                'brand' => 'Natura',
                'budget' => 'R$ 85.000',
                'status' => 'Live',
                'participants' => 12,
                'thumbnail' => 'https://picsum.photos/seed/campaign1/400/300',
            ],
            [
                'id' => 2,
                'title' => 'Urban Style Collection',
                'brand' => 'Adidas',
                'budget' => 'R$ 120.000',
                'status' => 'Live',
                'participants' => 18,
                'thumbnail' => 'https://picsum.photos/seed/campaign2/400/300',
            ],
        ];

        return Inertia::render('app/dashboard', [
            'stats' => $stats,
            'topArtists' => $topArtists,
            'recentCampaigns' => $recentCampaigns,
        ]);
    }

    public function onboarding(Request $request)
    {
        return Inertia::render('app/onboarding');
    }
}
