// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  redirect: null,
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, refresh: navigation.refresh }),
  useSearchParams: () => ({ get: () => navigation.redirect }),
}));

import LoginPage from "@/app/(auth)/login/page";
import CreatorLoginPage from "@/app/(auth)/creator-login/page";

afterEach(() => {
  cleanup();
  navigation.redirect = null;
  navigation.push.mockReset();
  navigation.refresh.mockReset();
  vi.unstubAllGlobals();
});

async function completeLogin({ email, submitName }) {
  const user = userEvent.setup();
  await user.type(await screen.findByRole("textbox", { name: /email/i }), email);
  await user.type(screen.getByLabelText("Password"), "Test1234");
  expect(screen.getByRole("button", { name: "Show password" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: submitName }));
}

describe("role-aware auth entry", () => {
  it("labels user controls, submits the USER role, and rejects an external redirect", async () => {
    navigation.redirect = "https://evil.example/collect";
    const fetchMock = vi.fn((url) => Promise.resolve(new Response(JSON.stringify(
      url === "/api/auth/providers" ? { google: false, passwordReset: false } : { user: { role: "USER" } },
    ), { status: 200, headers: { "content-type": "application/json" } })));
    vi.stubGlobal("fetch", fetchMock);
    render(<LoginPage />);

    await completeLogin({ email: "fan@example.test", submitName: "Sign In" });

    const loginCall = fetchMock.mock.calls.find(([url]) => url === "/api/auth/login");
    expect(JSON.parse(loginCall[1].body)).toMatchObject({ role: "USER" });
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/"));
  });

  it("labels creator controls, submits the CREATOR role, and rejects a protocol-relative redirect", async () => {
    navigation.redirect = "//evil.example/collect";
    const fetchMock = vi.fn((url) => Promise.resolve(new Response(JSON.stringify(
      url === "/api/auth/providers" ? { google: false, passwordReset: false } : { user: { role: "CREATOR" } },
    ), { status: 200, headers: { "content-type": "application/json" } })));
    vi.stubGlobal("fetch", fetchMock);
    render(<CreatorLoginPage />);

    await completeLogin({ email: "creator@example.test", submitName: "Access Creator Studio" });

    const loginCall = fetchMock.mock.calls.find(([url]) => url === "/api/auth/login");
    expect(JSON.parse(loginCall[1].body)).toMatchObject({ role: "CREATOR" });
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/studio/content"));
  });
});
