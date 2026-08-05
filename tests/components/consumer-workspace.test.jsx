// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ConsumerWorkspaceNav from "@/components/consumer/ConsumerWorkspaceNav";
import EditorialImage from "@/components/consumer/EditorialImage";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

afterEach(() => {
  cleanup();
});

it("shows the complete desktop user navigation", () => {
  render(<ConsumerWorkspaceNav pathname="/home" variant="desktop" />);

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
  expect(screen.getByRole("link", { name: "Saved Posts" })).toHaveAttribute("href", "/saved");
});

it("keeps the mobile primary navigation available through tablet widths", () => {
  render(<ConsumerWorkspaceNav pathname="/home" variant="mobile" />);

  expect(screen.getByRole("navigation", { name: "Mobile primary navigation" })).toHaveClass("lg:hidden");
});

it("replaces failed editorial media with an accessible fallback", async () => {
  render(
    <EditorialImage
      src="https://invalid.example/photo.jpg"
      alt="Studio portrait"
      fallbackLabel="Photo unavailable"
    />,
  );

  fireEvent.error(screen.getByRole("img", { name: "Studio portrait" }));

  expect(await screen.findByText("Photo unavailable")).toBeInTheDocument();
});
