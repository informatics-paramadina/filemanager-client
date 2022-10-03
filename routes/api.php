<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/getJwt', function (){
    if(\Illuminate\Support\Facades\Cookie::has('token'))
    {
        $cookie = \Illuminate\Support\Facades\Cookie::get('token');
        $kuki = \Illuminate\Support\Facades\Crypt::decrypt($cookie, false);
        return response()->json(['token' => explode("|", $kuki)[1]]);
    }

    return response()->json(['token' => null]);
});

Route::get('/logout', function(){
    return redirect(url(''))->withCookie(cookie("token", null, 0));
});
