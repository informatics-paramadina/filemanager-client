<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/{any}', function (Request $request) {
    if ($request->has('token')) {
        $cookie = cookie(
            "token",
            $request->input('token'),
            $request->input('expiredIn'),
            '/',
            null,
            null,
            false
        );
        return redirect(url(''))->withCookie($cookie);
    }

    return view('react');
})->where('any', '.*');
