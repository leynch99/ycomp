import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("has combobox role and aria-expanded", () => {
    render(<SearchBar />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape key", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: "1", name: "Test", slug: "test", salePrice: 100, image: null }] }),
    });

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Пошук товарів/);
    await userEvent.type(input, "test");
    await vi.waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has listbox when open with results", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: "1", name: "Test", slug: "test", salePrice: 100, image: null }] }),
    });

    render(<SearchBar />);
    await userEvent.type(screen.getByRole("combobox"), "test");

    await vi.waitFor(() => {
      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();
      expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    });
  });

  it("navigates with ArrowDown/ArrowUp", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [
          { id: "1", name: "A", slug: "a", salePrice: 100, image: null },
          { id: "2", name: "B", slug: "b", salePrice: 200, image: null },
        ],
      }),
    });

    render(<SearchBar />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "test");
    await vi.waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent("A");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent("B");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent("A");
  });
});
