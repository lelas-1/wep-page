import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <span
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--color-muted)" }}
      >
        <Icon size={24} style={{ color: "var(--color-text-secondary)" }} />
      </span>
      <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--color-heading)" }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
        {description}
      </p>
      {action}
    </div>
  );
}
