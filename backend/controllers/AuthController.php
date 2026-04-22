<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($action) {
    case 'register':  // takes a name, email, and password → hashes the password → saves to the users table
        register($conn);
        break;
    case 'login': //checks the email exists → verifies the password → returns the user's info
                    //Passwords are never stored as plain text — we use password_hash() to keep them safe
        login($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
}

// ─── REGISTER ───────────────────────────────────────
function register($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    $name     = trim($data['name'] ?? '');
    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    // Basic validation
    if (!$name || !$email || !$password) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        return;
    }

    // Check if email already exists
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already registered"]);
        return;
    }

    // Hash the password (never store plain text!)
    $hashed = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashed);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registration successful"]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
}

// ─── LOGIN ───────────────────────────────────────────
function login($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        return;
    }

    // Find user by email
    $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        return;
    }

    $user = $result->fetch_assoc();

    // Verify password
    if (!password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        return;
    }

    // Return user info (never return the password!)
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "id"    => $user['id'],
            "name"  => $user['name'],
            "email" => $user['email'],
            "role"  => $user['role']
        ]
    ]);
}
?>