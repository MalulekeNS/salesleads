<?php
namespace App\middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware {
    public static function authenticate(): string {
        $headers = getallheaders();
        $authHeader = '';
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            throw new Exception('Unauthorized: No token provided', 401);
        }

        $token = $matches[1];

        try {
            $secret = self::getJwtSecret();
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            return $decoded->sub;
        } catch (Exception $e) {
            throw new Exception('Unauthorized: Invalid token', 401);
        }
    }

    public static function generateToken(string $userId, string $email): string {
        $issuedAt = time();
        $expiresAt = $issuedAt + (60 * 60 * 24);

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'sub' => $userId,
            'email' => $email
        ];

        return JWT::encode($payload, self::getJwtSecret(), 'HS256');
    }

    private static function getJwtSecret(): string {
        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? '';
        if (empty($secret) || strlen($secret) < 32) {
            throw new Exception('JWT_SECRET must be at least 32 characters', 500);
        }
        return $secret;
    }
}
