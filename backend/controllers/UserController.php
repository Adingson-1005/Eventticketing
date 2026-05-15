<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/encryption.php';

class UserController {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // GET /api/users/profile
    public function getProfile() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $stmt = $this->conn->prepare("
            SELECT id, name, email, role, avatar_url, bio,
            phone_encrypted, phone_iv, phone_tag,
            created_at FROM users WHERE id = ?
        ");
        $stmt->execute([$user['user_id']]);
        $profile = $stmt->fetch();

        if (!$profile) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }

        // Decrypt phone if exists
        $phone = null;
        if ($profile['phone_encrypted']) {
            try {
                $phone = EncryptionUtil::decrypt(
                    $profile['phone_encrypted'],
                    $profile['phone_iv'],
                    $profile['phone_tag']
                );
            } catch (Exception $e) {
                $phone = null;
            }
        }

        // Get hosted events count
        $hostedStmt = $this->conn->prepare("
            SELECT COUNT(*) as total FROM events WHERE host_id = ?
        ");
        $hostedStmt->execute([$user['user_id']]);
        $hostedCount = $hostedStmt->fetch()['total'];

        // Get registered events count
        $registeredStmt = $this->conn->prepare("
            SELECT COUNT(*) as total FROM registrations 
            WHERE user_id = ? AND status = 'registered'
        ");
        $registeredStmt->execute([$user['user_id']]);
        $registeredCount = $registeredStmt->fetch()['total'];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'user' => [
                'id'               => $profile['id'],
                'name'             => $profile['name'],
                'email'            => $profile['email'],
                'role'             => $profile['role'],
                'avatar_url'       => $profile['avatar_url'],
                'bio'              => $profile['bio'],
                'phone'            => $phone,
                'created_at'       => $profile['created_at'],
                'hosted_events'    => $hostedCount,
                'registered_events'=> $registeredCount,
            ]
        ]);
    }

    // PUT /api/users/profile
    public function updateProfile() {
        $user = JWT::getFromHeader();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $name   = trim($data['name'] ?? '');
        $bio    = trim($data['bio'] ?? '');
        $phone  = trim($data['phone'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name is required']);
            return;
        }

        // Encrypt phone if provided
        $encPhone = $phone ? EncryptionUtil::encrypt($phone) : null;

        $stmt = $this->conn->prepare("
            UPDATE users SET 
            name = ?,
            bio = ?,
            phone_encrypted = ?,
            phone_iv = ?,
            phone_tag = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $name,
            $bio,
            $encPhone ? $encPhone['encrypted'] : null,
            $encPhone ? $encPhone['iv'] : null,
            $encPhone ? $encPhone['tag'] : null,
            $user['user_id']
        ]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    }
}
?>