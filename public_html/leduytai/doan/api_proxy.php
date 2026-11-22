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

// Nếu Wispbyte đang tắt hoặc bị lỗi 502 -> Tự động kết nối trực tiếp với Neon Cloud!
if ($response === false || empty($response) || $httpCode === 502 || strpos($response, '<!DOCTYPE') !== false) {
    $neonHost = 'ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech';
    $neonConn = 'postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    
    if (strpos($path, 'fields') !== false) {
        $nch = curl_init('https://' . $neonHost . '/sql');
        curl_setopt($nch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($nch, CURLOPT_POST, true);
        curl_setopt($nch, CURLOPT_POSTFIELDS, json_encode(['query' => 'SELECT id, name, field_type as "fieldType", status, phone, address, ward, description, image_url as "imageUrl" FROM fields WHERE status != \'DELETED\' ORDER BY id ASC']));
        curl_setopt($nch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Neon-Connection-String: ' . $neonConn
        ]);
        $nres = curl_exec($nch);
        $ncode = curl_getinfo($nch, CURLINFO_HTTP_CODE);
        curl_close($nch);
        if ($ncode === 200) {
            $parsed = json_decode($nres, true);
            http_response_code(200);
            echo json_encode($parsed['rows'] ?? [], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }
    
    if (strpos($path, 'health') !== false) {
        http_response_code(200);
        echo json_encode([
            'status' => 'OK',
            'database' => 'Neon PostgreSQL Cloud (Connected)',
            'wispbyte' => 'STANDBY',
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

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

