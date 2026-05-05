<?php
require_once 'config/database.php';
require_once 'config/cors.php';

// Get the request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path
$base = '/eventticketing/backend';
$uri = str_replace($base, '', $uri);
$uri = trim($uri, '/');

// Split URI into parts
$parts = explode('/', $uri);

// Route: /api/resource/...
// $parts[0] = 'api'
// $parts[1] = resource (auth, events, tickets, users, admin, reports)
// $parts[2] = action or id

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
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Route not found']);
}
?>