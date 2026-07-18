import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Home, History, Settings } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {children}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/70 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2 text-xs">
          <NavItem to="/" icon={<Home className="h-5 w-5" />} label="POS" exact />
          <NavItem to="/historia" icon={<History className="h-5 w-5" />} label="Historia" />
          <NavItem to="/ustawienia" icon={<Settings className="h-5 w-5" />} label="Ustawienia" />
        </ul>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  exact,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <li className="flex-1">
      <Link
        to={to}
        activeOptions={{ exact }}
        className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-muted-foreground transition-colors data-[status=active]:text-emerald-500"
      >
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </Link>
    </li>
  );
}