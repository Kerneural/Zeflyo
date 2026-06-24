<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Handle file upload.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|max:5120', // max 5MB image
        ]);

        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            $file = $request->file('file');
            // Store the file in public disk, under 'uploads' directory
            $path = $file->store('uploads', 'public');
            
            // Get public URL
            $url = asset('storage/' . $path);

            return response()->json([
                'url' => $url,
                'message' => 'File uploaded successfully'
            ]);
        }

        return response()->json([
            'error' => 'Invalid file uploaded'
        ], 400);
    }
}
