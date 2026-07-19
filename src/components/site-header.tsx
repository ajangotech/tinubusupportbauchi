import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Heart, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TSBLogo } from "./tsb-logo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/leadership", label: "Leadership" },
  { to: "/news", label: "News" },
  { to: "/events", label: "Events" },
  { to: "/verify", label: "Verify" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4">
        <TSBLogo />
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground",
                  active && "text-[color:var(--tsb-green)]",
                )}
              >
                {n.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[color:var(--tsb-green)]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="tsbGreen" size="sm">
            <Link to="/register">
              <UserPlus className="mr-1.5 h-4 w-4" /> Register
            </Link>
          </Button>
          <Button asChild variant="tsbBlue" size="sm">
            <Link to="/contact">
              <Heart className="mr-1.5 h-4 w-4" /> Donate
            </Link>
          </Button>
        </div>
        <button
          className="rounded-md p-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button asChild variant="tsbGreen" className="flex-1">
                <Link to="/register">Register</Link>
              </Button>
              <Button asChild variant="tsbBlue" className="flex-1">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}