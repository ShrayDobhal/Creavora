// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PostComposer } from "@/components/consumer/PostComposer";
import { ProfileEditor } from "@/components/consumer/ProfileEditor";
import { SearchPanel } from "@/components/consumer/SearchPanel";
import { FeedCard } from "@/components/consumer/FeedCard";
import SettingsPage from "@/app/(fan)/settings/page";
import FanLayout, { UserMenu } from "@/layouts/FanLayout";
import ResponsiveNav from "@/components/consumer/ResponsiveNav";
import {
  completeImageUpload,
  createPost,
  deletePost,
  getProfile,
  signImageUpload,
  updatePost,
  updateProfile,
  uploadSignedImage,
} from "@/services/consumer-api";

const push = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/feed",
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/services/consumer-api", () => ({
  completeImageUpload: vi.fn(),
  createPost: vi.fn(),
  deletePost: vi.fn(),
  getProfile: vi.fn(),
  signImageUpload: vi.fn(),
  updatePost: vi.fn(),
  updateProfile: vi.fn(),
  uploadSignedImage: vi.fn(),
}));

const profile = {
  id: "user-1",
  name: "Nisha Kapoor",
  email: "nisha@example.test",
  handle: "nisha-kapoor",
  bio: "Street photographer",
  avatar: null,
  coverImage: null,
  roleTitle: "Photographer",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra",
  address: "Bandra West, Mumbai 400050",
  website: "https://nisha.example.test",
  profileVisibility: "PUBLIC",
  counts: { followers: 2, following: 4, posts: 3 },
};

const managedPost = {
  id: "post-1",
  content: "Before edit",
  mediaUrl: null,
  mediaType: null,
  isPremium: false,
  publishedAt: "2026-08-05T10:00:00.000Z",
  counts: { likes: 0, comments: 0, shares: 0 },
  creator: {
    id: "user-1",
    name: "Nisha Kapoor",
    handle: "nisha-kapoor",
    avatar: null,
    roleTitle: "Photographer",
    verified: false,
  },
  viewer: { isLiked: false, isBookmarked: false, canManage: true },
};

