<?php
namespace App\config;

use PDO;
use PDOException;

class Database {
    private static ?Database $instance = null;
    private PDO $connection;

    private function __construct() {
        $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '5432';
        $dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'leadshub';
        $user = $_ENV['DB_USER'] ?? getenv('DB_USER') ?? 'leadshub_user';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? '';

        $sslMode = ($host === 'localhost' || $host === '127.0.0.1' || $host === 'database') 
            ? '' : ';sslmode=require';

        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname$sslMode";

        try {
            $this->connection = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->connection;
    }
}
