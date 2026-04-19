<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

/**
 * TDA-C04 — helpers de requête cross-DB.
 *
 * `ilike` est PostgreSQL-only. En SQLite (dev/tests) les recherches admin plantent.
 * Cette classe expose des helpers qui fonctionnent sur les deux SGBD.
 */
class QueryHelpers
{
    /**
     * Filtre insensible à la casse sur une colonne, compatible SQLite + PostgreSQL.
     *
     * @param  Builder  $query
     * @param  string   $column  nom de colonne (doit être contrôlé par l'appelant, pas d'input user)
     * @param  string   $value   valeur recherchée (sans % ; l'helper les ajoute)
     */
    public static function whereILike(Builder $query, string $column, string $value): Builder
    {
        return $query->whereRaw("LOWER({$column}) LIKE ?", ['%' . mb_strtolower($value) . '%']);
    }

    /**
     * Variante pour un orWhere.
     */
    public static function orWhereILike(Builder $query, string $column, string $value): Builder
    {
        return $query->orWhereRaw("LOWER({$column}) LIKE ?", ['%' . mb_strtolower($value) . '%']);
    }
}
