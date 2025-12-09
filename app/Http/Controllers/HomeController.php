<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __construct() {}

    /**
     * list model Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('landing-page/index', [
            'canRegister' => Features::enabled(Features::registration()),
            'seo' => [
                'title' => 'UGC para artistas e marcas | UGC4Artists',
                'description' => 'Plataforma que conecta artistas e marcas para campanhas UGC, shows e conteúdos personalizados.',
                'canonical' => 'https://ugc4artists.com.br/',
                'image' => 'https://ugc4artists.com.br/images/og-image.jpg',
            ],
        ])->rootView('landing');
    }

    public function regulamento()
    {
        return view('regulamento');
    }
}
