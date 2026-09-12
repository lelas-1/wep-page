import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  /** Optional trigger label override; defaults to the selected option's label. */
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * Themed replacement for a native <select>. Native selects can't be styled
 * beyond the trigger (the open dropdown is rendered by the OS/browser, not
 * CSS-controllable), so this renders both the trigger and the option list
 * ourselves, using the app's design tokens.
 *
 * The option list is rendered through a portal into document.body,
 * positioned from the trigger's live screen coordinates, rather than as an
 * absolutely-positioned child of the trigger. A Select placed inside a
 * table row (e.g. an order's status column) sits inside an ancestor with
 * `overflow-hidden` (the table's rounded card wrapper) — an absolutely
 * positioned child there gets silently clipped and never becomes visible.
 * The portal escapes that entirely. The list always opens downward from
 * the trigger — no auto-flip-upward near the bottom of the viewport,
 * since that made a row's dropdown appear to jump unpredictably.
 *
 * Generic over the option value type so every filter (category ids, status
 * unions, etc.) gets full type-safety without a separate component per use
 * — avoids the boolean-prop-per-variant trap in favor of one typed API.
 */
export default function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [rect, setRect] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => setOpen(false), []);

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
  }, []);

  // Close on outside click / Escape, and keep the portal's position in
  // sync with the trigger while open (scrolling, resizing, etc.).
  // Re-subscribes only when `open` actually changes, not on every render.
  useEffect(() => {
    if (!open) return;
    measure();

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onReposition = () => measure();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, close, measure]);

  const openList = () => {
    const idx = options.findIndex((o) => o.value === value);
    setHighlighted(idx === -1 ? 0 : idx);
    setOpen(true);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[highlighted];
      if (opt) {
        onChange(opt.value);
        close();
      }
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[var(--radius-card)] text-sm border bg-[var(--color-surface)] text-[var(--color-text)] transition-colors"
        style={{ borderColor: open ? "var(--color-primary)" : "var(--color-border)" }}
      >
        <span className="truncate">{selected?.label ?? placeholder ?? ""}</span>
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200"
          style={{ color: "var(--color-text-secondary)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            aria-activedescendant={`select-option-${highlighted}`}
            className="fixed z-[200] max-h-64 overflow-y-auto rounded-[var(--radius-card)] border py-1 shadow-[var(--shadow-card)] motion-safe:animate-[fadeIn_0.15s_ease]"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              left: rect.left,
              width: rect.width,
              top: rect.bottom + 6,
            }}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isHighlighted = i === highlighted;
              return (
                <li
                  key={opt.value}
                  id={`select-option-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => {
                    onChange(opt.value);
                    close();
                  }}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors"
                  style={{
                    background: isHighlighted ? "var(--color-lavender-light)" : "transparent",
                    color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={15} className="shrink-0" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
}
