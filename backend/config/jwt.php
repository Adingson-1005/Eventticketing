<?php
define('JWT_SECRET', 'eventticketing_secret_key_2026_group6');
define('JWT_EXPIRY', 86400); // 24 hours

class JWT {
    public static function generate($payload) {
        $header = base64_encode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $payload = base64_encode(json_encode($payload));

        $signature = base64_encode(hash_hmac(
            'sha256',
            "$header.$payload",
            JWT_SECRET,
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
            JWT_SECRET,
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