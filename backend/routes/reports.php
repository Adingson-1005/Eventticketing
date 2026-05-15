<?php
require_once __DIR__ . '/../controllers/ReportController.php';

$reportController = new ReportController($conn);

switch ($action) {
    case 'ticket-sales':
        if ($method === 'GET') $reportController->ticketSales();
        else httpError(405, 'Method not allowed');
        break;
    case 'event-attendance':
        if ($method === 'GET') $reportController->eventAttendance();
        else httpError(405, 'Method not allowed');
        break;
    default:
        httpError(404, 'Report route not found');
}
?>