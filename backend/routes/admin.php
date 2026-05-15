<?php
require_once __DIR__ . '/../controllers/AdminController.php';

$adminController = new AdminController($conn);

switch ($action) {
    case 'events':
        if ($method === 'GET') $adminController->getEvents();
        else httpError(405, 'Method not allowed');
        break;
    case 'tickets':
        if ($method === 'GET') $adminController->getTickets();
        else httpError(405, 'Method not allowed');
        break;
    default:
        httpError(404, 'Admin route not found');
}
?>