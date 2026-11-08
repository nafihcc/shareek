import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "faiz.theme";

/** Day mode is always the first view; night mode only after the user switches. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let preference: string | null = null;
    try { preference = localStorage.getItem(THEME_KEY); } catch { /* Storage may be unavailable. */ }
    const enabled = preference === "dark";
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
  }, []);

  const toggle = () => {
    const enabled = !dark;
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
    try { localStorage.setItem(THEME_KEY, enabled ? "dark" : "light"); } catch { /* Keep working without storage. */ }
  };

  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={label} title={label}
      className="shrink-0 border border-border text-deep hover:bg-mist hover:text-deep">
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
