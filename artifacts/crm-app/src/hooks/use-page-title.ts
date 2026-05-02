import { useEffect } from "react";

export function usePageTitle(title: string | undefined | null) {
  useEffect(() => {
    const base = "Rawdat";
    document.title = title ? `${title} — ${base}` : base;
    return () => { document.title = base; };
  }, [title]);
}
