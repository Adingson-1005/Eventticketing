<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/encryption.php';

class EventController {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // GET /api/events
    public function getAll() {
        $sql = "SELECT e.*, u.name AS host_name, c.name AS category_name,
                COUNT(r.id) AS registered_count
                FROM events e
                JOIN users u ON e.host_id = u.id
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
                WHERE e.status = 'published'
                GROUP BY e.id
                ORDER BY e.start_datetime ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $events = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(['success' => true, 'events' => $events]);
    }

    // GET /api/events/{id}
    public function getOne($id) {
        $stmt = $this->conn->prepare("
            SELECT e.*, u.name AS host_name, c.name AS category_name,
            COUNT(r.id) AS registered_count
            FROM events e
            JOIN users u ON e.host_id = u.id
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            WHERE e.id = ?
            GROUP BY e.id
        ");
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        if (!$event) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Event not found']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'event' => $event]);
    }

    // POST /api/events
    public function create() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data = json_decode(EncryptionUtil::getDecryptedInput(), true);

        $title          = trim($data['title'] ?? '');
        $description    = trim($data['description'] ?? '');
        $location       = trim($data['location'] ?? '');
        $start_datetime = $data['start_datetime'] ?? '';
        $end_datetime   = $data['end_datetime'] ?? null;
        $capacity       = $data['capacity'] ?? null;
        $is_paid        = $data['is_paid'] ?? false;
        $ticket_price   = $data['ticket_price'] ?? 0.00;
        $category_id    = $data['category_id'] ?? null;

        if (!$title || !$start_datetime) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title and start date are required']);
            return;
        }

        $stmt = $this->conn->prepare("
            INSERT INTO events 
            (host_id, category_id, title, description, location, 
            start_datetime, end_datetime, capacity, is_paid, ticket_price) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $user['user_id'], $category_id, $title, $description,
            $location, $start_datetime, $end_datetime,
            $capacity, $is_paid ? 1 : 0, $ticket_price
        ]);

        http_response_code(201);
        echo json_encode([
            'success'  => true,
            'message'  => 'Event created successfully',
            'event_id' => $this->conn->lastInsertId()
        ]);
    }

    // DELETE /api/events/{id}
    public function delete($id) {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        // Check event exists and belongs to this user
        $check = $this->conn->prepare("SELECT host_id FROM events WHERE id = ?");
        $check->execute([$id]);
        $event = $check->fetch();

        if (!$event) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Event not found']);
            return;
        }

        if ($event['host_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You can only delete your own events']);
            return;
        }

        // Cancel all registrations first
        $cancelReg = $this->conn->prepare("
            UPDATE registrations SET status = 'cancelled' WHERE event_id = ?
        ");
        $cancelReg->execute([$id]);

        // Delete the event
        $stmt = $this->conn->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$id]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Event deleted successfully']);
    }

    // GET /api/events/my — get events hosted by logged in user
    public function getMyHostedEvents() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $stmt = $this->conn->prepare("
            SELECT e.*, c.name AS category_name,
            COUNT(r.id) AS registered_count
            FROM events e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
            WHERE e.host_id = ?
            GROUP BY e.id
            ORDER BY e.start_datetime DESC
        ");
        $stmt->execute([$user['user_id']]);
        $events = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(['success' => true, 'events' => $events]);
    }
}
?>