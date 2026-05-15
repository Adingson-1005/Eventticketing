<?php
require_once __DIR__ . '/../controllers/DashboardController.php';

$dashboardController = new DashboardController($conn);

switch ($action) {
    case 'stats':
        if ($method === 'GET') $dashboardController->getStats();
        else httpError(405, 'Method not allowed');
        break;
    default:
        httpError(404, 'Dashboard route not found');
}
?>
