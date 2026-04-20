<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Property;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $this->authorize('create', Media::class);

        $validated = $request->validate([
            'mediable_type' => 'required|in:vehicle,property',
            'mediable_id' => 'required|integer',
            'files' => 'required|array|min:1|max:10',
            'files.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_primary' => 'boolean',
        ]);

        // TDA-C01 : résoudre l'alias morph via Relation::getMorphedModel.
        $mediableClass = \Illuminate\Database\Eloquent\Relations\Relation::getMorphedModel(
            $validated['mediable_type']
        );
        $mediable = $mediableClass::findOrFail($validated['mediable_id']);

        $uploaded = [];

        $disk = config('filesystems.default', 'public');

        foreach ($request->file('files') as $index => $file) {
            $folder = 'uploads/' . $validated['mediable_type'] . 's/' . $validated['mediable_id'];
            $path = $file->store($folder, $disk);

            $media = Media::create([
                'mediable_type' => $validated['mediable_type'],
                'mediable_id' => $mediable->id,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'is_primary' => $index === 0 && ($validated['is_primary'] ?? false),
                'sort_order' => $index,
            ]);

            $uploaded[] = $media;
        }

        return response()->json([
            'message' => count($uploaded) . ' fichier(s) uploadé(s).',
            'media' => $uploaded,
        ], 201);
    }

    public function destroy(Media $media): JsonResponse
    {
        $this->authorize('delete', $media);

        // BE-3 : suppression sur le disk actif (local 'public' ou CDN 'r2').
        $disk = config('filesystems.default', 'public');
        if (Storage::disk($disk)->exists($media->file_path)) {
            Storage::disk($disk)->delete($media->file_path);
        }

        $media->delete();

        return response()->json([
            'message' => 'Fichier supprimé.',
        ]);
    }

    public function setPrimary(Media $media): JsonResponse
    {
        $this->authorize('setPrimary', $media);

        // Retirer le statut primary des autres médias du même parent
        Media::where('mediable_type', $media->mediable_type)
            ->where('mediable_id', $media->mediable_id)
            ->update(['is_primary' => false]);

        $media->update(['is_primary' => true]);

        return response()->json([
            'message' => 'Image principale définie.',
            'media' => $media->fresh(),
        ]);
    }
}
