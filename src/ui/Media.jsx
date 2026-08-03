import { BadgeCheck } from "lucide-react";

/**
 * The source mockups use photographic imagery we can't ship, so every photo and
 * avatar renders as a deterministic gradient derived from its seed string. Same
 * seed always yields the same colours, which keeps a person's avatar consistent
 * across every screen.
 */
function hash(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function gradientFor(seed, dark = false) {
  const h = hash(seed);
  const a = h % 360;
  const b = (a + 40 + (h % 60)) % 360;
  const l1 = dark ? 26 : 62;
  const l2 = dark ? 14 : 44;
  return `linear-gradient(135deg, hsl(${a} 62% ${l1}%), hsl(${b} 58% ${l2}%))`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Photo({ seed = "", dark = false, className = "", style, children }) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 ${className}`}
      style={{ backgroundImage: gradientFor(seed, dark), ...style }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,.28),transparent_60%)]" />
      {children}
    </div>
  );
}

export function Avatar({ name = "", size = 40, ring, className = "" }) {
  return (
    <div
      className={`relative shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size, padding: ring ? 2 : 0, background: ring }}
    >
      <div
        className="grid h-full w-full place-items-center rounded-full font-bold text-white"
        style={{
          backgroundImage: gradientFor(name),
          fontSize: Math.max(9, size * 0.36),
          border: ring ? "2px solid #fff" : "none",
        }}
      >
        {initials(name)}
      </div>
    </div>
  );
}

export function Verified({ size = 15, className = "" }) {
  return (
    <BadgeCheck
      size={size}
      className={`shrink-0 fill-[#4f7dff] text-white ${className}`}
    />
  );
}
