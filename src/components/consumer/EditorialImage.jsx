/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

export default function EditorialImage({ src, alt, className = "", fallbackLabel = "Image unavailable" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid place-items-center bg-canvas text-sm font-semibold text-muted ${className}`}
      >
        {fallbackLabel}
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}
