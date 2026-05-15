<?php
require_once __DIR__ . '/../config/jwt.php';

class DashboardController {
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

    // GET /api/dashboard/stats
    public function getStats() {
        $this->requireAdmin();

        // Total events
        $totalEvents = $this->conn->query("
            SELECT COUNT(*) as total FROM events
        ")->fetch()['total'];

        // Total users
        $totalUsers = $this->conn->query("
            SELECT COUNT(*) as total FROM users
        ")->fetch()['total'];

        // Total registrations (active)
        $totalRegistrations = $this->conn->query("
            SELECT COUNT(*) as total FROM registrations WHERE status = 'registered'
        ")->fetch()['total'];

        // Total revenue
        $totalRevenue = $this->conn->query("
            SELECT COALESCE(SUM(e.ticket_price), 0) as revenue
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.status = 'registered' AND e.is_paid = 1
        ")->fetch()['revenue'];

        // Events by category
        $categoryCounts = $this->conn->query("
            SELECT c.name as category, COUNT(e.id) as count
            FROM categories c
            LEFT JOIN events e ON c.id = e.category_id
            GROUP BY c.id
            ORDER BY count DESC
        ")->fetchAll();

        // Events list with registration count
        $events = $this->conn->query("
            SELECT e.id, e.title, e.location, e.start_datetime, e.end_datetime,
                   e.capacity, e.is_paid, e.ticket_price, e.status,
                   u.name AS host_name, c.name AS category_name,
                   COUNT(r.id) AS registered_count
            FROM events e
            JOIN users u ON e.host_id = u.id
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            GROUP BY e.id
            ORDER BY e.created_at DESC
        ")->fetchAll();

        // Recent registrations (last 10)
        $recentRegistrations = $this->conn->query("
            SELECT r.id, r.ticket_code, r.status, r.registered_at,
                   u.name AS user_name, u.email AS user_email,
                   e.title AS event_title
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            ORDER BY r.registered_at DESC
            LIMIT 10
        ")->fetchAll();

        // Upcoming events (next 5)
        $upcomingEvents = $this->conn->query("
            SELECT e.id, e.title, e.start_datetime, e.location,
                   COUNT(r.id) AS registered_count
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            WHERE e.start_datetime >= NOW() AND e.status = 'published'
            GROUP BY e.id
            ORDER BY e.start_datetime ASC
            LIMIT 5
        ")->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success'              => true,
            'total_events'         => (int)$totalEvents,
            'total_users'          => (int)$totalUsers,
            'total_registrations'  => (int)$totalRegistrations,
            'total_revenue'        => (float)$totalRevenue,
            'category_counts'      => $categoryCounts,
            'events'               => $events,
            'recent_registrations' => $recentRegistrations,
            'upcoming_events'      => $upcomingEvents
        ]);
    }
}
?>
