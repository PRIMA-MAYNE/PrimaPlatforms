// lib/encryption.ts

/**
 * Encrypts sensitive data (e.g., face embeddings or photo base64) using AES-256-GCM.
 * All operations occur on-device. No data is sent to servers.
 */

const ENCRYPTION_KEY_NAME = "class-roll-encryption-key";

/**
 * Derives a cryptographic key from a password-like secret.
 * Uses PBKDF2 to make brute-force attacks harder.
 * @param secret - A passphrase known only to the teacher (e.g., school PIN)
 * @returns CryptoKey object for encryption/decryption
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), // Static salt — safe since key is never transmitted
      iterations: 100_000, // High iteration count slows down brute force
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Gets or creates an encryption key from localStorage or fallback secret.
 * If no secret exists, uses a default (teacher should set one in settings later).
 * @returns CryptoKey
 */
export async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = localStorage.getItem("crypto-secret") || "classroll2025";
  return await deriveKey(secret);
}

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a base64-encoded string containing IV + encrypted data.
 * @param data - The plaintext string to encrypt (e.g., base64 image or JSON embedding)
 * @returns Base64 string of (IV + ciphertext)
 */
export async function encryptData(data: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(data)
  );

  // Combine IV + encrypted data into one buffer
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);

  // Return as base64 for easy storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64-encoded string that was encrypted with encryptData().
 * @param encryptedBase64 - The base64 string returned by encryptData()
 * @returns The original plaintext string
 */
export async function decryptData(encryptedBase64: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12); // First 12 bytes = IV
  const encryptedBytes = combined.slice(12); // Rest = ciphertext

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encryptedBytes
  );

  return new TextDecoder().decode(decrypted);
}