const webpFile = (name = "look.webp") => new File([
  new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
], name, { type: "image/webp" });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("social launch UI", () => {
  it("publishes a selected image and refreshes the feed", async () => {
    const user = userEvent.setup();
    const onPublished = vi.fn();
    signImageUpload.mockResolvedValue({
      assetId: "asset-1",
      uploadUrl: "https://upload.example.test/asset-1",
      headers: { "content-type": "image/webp" },
    });
    uploadSignedImage.mockResolvedValue(undefined);
    completeImageUpload.mockResolvedValue({ assetId: "asset-1", verified: true });
    createPost.mockResolvedValue({ id: "post-1" });

    render(<PostComposer user={{ name: "Nisha" }} onPublished={onPublished} />);
    await user.type(screen.getByRole("textbox", { name: "Write a post" }), "New street-style look");
    await user.upload(
      screen.getByLabelText("Add image"),
      webpFile(),
    );
    await screen.findByAltText("Selected image preview");
    await user.click(screen.getByRole("button", { name: "Publish post" }));

    expect(signImageUpload).toHaveBeenCalledWith(expect.objectContaining({
      fileName: "look.webp",
      mimeType: "image/webp",
      kind: "post",
    }), expect.anything());
    expect(uploadSignedImage).toHaveBeenCalledWith(
      expect.objectContaining({ uploadUrl: "https://upload.example.test/asset-1" }),
      expect.any(File),
      expect.anything(),
    );
    expect(completeImageUpload).toHaveBeenCalledWith("asset-1", expect.anything());
    expect(createPost).toHaveBeenCalledWith({ content: "New street-style look", category: "Lifestyle", mediaAssetId: "asset-1" });
    expect(onPublished).toHaveBeenCalledOnce();
  });

  it("previews the selected image in both post and profile-grid crops", async () => {
    const user = userEvent.setup();
    render(<PostComposer user={{ name: "Nisha" }} onPublished={vi.fn()} />);

    await user.upload(screen.getByLabelText("Add image"), webpFile());
    expect(await screen.findByRole("region", { name: "Crop image" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Portrait 4:5" })).toBeVisible();
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Keep original" }));
    const preview = screen.getByAltText("Selected image preview");
    expect(preview).toHaveClass("object-contain");

    await user.click(screen.getByRole("button", { name: "Profile grid" }));
    expect(preview).toHaveClass("aspect-square", "object-cover");

    await user.click(screen.getByRole("button", { name: "Full post" }));
    expect(preview).toHaveClass("object-contain");
  });

  it("keeps text publishing available after the exact unavailable image message", async () => {
    const user = userEvent.setup();
    signImageUpload.mockRejectedValue(new Error("Image uploads are not configured yet"));
    createPost.mockResolvedValue({ id: "post-1" });

    render(<PostComposer user={{ name: "Nisha" }} onPublished={vi.fn()} />);
    await user.type(screen.getByRole("textbox", { name: "Write a post" }), "A text-only update");
    await user.upload(
      screen.getByLabelText("Add image"),
      webpFile(),
    );
    await screen.findByAltText("Selected image preview");
    await user.click(screen.getByRole("button", { name: "Publish post" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Image uploads are not configured yet");
    expect(screen.getByLabelText("Add image")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Publish post" }));
    expect(createPost).toHaveBeenCalledWith({ content: "A text-only update", category: "Lifestyle" });
  });

  it("omits mediaAssetId for a text-only post", async () => {
    const user = userEvent.setup();
    createPost.mockResolvedValue({ id: "post-1" });

    render(<PostComposer user={{ name: "Nisha" }} onPublished={vi.fn()} />);
    await user.type(screen.getByRole("textbox", { name: "Write a post" }), "A plain text update");
    await user.click(screen.getByRole("button", { name: "Publish post" }));

    expect(createPost).toHaveBeenCalledWith({ content: "A plain text update", category: "Lifestyle" });
  });

  it("saves editable profile fields with the update API rather than an alert", async () => {
    const user = userEvent.setup();
    updateProfile.mockResolvedValue({ ...profile, location: "Pune" });
    const onSaved = vi.fn();
    const alertSpy = vi.spyOn(window, "alert");

    render(<ProfileEditor profile={profile} onSaved={onSaved} />);
    expect(screen.getByLabelText("City / State")).toHaveValue("Mumbai, Maharashtra");
    expect(screen.getByLabelText("Address")).toHaveValue("Bandra West, Mumbai 400050");
    expect(screen.getByLabelText("Phone number")).toHaveValue("+91 98765 43210");
    expect(screen.queryByLabelText("Role")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile visibility")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Website")).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText("Address"));
    await user.clear(screen.getByLabelText("City / State"));
    await user.type(screen.getByLabelText("City / State"), "Pune");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ location: "Pune", address: null }));
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ location: "Pune" }));
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("uploads creator profile images through the shared verified media flow", async () => {
    const user = userEvent.setup();
    signImageUpload.mockResolvedValue({
      assetId: "avatar-asset",
      uploadUrl: "https://upload.example.test/avatar-asset",
      publicUrl: "https://cdn.example.test/avatar.webp",
      headers: { "content-type": "image/webp" },
    });
    uploadSignedImage.mockResolvedValue(undefined);
    completeImageUpload.mockResolvedValue({ publicUrl: "https://cdn.example.test/avatar.webp" });
    updateProfile.mockResolvedValue({ ...profile, avatar: "https://cdn.example.test/avatar.webp" });

    render(<ProfileEditor profile={profile} onSaved={vi.fn()} />);
    await user.upload(screen.getByLabelText("Upload avatar"), webpFile("creator-avatar.webp"));
    await screen.findByAltText("Selected avatar");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(signImageUpload).toHaveBeenCalledWith(expect.objectContaining({
      fileName: "creator-avatar.webp",
      mimeType: "image/webp",
      kind: "avatar",
      width: 1,
      height: 1,
    }));
    expect(uploadSignedImage).toHaveBeenCalledWith(
      expect.objectContaining({ assetId: "avatar-asset" }),
      expect.any(File),
    );
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      avatar: "https://cdn.example.test/avatar.webp",
    }));
  });

  it("only exposes edit and delete actions for a manageable post and confirms deletion", async () => {
    const user = userEvent.setup();
    const onMutated = vi.fn();
    updatePost.mockResolvedValue({ id: "post-1", content: "After edit" });
    deletePost.mockResolvedValue(undefined);

    const { rerender } = render(
      <FeedCard post={managedPost} onLike={vi.fn()} onBookmark={vi.fn()} onMutated={onMutated} />,
    );
    await user.click(screen.getByRole("button", { name: "Post options" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit post" }));
    await user.clear(screen.getByRole("textbox", { name: "Edit post content" }));
    await user.type(screen.getByRole("textbox", { name: "Edit post content" }), "After edit");
    await user.click(screen.getByRole("button", { name: "Save post" }));
    expect(updatePost).toHaveBeenCalledWith("post-1", { content: "After edit" });

    await user.click(screen.getByRole("button", { name: "Post options" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete post" }));
    expect(screen.getByRole("dialog", { name: "Delete post" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    expect(deletePost).toHaveBeenCalledWith("post-1");
    expect(onMutated).toHaveBeenCalled();

    rerender(
      <FeedCard
        post={{ ...managedPost, viewer: { ...managedPost.viewer, canManage: false } }}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Post options" })).not.toBeInTheDocument();
  });

  it("renders only profile and sign out settings controls without visibility settings", async () => {
    getProfile.mockResolvedValue(profile);
    render(<SettingsPage />);

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeVisible();
    expect(screen.queryByText(/billing|wallet|achievements/i)).not.toBeInTheDocument();
    expect(screen.getByText("Profile")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { name: "Privacy" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Phone number")).toBeVisible();
    expect(screen.queryByText("Profile visibility")).not.toBeInTheDocument();
  });

  it("keeps the shared consumer shell and settings editor within the phone viewport", async () => {
    getProfile.mockResolvedValue(profile);
    vi.stubGlobal("fetch", vi.fn((url) => Promise.resolve(new Response(
      JSON.stringify(String(url) === "/api/notifications" ? [] : null),
      { status: 200 },
    ))));
    const shell = render(<FanLayout><div>Consumer content</div></FanLayout>);

    expect(screen.getByRole("main")).toHaveClass("min-w-0", "overflow-x-hidden");
    expect(screen.getByRole("banner")).toHaveClass("fixed", "inset-x-0", "top-0");
    expect(screen.getByRole("banner").parentElement).toHaveClass("pt-[72px]");
    expect(screen.getByRole("button", { name: "Open account menu" })).toBeVisible();
    shell.unmount();

    render(<SettingsPage />);

    const settings = await screen.findByRole("navigation", { name: "Settings sections" });
    expect(settings).toHaveClass("max-w-full", "overflow-x-auto");
    expect(screen.getByRole("main")).toHaveClass("min-w-0", "overflow-x-hidden");
    const editor = await screen.findByRole("form", { name: "Profile editor" });
    expect(editor).toHaveClass("min-w-0");
    expect(screen.getByLabelText("Address")).toHaveClass("w-full");
    expect(screen.getByRole("button", { name: "Save profile" })).toHaveClass("min-h-11");
  });

  it("keeps the Explore search action reachable in a narrow shared layout", () => {
    render(<SearchPanel onQueryChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByRole("search")).toHaveClass("min-w-0", "max-w-full");
    expect(screen.getByRole("button", { name: "Search" })).toHaveClass("min-h-11");
  });

  it("renders Home, Feed, Explore, Notifications, and Profile in the mobile primary navigation", () => {
    render(<ResponsiveNav variant="mobile" unreadNotifications={2} />);

    const navigation = screen.getByRole("navigation", { name: "Mobile primary navigation" });
    expect(navigation).toHaveTextContent("Home");
    expect(navigation).toHaveTextContent("Feed");
    expect(navigation).toHaveTextContent("Explore");
    expect(navigation).toHaveTextContent("Notifications");
    expect(navigation).toHaveTextContent("Profile");
    expect(navigation).not.toHaveTextContent(/collections|messages|wallet|rewards/i);
  });

  it("closes the account menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<UserMenu user={profile} />);

    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    expect(screen.getByRole("link", { name: "Profile" })).toBeVisible();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("logs out before returning to the Blindly landing page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<UserMenu user={profile} />);
    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    expect(push).toHaveBeenCalledWith("/landing");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("keeps the account menu open and shows an inline error when logout fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    render(<UserMenu user={profile} />);
    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to sign out, please try again");
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
