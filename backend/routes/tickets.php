<?php
require_once __DIR__ . '/../controllers/TicketController.php';

$ticketController = new TicketController($conn);

switch ($action) {
    case 'book':
        if ($method === 'POST') $ticketController->book();
        else httpError(405, 'Method not allowed');
        break;
    case 'user':
        // GET /api/tickets/user/{user_id}
        if ($method === 'GET') $ticketController->getUserTickets($id);
        else httpError(405, 'Method not allowed');
        break;
    default:
        httpError(404, 'Ticket route not found');
}
?>