<?php
require_once __DIR__ . '/bootstrap.php';

class EncryptionUtil {
    private static function getKey(): string {
        return hex2bin($_ENV['ENCRYPTION_KEY']);
    }

    public static function encrypt($plaintext) {
        $iv  = random_bytes(12); // 12 bytes for GCM
        $tag = '';

        $encrypted = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            self::getKey(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16
        );

        if ($encrypted === false) {
            throw new Exception('Encryption failed');
        }

        return [
            'encrypted' => base64_encode($encrypted),
            'iv'        => base64_encode($iv),
            'tag'       => base64_encode($tag)
        ];
    }

    public static function decrypt($encrypted, $iv, $tag) {
        $decrypted = openssl_decrypt(
            base64_decode($encrypted),
            'aes-256-gcm',
            self::getKey(),
            OPENSSL_RAW_DATA,
            base64_decode($iv),
            base64_decode($tag)
        );

        if ($decrypted === false) {
            throw new Exception('Decryption failed');
        }

        return $decrypted;
    }
}
?>