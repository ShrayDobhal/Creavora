import { useState } from "react";
import {
  Bookmark,
  ChevronRight,
  Flame,
  Gift,
  Heart,
  Images,
  Lock,
  MessageCircle,
  MoreVertical,
  Play,
  Plus,
  Share2,
  SlidersHorizontal,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, Chip, SectionHead } from "../ui/Bits.jsx";
import { Avatar, Photo, Verified } from "../ui/Media.jsx";
import { creators, feedPosts, hashtags, slug } from "../data.js";

const filters = [
  { label: "For You" },
  { label: "Following", icon: Images },
  { label: "Trending", emoji: "🔥" },
  { label: "New" },
  { label: "Nearby" },
  { label: "Bookmarks", icon: Bookmark },
];

const stories = ["You", "Ananya", "Rohit", "Meera", "Karan"];

function Post({ post }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Link to={`/creator/${slug(post.author)}`}>
          <Avatar name={post.author} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/creator/${slug(post.author)}`}
            className="flex items-center gap-1.5 text-[15px] font-bold hover:underline"
          >
            {post.author} <Verified size={15} />
          </Link>
          <p className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted">
            {post.time}
            {post.premium && (
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                Premium
              </span>
            )}
          </p>
        </div>
        <Link
          to="/checkout"
          className="flex h-9 items-center rounded-lg bg-brand-600 px-4 text-[13px] font-bold text-white hover:bg-brand-700"
        >
          Subscribe
        </Link>
        <button className="grid h-9 w-8 place-items-center rounded-lg text-muted hover:bg-canvas">
          <MoreVertical size={17} />
        </button>
      </div>

      <div className="mt-3 space-y-0.5 text-[14.5px] leading-relaxed">
        {post.body.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {post.gallery && (
        <div className="relative mt-3">
          <div className="grid grid-cols-3 gap-2.5">
            {post.gallery.map((g) => (
              <Photo key={g.seed} seed={g.seed} className="h-[195px] rounded-xl">
                {g.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/85 backdrop-blur">
                      <Play size={20} className="ml-0.5 fill-ink text-ink" />
                    </span>
                  </span>
                )}
                {g.tag && (
                  <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[11.5px] font-semibold text-white backdrop-blur">
                    {g.tag.includes("Video") ? <Video size={12} /> : <Images size={12} />}
                    {g.tag}
                  </span>
                )}
              </Photo>
            ))}
          </div>
          <button className="absolute -right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[0_6px_18px_-6px_rgba(15,15,20,.5)]">
            <ChevronRight size={17} />
          </button>
        </div>
      )}

      {post.hero && (
        <Photo seed={post.hero.seed} dark className="mt-3 h-[300px] rounded-xl">
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/85 backdrop-blur">
              <Play size={22} className="ml-0.5 fill-ink text-ink" />
            </span>
          </span>
          {post.hero.locked && (
            <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-[11.5px] font-bold text-ink">
              <Lock size={11} /> {post.hero.locked}
            </span>
          )}
          {post.hero.duration && (
            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[11.5px] font-semibold text-white">
              {post.hero.duration}
            </span>
          )}
        </Photo>
      )}

      <div className="mt-3.5 flex items-center gap-7 border-t border-line pt-3.5 text-[13.5px] font-semibold">
        <button className="flex items-center gap-2 text-rose-500">
          <Heart size={18} className="fill-rose-500" /> {post.likes}
        </button>
        <button className="flex items-center gap-2 text-ink/70">
          <MessageCircle size={18} /> {post.comments}
        </button>
        <button className="flex items-center gap-2 text-ink/70">
          <Share2 size={18} /> {post.shares}
        </button>
        <button className="ml-auto text-ink/70">
          <Bookmark size={18} />
        </button>
      </div>
    </Card>
  );
}

export default function Feed() {
  const [active, setActive] = useState("For You");

  return (
    <div className="relative flex gap-6 px-6 py-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          {filters.map((f) => (
            <Chip
              key={f.label}
              active={active === f.label}
              onClick={() => setActive(f.label)}
            >
              {f.emoji && <span>{f.emoji}</span>}
              {f.icon && <f.icon size={14} />}
              {f.label}
            </Chip>
          ))}
          <button className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-muted hover:bg-canvas">
            <SlidersHorizontal size={17} />
          </button>
        </div>

        <div className="mt-4 space-y-4 pb-10">
          {feedPosts.map((p, i) => (
            <Post key={i} post={p} />
          ))}
        </div>
      </div>

      <aside className="hidden w-[400px] shrink-0 space-y-4 xl:block">
        <Card className="p-4">
          <SectionHead title="Stories" />
          <div className="mt-4 flex justify-between">
            {stories.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="rounded-full bg-gradient-to-tr from-[#f0399a] via-[#7c3aed] to-[#3b9dff] p-[2.5px]">
                    <Avatar name={s} size={54} className="border-2 border-white" />
                  </div>
                  {i === 0 && (
                    <span className="absolute -bottom-0.5 right-0 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-brand-600 text-white">
                      <Plus size={11} />
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-semibold">{s}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="Trending Creators" />
          <div className="mt-3 space-y-3">
            {creators.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-3 text-[12.5px] font-bold text-muted">{i + 1}</span>
                <Link to={`/creator/${slug(c.name)}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={c.name} size={38} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="flex items-center gap-1 truncate text-[13.5px] font-bold">
                      {c.name} <Verified size={13} />
                    </span>
                    <span className="block truncate text-[12px] text-muted">{c.role}</span>
                  </span>
                </Link>
                <Link
                  to="/checkout"
                  className="flex h-8 shrink-0 items-center rounded-lg border border-brand-200 px-3 text-[12.5px] font-bold text-brand-700 hover:bg-brand-50"
                >
                  Subscribe
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHead title="What's Hot 🔥" action={null} />
          <div className="mt-3 space-y-3">
            {hashtags.slice(0, 3).map((h, i) => (
              <div key={h.tag} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-[14px] font-bold text-brand-600">
                  #
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13.5px] font-bold">
                    {["SundayVibes", "GamingReels", "TravelDiaries"][i]}
                  </p>
                  <p className="text-[12px] text-muted">
                    {["12.5K posts", "8.7K posts", "6.2K posts"][i]}
                  </p>
                </div>
                <div className="flex -space-x-1.5">
                  {[0, 1, 2].map((k) => (
                    <Photo
                      key={k}
                      seed={h.tag + k}
                      className="h-8 w-8 rounded-md border-2 border-white"
                    />
                  ))}
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            ))}
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-[#8b5cf6] to-[#e05fd6] p-5 text-white">
          <p className="flex items-center gap-1.5 text-[16px] font-extrabold">
            Invite &amp; Earn <Gift size={16} />
          </p>
          <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-snug text-white/85">
            Earn up to ₹500 for every friend you invite!
          </p>
          <button className="mt-3.5 h-8 rounded-lg bg-white px-4 text-[12.5px] font-bold text-brand-700">
            Invite Now
          </button>
          <Gift size={120} className="pointer-events-none absolute -bottom-5 -right-4 text-white/25" />
        </div>
      </aside>

      <button className="fixed bottom-8 right-[440px] z-20 grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-[0_10px_26px_-8px_rgba(107,63,239,.8)] hover:bg-brand-700">
        <Plus size={22} />
      </button>
    </div>
  );
}
