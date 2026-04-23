import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildShareUrl, readSharedContent } from "../share";

function toBase64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

class IdentityStream {
  private controller!: ReadableStreamDefaultController<Uint8Array>;
  private chunks: Uint8Array[] = [];

  readonly readable = new ReadableStream<Uint8Array>({
    start: (controller) => {
      this.controller = controller;
    },
  });

  readonly writable = new WritableStream<Uint8Array>({
    write: (chunk) => {
      this.chunks.push(new Uint8Array(chunk));
    },
    close: () => {
      const size = this.chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const merged = new Uint8Array(size);
      let offset = 0;

      for (const chunk of this.chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      this.controller.enqueue(merged);
      this.controller.close();
    },
  });
}

class IdentityCompressionStream extends IdentityStream {
  constructor(_format: string) {
    super();
  }
}

class IdentityDecompressionStream extends IdentityStream {
  constructor(_format: string) {
    super();
  }
}

class FailingCompressionStream extends IdentityStream {
  constructor(_format: string) {
    super();
  }

  override readonly writable = new WritableStream<Uint8Array>({
    write: () => {
      throw new Error("compression failed");
    },
    close: () => { },
  });
}

describe("share utils", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/share-test");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
  });

  it("builds uncompressed share URL when CompressionStream is unavailable", async () => {
    vi.stubGlobal("CompressionStream", undefined);
    vi.stubGlobal("DecompressionStream", undefined);

    const url = await buildShareUrl("hello world");

    expect(url).toMatch(new RegExp(`^${window.location.origin}/share-test#s=u\\.`));
  });

  it("reads uncompressed payload from hash", async () => {
    const encoded = toBase64url("hello world");
    window.history.replaceState(null, "", `/#s=u.${encoded}`);

    const content = await readSharedContent();

    expect(content).toBe("hello world");
  });

  it("returns null for unsupported compressed mode without streams", async () => {
    vi.stubGlobal("CompressionStream", undefined);
    vi.stubGlobal("DecompressionStream", undefined);

    const encoded = toBase64url("compressed");
    window.history.replaceState(null, "", `/#s=c.${encoded}`);

    const content = await readSharedContent();

    expect(content).toBeNull();
  });

  it("returns null for malformed or unknown payloads", async () => {
    window.history.replaceState(null, "", "/#s=x.invalid");
    await expect(readSharedContent()).resolves.toBeNull();

    window.history.replaceState(null, "", "/#s=u.not-base64%%");
    await expect(readSharedContent()).resolves.toBeNull();

    window.history.replaceState(null, "", "/#not-share");
    await expect(readSharedContent()).resolves.toBeNull();
  });

  it("builds compressed URLs and reads compressed payloads when streams are available", async () => {
    vi.stubGlobal(
      "CompressionStream",
      IdentityCompressionStream as unknown as typeof CompressionStream,
    );
    vi.stubGlobal(
      "DecompressionStream",
      IdentityDecompressionStream as unknown as typeof DecompressionStream,
    );

    const url = await buildShareUrl("compressed content");

    expect(url).toMatch(new RegExp(`^${window.location.origin}/share-test#s=c\\.`));

    const hash = url.slice(url.indexOf("#"));
    window.history.replaceState(null, "", `/share-test${hash}`);

    await expect(readSharedContent()).resolves.toBe("compressed content");
  });

  it("reads legacy compressed payload format when streams are available", async () => {
    vi.stubGlobal(
      "CompressionStream",
      IdentityCompressionStream as unknown as typeof CompressionStream,
    );
    vi.stubGlobal(
      "DecompressionStream",
      IdentityDecompressionStream as unknown as typeof DecompressionStream,
    );

    const compressedUrl = await buildShareUrl("legacy payload");
    const compressedPayload = compressedUrl.split("#s=c.")[1] ?? "";

    window.history.replaceState(null, "", `/#s=${compressedPayload}`);
    await expect(readSharedContent()).resolves.toBe("legacy payload");
  });

  it("falls back to uncompressed URL when compression fails", async () => {
    vi.stubGlobal(
      "CompressionStream",
      FailingCompressionStream as unknown as typeof CompressionStream,
    );
    vi.stubGlobal(
      "DecompressionStream",
      IdentityDecompressionStream as unknown as typeof DecompressionStream,
    );

    const url = await buildShareUrl("fallback text");

    expect(url).toMatch(new RegExp(`^${window.location.origin}/share-test#s=u\\.`));
  });
});
