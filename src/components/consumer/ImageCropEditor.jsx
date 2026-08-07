"use client";

import { Check, Crop, LoaderCircle, X } from "lucide-react";
import { useState } from "react";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("The selected image could not be opened"));
  image.src = source;
});

export async function cropImageFile(file, { aspect, zoom, positionX, positionY }) {
  if (typeof document === "undefined" || typeof URL?.createObjectURL !== "function") return file;
  const source = URL.createObjectURL(file);
  try {
    const image = await loadImage(source);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : naturalWidth / naturalHeight;
    let cropWidth = naturalWidth;
    let cropHeight = cropWidth / safeAspect;
    if (cropHeight > naturalHeight) {
      cropHeight = naturalHeight;
      cropWidth = cropHeight * safeAspect;
    }
    const safeZoom = clamp(Number(zoom) || 1, 1, 3);
    cropWidth /= safeZoom;
    cropHeight /= safeZoom;
    const sourceX = (naturalWidth - cropWidth) * clamp(positionX / 100, 0, 1);
    const sourceY = (naturalHeight - cropHeight) * clamp(positionY / 100, 0, 1);
    const outputScale = Math.min(1, 2048 / Math.max(cropWidth, cropHeight));
    const outputWidth = Math.max(1, Math.round(cropWidth * outputScale));
    const outputHeight = Math.max(1, Math.round(cropHeight * outputScale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext?.("2d");
    if (!context) return file;
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
    const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, 0.88));
    if (!blob) throw new Error("The crop could not be created");
    const extension = outputType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}-cropped.${extension}`, { type: outputType, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function ImageCropEditor({
  file,
  sourceUrl,
  alt = "Selected image preview",
  aspectOptions,
  initialAspect,
  onApply,
  onCancel,
}) {
  const [aspect, setAspect] = useState(initialAspect || aspectOptions[0].value);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  async function applyCrop() {
    if (applying) return;
    setApplying(true);
    setError("");
    try {
      const cropped = await cropImageFile(file, { aspect, zoom, positionX, positionY });
      await onApply(cropped);
    } catch (cropError) {
      setError(cropError?.message || "Unable to crop this image");
    } finally {
      setApplying(false);
    }
  }

  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-3 shadow-sm" aria-label="Crop image">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black"><Crop size={17} className="text-brand-600" /> Adjust image</div>
        <button type="button" onClick={onCancel} aria-label="Close crop editor" className="grid h-9 w-9 place-items-center rounded-full hover:bg-canvas"><X size={17} /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Crop aspect ratio">
        {aspectOptions.map((option) => (
          <button key={option.label} type="button" aria-pressed={aspect === option.value} onClick={() => setAspect(option.value)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${aspect === option.value ? "bg-brand-600 text-white" : "border border-line bg-white"}`}>{option.label}</button>
        ))}
      </div>
      <div className="mx-auto mt-3 grid max-h-[520px] w-full max-w-2xl overflow-hidden rounded-xl bg-neutral-950" style={{ aspectRatio: String(aspect) }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
        <img src={sourceUrl} alt={alt} className="h-full w-full object-cover transition-transform duration-150" style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})` }} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Control label="Zoom" value={zoom} min={1} max={3} step={0.05} onChange={setZoom} />
        <Control label="Move left or right" value={positionX} min={0} max={100} step={1} onChange={setPositionX} />
        <Control label="Move up or down" value={positionY} min={0} max={100} step={1} onChange={setPositionY} />
      </div>
      {error ? <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
        <button type="button" onClick={onCancel} className="min-h-10 rounded-xl border border-line px-4 text-sm font-bold">Keep original</button>
        <button type="button" onClick={applyCrop} disabled={applying} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white disabled:opacity-60">{applying ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Apply crop</button>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, step, onChange }) {
  return (
    <label className="text-xs font-bold text-muted">
      <span>{label}</span>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 block w-full accent-brand-600" />
    </label>
  );
}
