<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // BE-2 : chemins couverts par CORS — toute l'API v1 + endpoint CSRF Sanctum SPA.
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // BE-2 : origines autorisées — frontend Next.js prod + dev local.
    // Injecter CORS_ALLOWED_ORIGINS en prod pour surcharger sans modifier ce fichier.
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'https://tdaholding.com,http://localhost:3000')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Obligatoire pour Sanctum SPA (cookies HTTP-only + CSRF token).
    'supports_credentials' => true,

];
