<?php
require_once 'config/database.php';
require_once 'config/cors.php';

function httpError($code, $message) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$base = '/eventticketing/backend';
$uri = str_replace($base, '', $uri);
$uri = trim($uri, '/');

$parts = explode('/', $uri);

$resource = $parts[1] ?? '';
$action   = $parts[2] ?? '';
$id       = $parts[3] ?? '';

switch ($resource) {
    case 'auth':
        require_once 'routes/auth.php';
        break;
    case 'events':
        require_once 'routes/events.php';
        break;
    case 'tickets':
        require_once 'routes/tickets.php';
        break;
    case 'users':
        require_once 'routes/users.php';
        break;
    case 'admin':
        require_once 'routes/admin.php';
        break;
    case 'reports':
        require_once 'routes/reports.php';
        break;
    default:
        httpError(404, 'Route not found');
}
?>