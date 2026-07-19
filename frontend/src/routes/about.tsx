import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, ShieldCheck, HandHeart, Users, Heart, Sparkles, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About TSB — Tinubu Support Bauchi 2027" },
      { name: "description", content: "About Tinubu Support Bauchi 2027 — our mission, vision and core values for a greater Nigeria." },
      { property: "og:title", content: "About Tinubu Support Bauchi 2027" },
      { property: "og:description", content: "Our mission, vision and core values." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const values = [
  { icon: <ShieldCheck />, title: "Integrity", body: "We act honestly and stand accountable in all we do." },
  { icon: <HandHeart />, title: "Service", body: "Serving the people of Bauchi State and Nigeria." },
  { icon: <Users />, title: "Unity", body: "One movement, one people, one destination." },
  { icon: <Scale />, title: "Accountability", body: "Transparent operations at every level." },
  { icon: <Heart />, title: "Patriotism", body: "Committed to Nigeria's prosperity and progress." },
  { icon: <Sparkles />, title: "Development", body: "Driving sustainable growth in our communities." },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">About TSB</div>
      <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">
        Who we are and what we stand for
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Tinubu Support Bauchi 2027 (TSB) is a non-partisan citizen movement based
        in Bauchi State, Nigeria. We unite professionals, youth, women,
        traditional stakeholders and grassroots members behind the Renewed Hope
        agenda of President Bola Ahmed Tinubu — advocating for good governance,
        peace, unity and sustainable development.
      </p>

      <section id="mission" className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl gradient-blue p-8 text-white shadow-elegant">
          <Target className="h-10 w-10" />
          <h2 className="mt-4 font-display text-2xl font-extrabold">Our Mission</h2>
          <p className="mt-3 text-white/90">
            To mobilize support for the Renewed Hope agenda and promote good
            governance, youth empowerment, economic growth, peace and
            democratic participation across Bauchi State and Nigeria.
          </p>
        </div>
        <div id="vision" className="rounded-2xl gradient-green p-8 text-white shadow-elegant">
          <Eye className="h-10 w-10" />
          <h2 className="mt-4 font-display text-2xl font-extrabold">Our Vision</h2>
          <p className="mt-3 text-white/90">
            A prosperous, united and developed Nigeria where every citizen
            enjoys peace, opportunity and a better quality of life — starting
            with the communities of Bauchi State.
          </p>
        </div>
      </section>

      <section id="values" className="mt-16">
        <h2 className="font-display text-3xl font-extrabold">Core Values</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--tsb-green)]/10 text-[color:var(--tsb-green)]">{v.icon}</div>
              <div className="mt-3 font-display text-lg font-bold">{v.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{v.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border bg-muted/50 p-8 text-center">
        <h2 className="font-display text-2xl font-extrabold">Ready to stand with us?</h2>
        <p className="mt-2 text-muted-foreground">Registration is free and takes less than 2 minutes.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button asChild variant="tsbGreen"><Link to="/register">Become a member</Link></Button>
          <Button asChild variant="tsbBlue"><Link to="/corporate-register">Corporate supporter</Link></Button>
        </div>
      </section>
    </div>
  );
}