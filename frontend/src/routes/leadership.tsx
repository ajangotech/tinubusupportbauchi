import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { leadershipApi, toList } from "@/lib/api";

export const Route = createFileRoute("/leadership")({
  component: LeadershipPage,
  head: () => ({
    meta: [
      { title: "Leadership — Tinubu Support Bauchi 2027" },
      { name: "description", content: "Meet the leaders driving Tinubu Support Bauchi 2027." },
      { property: "og:title", content: "Leadership — TSB 2027" },
      { property: "og:url", content: "/leadership" },
    ],
    links: [{ rel: "canonical", href: "/leadership" }],
  }),
});

interface Leader {
  full_name: string;
  position: string;
  bio?: string | null;
  photo_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
}

const placeholders: Leader[] = [
  { full_name: "Alh. Muhammad Yakubu", position: "State Coordinator", bio: "Seasoned public administrator championing grassroots engagement across the 20 LGAs.", photo_url: null, facebook_url: "#", twitter_url: "#", instagram_url: null },
  { full_name: "Barr. Amina Ibrahim", position: "Deputy Coordinator", bio: "Legal practitioner and women-empowerment advocate leading policy dialogue.", photo_url: null, facebook_url: null, twitter_url: "#", instagram_url: "#" },
  { full_name: "Engr. Sadiq Adamu", position: "Director of Operations", bio: "Coordinates our field operations, logistics and outreach programmes.", photo_url: null, facebook_url: "#", twitter_url: null, instagram_url: null },
  { full_name: "Hajiya Fatima Bello", position: "Women's Wing Chair", bio: "Mobilises women groups across all 20 LGAs of Bauchi State.", photo_url: null, facebook_url: null, twitter_url: "#", instagram_url: "#" },
  { full_name: "Comrade Ismail Musa", position: "Youth Coordinator", bio: "Rallies young Bauchi citizens for civic engagement and empowerment.", photo_url: null, facebook_url: "#", twitter_url: "#", instagram_url: null },
  { full_name: "Prof. Kabir Adamu", position: "Policy Advisor", bio: "Provides strategic policy input on governance and development.", photo_url: null, facebook_url: null, twitter_url: "#", instagram_url: null },
];

function LeadershipPage() {
  const q = useQuery({
    queryKey: ["leadership"],
    queryFn: async () => toList<Leader>(await leadershipApi.list()),
  });

  const leaders: Leader[] = q.data && q.data.length > 0 ? q.data : placeholders;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Leadership</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">Meet our leaders</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Committed men and women coordinating TSB's grassroots engagement, outreach and advocacy across Bauchi State.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leaders.map((l: Leader, i: number) => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-elegant">
            <div className="aspect-[4/3] gradient-blue">
              {l.photo_url ? (
                <img src={l.photo_url} alt={l.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-6xl font-extrabold text-white/40">
                  {l.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="font-display text-lg font-bold">{l.full_name}</div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[color:var(--tsb-green)]">{l.position}</div>
              <p className="mt-2 text-sm text-muted-foreground">{l.bio}</p>
              <div className="mt-4 flex gap-2 text-muted-foreground">
                {l.facebook_url && <a href={l.facebook_url} className="hover:text-[color:var(--tsb-blue)]"><Facebook className="h-4 w-4" /></a>}
                {l.twitter_url && <a href={l.twitter_url} className="hover:text-[color:var(--tsb-blue)]"><Twitter className="h-4 w-4" /></a>}
                {l.instagram_url && <a href={l.instagram_url} className="hover:text-[color:var(--tsb-blue)]"><Instagram className="h-4 w-4" /></a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
