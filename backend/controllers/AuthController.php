<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/encryption.php';

class AuthController {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // POST /api/auth/register
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        $name     = trim($data['name'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $phone    = trim($data['phone'] ?? '');

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name, email and password are required']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            return;
        }

        // Check duplicate email
        $check = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
            return;
        }

        // Hash password
        $hashed = password_hash($password, PASSWORD_BCRYPT);

        // Encrypt email and phone
        $encEmail = EncryptionUtil::encrypt($email);
        $encPhone = $phone ? EncryptionUtil::encrypt($phone) : null;

        $stmt = $this->conn->prepare("
            INSERT INTO users 
            (name, email, password, email_encrypted, email_iv, email_tag, phone_encrypted, phone_iv, phone_tag, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'user')
        ");

        $stmt->execute([
            $name,
            $email,
            $hashed,
            $encEmail['encrypted'],
            $encEmail['iv'],
            $encEmail['tag'],
            $encPhone ? $encPhone['encrypted'] : null,
            $encPhone ? $encPhone['iv'] : null,
            $encPhone ? $encPhone['tag'] : null,
        ]);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful'
        ]);
    }

    // POST /api/auth/login
    public function login() {
        $data     = json_decode(file_get_contents("php://input"), true);
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            return;
        }

        // Generate JWT token
        $token = JWT::generate([
            'user_id' => $user['id'],
            'email'   => $user['email'],
            'role'    => $user['role']
        ]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]
        ]);
    }

    // POST /api/auth/logout
    public function logout() {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
?>