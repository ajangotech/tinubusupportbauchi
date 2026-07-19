import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { UserPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BAUCHI_LGAS } from "@/lib/tsb-utils";
import { useAuth } from "@/lib/auth-context";
import { membersApi, ApiError } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Become a Member — TSB 2027" },
      { name: "description", content: "Register as a Tinubu Support Bauchi 2027 member. Get your digital membership card with QR verification." },
      { property: "og:title", content: "Become a TSB Member" },
      { property: "og:url", content: "/register" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
});

const schema = z.object({
  first_name: z.string().trim().min(2).max(60),
  middle_name: z.string().trim().max(60).optional().or(z.literal("")),
  last_name: z.string().trim().min(2).max(60),
  gender: z.string().min(1),
  date_of_birth: z.string().optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(30),
  email: z.string().email(),
  nin: z.string().trim().max(20).optional().or(z.literal("")),
  lga: z.string().min(1),
  ward: z.string().trim().max(120).optional().or(z.literal("")),
  polling_unit: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  occupation: z.string().trim().max(120).optional().or(z.literal("")),
  education: z.string().trim().max(120).optional().or(z.literal("")),
  interests: z.string().trim().max(500).optional().or(z.literal("")),
  participation: z.string().trim().max(200).optional().or(z.literal("")),
});

function RegisterPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gender, setGender] = useState("");
  const [lga, setLga] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    // If member already exists, kick to dashboard
    membersApi.profile().then(() => nav({ to: "/dashboard" })).catch(() => {});
  }, [user, loading, nav]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return toast.error("Photo must be under 2MB");
    if (!f.type.startsWith("image/")) return toast.error("Please upload an image file");
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) { toast.error("Please sign in first"); nav({ to: "/auth" }); return; }
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse({ ...fd, gender, lga });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      const form = new FormData();
      for (const [k, v] of Object.entries(parsed.data)) if (v) form.append(k, String(v));
      if (photoFile) form.append("photo", photoFile);
      const res = await membersApi.register(form);
      const member = (res as any)?.member ?? res;
      toast.success(`Welcome to TSB! Your ID: ${member?.membership_number ?? ""}`);
      nav({ to: "/dashboard" });
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
        <h1 className="font-display text-3xl font-extrabold">Sign in to register</h1>
        <p className="mt-2 text-muted-foreground">You'll need an account so we can issue and secure your membership card.</p>
        <Button asChild variant="tsbGreen" className="mt-6"><Link to="/auth">Sign in / Create account</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-green text-white"><UserPlus /></div>
        <h1 className="mt-4 font-display text-4xl font-extrabold">Membership Registration</h1>
        <p className="mt-2 text-muted-foreground">Please complete every required field. Your data is protected.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-8 rounded-2xl border bg-card p-6 shadow-card md:p-8">
        <Section title="Personal information">
          <Grid>
            <Field name="first_name" label="First name" required />
            <Field name="middle_name" label="Middle name" />
            <Field name="last_name" label="Last name" required />
            <div>
              <Label>Gender <span className="text-destructive">*</span></Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field name="date_of_birth" label="Date of birth" type="date" />
            <Field name="phone" label="Phone" required />
            <Field name="email" label="Email" type="email" defaultValue={user.email} required />
            <Field name="nin" label="NIN (optional)" />
          </Grid>
        </Section>

        <Section title="Location">
          <Grid>
            <div>
              <Label>Local Government Area <span className="text-destructive">*</span></Label>
              <Select value={lga} onValueChange={setLga}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select LGA…" /></SelectTrigger>
                <SelectContent>
                  {BAUCHI_LGAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field name="ward" label="Ward" />
            <Field name="polling_unit" label="Polling unit" />
            <div className="sm:col-span-2">
              <Label>Residential address</Label>
              <Textarea name="address" rows={2} className="mt-1.5" />
            </div>
          </Grid>
        </Section>

        <Section title="Additional details">
          <Grid>
            <Field name="occupation" label="Occupation" />
            <Field name="education" label="Highest qualification" />
            <div className="sm:col-span-2">
              <Label>Political / community interests</Label>
              <Textarea name="interests" rows={2} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Field name="participation" label="Preferred area of participation" />
            </div>
          </Grid>
        </Section>

        <Section title="Passport photograph">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-28 w-24 place-items-center overflow-hidden rounded-md border bg-muted">
              {photoPreview ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Preview</span>}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
              <Upload className="h-4 w-4" /> Upload photo
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            <span className="text-xs text-muted-foreground">JPG/PNG, up to 2MB. Passport style preferred.</span>
          </div>
        </Section>

        <Button type="submit" variant="tsbGreen" size="xl" className="w-full" disabled={busy}>
          {busy ? "Registering…" : "Complete registration"}
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[color:var(--tsb-blue)]">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} className="mt-1.5" />
    </div>
  );
}
