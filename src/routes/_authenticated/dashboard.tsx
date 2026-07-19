import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, LogOut, ShieldCheck, IdCard, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, generateMembershipCard, generateQrDataUrl } from "@/lib/tsb-utils";
import { useAuth } from "@/lib/auth-context";
import { membersApi } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "My Dashboard — TSB" }, { name: "robots", content: "noindex" }] }),
});

const STAFF_ROLES = ["super_admin", "admin", "membership_officer", "corporate_officer", "editor"];

function Dashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [qr, setQr] = useState<string | null>(null);

  const member = useQuery({
    queryKey: ["me-member"],
    queryFn: async () => {
      try {
        const res = await membersApi.profile();
        return (res as any)?.member ?? res;
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (member.data?.membership_number) {
      const url = `${window.location.origin}/verify/${member.data.membership_number}`;
      generateQrDataUrl(url).then(setQr).catch(() => setQr(null));
    }
  }, [member.data]);

  async function download() {
    if (!member.data) return;
    const url = `${window.location.origin}/verify/${member.data.membership_number}`;
    const blob = await generateMembershipCard(member.data, url);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TSB-${member.data.membership_number}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function signOut() {
    await logout();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  if (member.isLoading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;

  if (!member.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">No member record yet</h1>
        <p className="mt-2 text-muted-foreground">Complete your membership registration to receive your card.</p>
        <Button asChild variant="tsbGreen" className="mt-6"><Link to="/register">Register now</Link></Button>
      </div>
    );
  }

  const m = member.data;
  const full = [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(" ");
  const roles: string[] = user?.roles ?? (user?.role ? [user.role] : []);
  const isStaff = roles.some((r: string) => STAFF_ROLES.includes(r));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Member dashboard</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Welcome, {m.first_name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isStaff && <Button asChild variant="tsbBlue"><Link to="/admin">Admin panel</Link></Button>}
          <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 overflow-hidden rounded-2xl shadow-elegant">
          <div className="relative gradient-blue p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Tinubu Support Bauchi 2027</div>
                <div className="mt-0.5 font-display text-sm font-bold">Official Membership Card</div>
              </div>
              <Badge className="bg-[color:var(--tsb-green)] text-white uppercase">{m.status}</Badge>
            </div>
            <div className="mt-6 flex gap-5">
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-md bg-white/10">
                {m.photo_url && <img src={m.photo_url} alt={full} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 space-y-1.5 text-sm">
                <div className="font-display text-lg font-extrabold uppercase leading-tight">{full}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white/85">
                  <div><span className="text-white/60">ID:</span> <span className="font-mono">{m.membership_number}</span></div>
                  <div><span className="text-white/60">LGA:</span> {m.lga}</div>
                  <div><span className="text-white/60">Ward:</span> {m.ward || "—"}</div>
                  <div><span className="text-white/60">Gender:</span> {m.gender || "—"}</div>
                  <div className="col-span-2"><span className="text-white/60">Issued:</span> {formatDate(m.created_at)}</div>
                </div>
              </div>
              <div className="hidden shrink-0 rounded-md bg-white p-1 md:block">
                {qr && <img src={qr} alt="QR" className="h-24 w-24" />}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t bg-card p-4">
            <Button variant="tsbGreen" onClick={download}><Download /> Download PDF card</Button>
            <Button asChild variant="outline"><Link to="/verify/$membership" params={{ membership: m.membership_number }}><ShieldCheck /> View public verify page</Link></Button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 font-display font-bold"><IdCard className="h-4 w-4 text-[color:var(--tsb-green)]" /> Profile</div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row k="Email" v={m.email} />
              <Row k="Phone" v={m.phone} />
              <Row k="Occupation" v={m.occupation || "—"} />
              <Row k="Polling unit" v={m.polling_unit || "—"} />
            </dl>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 font-display font-bold"><Edit3 className="h-4 w-4 text-[color:var(--tsb-blue)]" /> Manage</div>
            <p className="mt-2 text-xs text-muted-foreground">Need to update your details? Contact the state secretariat or an officer at your ward.</p>
            <Button asChild variant="outline" className="mt-3 w-full"><Link to="/contact">Contact support</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b py-1 last:border-none">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
