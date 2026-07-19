import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/tsb-utils";
import { eventsApi, toList } from "@/lib/api";

export const Route = createFileRoute("/events")({
  component: EventsPage,
  head: () => ({
    meta: [
      { title: "Events — Tinubu Support Bauchi 2027" },
      { name: "description", content: "Upcoming and past events, rallies and outreach activities by TSB." },
      { property: "og:title", content: "TSB Events" },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
});

interface EventItem {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
}

function EventsPage() {
  const q = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => toList<EventItem>(await eventsApi.list({ limit: 100 })),
  });
  const now = new Date();
  const items = q.data ?? [];
  const upcoming = items.filter((e) => new Date(e.event_date) >= now);
  const past = items.filter((e) => new Date(e.event_date) < now);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Calendar</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">Events</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          State meetings, ward outreach, rallies and community programmes.
        </p>
      </div>

      <Section title="Upcoming" empty="No upcoming events at the moment — check back soon." items={upcoming} tone="green" />
      <Section title="Past events" empty="Past events will appear here." items={past} tone="blue" />
    </div>
  );
}

function Section({ title, items, empty, tone }: { title: string; items: EventItem[]; empty: string; tone: "green" | "blue" }) {
  return (
    <section className="mt-14">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-extrabold">{title}</h2>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">{empty}</div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <Card key={e.id} className="overflow-hidden pt-0 pb-5 shadow-card">
              <div className={`aspect-video ${tone === "green" ? "gradient-green" : "gradient-blue"}`}>
                {e.image_url ? <img src={e.image_url} alt={e.title} className="h-full w-full object-cover" /> : (
                  <div className="flex h-full w-full items-center justify-center text-white/70"><ImageIcon className="h-10 w-10" /></div>
                )}
              </div>
              <div className="px-5">
                <div className="font-display text-lg font-bold">{e.title}</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> {formatDate(e.event_date)}
                </div>
                {e.location && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {e.location}
                  </div>
                )}
                {e.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
