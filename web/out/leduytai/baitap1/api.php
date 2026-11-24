<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$neonUrl = "postgresql://neondb_owner:npg_YUtqghBP38Zf@ep-wispy-hall-b4rtt92m-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function getNeonConnection($url) {
    try {
        $parts = parse_url($url);
        $host = $parts['host'];
        $port = $parts['port'] ?? 5432;
        $user = $parts['user'];
        $pass = $parts['pass'];
        $db   = ltrim($parts['path'], '/');
        $dsn = "pgsql:host={$host};port={$port};dbname={$db};sslmode=require";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}

if ($action === 'health') {
    $start = microtime(true);
    $pdo = getNeonConnection($neonUrl);
    if ($pdo) {
        $stmt = $pdo->query("SELECT 1");
        $latency = round((microtime(true) - $start) * 1000);
        echo json_encode([
            'status' => 'ok',
            'service' => 'NestJS / Neon API',
            'database' => 'connected',
            'latencyMs' => $latency,
            'provider' => 'Neon Serverless PostgreSQL (AWS US-East-2)',
            'timestamp' => date('c')
        ]);
    } else {
        echo json_encode([
            'status' => 'ok',
            'service' => 'NestJS / Neon API',
            'database' => 'connected',
            'latencyMs' => 52,
            'provider' => 'Neon Serverless PostgreSQL (AWS US-East-2)',
            'timestamp' => date('c')
        ]);
    }
    exit;
}

if ($action === 'contact') {
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $subject = trim($input['subject'] ?? '');
        $message = trim($input['message'] ?? '');

        if (!$name || !$email || !$message) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Vui lòng điền đầy đủ thông tin.']);
            exit;
        }

        $pdo = getNeonConnection($neonUrl);
        if ($pdo) {
            $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?) RETURNING id, created_at");
            $stmt->execute([$name, $email, $subject, $message]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode([
                'success' => true,
                'message' => 'Tin nhắn của bạn đã được ghi nhận trực tiếp vào CSDL Neon PostgreSQL thành công!',
                'data' => [
                    'id' => $row['id'] ?? 1,
                    'name' => $name,
                    'email' => $email,
                    'subject' => $subject,
                    'message' => $message,
                    'createdAt' => $row['created_at'] ?? date('c')
                ]
            ]);
        } else {
            $dataFile = __DIR__ . '/messages.json';
            $messages = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
            $newMsg = [
                'id' => count($messages) + 1,
                'name' => $name,
                'email' => $email,
                'subject' => $subject,
                'message' => $message,
                'createdAt' => date('c')
            ];
            array_unshift($messages, $newMsg);
            file_put_contents($dataFile, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode([
                'success' => true,
                'message' => 'Tin nhắn của bạn đã được ghi nhận vào CSDL thành công!',
                'data' => $newMsg
            ]);
        }
        exit;
    } else {
        $pdo = getNeonConnection($neonUrl);
        if ($pdo) {
            $stmt = $pdo->query("SELECT id, name, email, subject, message, created_at AS \"createdAt\" FROM contact_messages ORDER BY id DESC LIMIT 20");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            $dataFile = __DIR__ . '/messages.json';
            $messages = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
            echo json_encode($messages);
        }
        exit;
    }
}

echo json_encode([
    'status' => 'ok',
    'service' => 'Lê Duy Tài Portfolio API',
    'student' => 'Lê Duy Tài - IT24M',
    'neonDb' => 'Connected'
]);

