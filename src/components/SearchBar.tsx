"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

function sendSearchEvent(name: "search_select" | "search_submit_all_results", payload: Record<string, unknown>) {
  fetch("/api/search-telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ...payload }),
  }).catch(() => {});
}

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  salePrice: number;
  image: string | null;
  matchType?: string;
};

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${q})`, "gi");
  return text.replace(re, "<mark class='bg-[var(--lilac-200)] text-[var(--lilac-900)] rounded px-0.5'>$1</mark>");
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFetchedQuery = useRef<string | null>(null);

  const totalOptions = items.length + (items.length > 0 ? 1 : 0);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSelectedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    if (!query.trim()) {
      setTimeout(() => {
        setItems([]);
        setLoading(false);
        lastFetchedQuery.current = null;
      }, 0);
      return;
    }
    if (lastFetchedQuery.current === query.trim()) return;

    let cancelled = false;
    lastFetchedQuery.current = query.trim();
    const loadingId = setTimeout(() => setLoading(true), 0);
    const handle = setTimeout(async () => {
      if (cancelled) return;
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        lastFetchedQuery.current = null;
        return;
      }
      const data = (await res.json()) as { items?: SearchItem[] };
      const newItems = data.items ?? [];
      setItems(newItems);
      setSelectedIndex(-1);
      setOpen(true);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(loadingId);
      clearTimeout(handle);
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !hasContent) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i < totalOptions - 1 ? i + 1 : i));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : -1));
      return;
    }
    if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex < items.length) {
        const item = items[selectedIndex];
        sendSearchEvent("search_select", {
          position: selectedIndex,
          match_type: item.matchType,
        });
        window.location.href = `/p/${item.slug}`;
      } else {
        sendSearchEvent("search_submit_all_results");
        window.location.href = `/catalog?q=${encodeURIComponent(query)}`;
      }
    }
  };

  const hasContent = open && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg"
      onKeyDown={handleKeyDown}
    >
      <input
        type="search"
        role="combobox"
        aria-expanded={open && hasContent}
        aria-controls="search-results"
        aria-activedescendant={
          selectedIndex >= 0 && selectedIndex < items.length
            ? `search-option-${items[selectedIndex]?.id ?? ""}`
            : selectedIndex === items.length
              ? "search-option-all"
              : undefined
        }
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder="Пошук товарів, брендів, SKU"
        className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-[var(--lilac-500)] focus:ring-2 focus:ring-[var(--lilac-500)]/20"
      />
      {hasContent && (
        <div
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(360px,60vh)] overflow-y-auto rounded-2xl border border-slate-200/70 bg-white p-3 shadow-xl"
        >
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Швидкий пошук
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 p-2"
                >
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-1">
              {items.map((item, idx) => (
                <Link
                  key={item.id}
                  id={`search-option-${item.id}`}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  href={`/p/${item.slug}`}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl px-2 py-2.5 transition ${
                    idx === selectedIndex ? "bg-[var(--lilac-100)]" : "hover:bg-[var(--lilac-50)]"
                  }`}
                  onClick={() => {
                    sendSearchEvent("search_select", {
                      position: idx,
                      match_type: item.matchType,
                    });
                    closeDropdown();
                  }}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={item.image ?? "/images/placeholder.svg"}
                      alt=""
                      fill
                      className="object-contain p-1"
                      unoptimized={!!(item.image?.startsWith("http"))}
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="line-clamp-1 text-sm font-medium text-slate-900"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(item.name, query),
                      }}
                    />
                    <span className="block text-xs text-[var(--lilac-700)]">
                      {formatPrice(item.salePrice)}
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                id="search-option-all"
                role="option"
                aria-selected={selectedIndex === items.length}
                href={`/catalog?q=${encodeURIComponent(query)}`}
                className={`mt-2 flex min-h-[48px] items-center justify-center rounded-xl border-t border-slate-100 px-3 py-3 text-xs font-medium text-[var(--lilac-900)] transition ${
                  selectedIndex === items.length ? "bg-[var(--lilac-100)]" : "hover:bg-[var(--lilac-50)]"
                }`}
                onClick={() => {
                  sendSearchEvent("search_submit_all_results");
                  closeDropdown();
                }}
              >
                Показати всі результати
              </Link>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-slate-500">
              Нічого не знайдено…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
