import { Link } from "@tanstack/react-router";
import Logo from "@/assets/logo.png";

export function TSBLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={Logo}  className="" width={100} />
      <div className="leading-tight">
        <div className="font-display text-[13px] font-extrabold uppercase tracking-wide text-[color:var(--tsb-green)]">
          Tinubu Support
        </div>
        <div className="font-display text-[15px] font-extrabold uppercase text-[color:var(--tsb-blue)]">
          Bauchi
        </div>
        {!compact && (
          <div className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Together for a Greater Nigeria
          </div>
        )}
      </div>
    </Link>
  );
}