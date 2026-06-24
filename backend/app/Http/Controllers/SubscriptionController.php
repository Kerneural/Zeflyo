<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Get the listing of available subscription plans.
     */
    public function getPlans()
    {
        return response()->json([
            [ "id" => "free",     "name" => "Free",     "price" => 0,       "currency" => "VND", "period" => "month" ],
            [ "id" => "pro",      "name" => "Pro",      "price" => 299000,  "currency" => "VND", "period" => "month", "recommended" => true ],
            [ "id" => "business", "name" => "Business", "price" => null,    "currency" => null,  "contact" => true ]
        ]);
    }

    /**
     * Get the authenticated user's current subscription.
     */
    public function getSubscription(Request $request)
    {
        // Currently static response as requested
        return response()->json([
            'plan' => 'free',
            'expires_at' => null
        ]);
    }
}
