"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  completeImageUpload,
  createPost,
  signImageUpload,
  uploadSignedImage,
} from "@/services/consumer-api";
import { CATEGORY_OPTIONS } from "@/lib/consumer/constants";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const UNAVAILABLE_MESSAGE = "Image uploads are not configured yet";
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const canCreateObjectUrl = () => typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

async function hasValidImageSignature(file) {
  if (typeof file.slice !== "function") return false;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

async function imageDimensions(file) {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return { width: 1080, height: 1080 };
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
  if (!canCreateObjectUrl() || typeof document === "undefined") return file;
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
  const [category, setCategory] = useState("Lifestyle");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [imageUploadsUnavailable, setImageUploadsUnavailable] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInput = useRef(null);
  const previewUrlRef = useRef("");

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL?.(previewUrlRef.current);
  }, []);

  function clearImage() {
    setImage(null);
    if (previewUrlRef.current) URL.revokeObjectURL?.(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
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

    if (!(await hasValidImageSignature(selected))) {
      clearImage();
      setError("The selected file does not contain a valid image");
      return;
    }
    const prepared = await compressImage(selected);
    if (prepared.size > MAX_IMAGE_BYTES) {
      clearImage();
      setError("Image must be 4 MiB or smaller after compression");
      return;
    }

    setImage(prepared);
    if (previewUrlRef.current) URL.revokeObjectURL?.(previewUrlRef.current);
    previewUrlRef.current = canCreateObjectUrl() ? URL.createObjectURL(prepared) : "";
    setPreviewUrl(previewUrlRef.current);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const text = content.trim();
    if (!text || isPublishing) return;
    setError("");
    setUploadProgress(0);
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
        await uploadSignedImage(intent, image, { signal: controller.signal, onProgress: setUploadProgress });
        const completed = await completeImageUpload(intent.assetId, { signal: controller.signal });
        mediaAssetId = completed.assetId;
      }
      const post = await createPost({
        content: text,
        category,
        ...(mediaAssetId ? { mediaAssetId } : {}),
      });
      setContent("");
      setUploadProgress(0);
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
    <form id="create-post" onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5" aria-label="Create a post">
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
      <div className="mt-3">
        <label htmlFor="post-category" className="mb-1.5 block text-xs font-bold text-muted">Category</label>
        <select id="post-category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand-500 sm:max-w-xs">
          {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {previewUrl ? (
        <div className="relative mt-3">
          <div className="grid min-h-48 overflow-hidden rounded-xl border border-line bg-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={previewUrl} alt="Selected image preview" className="max-h-72 min-h-48 w-full object-contain" />
          </div>
          <button type="button" onClick={clearImage} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/75 text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500" aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      ) : image ? <p className="mt-3 text-sm text-muted">{image.name}</p> : null}
      {error ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
      {isPublishing && image ? <div className="mt-3" role="status" aria-label={`Upload ${uploadProgress} percent complete`}><div className="h-2 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${Math.max(6, uploadProgress)}%` }} /></div><p className="mt-1 text-xs font-semibold text-muted">Uploading image {uploadProgress}%</p></div> : null}
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
