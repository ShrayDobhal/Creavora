import { FeedCard } from "./FeedCard";

export function FeedRail({ posts }) {
  if (!posts.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">
        No featured posts yet.
      </p>
    );
  }

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      {posts.map((post) => (
        <div key={post.id} className="min-w-0">
          <FeedCard post={post} />
        </div>
      ))}
    </div>
  );
}
