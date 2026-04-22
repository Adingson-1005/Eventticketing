<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($action) {
    case 'create':
        createEvent($conn);
        break;
    case 'all':
        getAllEvents($conn);
        break;
    case 'single':
        getSingleEvent($conn);
        break;
    case 'delete':
        deleteEvent($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
}

// ─── CREATE EVENT ─────────────────────────────────────
function createEvent($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    $host_id        = $data['host_id'] ?? '';
    $title          = trim($data['title'] ?? '');
    $description    = trim($data['description'] ?? '');
    $location       = trim($data['location'] ?? '');
    $start_datetime = $data['start_datetime'] ?? '';
    $end_datetime   = $data['end_datetime'] ?? '';
    $capacity       = $data['capacity'] ?? null;
    $is_paid        = $data['is_paid'] ?? false;
    $ticket_price   = $data['ticket_price'] ?? 0.00;
    $category_id    = $data['category_id'] ?? null;

    if (!$host_id || !$title || !$start_datetime) {
        echo json_encode(["success" => false, "message" => "Host, title and start date are required"]);
        return;
    }

    $stmt = $conn->prepare("INSERT INTO events 
        (host_id, category_id, title, description, location, start_datetime, end_datetime, capacity, is_paid, ticket_price) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param(
        "iisssssiid",
        $host_id, $category_id, $title, $description,
        $location, $start_datetime, $end_datetime,
        $capacity, $is_paid, $ticket_price
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Event created successfully",
            "event_id" => $conn->insert_id
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create event"]);
    }
}

// ─── GET ALL EVENTS ───────────────────────────────────
function getAllEvents($conn) {
    $sql = "SELECT e.*, u.name AS host_name, c.name AS category_name
            FROM events e
            JOIN users u ON e.host_id = u.id
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.status = 'published'
            ORDER BY e.start_datetime ASC";

    $result = $conn->query($sql);
    $events = [];

    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }

    echo json_encode(["success" => true, "events" => $events]);
}

// ─── GET SINGLE EVENT ─────────────────────────────────
function getSingleEvent($conn) {
    $id = $_GET['id'] ?? '';

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Event ID is required"]);
        return;
    }

    $stmt = $conn->prepare("SELECT e.*, u.name AS host_name, c.name AS category_name
            FROM events e
            JOIN users u ON e.host_id = u.id
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.id = ?");

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Event not found"]);
        return;
    }

    echo json_encode(["success" => true, "event" => $result->fetch_assoc()]);
}

// ─── DELETE EVENT ─────────────────────────────────────
function deleteEvent($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? '';

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Event ID is required"]);
        return;
    }

    $stmt = $conn->prepare("DELETE FROM events WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Event deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete event"]);
    }
}
?>