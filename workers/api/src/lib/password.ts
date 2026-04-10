const PBKDF2_ITERATIONS = 100000;
const HASH_ALGO = "SHA-256";
const KEY_LENGTH = 32;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return toBase64(new Uint8Array(derivedBits));
}

export function isLegacyPasswordHash(storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;
  return !storedHash.startsWith("pbkdf2$");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${hash}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!storedHash) {
    return { valid: false, needsRehash: false };
  }

  if (isLegacyPasswordHash(storedHash)) {
    const valid = storedHash === btoa(password);
    return { valid, needsRehash: valid };
  }

  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return { valid: false, needsRehash: false };
  }

  const salt = fromBase64(parts[2]);
  const expected = parts[3];
  const actual = await derive(password, salt);

  return {
    valid: timingSafeEqual(actual, expected),
    needsRehash: false
  };
}
