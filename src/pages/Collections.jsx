import { useState } from "react";
import { Folder, FolderPlus, MoreVertical, Plus, Image as ImageIcon, Video, Trash2, Edit2 } from "lucide-react";
import { Card, SectionHead } from "../ui/Bits.jsx";
import { Photo } from "../ui/Media.jsx";

const initialCollections = [
  { id: 1, name: "Fashion & Style", count: 12, seed: "ananya-hero", desc: "Styling tips, outfit ideas and lookbooks" },
  { id: 2, name: "Travel Diaries", count: 8, seed: "karan-himachal", desc: "Places to visit, itineraries and guides" },
  { id: 3, name: "Fitness Goals", count: 15, seed: "neha-fit", desc: "HIIT workouts, yoga poses and diet tips" },
  { id: 4, name: "Digital Art & Painting", count: 6, seed: "meera-studio", desc: "Photoshop tutorials, brush packs and speed paints" },
];

export default function Collections() {
  const [collections, setCollections] = useState(initialCollections);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const newCol = {
      id: Date.now(),
      name: newColName,
      count: 0,
      seed: "default-col",
      desc: newColDesc || "Personal curated collection",
    };
    setCollections([...collections, newCol]);
    setNewColName("");
    setNewColDesc("");
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this collection? All saved links inside it will be unsaved.")) {
      setCollections(collections.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
            <Folder className="text-brand-600" size={24} /> Collections
          </h1>
          <p className="text-[14px] text-muted">Organize your bookmarked creator posts into custom folders</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4.5 text-[13.5px] font-bold text-white hover:bg-brand-700 shadow-md"
        >
          <FolderPlus size={16} /> Create Collection
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-[440px] p-6 shadow-2xl bg-white border border-line">
            <h3 className="text-[17.5px] font-black text-ink mb-4">New Collection</h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-bold text-muted mb-1.5">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Cooking Recipes"
                  className="w-full h-11 px-3.5 text-[13.5px] border border-line bg-canvas rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-bold text-muted mb-1.5">Description (Optional)</label>
                <textarea
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="e.g. Healthy recipes to try at home"
                  className="w-full h-24 p-3.5 text-[13.5px] border border-line bg-canvas rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4.5 rounded-xl border border-line text-[13px] font-bold text-ink hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-brand-600 text-[13px] font-bold text-white hover:bg-brand-700"
                >
                  Create
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {collections.map((c) => (
          <Card key={c.id} className="overflow-hidden flex flex-col justify-between hover:border-brand-200 transition">
            <div>
              <Photo seed={c.seed} className="h-[140px] relative">
                <div className="absolute inset-0 bg-black/25" />
                <span className="absolute bottom-3 left-3 flex h-6 items-center gap-1.5 rounded-md bg-white/20 backdrop-blur px-2.5 text-[11px] font-bold text-white">
                  <Folder size={11} /> {c.count} items
                </span>
              </Photo>
              <div className="p-4">
                <h3 className="text-[15.5px] font-extrabold text-ink leading-tight truncate">{c.name}</h3>
                <p className="mt-1 text-[12px] text-muted leading-relaxed line-clamp-2">{c.desc}</p>
              </div>
            </div>

            <div className="p-4 border-t border-line flex gap-2">
              <button className="flex-1 h-9 rounded-xl border border-line text-[12.5px] font-bold text-ink hover:bg-canvas">
                Open
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-rose-100 hover:border-rose-200 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
