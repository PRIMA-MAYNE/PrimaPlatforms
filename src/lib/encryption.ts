// lib/encryption.ts
// AES-256-GCM encryption using Web Crypto API

const ENCRYPTION_KEY_NAME = "class-roll-encryption-key";

export const generateKey = async (): Promise<CryptoKey> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(localStorage.getItem("crypto-secret") || "secret123"),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
};

export const encryptData = async (data: string): Promise<string> => {
  const key = await generateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(data)
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
};

export const decryptData = async (encryptedBase64: string): Promise<string> => {
  const key = await generateKey();
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedBytes = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encryptedBytes
  );

  return new TextDecoder().decode(decrypted);
};
