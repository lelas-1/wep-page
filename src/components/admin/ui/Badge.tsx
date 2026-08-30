import type { ReactNode } from "react";

type Tone = "success" | "error" | "warning" | "neutral";

export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const toneMap: Record<Tone, { bg: string; fg: string }> = {
    success: { bg: "color-mix(in srgb, var(--color-success) 16%, transparent)", fg: "var(--color-success)" },
    error: { bg: "color-mix(in srgb, var(--color-error) 16%, transparent)", fg: "var(--color-error)" },
    warning: { bg: "color-mix(in srgb, var(--color-warning) 18%, transparent)", fg: "var(--color-warning)" },
    neutral: { bg: "var(--color-muted)", fg: "var(--color-text-secondary)" },
  };
  const { bg, fg } = toneMap[tone];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}
