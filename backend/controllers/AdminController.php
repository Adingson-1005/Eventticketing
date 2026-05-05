<?php
require_once __DIR__ . '/../config/jwt.php';

class AdminController {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    private function requireAdmin() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - Admin only']);
            exit();
        }
        return $user;
    }

    // GET /api/admin/events
    public function getEvents() {
        $this->requireAdmin();

        $stmt = $this->conn->prepare("
            SELECT e.*, u.name AS host_name, c.name AS category_name,
            COUNT(r.id) AS registered_count
            FROM events e
            JOIN users u ON e.host_id = u.id
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            GROUP BY e.id
            ORDER BY e.created_at DESC
        ");
        $stmt->execute();
        $events = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'total'   => count($events),
            'events'  => $events
        ]);
    }

    // GET /api/admin/tickets
    public function getTickets() {
        $this->requireAdmin();

        $stmt = $this->conn->prepare("
            SELECT r.*, u.name AS user_name, u.email AS user_email,
            e.title AS event_title, e.start_datetime
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            ORDER BY r.registered_at DESC
        ");
        $stmt->execute();
        $tickets = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'total'   => count($tickets),
            'tickets' => $tickets
        ]);
    }
}
?>