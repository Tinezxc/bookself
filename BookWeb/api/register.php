<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'], $data['password'], $data['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];
$name = trim($data['name']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$defaultPrefs = json_encode(['genres' => ['Fantasy', 'Mystery'], 'languages' => ['English']]);
$defaultStats = json_encode(['booksRead' => 0, 'currentlyReading' => 0, 'wantToRead' => 0, 'purchases' => 0, 'readingGoal' => ['target' => 20, 'progress' => 0]]);
$joinDate = date('Y-m-d');

$stmt = $pdo->prepare('INSERT INTO users (email, password, name, join_date, plan, preferences, stats) VALUES (?, ?, ?, ?, ?, ?, ?)');
$plan = 'Free';
$success = $stmt->execute([$email, $hashedPassword, $name, $joinDate, $plan, $defaultPrefs, $defaultStats]);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Account created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed']);
}
?>