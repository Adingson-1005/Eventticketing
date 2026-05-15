<?php
require_once __DIR__ . '/../controllers/EventController.php';

$eventController = new EventController($conn);

switch ($action) {
    case '':
        if ($method === 'GET') $eventController->getAll();
        else if ($method === 'POST') $eventController->create();
        else httpError(405, 'Method not allowed');
        break;
    case 'my':
        // GET /api/events/my
        if ($method === 'GET') $eventController->getMyHostedEvents();
        else httpError(405, 'Method not allowed');
        break;
    default:
        // /api/events/{id}
        if ($method === 'GET') $eventController->getOne($action);
        else if ($method === 'DELETE') $eventController->delete($action);
        else httpError(405, 'Method not allowed');
        break;
}
?>