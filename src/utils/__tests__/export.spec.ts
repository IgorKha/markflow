import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportHTML, exportMarkdown, exportPDF } from "../export";

describe("export utils", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports HTML with inline styles, fetched linked styles, and fetch-error comment", async () => {
    const inlineStyle = document.createElement("style");
    inlineStyle.textContent = ".inline { color: blue; }";
    document.head.appendChild(inlineStyle);

    const okLink = document.createElement("link");
    okLink.rel = "stylesheet";
    okLink.href = "https://cdn.example.com/ok.css";
    document.head.appendChild(okLink);

    const badLink = document.createElement("link");
    badLink.rel = "stylesheet";
    badLink.href = "https://cdn.example.com/fail.css";
    document.head.appendChild(badLink);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const href = String(input);
        if (href.includes("ok.css")) {
          return Promise.resolve({
            text: () => Promise.resolve(".linked { color: red; }"),
          } as Response);
        }

        return Promise.reject(new Error("network error"));
      }),
    );

    let downloadedBlob: Blob | null = null;
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation((obj: Blob | MediaSource) => {
        downloadedBlob = obj as Blob;
        return "blob:mock-html";
      });
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => { });

    await exportHTML("<h1>Hello</h1>", "share-doc");

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith("blob:mock-html");
    expect(downloadedBlob).not.toBeNull();

    const html = await downloadedBlob!.text();
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain(inlineStyle.outerHTML);
    expect(html).toContain("<style>.linked { color: red; }</style>");
    expect(html).toContain("<!-- could not inline stylesheet: https://cdn.example.com/fail.css -->");
  });

  it("exports markdown into downloadable .md blob", () => {
    let downloadedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((obj: Blob | MediaSource) => {
      downloadedBlob = obj as Blob;
      return "blob:mock-md";
    });
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => { });

    exportMarkdown("# Title\nBody", "note");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith("blob:mock-md");
    expect(downloadedBlob).not.toBeNull();
  });

  it("opens print window and writes printable HTML document for PDF export", async () => {
    const inlineStyle = document.createElement("style");
    inlineStyle.textContent = ".inline { color: green; }";
    document.head.appendChild(inlineStyle);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/print.css";
    document.head.appendChild(link);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        text: () => Promise.resolve(".remote { color: black; }"),
      } as Response),
    );

    const previewEl = document.createElement("div");
    previewEl.innerHTML = "<article><h2>Printable</h2></article>";

    const writeSpy = vi.fn();
    const openSpy = vi.spyOn(window, "open").mockImplementation(
      () =>
        ({
          document: {
            open: vi.fn(),
            write: writeSpy,
            close: vi.fn(),
          },
        }) as unknown as Window,
    );

    await exportPDF(previewEl, "report");

    expect(openSpy).toHaveBeenCalledWith("", "_blank", "width=900,height=700");
    expect(writeSpy).toHaveBeenCalledTimes(1);

    const printedHtml = writeSpy.mock.calls[0]?.[0] as string;
    expect(printedHtml).toContain("<title>report</title>");
    expect(printedHtml).toContain("<article><h2>Printable</h2></article>");
    expect(printedHtml).toContain(inlineStyle.outerHTML);
    expect(printedHtml).toContain("<style>.remote { color: black; }</style>");
  });

  it("alerts user when popup is blocked during PDF export", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => { });
    vi.spyOn(window, "open").mockReturnValue(null);

    const previewEl = document.createElement("div");
    previewEl.innerHTML = "<p>Blocked</p>";

    await exportPDF(previewEl, "blocked");

    expect(alertSpy).toHaveBeenCalledWith(
      "Please allow pop-ups in your browser to export PDF.",
    );
  });
});
