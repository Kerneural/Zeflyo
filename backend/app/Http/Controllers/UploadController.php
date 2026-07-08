<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    /**
     * Handle file upload.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,avi,mpeg|max:51200', // max 50MB for images/videos
            'image' => 'nullable|file|image|max:5120',
        ]);

        $file = $request->file('file') ?? $request->file('image');

        if ($file && $file->isValid()) {
            // Store the file in public disk, under 'uploads' directory
            $path = $file->store('uploads', 'public');

            // Get public URL
            $url = asset('storage/'.$path);
            
            // Determine type
            $mimeType = $file->getMimeType();
            $type = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

            return response()->json([
                'url' => $url,
                'type' => $type,
                'mime_type' => $mimeType,
                'message' => 'Upload successful',
            ]);
        }

        return response()->json([
            'error' => 'No file uploaded or file is invalid',
        ], 400);
    }
}
