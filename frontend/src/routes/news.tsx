import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ImageIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/tsb-utils";
import { blogApi, toList } from "@/lib/api";

export const Route = createFileRoute("/news")({
  component: NewsPage,
  head: () => ({
    meta: [
      { title: "News & Announcements — TSB 2027" },
      { name: "description", content: "Latest news from Tinubu Support Bauchi 2027." },
      { property: "og:title", content: "TSB News & Announcements" },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
});

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  author_name?: string | null;
}

function NewsPage() {
  const [q, setQ] = useState("");
  const posts = useQuery({
    queryKey: ["news", q],
    queryFn: async () => toList<Post>(await blogApi.list({ search: q || undefined, limit: 60 })),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">Newsroom</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">News & Announcements</h1>
      </div>
      <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border bg-card px-4 shadow-card">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news…" className="border-0 shadow-none focus-visible:ring-0" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.data?.length === 0 && (
          <div className="col-span-full rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
            No posts yet. Check back soon.
          </div>
        )}
        {posts.data?.map((p) => (
          <Card key={p.slug} className="group overflow-hidden pt-0 pb-6 shadow-card transition-shadow hover:shadow-elegant">
            <Link to="/news/$slug" params={{ slug: p.slug }}>
              <div className="aspect-video overflow-hidden gradient-blue">
                {p.featured_image ? (
                  <img src={p.featured_image} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/70"><ImageIcon className="h-10 w-10" /></div>
                )}
              </div>
            </Link>
            <div className="px-5">
              <div className="text-xs text-muted-foreground">
                {p.published_at ? formatDate(p.published_at) : ""} · {p.author_name || "TSB Editorial"}
              </div>
              <Link to="/news/$slug" params={{ slug: p.slug }} className="mt-2 block font-display text-lg font-bold leading-tight hover:text-[color:var(--tsb-green)]">
                {p.title}
              </Link>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
