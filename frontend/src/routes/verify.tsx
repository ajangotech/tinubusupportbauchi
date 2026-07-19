import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/verify")({
  component: VerifyLanding,
  head: () => ({
    meta: [
      { title: "Verify Membership — TSB 2027" },
      { name: "description", content: "Verify a Tinubu Support Bauchi 2027 membership number or QR code." },
      { property: "og:title", content: "Verify TSB Membership" },
      { property: "og:url", content: "/verify" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
});

function VerifyLanding() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gradient-green text-white shadow-elegant">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-extrabold">Verify Membership</h1>
      <p className="mt-3 text-muted-foreground">
        Enter a TSB membership number to verify authenticity. Membership cards
        also carry a QR code that opens this page directly.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav({ to: "/verify/$membership", params: { membership: q.trim() } }); }}
        className="mx-auto mt-8 flex max-w-md gap-2"
      >
        <Input value={q} onChange={(e) => setQ(e.target.value.toUpperCase())} placeholder="e.g. TSB-26-01023" className="h-12 text-center font-mono uppercase" />
        <Button type="submit" variant="tsbGreen" size="lg"><Search /> Verify</Button>
      </form>
    </div>
  );
}