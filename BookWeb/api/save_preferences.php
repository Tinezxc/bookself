<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? null;
$genres = $input['genres'] ?? '';
$languages = $input['languages'] ?? '';

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

// Insert or update user_preferences
$sql = "INSERT INTO user_preferences (user_id, genres, languages) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE genres = VALUES(genres), languages = VALUES(languages)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([$userId, $genres, $languages]);

// Also update users.preferences JSON column (for profile page)
$prefsJson = json_encode(['genres' => explode(',', $genres), 'languages' => explode(',', $languages)]);
$stmt2 = $pdo->prepare("UPDATE users SET preferences = ? WHERE id = ?");
$stmt2->execute([$prefsJson, $userId]);

if ($success) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'DB error: ' . $stmt->errorInfo()[2]]);
}
?>