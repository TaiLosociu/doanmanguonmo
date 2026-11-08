<?php
/**
 * API Proxy - Đồ Án Mã Nguồn Mở 2 (Lê Duy Tài & Kpa Trần Quang Thịnh)
 * Giúp Frontend HTTPS trên hosting trường kết nối mượt mà tới Backend Wispbyte HTTP
 * Tránh hoàn toàn lỗi Mixed Content của trình duyệt.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Địa chỉ Wispbyte Backend (Hỗ trợ Cloudflare HTTPS & Direct IP)
$backendUrl = isset($_GET['backend']) && !empty($_GET['backend']) 
    ? $_GET['backend'] 
    : 'https://doanthinhvatai.wispbyte.app';

// Lấy endpoint từ query (?path=...)
$path = isset($_GET['path']) ? $_GET['path'] : (isset($_GET['endpoint']) ? $_GET['endpoint'] : 'api/v1/fields');
$targetUrl = rtrim($backendUrl, '/') . '/' . ltrim($path, '/');

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

// Chuyển tiếp headers
$forwardHeaders = ['Content-Type: application/json'];
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $forwardHeaders[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}
if (isset($_SERVER['HTTP_X_API_KEY'])) {
    $forwardHeaders[] = 'x-api-key: ' . $_SERVER['HTTP_X_API_KEY'];
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

// Chuyển tiếp phương thức và dữ liệu
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
} elseif ($method !== 'GET') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

header('Content-Type: application/json; charset=utf-8');

if ($response === false || empty($response)) {
    http_response_code(503);
    echo json_encode([
        'status' => 'OFFLINE',
        'message' => 'Backend trên Wispbyte hiện đang tắt hoặc chưa bấm START.',
        'target' => $targetUrl,
        'curl_error' => $error
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

http_response_code($httpCode ? $httpCode : 200);
echo $response;
?>

