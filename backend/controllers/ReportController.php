<?php
require_once __DIR__ . '/../config/jwt.php';

class ReportController {
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

    // GET /api/reports/ticket-sales
    public function ticketSales() {
        $this->requireAdmin();

        // Total tickets
        $total = $this->conn->query("
            SELECT COUNT(*) as total FROM registrations WHERE status = 'registered'
        ")->fetch()['total'];

        // Paid tickets revenue
        $revenue = $this->conn->query("
            SELECT COALESCE(SUM(e.ticket_price), 0) as revenue
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.status = 'registered' AND e.is_paid = 1
        ")->fetch()['revenue'];

        // Tickets per event
        $perEvent = $this->conn->query("
            SELECT e.title, e.is_paid, e.ticket_price,
            COUNT(r.id) as tickets_sold,
            e.capacity,
            COALESCE(SUM(e.ticket_price), 0) as total_revenue
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            GROUP BY e.id
            ORDER BY tickets_sold DESC
        ")->fetchAll();

        // Monthly sales
        $monthly = $this->conn->query("
            SELECT DATE_FORMAT(r.registered_at, '%Y-%m') as month,
            COUNT(*) as tickets
            FROM registrations r
            WHERE r.status = 'registered'
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        ")->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success'        => true,
            'total_tickets'  => $total,
            'total_revenue'  => $revenue,
            'per_event'      => $perEvent,
            'monthly_sales'  => $monthly
        ]);
    }

    // GET /api/reports/event-attendance
    public function eventAttendance() {
        $this->requireAdmin();

        // Overall stats
        $stats = $this->conn->query("
            SELECT 
            COUNT(DISTINCT e.id) as total_events,
            COUNT(DISTINCT r.user_id) as total_attendees,
            COUNT(r.id) as total_registrations
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
        ")->fetch();

        // Per event attendance
        $perEvent = $this->conn->query("
            SELECT e.id, e.title, e.start_datetime, e.capacity,
            COUNT(r.id) as attendees,
            CASE 
                WHEN e.capacity IS NULL THEN 'Unlimited'
                WHEN COUNT(r.id) >= e.capacity THEN 'Full'
                ELSE 'Available'
            END as status
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            GROUP BY e.id
            ORDER BY e.start_datetime DESC
        ")->fetchAll();

        // Top attendees
        $topAttendees = $this->conn->query("
            SELECT u.name, u.email, COUNT(r.id) as events_attended
            FROM users u
            JOIN registrations r ON u.id = r.user_id AND r.status = 'registered'
            GROUP BY u.id
            ORDER BY events_attended DESC
            LIMIT 10
        ")->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success'       => true,
            'stats'         => $stats,
            'per_event'     => $perEvent,
            'top_attendees' => $topAttendees
        ]);
    }
}
?>