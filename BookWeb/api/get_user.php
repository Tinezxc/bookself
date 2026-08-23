<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config/db_connect.php';

if (!isset($_GET['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email parameter missing']);
    exit;
}

$email = trim($_GET['email']);

$stmt = $pdo->prepare('SELECT id, email, name, join_date, plan, preferences, stats FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    $user['preferences'] = json_decode($user['preferences'], true);
    $user['stats'] = json_decode($user['stats'], true);
    echo json_encode($user);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
}
?>