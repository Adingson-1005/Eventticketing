const ENCRYPTION_KEY = '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4';

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function importKey(hexKey) {
    const rawKey = new Uint8Array(hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptPayload(payload) {
    try {
        const key = await importKey(ENCRYPTION_KEY);
        const ivBytes = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
        const encoder = new TextEncoder();
        const plaintextBytes = encoder.encode(JSON.stringify(payload));

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: ivBytes,
                tagLength: 128
            },
            key,
            plaintextBytes
        );

        // Web Crypto API appends the 16-byte authentication tag at the end of the encrypted ciphertext
        const encryptedBytes = new Uint8Array(encryptedBuffer);
        const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - 16);
        const tagBytes = encryptedBytes.slice(encryptedBytes.length - 16);

        return {
            data: arrayBufferToBase64(ciphertextBytes),
            iv: arrayBufferToBase64(ivBytes),
            tag: arrayBufferToBase64(tagBytes)
        };
    } catch (error) {
        console.error("Payload encryption failed:", error);
        throw new Error("Failed to encrypt request payload");
    }
}

export async function decryptPayload(encryptedB64, ivB64, tagB64) {
    try {
        const key = await importKey(ENCRYPTION_KEY);
        const encryptedBytes = new Uint8Array(base64ToArrayBuffer(encryptedB64));
        const tagBytes = new Uint8Array(base64ToArrayBuffer(tagB64));
        const ivBytes = new Uint8Array(base64ToArrayBuffer(ivB64));

        // In Web Crypto API GCM decryption, the authentication tag must be appended to the ciphertext
        const ciphertextAndTag = new Uint8Array(encryptedBytes.length + tagBytes.length);
        ciphertextAndTag.set(encryptedBytes);
        ciphertextAndTag.set(tagBytes, encryptedBytes.length);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivBytes,
                tagLength: 128
            },
            key,
            ciphertextAndTag
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedBuffer));
    } catch (error) {
        console.error("Payload decryption failed:", error);
        throw new Error("Failed to decrypt dashboard data");
    }
}
