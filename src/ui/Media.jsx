import { BadgeCheck } from "lucide-react";

// Curated high-quality, premium, Indian-centric photos from Unsplash
const imageMap = {
  // Ananya Sharma (Fashion)
  "ananya sharma": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
  "ananya-hero": "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&auto=format&fit=crop&q=80",
  "ananya-cover": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop&q=80",
  "ananya-neon-cover": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop&q=80",
  "ananya-cup": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80",
  "ananya-green": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=80",
  "ananya-beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",

  // Rohit Gamer (Gaming)
  "rohit gamer": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
  "rohit-stream": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",

  // Meera Art (Digital Art)
  "meera art": "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&auto=format&fit=crop&q=80",
  "meera-studio": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",

  // Wander With Karan (Travel)
  "wander with karan": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
  "karan-himachal": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",

  // Fit With Neha (Fitness)
  "fit with neha": "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&auto=format&fit=crop&q=80",
  "neha-fit": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",

  // Arjun Fitness
  "arjun fitness": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
  "arjun-gym": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",

  // Others
  "sangeetika": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
  "pooja singh": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
  "tech with dev": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
  "creator squad": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80"
};

function hash(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function imageUrlFor(seed) {
  if (!seed) return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80";
  const s = seed.toString().toLowerCase().trim();
  
  // Direct matches
  if (imageMap[s]) return imageMap[s];
  
  // Partial matches
  if (s.includes("ananya")) {
    if (s.includes("hero") || s.includes("live")) return imageMap["ananya-hero"];
    if (s.includes("cover")) return imageMap["ananya-cover"];
    if (s.includes("cup")) return imageMap["ananya-cup"];
    if (s.includes("green")) return imageMap["ananya-green"];
    if (s.includes("beach")) return imageMap["ananya-beach"];
    return imageMap["ananya sharma"];
  }
  if (s.includes("rohit")) {
    if (s.includes("stream") || s.includes("game") || s.includes("live")) return imageMap["rohit-stream"];
    return imageMap["rohit gamer"];
  }
  if (s.includes("meera")) {
    if (s.includes("studio") || s.includes("art") || s.includes("live")) return imageMap["meera-studio"];
    return imageMap["meera art"];
  }
  if (s.includes("karan") || s.includes("wander")) {
    if (s.includes("himachal") || s.includes("travel") || s.includes("live")) return imageMap["karan-himachal"];
    return imageMap["wander with karan"];
  }
  if (s.includes("neha") || s.includes("fit")) {
    if (s.includes("fit") || s.includes("shoot") || s.includes("gym") || s.includes("live")) return imageMap["neha-fit"];
    return imageMap["fit with neha"];
  }
  if (s.includes("arjun")) {
    if (s.includes("gym")) return imageMap["arjun-gym"];
    return imageMap["arjun fitness"];
  }
  if (s.includes("sangeetika") || s.includes("singer")) return imageMap["sangeetika"];
  if (s.includes("pooja")) return imageMap["pooja singh"];
  if (s.includes("dev") || s.includes("tech")) return imageMap["tech with dev"];
  if (s.includes("squad") || s.includes("group")) return imageMap["creator squad"];

  // Default images based on hashing to keep it dynamic but visual
  const h = hash(s);
  const fallbacks = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80"
  ];
  return fallbacks[h % fallbacks.length];
}

export function Photo({ seed = "", className = "", style, children }) {
  const url = imageUrlFor(seed);
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${url})`, ...style }}
    >
      <div className="absolute inset-0 bg-black/15" />
      {children}
    </div>
  );
}

export function Avatar({ name = "", size = 40, ring, className = "" }) {
  const url = imageUrlFor(name);
  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size, padding: ring ? 2 : 0, background: ring }}
    >
      <div
        className="h-full w-full bg-cover bg-center rounded-full"
        style={{
          backgroundImage: `url(${url})`,
          border: ring ? "2px solid #fff" : "none",
        }}
      />
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
