const HASH_PREFIX = "s=";
const STREAM_TIMEOUT_MS = 1200;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error("Stream operation timed out"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }) as Promise<T>;
}

function supportsCompressionStreams(): boolean {
  return (
    typeof CompressionStream !== "undefined" &&
    typeof DecompressionStream !== "undefined"
  );
}

async function compress(str: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(str);
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();

  await writer.write(data);
  await writer.close();

  const buf = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buf);
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  const normalizedBytes = new Uint8Array(bytes);

  await writer.write(normalizedBytes);
  await writer.close();

  const buf = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buf);
}

function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export async function buildShareUrl(content: string): Promise<string> {
  const utf8 = new TextEncoder().encode(content);

  if (!supportsCompressionStreams()) {
    const uncompressed = toBase64url(utf8);
    return `${location.origin}${location.pathname}#${HASH_PREFIX}u.${uncompressed}`;
  }

  try {
    const compressed = await withTimeout(compress(content), STREAM_TIMEOUT_MS);
    const encoded = toBase64url(compressed);
    return `${location.origin}${location.pathname}#${HASH_PREFIX}c.${encoded}`;
  } catch {
    const uncompressed = toBase64url(utf8);
    return `${location.origin}${location.pathname}#${HASH_PREFIX}u.${uncompressed}`;
  }
}

export async function readSharedContent(): Promise<string | null> {
  const hash = location.hash.slice(1);
  if (!hash.startsWith(HASH_PREFIX)) return null;

  const payload = hash.slice(HASH_PREFIX.length);
  if (!payload) return null;

  const dotIndex = payload.indexOf(".");

  // New format: c.<data> (compressed) or u.<data> (utf8 bytes)
  if (dotIndex > 0) {
    const mode = payload.slice(0, dotIndex);
    const encoded = payload.slice(dotIndex + 1);
    if (!encoded) return null;

    try {
      const bytes = fromBase64url(encoded);
      if (mode === "u") {
        return new TextDecoder().decode(bytes);
      }

      if (mode === "c") {
        if (!supportsCompressionStreams()) return null;
        return await withTimeout(decompress(bytes), STREAM_TIMEOUT_MS);
      }

      return null;
    } catch {
      return null;
    }
  }

  // Legacy format: raw compressed payload without mode prefix.
  try {
    if (!supportsCompressionStreams()) return null;
    const bytes = fromBase64url(payload);
    return await withTimeout(decompress(bytes), STREAM_TIMEOUT_MS);
  } catch {
    return null;
  }
}
