const ENCRYPTION_KEY = '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4';

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function importKey(hexKey) {
    const rawKey = new Uint8Array(hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        "AES-GCM",
        true,
        ["decrypt"]
    );
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
