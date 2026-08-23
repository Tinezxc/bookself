<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email required']);
    exit;
}

$email = trim($data['email']);
$updates = [];

if (isset($data['name']) && trim($data['name'])) {
    $updates['name'] = trim($data['name']);
}
if (isset($data['plan'])) {
    $updates['plan'] = $data['plan'];
}
if (isset($data['preferences'])) {
    $updates['preferences'] = json_encode($data['preferences']);
}
if (isset($data['stats'])) {
    $updates['stats'] = json_encode($data['stats']);
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update']);
    exit;
}

$setParts = [];
$params = [];
foreach ($updates as $field => $value) {
    $setParts[] = "$field = ?";
    $params[] = $value;
}
$params[] = $email;

$sql = "UPDATE users SET " . implode(', ', $setParts) . " WHERE email = ?";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute($params);

if ($success && $stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'Profile updated']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'User not found or no changes made']);
}
?>