<?php
namespace App\models;

class Lead {
    public string $id;
    public string $user_id;
    public string $name;
    public string $email;
    public string $status;
    public ?string $company;
    public ?string $phone;
    public ?string $notes;
    public ?string $display_id;
    public int $lead_number;
    public string $created_at;
    public string $updated_at;
}
