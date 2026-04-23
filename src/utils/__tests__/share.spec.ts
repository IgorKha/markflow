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
});
