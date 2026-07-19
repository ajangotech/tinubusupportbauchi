import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactApi, ApiError } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact TSB — Tinubu Support Bauchi 2027" },
      { name: "description", content: "Contact Tinubu Support Bauchi 2027." },
      { property: "og:title", content: "Contact TSB 2027" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

function ContactPage() {
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid form"); return; }
    setBusy(true);
    try {
      await contactApi.send({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        subject: parsed.data.subject || undefined,
        message: parsed.data.message,
      });
      toast.success("Message sent — we'll get back to you shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Contact</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">Get in touch</h1>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <InfoCard icon={<MapPin />} title="Secretariat" body="TSB Headquarters, Bauchi City, Bauchi State, Nigeria" />
          <InfoCard icon={<Phone />} title="Phone" body="+234 800 000 0000" />
          <InfoCard icon={<Mail />} title="Email" body="info@tinubusupportbauchi.ng" />
        </div>
        <form onSubmit={onSubmit} className="md:col-span-3 rounded-2xl border bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" />
            <Field label="Subject" name="subject" />
          </div>
          <div className="mt-4">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required rows={6} className="mt-1.5" />
          </div>
          <Button type="submit" variant="tsbGreen" size="lg" className="mt-5" disabled={busy}>
            <Send /> {busy ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input id={name} name={name} type={type} required={required} className="mt-1.5" />
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-card">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--tsb-green)]/10 text-[color:var(--tsb-green)]">{icon}</div>
      <div>
        <div className="font-display text-sm font-bold uppercase tracking-wide">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
