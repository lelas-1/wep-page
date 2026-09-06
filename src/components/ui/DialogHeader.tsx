import { X } from "lucide-react";

export default function DialogHeader({
  titleId,
  title,
  onClose,
  closeLabel,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b shrink-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <h2 id={titleId} className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-heading)" }}>
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="p-1.5 rounded-[var(--radius-card)] hover:bg-[var(--color-muted)] transition-colors shrink-0"
      >
        <X size={20} />
      </button>
    </div>
  );
}
