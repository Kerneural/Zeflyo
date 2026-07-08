<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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

            // Get absolute path to optimize in-place if it is an image
            $absolutePath = Storage::disk('public')->path($path);
            $mimeType = $file->getMimeType();
            $type = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

            if ($type === 'image' && in_array($mimeType, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])) {
                $originalSize = @filesize($absolutePath);
                
                // Compress image in-place
                if ($this->compressImage($absolutePath, $absolutePath, $mimeType)) {
                    clearstatcache();
                    $compressedSize = @filesize($absolutePath);
                    Log::info("Image compressed: {$path} from {$originalSize} bytes to {$compressedSize} bytes");
                }
            }

            // Get public URL
            $url = asset('storage/'.$path);

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

    /**
     * Compress and optimize image using GD library
     */
    private function compressImage($sourcePath, $targetPath, $mimeType)
    {
        if (!extension_loaded('gd') || !function_exists('imagecreatetruecolor')) {
            return false;
        }

        try {
            switch ($mimeType) {
                case 'image/jpeg':
                case 'image/jpg':
                    if (!function_exists('imagecreatefromjpeg')) return false;
                    $image = @imagecreatefromjpeg($sourcePath);
                    break;
                case 'image/png':
                    if (!function_exists('imagecreatefrompng')) return false;
                    $image = @imagecreatefrompng($sourcePath);
                    break;
                case 'image/webp':
                    if (!function_exists('imagecreatefromwebp')) return false;
                    $image = @imagecreatefromwebp($sourcePath);
                    break;
                default:
                    return false;
            }

            if (!$image) {
                return false;
            }

            $width = imagesx($image);
            $height = imagesy($image);
            $maxWidth = 2048;

            // Downscale if image is exceptionally large
            if ($width > $maxWidth) {
                $newWidth = $maxWidth;
                $newHeight = (int) floor($height * ($maxWidth / $width));
                $resized = imagecreatetruecolor($newWidth, $newHeight);

                if ($mimeType === 'image/png') {
                    imagealphablending($resized, false);
                    imagesavealpha($resized, true);
                }

                imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($image);
                $image = $resized;
            }

            $success = false;
            if ($mimeType === 'image/png') {
                if (!function_exists('imagepng')) return false;
                // Compresses PNG (0 to 9, 6 is balanced default)
                $success = @imagepng($image, $targetPath, 6);
            } else {
                // Compresses JPEG/WebP (Quality 75% gives huge savings with negligible quality loss)
                if ($mimeType === 'image/webp') {
                    if (!function_exists('imagewebp')) return false;
                    $success = @imagewebp($image, $targetPath, 75);
                } else {
                    if (!function_exists('imagejpeg')) return false;
                    $success = @imagejpeg($image, $targetPath, 75);
                }
            }

            imagedestroy($image);
            return $success;
        } catch (\Exception $e) {
            Log::error("Failed to compress image {$sourcePath}: " . $e->getMessage());
            return false;
        }
    }
}
