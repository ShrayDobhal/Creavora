"use client";

import { useState } from "react";
import Link from "next/link";;
import { Bookmark, Heart, MessageSquare, Trash2, ExternalLink } from "lucide-react";
import { Card, SectionHead } from "@/ui/Bits.jsx";
import { Avatar, Photo, Verified } from "@/ui/Media.jsx";
import { slug } from "@/data.js";

const initialSavedPosts = [
  {
    id: 1,
    author: "Ananya Sharma",
    role: "Fashion Creator",
    time: "Saved 2 days ago",
    body: "Morning vibes ☀️ A little peek into my peaceful Sunday. Full vlog dropping soon for my premium fam! ✨",
    seed: "ananya-cup",
    likes: "1.2K",
    comments: 128,
  },
  {
    id: 2,
    author: "Wander With Karan",
    role: "Travel Creator",
    time: "Saved 4 days ago",
    body: "Exploring the untouched beauty of Himachal! 🏔️❄️ Road trips are always special.",
    seed: "karan-himachal",
    likes: "1.8K",
    comments: 96,
  },
  {
    id: 3,
    author: "Meera Art",
    role: "Digital Artist",
    time: "Saved 1 week ago",
    body: "Behind the scenes from today's photoshoot. Choosing colors that pop! 🎨🖌️",
    seed: "meera-studio",
    likes: "2.3K",
    comments: 245,
  },
];

export default function SavedPosts() {
  const [posts, setPosts] = useState(initialSavedPosts);

  const handleUnsave = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
            <Bookmark className="text-brand-600 fill-brand-600" size={24} /> Saved Posts
          </h1>
          <p className="text-[14px] text-muted">Access all your bookmarked posts and content in one place</p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-5">
          {posts.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col md:flex-row gap-5 hover:border-brand-200 transition">
              {/* thumbnail */}
              <Photo seed={p.seed} className="w-full md:w-[200px] h-[130px] rounded-xl shrink-0" />

              {/* content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.author} size={24} />
                      <div className="leading-tight">
                        <Link href={`/creator/${slug(p.author)}`} className="text-[13.5px] font-bold text-ink hover:underline flex items-center gap-0.5">
                          {p.author} <Verified size={11} />
                        </Link>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-muted">{p.time}</span>
                  </div>
                  <p className="mt-3 text-[13px] text-ink/90 leading-relaxed line-clamp-2">
                    {p.body}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <div className="flex items-center gap-4 text-muted text-[12px]">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-rose-500 fill-rose-500" /> {p.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} /> {p.comments}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUnsave(p.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-rose-100 hover:border-rose-200 text-rose-500 hover:bg-rose-50"
                      title="Unsave Post"
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link href={`/creator/${slug(p.author)}`}
                      className="flex h-8 items-center gap-1 rounded-lg bg-brand-600 px-3.5 text-[12px] font-bold text-white hover:bg-brand-700"
                    >
                      View Post <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-line">
          <Bookmark className="mx-auto text-muted mb-3" size={36} />
          <p className="text-[15.5px] font-extrabold text-ink">No saved posts</p>
          <p className="text-[13px] text-muted mt-1">Bookmarked posts will appear here for easy access later</p>
        </div>
      )}
    </div>
  );
}
