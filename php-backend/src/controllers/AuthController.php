<?php
namespace App\controllers;

use PDO;
use App\middleware\AuthMiddleware;
use Exception;

class AuthController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['email']) || empty($input['password'])) {
            throw new Exception('Email and password are required', 400);
        }

        $email = strtolower(trim($input['email']));

        $stmt = $this->db->prepare("SELECT id, email, password_hash FROM public.users WHERE LOWER(email) = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            throw new Exception('Invalid credentials', 401);
        }

        $token = AuthMiddleware::generateToken($user['id'], $user['email']);

        echo json_encode([
            'token' => $token,
            'expires_at' => time() + 86400,
            'user' => ['id' => $user['id'], 'email' => $user['email']]
        ]);
    }

    public function register(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['email']) || empty($input['password'])) {
            throw new Exception('Email and password are required', 400);
        }

        $email = strtolower(trim($input['email']));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format', 400);
        }

        if (strlen($input['password']) < 6) {
            throw new Exception('Password must be at least 6 characters', 400);
        }

        $stmt = $this->db->prepare("SELECT id FROM public.users WHERE LOWER(email) = :email");
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            throw new Exception('Email already registered', 409);
        }

        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);

        $stmt = $this->db->prepare("INSERT INTO public.users (email, password_hash) VALUES (:email, :password_hash) RETURNING id, email");
        $stmt->execute(['email' => $email, 'password_hash' => $passwordHash]);
        $user = $stmt->fetch();

        $token = AuthMiddleware::generateToken($user['id'], $user['email']);

        http_response_code(201);
        echo json_encode([
            'token' => $token,
            'expires_at' => time() + 86400,
            'user' => ['id' => $user['id'], 'email' => $user['email']]
        ]);
    }
}
