// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ redirect: null, push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, refresh: navigation.refresh }),
  useSearchParams: () => ({ get: () => navigation.redirect }),
}));

import LoginPage from "@/app/(auth)/login/page";
import CreatorLoginPage from "@/app/(auth)/creator-login/page";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";

afterEach(() => {
  cleanup();
  navigation.redirect = null;
  vi.unstubAllGlobals();
});

describe("provider-aware login UI", () => {
  it.each([
    [LoginPage, "USER"],
    [CreatorLoginPage, "CREATOR"],
  ])("shows configured Google without password-recovery copy for %s", async (Page, role) => {
    navigation.redirect = "//evil.example/collect";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ google: true, passwordReset: true }), {
      status: 200, headers: { "content-type": "application/json" },
    })));
    render(<Page />);

    const google = await screen.findByRole("link", { name: /continue with google/i });
    expect(google).toHaveAttribute("href", `/api/auth/google/start?role=${role}&redirect=${encodeURIComponent(role === "CREATOR" ? "/studio/content" : "/")}`);
    expect(screen.queryByRole("textbox", { name: /email/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(screen.queryByText(/forgot password|password recovery/i)).not.toBeInTheDocument();
  });

  it("keeps Google visibly unavailable without adding recovery copy when configuration cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<LoginPage />);
    await waitFor(() => expect(screen.getByRole("button", { name: /continue with google/i })).toBeDisabled());
    expect(screen.queryByText(/forgot password|password recovery/i)).not.toBeInTheDocument();
  });
});

describe("password recovery pages", () => {
  it("renders a forgot-password form and reset-password form", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ google: false, passwordReset: true }), { status: 200 })));
    const { unmount } = render(<ForgotPasswordPage />);
    expect(screen.getByRole("heading", { name: /reset your password/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeVisible();
    unmount();
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText("New password")).toBeVisible();
    expect(screen.getByRole("button", { name: /save new password/i })).toBeVisible();
  });
});
