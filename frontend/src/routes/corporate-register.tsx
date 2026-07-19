import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BAUCHI_LGAS } from "@/lib/tsb-utils";
import { useAuth } from "@/lib/auth-context";
import { corporateApi, ApiError } from "@/lib/api";

export const Route = createFileRoute("/corporate-register")({
  component: CorpRegister,
  head: () => ({
    meta: [
      { title: "Corporate Registration — TSB 2027" },
      { name: "description", content: "Register your organization as a corporate supporter of TSB 2027." },
      { property: "og:title", content: "TSB Corporate Registration" },
      { property: "og:url", content: "/corporate-register" },
    ],
    links: [{ rel: "canonical", href: "/corporate-register" }],
  }),
});

const schema = z.object({
  organization_name: z.string().trim().min(2).max(200),
  organization_type: z.string().min(1),
  cac_number: z.string().trim().max(60).optional().or(z.literal("")),
  contact_person: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().email(),
  lga: z.string().optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  size_bracket: z.string().optional().or(z.literal("")),
  support_area: z.string().trim().max(500).optional().or(z.literal("")),
});

function CorpRegister() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState("");
  const [lga, setLga] = useState("");
  const [size, setSize] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) { toast.error("Please sign in first"); nav({ to: "/auth" }); return; }
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...fd, organization_type: type, lga, size_bracket: size });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      const form = new FormData();
      for (const [k, v] of Object.entries(parsed.data)) if (v) form.append(k, String(v));
      if (logoFile) form.append("logo", logoFile);
      const res = await corporateApi.register(form);
      const org = (res as any)?.organization ?? res;
      toast.success(`Registration received: ${org?.registration_number ?? ""}. Pending approval.`);
      nav({ to: "/corporate-dashboard" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold">Sign in to register your organization</h1>
        <Button asChild variant="tsbBlue" className="mt-6"><Link to="/auth">Sign in / Create account</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-blue text-white"><Building2 /></div>
        <h1 className="mt-4 font-display text-4xl font-extrabold">Corporate Registration</h1>
        <p className="mt-2 text-muted-foreground">For businesses, NGOs, associations and corporate supporters.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-2xl border bg-card p-6 shadow-card md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="organization_name" label="Organization name" required />
          <div>
            <Label>Type <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["Business","NGO","Association","Cooperative","Religious","Community","Media","Other"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field name="cac_number" label="CAC / registration number" />
          <Field name="contact_person" label="Contact person" required />
          <Field name="phone" label="Phone" required />
          <Field name="email" label="Email" type="email" required defaultValue={user.email} />
          <div>
            <Label>LGA</Label>
            <Select value={lga} onValueChange={setLga}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select LGA…" /></SelectTrigger>
              <SelectContent>{BAUCHI_LGAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Field name="website" label="Website" />
          <div>
            <Label>Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {["1-10","11-50","51-200","201-500","500+"].map((s) => <SelectItem key={s} value={s}>{s} members / employees</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Office address</Label>
            <Textarea name="address" rows={2} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>How would you like to support TSB?</Label>
            <Textarea name="support_area" rows={3} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Logo (optional)</Label>
            <Input type="file" accept="image/*" className="mt-1.5" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <Button type="submit" variant="tsbBlue" size="xl" className="w-full" disabled={busy}>
          {busy ? "Submitting…" : "Submit registration"}
        </Button>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} className="mt-1.5" />
    </div>
  );
}
