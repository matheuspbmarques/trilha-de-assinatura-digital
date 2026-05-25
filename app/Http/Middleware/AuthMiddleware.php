<?php

namespace App\Http\Middleware;

use App\Http\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    private JwtService $jwtService;

    public function __construct() {
        $this->jwtService = new JwtService();
    }

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $route = $request->getPathInfo();
        $hasAccessToken = $request->session()->has('USUARIO_TOKEN');

        if ($hasAccessToken) {
            $accessToken = $request->session()->get('USUARIO_TOKEN');

            $usuario_id = $this->jwtService->verify($accessToken);

            if (!$usuario_id) {
                $request->session()->remove('USUARIO_TOKEN');

                return redirect()->route('auth.sign-in');
            }

            $hasUsuarioId = $request->session()->has('USUARIO_ID');

            if (!$hasUsuarioId) {
                $request->session()->put('USUARIO_ID');
            }

            if ($route == '/auth/sign-in') {
                return redirect()->route('dashboard.home');
            }

            return $next($request);
        }

        if ($route != '/auth/sign-in') {
            return redirect()->route('auth.sign-in');
        }

        return $next($request);
    }
}
