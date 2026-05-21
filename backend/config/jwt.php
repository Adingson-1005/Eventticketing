<?php
require_once __DIR__ . '/bootstrap.php';

class JWT {
    private static function secret(): string {
        return $_ENV['JWT_SECRET'];
    }

    private static function expiry(): int {
        return (int) $_ENV['JWT_EXPIRY'];
    }

    public static function generate($payload) {
        $header = base64_encode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::expiry();
        $payload = base64_encode(json_encode($payload));

        $signature = base64_encode(hash_hmac(
            'sha256',
            "$header.$payload",
            self::secret(),
            true
        ));

        return "$header.$payload.$signature";
    }

    public static function verify($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        [$header, $payload, $signature] = $parts;

        $validSig = base64_encode(hash_hmac(
            'sha256',
            "$header.$payload",
            self::secret(),
            true
        ));

        if ($signature !== $validSig) return false;

        $data = json_decode(base64_decode($payload), true);
        if ($data['exp'] < time()) return false;

        return $data;
    }

    public static function getFromHeader() {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? '';

        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return false;
        }

        $token = substr($auth, 7);
        return self::verify($token);
    }
}
?>