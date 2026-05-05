<?php
// IMPORTANT: In production, store this in environment variable
// Never hardcode in controllers
define('ENCRYPTION_KEY', hex2bin('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'));

class EncryptionUtil {
    public static function encrypt($plaintext) {
        $iv = random_bytes(12); // 12 bytes for GCM
        $tag = '';

        $encrypted = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            ENCRYPTION_KEY,
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
            ENCRYPTION_KEY,
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