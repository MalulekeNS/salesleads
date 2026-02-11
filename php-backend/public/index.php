<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\config\Database;
use App\middleware\AuthMiddleware;
use App\controllers\AuthController;
use App\controllers\LeadController;

if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');

$segments = explode('/', $uri);
if (isset($segments[0]) && $segments[0] === 'api') array_shift($segments);
if (isset($segments[0]) && $segments[0] === 'public') array_shift($segments);

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

try {
    $db = Database::getInstance()->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

try {
    switch ($resource) {
        case 'auth':
            $controller = new AuthController($db);
            if ($id === 'login' && $method === 'POST') {
                $controller->login();
            } elseif ($id === 'register' && $method === 'POST') {
                $controller->register();
            } else {
                throw new Exception('Not Found', 404);
            }
            break;

        case 'leads':
            $userId = AuthMiddleware::authenticate();
            $controller = new LeadController($db, $userId);

            if ($id === null) {
                match ($method) {
                    'GET' => $controller->index(),
                    'POST' => $controller->store(),
                    default => throw new Exception('Method Not Allowed', 405)
                };
            } else {
                match ($method) {
                    'GET' => $controller->show($id),
                    'PUT' => $controller->update($id),
                    'DELETE' => $controller->destroy($id),
                    default => throw new Exception('Method Not Allowed', 405)
                };
            }
            break;

        case 'health':
            echo json_encode(['status' => 'ok', 'timestamp' => date('c')]);
            break;

        case '':
            echo json_encode([
                'name' => 'LeadsHub API',
                'version' => '1.0.0',
                'endpoints' => [
                    'POST /api/auth/login' => 'Authenticate user',
                    'POST /api/auth/register' => 'Register new user',
                    'GET /api/leads' => 'List all leads',
                    'POST /api/leads' => 'Create lead',
                    'GET /api/leads/{id}' => 'Get lead',
                    'PUT /api/leads/{id}' => 'Update lead',
                    'DELETE /api/leads/{id}' => 'Delete lead'
                ]
            ]);
            break;

        default:
            throw new Exception('Not Found', 404);
    }
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    if ($code < 100 || $code > 599) $code = 500;
    http_response_code($code);
    echo json_encode(['error' => $e->getMessage()]);
}
