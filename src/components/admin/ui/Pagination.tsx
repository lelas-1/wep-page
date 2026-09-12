import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  prevLabel,
  nextLabel,
  pageLabel,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  prevLabel: string;
  nextLabel: string;
  /** e.g. (p, total) => `صفحة ${p} من ${total}` */
  pageLabel: (page: number, totalPages: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t" style={{ borderColor: "var(--color-border)" }}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-card)] text-sm border disabled:opacity-40 transition-colors hover:bg-[var(--color-muted)] disabled:hover:bg-transparent"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
      >
        <ChevronRight size={15} className="rtl:hidden" />
        <ChevronLeft size={15} className="ltr:hidden" />
        {prevLabel}
      </button>

      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {pageLabel(page, totalPages)}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-card)] text-sm border disabled:opacity-40 transition-colors hover:bg-[var(--color-muted)] disabled:hover:bg-transparent"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
      >
        {nextLabel}
        <ChevronLeft size={15} className="rtl:hidden" />
        <ChevronRight size={15} className="ltr:hidden" />
      </button>
    </div>
  );
}
