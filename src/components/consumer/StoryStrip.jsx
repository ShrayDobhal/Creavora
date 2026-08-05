import Link from "next/link";
import EditorialImage from "./EditorialImage";

const storyLabel = (story) => story.caption || `${story.creator.name}'s story`;

function StoryMedia({ story }) {
  const label = storyLabel(story);

  if (story.mediaType?.toLowerCase().startsWith("video")) {
    return <video src={story.mediaUrl} aria-label={label} controls preload="metadata" className="aspect-[4/5] w-full bg-black object-cover" />;
  }

  return <EditorialImage src={story.mediaUrl} alt={label} fallbackLabel="Story unavailable" className="aspect-[4/5] w-full object-cover" />;
}

export function StoryStrip({ stories = [] }) {
  const activeStories = stories.filter((story) => story?.mediaUrl && story.creator?.handle);

  if (!activeStories.length) {
    return <p className="rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">No active stories right now.</p>;
  }

  return (
    <div className="flex max-w-full gap-3 overflow-x-auto pb-2">
      {activeStories.map((story) => (
        <article key={story.id} className="w-32 shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <Link href={`/creator/${story.creator.handle}`} className="block"><StoryMedia story={story} /></Link>
          <Link href={`/creator/${story.creator.handle}`} className="block truncate px-3 py-2 text-xs font-black hover:underline">{story.creator.name}</Link>
        </article>
      ))}
    </div>
  );
}
