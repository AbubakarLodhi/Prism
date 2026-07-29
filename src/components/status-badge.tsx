import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-white/5 text-[color:var(--ink-soft)] border-border",
  },
  generating: {
    label: "Generating",
    className:
      "bg-amber-500/15 text-amber-200 border-amber-500/30 hover:bg-amber-500/15",
  },
  complete: {
    label: "Complete",
    className:
      "bg-emerald-500/15 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/15",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const config = STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
