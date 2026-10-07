<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\JsonResponse;

class FoodController extends Controller
{
    public function index(): JsonResponse
    {
        $foods = Food::query()->orderBy('id')->get()->map(function (Food $food) {
            return [
                '_id' => (string) $food->id,
                'id' => $food->id,
                'name' => $food->name,
                'description' => $food->description,
                'price' => $food->price,
                'category' => $food->category,
                'image' => '/food-images/'.$food->image,
            ];
        });

        return response()->json(['data' => $foods]);
    }
}
