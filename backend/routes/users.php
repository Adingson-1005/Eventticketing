<?php
require_once __DIR__ . '/../controllers/UserController.php';

$userController = new UserController($conn);

switch ($action) {
    case 'profile':
        if ($method === 'GET') $userController->getProfile();
        else if ($method === 'PUT') $userController->updateProfile();
        else httpError(405, 'Method not allowed');
        break;
    default:
        httpError(404, 'User route not found');
}
?> 