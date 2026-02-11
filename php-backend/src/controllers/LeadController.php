<?php
namespace App\controllers;

use PDO;
use Exception;

class LeadController {
    private PDO $db;
    private string $userId;

    public function __construct(PDO $db, string $userId) {
        $this->db = $db;
        $this->userId = $userId;
    }

    public function index(): void {
        $query = "SELECT * FROM public.leads WHERE user_id = :user_id";
        $params = ['user_id' => $this->userId];
        $conditions = [];

        if (!empty($_GET['status'])) {
            $conditions[] = "status = :status";
            $params['status'] = $_GET['status'];
        }
        if (!empty($_GET['search'])) {
            $conditions[] = "(name ILIKE :search OR email ILIKE :search)";
            $params['search'] = '%' . $_GET['search'] . '%';
        }

        if ($conditions) $query .= " AND " . implode(" AND ", $conditions);

        $sortField = $_GET['sort_field'] ?? 'created_at';
        $sortOrder = strtoupper($_GET['sort_order'] ?? 'DESC');
        $allowedFields = ['name', 'email', 'status', 'created_at', 'company'];
        if (in_array($sortField, $allowedFields) && in_array($sortOrder, ['ASC', 'DESC'])) {
            $query .= " ORDER BY $sortField $sortOrder";
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $pageSize = min(100, max(1, (int) ($_GET['page_size'] ?? 10)));
        $offset = ($page - 1) * $pageSize;

        $countQuery = "SELECT COUNT(*) FROM public.leads WHERE user_id = :user_id";
        if ($conditions) $countQuery .= " AND " . implode(" AND ", $conditions);
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->execute($params);
        $totalCount = (int) $countStmt->fetchColumn();

        $query .= " LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($query);
        foreach ($params as $key => $value) $stmt->bindValue($key, $value);
        $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'data' => $stmt->fetchAll(),
            'pagination' => [
                'page' => $page,
                'page_size' => $pageSize,
                'total_count' => $totalCount,
                'total_pages' => ceil($totalCount / $pageSize)
            ]
        ]);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare("SELECT * FROM public.leads WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $this->userId]);
        $lead = $stmt->fetch();
        if (!$lead) throw new Exception('Lead not found', 404);
        echo json_encode($lead);
    }

    public function store(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['name']) || empty($input['email'])) {
            throw new Exception('Name and email are required', 400);
        }

        $stmt = $this->db->prepare("INSERT INTO public.leads (user_id, name, email, status, company, phone, notes) VALUES (:user_id, :name, :email, :status, :company, :phone, :notes) RETURNING *");
        $stmt->execute([
            'user_id' => $this->userId,
            'name' => $input['name'],
            'email' => $input['email'],
            'status' => $input['status'] ?? 'New',
            'company' => $input['company'] ?? null,
            'phone' => $input['phone'] ?? null,
            'notes' => $input['notes'] ?? null
        ]);

        http_response_code(201);
        echo json_encode($stmt->fetch());
    }

    public function update(string $id): void {
        $stmt = $this->db->prepare("SELECT id FROM public.leads WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $this->userId]);
        if (!$stmt->fetch()) throw new Exception('Lead not found', 404);

        $input = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        $params = ['id' => $id, 'user_id' => $this->userId];

        foreach (['name', 'email', 'status', 'company', 'phone', 'notes'] as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = :$field";
                $params[$field] = $input[$field];
            }
        }

        if (empty($fields)) throw new Exception('No fields to update', 400);

        $query = "UPDATE public.leads SET " . implode(", ", $fields) . ", updated_at = NOW() WHERE id = :id AND user_id = :user_id RETURNING *";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        echo json_encode($stmt->fetch());
    }

    public function destroy(string $id): void {
        $stmt = $this->db->prepare("DELETE FROM public.leads WHERE id = :id AND user_id = :user_id RETURNING id");
        $stmt->execute(['id' => $id, 'user_id' => $this->userId]);
        if (!$stmt->fetch()) throw new Exception('Lead not found', 404);
        http_response_code(204);
    }
}
