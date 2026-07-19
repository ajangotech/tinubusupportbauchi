import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  UserPlus, ArrowRight, Target, Eye, Users, Calendar, ImageIcon,
  Flag, HandHeart, Sparkles, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { blogApi, eventsApi, adminApi, toList } from "@/lib/api";
import heroImg from "@/assets/logo.png";
import outreachImg from "@/assets/one.jpeg";
import groupImg from "@/assets/two.jpeg";
import { formatDate } from "@/lib/tsb-utils";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Tinubu Support Bauchi 2027 — Together for a Greater Nigeria" },
      {
        name: "description",
        content:
          "Join Tinubu Support Bauchi 2027 — a citizen movement for good governance, unity and sustainable development across Bauchi State.",
      },
      { property: "og:title", content: "Tinubu Support Bauchi 2027 — Together for a Greater Nigeria" },
      { property: "og:description", content: "Join Tinubu Support Bauchi 2027 — a citizen movement for good governance, unity and sustainable development across Bauchi State." },
      { property: "og:url", content: "/" },
    ],
  }),
});

interface NewsItem {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  author_name?: string | null;
}
interface EventItem {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  location?: string | null;
  image_url?: string | null;
}

function HomePage() {
  const stats = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      try {
        const s = await adminApi.dashboard();
        const d: any = (s as any)?.stats ?? s;
        return {
          members: d.members ?? d.total_members ?? 0,
          corporate: d.corporate ?? d.total_corporates ?? 0,
          events: d.events ?? d.total_events ?? 0,
          posts: d.posts ?? d.total_posts ?? 0,
        };
      } catch {
        return { members: 0, corporate: 0, events: 0, posts: 0 };
      }
    },
  });

  const news = useQuery({
    queryKey: ["home-news"],
    queryFn: async () => toList<NewsItem>(await blogApi.list({ limit: 3 })),
  });

  const events = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => toList<EventItem>(await eventsApi.list({ limit: 2, upcoming: true })),
  });

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-24 pt-14 md:grid-cols-2 md:pt-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--tsb-green)]/30 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)] backdrop-blur">
              <Flag className="h-3.5 w-3.5" /> Bauchi State • 2027
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-foreground md:text-6xl">
              Together We Support{" "}
              <span className="text-[color:var(--tsb-green)]">President Tinubu</span>{" "}
              <span className="text-[color:var(--tsb-blue)]">For a Greater Nigeria</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Tinubu Support Bauchi (TSB) is a movement of committed individuals
              working for progress, unity and sustainable development in Bauchi
              State and Nigeria at large.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="tsbGreen" size="xl">
                <Link to="/register"><UserPlus /> Become a Member</Link>
              </Button>
              <Button asChild variant="tsbBlue" size="xl">
                <Link to="/about">Learn More <ArrowRight /></Link>
              </Button>
            </div>
            <div className="mt-6 flex gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-[color:var(--tsb-green)]" />
              Verified movement • Registered members • Transparent operations
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-[color:var(--tsb-sky)]/25 blur-3xl" aria-hidden />
            <img src={heroImg} alt="President Bola Ahmed Tinubu" className="relative mx-auto w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[color:var(--tsb-blue)]" aria-hidden />
      </section>

      {/* ============ STATS ============ */}
      <section className="relative z-10 -mt-14 px-4">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-2xl bg-white p-6 shadow-elegant md:grid-cols-4 md:p-8">
          <Stat icon={<Users />} value={`${(stats.data?.members ?? 0).toLocaleString()}+`} label="Registered Members" tone="green" />
          <Stat icon={<Flag />} value="20" label="LGAs Reached" tone="blue" />
          <Stat icon={<Sparkles />} value={`${stats.data?.events ?? 0}+`} label="Events & Outreach" tone="green" />
          <Stat icon={<HandHeart />} value="1 Goal" label="A Greater Nigeria" tone="blue" />
        </div>
      </section>

      {/* ============ FEATURE CARDS ============ */}
      <section className="mx-auto mt-16 grid max-w-7xl gap-4 px-4 md:grid-cols-5">
        <FeatureCard
          tone="blue"
          icon={<Target />}
          title="Our Mission"
          body="To mobilize support for the renewed hope agenda and promote good governance, unity and development across Bauchi State."
          cta={<Link to="/about#mission">Read more</Link>}
        />
        <FeatureCard
          tone="green"
          icon={<Eye />}
          title="Our Vision"
          body="A prosperous, united and developed Nigeria where every citizen enjoys peace, opportunity and a better quality of life."
          cta={<Link to="/about#vision">Read more</Link>}
        />
        <FeatureCard
          tone="muted"
          icon={<Users />}
          title="Become a Member"
          body="Join thousands of people across Bauchi State supporting the vision for a better Nigeria."
          cta={<Link to="/register">Register now</Link>}
        />
        <FeatureCard
          tone="blue"
          icon={<Calendar />}
          title="Upcoming Events"
          body={
            events.data?.length
              ? events.data.map((e: EventItem) => `${formatDate(e.event_date)} — ${e.title}`).join(" • ")
              : "Meetings, rallies and community outreach across all 20 LGAs."
          }
          cta={<Link to="/events">View all</Link>}
        />
        <FeatureCard
          tone="green"
          icon={<ImageIcon />}
          title="Photo Gallery"
          body="Moments from our meetings, outreach and community activities."
          cta={<Link to="/news">View gallery</Link>}
        />
      </section>

      {/* ============ ABOUT ============ */}
      <section className="mx-auto mt-24 grid max-w-7xl gap-12 px-4 md:grid-cols-2">
        <div className="relative">
          <img src={outreachImg} alt="TSB community outreach" className="rounded-2xl shadow-elegant" />
          <img src={groupImg} alt="TSB team" className="absolute -bottom-8 -right-4 hidden w-2/3 rounded-xl border-4 border-background shadow-elegant md:block" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">About TSB</div>
          <h2 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
            A citizen movement <span className="text-[color:var(--tsb-blue)]">rooted in Bauchi</span>, committed to Nigeria.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tinubu Support Bauchi 2027 (TSB) unites citizens, professionals,
            youths, women and traditional stakeholders in a shared cause:
            advancing good governance and delivering the Renewed Hope agenda
            to every ward in Bauchi State.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Grassroots engagement across all 20 LGAs",
              "Youth and women empowerment",
              "Peace, unity and civic participation",
              "Transparent, accountable leadership",
            ].map((v) => (
              <li key={v} className="flex items-start gap-2 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--tsb-green)]" />
                {v}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="tsbGreen"><Link to="/about">Read our story</Link></Button>
            <Button asChild variant="outline"><Link to="/leadership">Meet our leaders</Link></Button>
          </div>
        </div>
      </section>

      {/* ============ NEWS ============ */}
      <section className="mx-auto mt-24 max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Latest</div>
            <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">News & Announcements</h2>
          </div>
          <Button asChild variant="ghost"><Link to="/news">All news <ArrowRight /></Link></Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(news.data?.length ? news.data : placeholderNews).map((p: NewsItem) => (
            <Card key={p.slug} className="group overflow-hidden pt-0 pb-6 shadow-card transition-shadow hover:shadow-elegant">
              <div className="aspect-video overflow-hidden gradient-blue">
                {p.featured_image ? (
                  <img src={p.featured_image} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/70"><ImageIcon className="h-10 w-10" /></div>
                )}
              </div>
              <div className="px-5">
                <div className="text-xs text-muted-foreground">
                  {p.published_at ? formatDate(p.published_at) : "Coming soon"} · {p.author_name || "TSB Editorial"}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-tight">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <Link to="/news" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--tsb-green)] hover:underline">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto mt-24 max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-blue p-10 text-center text-white md:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[color:var(--tsb-green)]/25 blur-3xl" aria-hidden />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[color:var(--tsb-red)]/20 blur-3xl" aria-hidden />
          <h2 className="relative font-display text-3xl font-extrabold md:text-5xl">
            Ready to join the movement?
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-white/85">
            Register today, get your digital membership card, and stand with
            thousands of Bauchi citizens shaping a greater Nigeria.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="tsbGreen" size="xl"><Link to="/register">Register as member</Link></Button>
            <Button asChild variant="tsbRed" size="xl"><Link to="/corporate-register">Corporate supporter</Link></Button>
          </div>
        </div>
      </section>

      <div className="h-8" />
    </>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "green" | "blue" }) {
  const bg = tone === "green" ? "gradient-green" : "gradient-blue";
  return (
    <div className="flex items-center gap-4">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${bg} text-white`}>{icon}</div>
      <div>
        <div className={`font-display text-2xl font-extrabold ${tone === "green" ? "text-[color:var(--tsb-green)]" : "text-[color:var(--tsb-blue)]"}`}>{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  tone, icon, title, body, cta,
}: {
  tone: "green" | "blue" | "muted";
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: React.ReactNode;
}) {
  const styles =
    tone === "green"
      ? "gradient-green text-white"
      : tone === "blue"
        ? "gradient-blue text-white"
        : "bg-muted text-foreground";
  const btn =
    tone === "muted"
      ? "bg-[color:var(--tsb-green)] text-white"
      : "bg-white text-foreground";
  return (
    <div className={`flex flex-col rounded-2xl p-6 shadow-card ${styles}`}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white [.bg-muted_&]:bg-white [.bg-muted_&]:text-[color:var(--tsb-blue)]">
        {icon}
      </div>
      <div className="mt-4 font-display text-lg font-bold uppercase tracking-wide">{title}</div>
      <div className={`mt-2 flex-1 text-sm ${tone === "muted" ? "text-muted-foreground" : "text-white/85"}`}>{body}</div>
      <div className={`mt-5 inline-flex w-fit items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${btn}`}>{cta}</div>
    </div>
  );
}

const placeholderNews = [
  //{ slug: "welcome", title: "Welcome to Tinubu Support Bauchi 2027", excerpt: "Our official platform is now live. Register today and stand with thousands of Bauchi citizens.", featured_image: null, published_at: new Date().toISOString(), author_name: "TSB Editorial" },
  //{ slug: "outreach", title: "Community outreach across the 20 LGAs", excerpt: "Volunteers spread the Renewed Hope message to communities in every corner of Bauchi State.", featured_image: null, published_at: new Date().toISOString(), author_name: "TSB Editorial" },
  //{ slug: "youth", title: "Empowering Bauchi youth for 2027 and beyond", excerpt: "TSB's youth programme is opening opportunities for training, mentorship and civic engagement.", featured_image: null, published_at: new Date().toISOString(), author_name: "TSB Editorial" },
];
