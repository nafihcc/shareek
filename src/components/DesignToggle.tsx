import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Design = "classic" | "pro";

export const DESIGN_KEY = "faiz.design";
/** Design shown to visitors who have never picked one. */
export const DEFAULT_DESIGN: Design = "pro";

function readDesign(): Design {
  try {
    const saved = localStorage.getItem(DESIGN_KEY);
    if (saved === "classic" || saved === "pro") return saved;
  } catch {
    /* Storage may be unavailable. */
  }
  return DEFAULT_DESIGN;
}

/** Switches between the original (Classic) look and the Professional look. */
export function DesignToggle() {
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);

  useEffect(() => {
    const current = readDesign();
    document.documentElement.setAttribute("data-design", current);
    setDesign(current);
  }, []);

  const toggle = () => {
    const next: Design = design === "pro" ? "classic" : "pro";
    document.documentElement.setAttribute("data-design", next);
    setDesign(next);
    try {
      localStorage.setItem(DESIGN_KEY, next);
    } catch {
      /* Keep working without storage. */
    }
  };

  const label = design === "pro" ? "Switch to the Classic design" : "Switch to the Professional design";
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="shrink-0 gap-1.5 border border-border px-2.5 text-deep hover:bg-mist hover:text-deep"
    >
      <Palette aria-hidden="true" className="size-4" />
      <span className="hidden text-xs font-semibold sm:inline">
        {design === "pro" ? "Pro" : "Classic"}
      </span>
    </Button>
  );
}
