"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  completeImageUpload,
  createPost,
  signImageUpload,
  uploadSignedImage,
} from "@/services/consumer-api";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const UNAVAILABLE_MESSAGE = "Image uploads are not configured yet";
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const canCreateObjectUrl = () => typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

async function imageDimensions(file) {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return { width: 1, height: 1 };
  if (!canCreateObjectUrl() || typeof Image === "undefined") return { width: 1, height: 1 };
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    return { width: image.naturalWidth || image.width || 1, height: image.naturalHeight || image.height || 1 };
  } catch {
    return { width: 1, height: 1 };
  } finally {
    URL.revokeObjectURL(source);
  }
}

async function compressImage(file) {
  if (file.type === "image/webp" || !canCreateObjectUrl() || typeof document === "undefined") return file;
  const dimensions = await imageDimensions(file);
  const maxDimension = 2048;
  const scale = Math.min(1, maxDimension / Math.max(dimensions.width, dimensions.height));
  const width = Math.max(1, Math.round(dimensions.width * scale));
  const height = Math.max(1, Math.round(dimensions.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext?.("2d");
  if (!context) return file;

  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const result = await new Promise((resolve) => canvas.toBlob(resolve, outputType, 0.86));
    if (!result || result.size >= file.size) return file;
    const extension = outputType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([result], `${baseName}.${extension}`, { type: outputType, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function PostComposer({ user, onPublished }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [imageUploadsUnavailable, setImageUploadsUnavailable] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL?.(previewUrl);
  }, [previewUrl]);

  function clearImage() {
    setImage(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL?.(current);
      return "";
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleImageChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setError("");
    if (!imageTypes.has(selected.type)) {
      clearImage();
      setError("Choose a JPEG, PNG, or WebP image");
      return;
    }

    const prepared = await compressImage(selected);
    if (prepared.size > MAX_IMAGE_BYTES) {
      clearImage();
      setError("Image must be 5 MiB or smaller after compression");
      return;
    }

    setImage(prepared);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL?.(current);
      return canCreateObjectUrl() ? URL.createObjectURL(prepared) : "";
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const text = content.trim();
    if (!text || isPublishing) return;
    setError("");
    setIsPublishing(true);
    const controller = new AbortController();
    try {
      let mediaAssetId = null;
      if (image) {
        const dimensions = await imageDimensions(image);
        const intent = await signImageUpload({
          fileName: image.name,
          mimeType: image.type,
          bytes: image.size,
          width: dimensions.width,
          height: dimensions.height,
          kind: "post",
        }, { signal: controller.signal });
        await uploadSignedImage(intent, image, { signal: controller.signal });
        const completed = await completeImageUpload(intent.assetId, { signal: controller.signal });
        mediaAssetId = completed.assetId;
      }
      const post = await createPost({ content: text, mediaAssetId });
      setContent("");
      clearImage();
      onPublished?.(post);
    } catch (publishError) {
      const message = publishError?.message || "Unable to publish post";
      if (message === UNAVAILABLE_MESSAGE) {
        setImageUploadsUnavailable(true);
        clearImage();
      }
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5" aria-label="Create a post">
      <div className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">{user?.name?.slice(0, 1)?.toUpperCase() || "Y"}</span>
        Share an update
      </div>
      <label htmlFor="post-content" className="sr-only">Write a post</label>
      <textarea
        id="post-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share something with your community"
        maxLength={5000}
        rows={3}
        className="mt-3 w-full resize-y rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-500 focus:bg-white"
      />
      {previewUrl ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-line bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img src={previewUrl} alt="Selected image preview" className="max-h-72 w-full object-contain" />
          <button type="button" onClick={clearImage} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/65 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500" aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      ) : image ? <p className="mt-3 text-sm text-muted">{image.name}</p> : null}
      {error ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-ink hover:bg-canvas focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500">
          <ImagePlus size={17} /> Add image
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={imageUploadsUnavailable || isPublishing}
            className="sr-only"
            aria-label="Add image"
          />
        </label>
        <button type="submit" disabled={!content.trim() || isPublishing} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60">
          {isPublishing ? <LoaderCircle size={16} className="animate-spin" /> : null}
          {isPublishing ? "Publishing" : "Publish post"}
        </button>
      </div>
    </form>
  );
}
