<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$email = $_GET['email'] ?? null;
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();
if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}
$userId = $user['id'];

$stmt = $pdo->prepare("SELECT genres, languages FROM user_preferences WHERE user_id = ?");
$stmt->execute([$userId]);
$prefs = $stmt->fetch();

if (!$prefs) {
    echo json_encode(['genres' => '', 'languages' => '']);
} else {
    echo json_encode($prefs);
}
?>