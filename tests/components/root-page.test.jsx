// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));

import RootPage from "@/app/(fan)/page";

afterEach(() => {
  cleanup();
  redirect.mockReset();
});

it("redirects the root page to the database-backed feed without rendering legacy data", () => {
  const { container } = render(<RootPage />);

  expect(redirect).toHaveBeenCalledWith("/feed");
  expect(container).toBeEmptyDOMElement();
});
