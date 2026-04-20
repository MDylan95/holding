<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureRateLimiting();
        $this->configureMorphMap();
        $this->configureScramble();
    }

    /**
     * TDA-C01 — découplage des morph types du namespace App\Models.
     * Les colonnes bookable_type / favorable_type / mediable_type stockent
     * désormais 'vehicle' / 'property' au lieu du FQCN.
     */
    protected function configureMorphMap(): void
    {
        // Non-strict (morphMap) : enregistre les alias sans bloquer les FQCN
        // restants sur d'autres morphs (notifications, etc.).
        Relation::morphMap([
            'vehicle' => \App\Models\Vehicle::class,
            'property' => \App\Models\Property::class,
        ]);
    }

    /**
     * TDA-A04 — limiters nommés utilisés par routes/api.php.
     */
    protected function configureRateLimiting(): void
    {
        // Routes authentifiées génériques (lecture + mutations légères)
        RateLimiter::for('api-authenticated', function (Request $request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });

        // Créations sensibles : bookings, appointments, transactions, favorites, media upload
        RateLimiter::for('api-create', function (Request $request) {
            return Limit::perMinute(10)->by(optional($request->user())->id ?: $request->ip());
        });
    }

    /**
     * BE-2 — Scramble : spec OpenAPI exposée à /api/v1/openapi.json
     * Interface Stoplight Elements à /api/v1/docs (accès local en dev, restreint en prod).
     */
    protected function configureScramble(): void
    {
        Scramble::configure()
            ->withDocumentTransformers(function (\Dedoc\Scramble\Support\Generator\OpenApi $openApi) {
                $openApi->secure(
                    \Dedoc\Scramble\Support\Generator\SecurityScheme::http('bearer')
                );
            });

        Scramble::registerJsonSpecificationRoute('api/v1/openapi.json');
        Scramble::registerUiRoute('api/v1/docs');
    }
}
