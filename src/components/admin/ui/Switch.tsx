/**
 * Generic on/off switch. One component reused for both "Active" and
 * "Featured" columns (and anywhere else a boolean toggle is needed) instead
 * of duplicating badge-as-button markup per field — keeps the API to a
 * single typed `checked`/`onChange` pair rather than growing new boolean
 * props per variant.
 *
 * Thumb position is animated via `insetInlineStart` rather than
 * `transform: translateX()`, so it flips correctly for RTL automatically
 * (a fixed-sign translateX would slide the wrong direction in Arabic).
 */
export default function Switch({
  checked,
  onChange,
  label,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  /** Short text shown next to the switch (e.g. "نشط" / "Active"). */
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="inline-flex items-center gap-2"
    >
      <span
        className="relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
        style={{ background: checked ? "var(--color-primary)" : "var(--color-border)" }}
      >
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow transition-[inset-inline-start] duration-200"
          style={{ insetInlineStart: checked ? "20px" : "2px" }}
        />
      </span>
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: checked ? "var(--color-primary)" : "var(--color-text-secondary)" }}
      >
        {label}
      </span>
    </button>
  );
}
