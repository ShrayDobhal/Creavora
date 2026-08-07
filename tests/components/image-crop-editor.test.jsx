// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cropImageFile } from "@/components/consumer/ImageCropEditor";

describe("image crop output", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates the selected square crop as a new uploadable file", async () => {
    const drawImage = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage }),
      toBlob: (callback, type) => callback(new Blob([new Uint8Array([1, 2, 3])], { type })),
    };
    const nativeCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => (
      tagName === "canvas" ? canvas : nativeCreateElement(tagName, options)
    ));
    vi.stubGlobal("Image", class MockImage {
      naturalWidth = 1000;
      naturalHeight = 800;
      width = 1000;
      height = 800;
      set src(_value) { queueMicrotask(() => this.onload?.()); }
    });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:crop-source") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    const file = new File([new Uint8Array([1])], "portrait.png", { type: "image/png" });

    const result = await cropImageFile(file, { aspect: 1, zoom: 2, positionX: 50, positionY: 50 });

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe("portrait-cropped.webp");
    expect(result.type).toBe("image/webp");
    expect(canvas).toMatchObject({ width: 400, height: 400 });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 300, 200, 400, 400, 0, 0, 400, 400);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:crop-source");
  });
});
