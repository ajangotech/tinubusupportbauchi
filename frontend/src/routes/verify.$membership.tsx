import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/tsb-utils";
import { membersApi } from "@/lib/api";

export const Route = createFileRoute("/verify/$membership")({
  component: VerifyResult,
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.membership} — TSB 2027` },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function VerifyResult() {
  const { membership } = Route.useParams();
  const q = useQuery({
    queryKey: ["verify", membership],
    queryFn: async () => {
      try {
        const res = await membersApi.verify(membership);
        return (res as any)?.member ?? res;
      } catch {
        return null;
      }
    },
  });

  if (q.isLoading) return <div className="py-24 text-center text-muted-foreground">Verifying…</div>;

  const m = q.data;
  if (!m || (m.status && m.status !== "approved")) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold">Not verified</h1>
        <p className="mt-2 text-muted-foreground">
          No approved member found with number <span className="font-mono">{membership}</span>.
        </p>
        <Button asChild variant="outline" className="mt-6"><Link to="/">Back to home</Link></Button>
      </div>
    );
  }

  const full = [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(" ");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border bg-card p-8 text-center shadow-elegant">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gradient-green text-white">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Verified member</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{full}</h1>
        <div className="mt-1 font-mono text-sm text-muted-foreground">{m.membership_number}</div>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <Info label="LGA" value={m.lga} />
          <Info label="Status" value={String(m.status || "approved").toUpperCase()} />
          <Info label="Registered" value={formatDate(m.created_at)} />
          <Info label="Organization" value="TSB 2027" />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Only public membership details are shown. Sensitive personal data is protected.
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
