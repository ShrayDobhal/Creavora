"use client";

import { ImagePlus, LoaderCircle, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  completeImageUpload,
  signImageUpload,
  updateProfile,
  uploadSignedImage,
} from "@/services/consumer-api";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 4 * 1024 * 1024;

const canCreateObjectUrl = () => typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

async function hasValidImageSignature(file) {
  if (typeof file.slice !== "function") return false;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

async function dimensionsFor(file) {
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

async function prepareImage(file) {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return file;
  if (!canCreateObjectUrl() || typeof document === "undefined") return file;
  const dimensions = await dimensionsFor(file);
  const scale = Math.min(1, 2048 / Math.max(dimensions.width, dimensions.height));
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
    const baseName = file.name.replace(/\.[^.]+$/, "") || "profile-image";
    const extension = outputType === "image/webp" ? "webp" : "jpg";
    return new File([result], `${baseName}.${extension}`, { type: outputType, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(source);
  }
}

function initialValues(profile) {
  return {
    name: profile.name || "",
    bio: profile.bio || "",
    roleTitle: profile.roleTitle || "",
    location: profile.location || "",
    address: profile.address || "",
    profileVisibility: profile.profileVisibility || "PUBLIC",
  };
}

export function ProfileEditor({ profile, onSaved }) {
  const [values, setValues] = useState(() => initialValues(profile));
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const avatarInput = useRef(null);
  const coverInput = useRef(null);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL?.(avatarPreview);
    if (coverPreview) URL.revokeObjectURL?.(coverPreview);
  }, [avatarPreview, coverPreview]);

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function chooseImage(kind, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!acceptedTypes.has(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image");
      event.target.value = "";
      return;
    }
    if (!(await hasValidImageSignature(file))) {
      setError("The selected file does not contain a valid image");
      event.target.value = "";
      return;
    }
    const prepared = await prepareImage(file);
    if (prepared.size > maxImageBytes) {
      setError("Image must be 4 MiB or smaller after compression");
      event.target.value = "";
      return;
    }
    const setFile = kind === "avatar" ? setAvatarFile : setCoverFile;
    const setPreview = kind === "avatar" ? setAvatarPreview : setCoverPreview;
    setFile(prepared);
    setPreview((current) => {
      if (current) URL.revokeObjectURL?.(current);
      return canCreateObjectUrl() ? URL.createObjectURL(prepared) : "";
    });
  }

  async function uploadAsset(file, kind) {
    if (!file) return null;
    const dimensions = await dimensionsFor(file);
    const intent = await signImageUpload({
      fileName: file.name,
      mimeType: file.type,
      bytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
      kind,
    });
    await uploadSignedImage(intent, file);
    const completed = await completeImageUpload(intent.assetId);
    return completed.publicUrl || intent.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      const [avatar, coverImage] = await Promise.all([
        uploadAsset(avatarFile, "avatar"),
        uploadAsset(coverFile, "cover"),
      ]);
      const saved = await updateProfile({
        name: values.name.trim(),
        bio: values.bio.trim() || null,
        roleTitle: values.roleTitle.trim() || null,
        location: values.location.trim() || null,
        address: values.address.trim() || null,
        profileVisibility: values.profileVisibility,
        ...(avatar ? { avatar } : {}),
        ...(coverImage ? { coverImage } : {}),
      });
      window.dispatchEvent(new CustomEvent("user-update", { detail: saved }));
      setAvatarFile(null);
      setCoverFile(null);
      onSaved?.(saved);
    } catch (saveError) {
      setError(saveError?.message || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-5" aria-label="Profile editor">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-ink">Profile appearance</p>
          <p className="mt-1 text-sm text-muted">Use an image you have permission to share</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold hover:bg-canvas focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500">
            <ImagePlus size={16} /> Avatar
            <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload avatar" onChange={(event) => chooseImage("avatar", event)} disabled={saving} />
          </label>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold hover:bg-canvas focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-visible:outline-brand-500">
            <ImagePlus size={16} /> Cover image
            <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload cover image" onChange={(event) => chooseImage("cover", event)} disabled={saving} />
          </label>
        </div>
      </div>
      {avatarPreview || coverPreview ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {avatarPreview ? <ImagePreview url={avatarPreview} label="Selected avatar" onRemove={() => { setAvatarFile(null); setAvatarPreview(""); if (avatarInput.current) avatarInput.current.value = ""; }} /> : null}
          {coverPreview ? <ImagePreview url={coverPreview} label="Selected cover image" onRemove={() => { setCoverFile(null); setCoverPreview(""); if (coverInput.current) coverInput.current.value = ""; }} /> : null}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" value={values.name} onChange={(value) => updateValue("name", value)} required />
        <Field label="Role" value={values.roleTitle} onChange={(value) => updateValue("roleTitle", value)} />
        <Field label="City / State" value={values.location} onChange={(value) => updateValue("location", value)} />
        <Field label="Address" value={values.address} maxLength={240} onChange={(value) => updateValue("address", value)} />
      </div>
      <div>
        <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-bold text-ink">Bio</label>
        <textarea id="profile-bio" value={values.bio} onChange={(event) => updateValue("bio", event.target.value)} maxLength={500} rows={4} className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white" />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink">Profile visibility</legend>
        <div className="flex flex-wrap gap-3">
          {[{ value: "PUBLIC", label: "Public" }, { value: "FOLLOWERS", label: "Followers" }].map(({ value, label }) => (
            <label key={value} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold">
              <input type="radio" name="profileVisibility" value={value} checked={values.profileVisibility === value} onChange={(event) => updateValue("profileVisibility", event.target.value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {error ? <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
      <div className="flex justify-end border-t border-line pt-4">
        <button type="submit" disabled={saving || values.name.trim().length < 2} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-60">
          {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving profile" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required = false, maxLength }) {
  const id = `profile-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">{label}</label>
      <input id={id} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength ?? (type === "url" ? 2048 : 100)} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand-500 focus:bg-white" />
    </div>
  );
}

function ImagePreview({ url, label, onRemove }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
      <img src={url} alt={label} className="h-32 w-full object-cover" />
      <button type="button" onClick={onRemove} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/65 text-white" aria-label={`Remove ${label}`}><X size={16} /></button>
    </div>
  );
}
