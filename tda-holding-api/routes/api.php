<?php

use Illuminate\Support\Facades\Route;

// BE-2 : toutes les routes actives sont désormais sous /api/v1/* (voir api_v1.php).
// Les anciens clients qui appellent /api/* (sans version) reçoivent 410 Gone.
Route::fallback(fn () => response()->json([
    'message' => 'Cette version de l\'API n\'est plus disponible. Utilisez /api/v1/*.',
    'docs'    => '/api/v1/openapi.json',
], 410));
