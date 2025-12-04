<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct() {}

    /**
     * list model Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('home');
    }
}
