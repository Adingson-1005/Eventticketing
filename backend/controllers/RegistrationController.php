<?php
require_once '../config/database.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'register':
        registerForEvent($conn);
        break;
    case 'cancel':
        cancelRegistration($conn);
        break;
    case 'my_events':
        getMyEvents($conn);
        break;
    case 'attendees':
        getAttendees($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
}

// ─── REGISTER FOR EVENT ───────────────────────────────
function registerForEvent($conn) {
    $data     = json_decode(file_get_contents("php://input"), true);
    $event_id = $data['event_id'] ?? '';
    $user_id  = $data['user_id'] ?? '';

    if (!$event_id || !$user_id) {
        echo json_encode(["success" => false, "message" => "Event ID and User ID are required"]);
        return;
    }

    // Check if already registered
    $check = $conn->prepare("SELECT id FROM registrations WHERE event_id = ? AND user_id = ?");
    $check->bind_param("ii", $event_id, $user_id);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "You are already registered for this event"]);
        return;
    }

    // Check event capacity
    $cap = $conn->prepare("SELECT capacity FROM events WHERE id = ?");
    $cap->bind_param("i", $event_id);
    $cap->execute();
    $capResult = $cap->get_result()->fetch_assoc();

    if ($capResult['capacity'] !== null) {
        $count = $conn->prepare("SELECT COUNT(*) as total FROM registrations WHERE event_id = ? AND status = 'registered'");
        $count->bind_param("i", $event_id);
        $count->execute();
        $total = $count->get_result()->fetch_assoc()['total'];

        if ($total >= $capResult['capacity']) {
            echo json_encode(["success" => false, "message" => "Sorry, this event is full"]);
            return;
        }
    }

    // Generate unique ticket code
    $ticket_code = strtoupper(uniqid('TKT-'));

    // Insert registration
    $stmt = $conn->prepare("INSERT INTO registrations (event_id, user_id, ticket_code) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $event_id, $user_id, $ticket_code);

    if ($stmt->execute()) {
        echo json_encode([
            "success"      => true,
            "message"      => "Successfully registered for event!",
            "ticket_code"  => $ticket_code
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
}

// ─── CANCEL REGISTRATION ──────────────────────────────
function cancelRegistration($conn) {
    $data     = json_decode(file_get_contents("php://input"), true);
    $event_id = $data['event_id'] ?? '';
    $user_id  = $data['user_id'] ?? '';

    if (!$event_id || !$user_id) {
        echo json_encode(["success" => false, "message" => "Event ID and User ID are required"]);
        return;
    }

    $stmt = $conn->prepare("UPDATE registrations SET status = 'cancelled' WHERE event_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $event_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registration cancelled"]);
    } else {
        echo json_encode(["success" => false, "message" => "Cancellation failed"]);
    }
}

// ─── GET MY REGISTERED EVENTS ─────────────────────────
function getMyEvents($conn) {
    $user_id = $_GET['user_id'] ?? '';

    if (!$user_id) {
        echo json_encode(["success" => false, "message" => "User ID is required"]);
        return;
    }

    $stmt = $conn->prepare("SELECT r.*, e.title, e.location, e.start_datetime, e.cover_image_url
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ? AND r.status = 'registered'
            ORDER BY e.start_datetime ASC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $events = [];
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }

    echo json_encode(["success" => true, "events" => $events]);
}

// ─── GET EVENT ATTENDEES (for hosts) ──────────────────
function getAttendees($conn) {
    $event_id = $_GET['event_id'] ?? '';

    if (!$event_id) {
        echo json_encode(["success" => false, "message" => "Event ID is required"]);
        return;
    }

    $stmt = $conn->prepare("SELECT r.ticket_code, r.registered_at, r.status, u.name, u.email
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.registered_at ASC");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $attendees = [];
    while ($row = $result->fetch_assoc()) {
        $attendees[] = $row;
    }

    echo json_encode(["success" => true, "attendees" => $attendees]);
}
?>