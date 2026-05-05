<?php
require_once __DIR__ . '/../controllers/AuthController.php';

$authController = new AuthController($conn);

switch ($action) {
    case 'register':
        if ($method === 'POST') $authController->register();
        else httpError(405, 'Method not allowed');
        break;
    case 'login':
        if ($method === 'POST') $authController->login();
        else httpError(405, 'Method not allowed');
        break;
    case 'logout':
        if ($method === 'POST') $authController->logout();
        else httpError(405, 'Method not allowed');
        break;
    default:
        httpError(404, 'Auth route not found');
}

function httpError($code, $message) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}
?>