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

    public static function getDecryptedInput() {
        static $input = null;
        if ($input !== null) {
            return $input;
        }

        $rawInput = file_get_contents("php://input");
        if (empty($rawInput)) {
            $input = '';
            return $input;
        }

        $data = json_decode($rawInput, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($data) && isset($data['a'])) {
            try {
                $envelopeStr = base64_decode($data['a']);
                $envelope = json_decode($envelopeStr, true);
                if (is_array($envelope) && isset($envelope['data'], $envelope['iv'], $envelope['tag'])) {
                    $decrypted = self::decrypt($envelope['data'], $envelope['iv'], $envelope['tag']);
                    $input = $decrypted;
                    return $input;
                }
            } catch (Exception $e) {
                // Decryption failed or not encrypted, fallback to raw
            }
        }

        $input = $rawInput;
        return $input;
    }
}
?>