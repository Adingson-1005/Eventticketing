<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/encryption.php';

class TicketController {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // POST /api/tickets/book
    public function book() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data     = json_decode(EncryptionUtil::getDecryptedInput(), true);
        $event_id = $data['event_id'] ?? '';

        if (!$event_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            return;
        }

        $user_id = $user['user_id'];

        $check = $this->conn->prepare("
            SELECT id FROM registrations 
            WHERE event_id = ? AND user_id = ? AND status = 'registered'
        ");
        $check->execute([$event_id, $user_id]);
        if ($check->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Already registered for this event']);
            return;
        }

        $cap = $this->conn->prepare("SELECT capacity FROM events WHERE id = ?");
        $cap->execute([$event_id]);
        $event = $cap->fetch();

        if (!$event) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Event not found']);
            return;
        }

        if ($event['capacity'] !== null) {
            $count = $this->conn->prepare("
                SELECT COUNT(*) as total FROM registrations 
                WHERE event_id = ? AND status = 'registered'
            ");
            $count->execute([$event_id]);
            $total = $count->fetch()['total'];

            if ($total >= $event['capacity']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Event is full']);
                return;
            }
        }

        $ticket_code = strtoupper(uniqid('TKT-'));
        $encTicket = EncryptionUtil::encrypt($ticket_code);

        $stmt = $this->conn->prepare("
            INSERT INTO registrations 
            (event_id, user_id, ticket_code, ticket_encrypted, ticket_iv, ticket_tag) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $event_id, $user_id, $ticket_code,
            $encTicket['encrypted'], $encTicket['iv'], $encTicket['tag']
        ]);

        http_response_code(201);
        echo json_encode([
            'success'     => true,
            'message'     => 'Successfully registered for event!',
            'ticket_code' => $ticket_code
        ]);
    }

    // POST /api/tickets/cancel
    public function cancel() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data     = json_decode(EncryptionUtil::getDecryptedInput(), true);
        $event_id = $data['event_id'] ?? '';

        if (!$event_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            return;
        }

        // Check if registration exists
        $check = $this->conn->prepare("
            SELECT id FROM registrations 
            WHERE event_id = ? AND user_id = ? AND status = 'registered'
        ");
        $check->execute([$event_id, $user['user_id']]);

        if ($check->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Registration not found']);
            return;
        }

        $stmt = $this->conn->prepare("
            UPDATE registrations SET status = 'cancelled'
            WHERE event_id = ? AND user_id = ?
        ");
        $stmt->execute([$event_id, $user['user_id']]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Registration cancelled successfully']);
    }

    // GET /api/tickets/user/{user_id}
    public function getUserTickets($user_id) {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $stmt = $this->conn->prepare("
            SELECT r.*, e.title, e.location, e.start_datetime, e.cover_image_url
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ? AND r.status = 'registered'
            ORDER BY e.start_datetime ASC
        ");
        $stmt->execute([$user_id]);
        $tickets = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(['success' => true, 'tickets' => $tickets]);
    }
}
?>