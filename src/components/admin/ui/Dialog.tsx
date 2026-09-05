import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  /** Tailwind max-width classes for the dialog panel, e.g. "sm:max-w-[900px]". */
  maxWidthClassName?: string;
}

/**
 * Unopinionated modal shell. Composes with <DialogHeader>/<DialogBody>/
 * plain content as children rather than baking header/footer/title props
 * into one component — keeps this reusable for any future dialog, not just
 * the product form.
 */
export default function Dialog({ open, onClose, titleId, children, maxWidthClassName = "sm:max-w-[900px]" }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Scroll lock + focus management + Escape-to-close. Only active while open.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog.
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusables?.[0] ?? panelRef.current)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Simple focus trap on Tab.
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 motion-safe:animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full h-full sm:h-auto ${maxWidthClassName} sm:max-h-[85vh] sm:w-[90vw] flex flex-col overflow-hidden rounded-none sm:rounded-2xl shadow-[var(--shadow-card)] motion-safe:animate-[fadeInUp_0.25s_ease] outline-none`}
        style={{ background: "var(--color-surface)" }}
      >
        {children}
      </div>
    </div>
  );
}
