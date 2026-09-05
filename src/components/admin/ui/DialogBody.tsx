import type { ReactNode } from "react";

export default function DialogBody({ children }: { children: ReactNode }) {
  return <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">{children}</div>;
}
