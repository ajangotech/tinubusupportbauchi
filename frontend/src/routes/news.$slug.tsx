import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { blogApi, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/tsb-utils";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await blogApi.bySlug(params.slug);
      const post = (res as any)?.post ?? res;
      if (!post || !post.title) throw notFound();
      return { post };
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound();
      throw err;
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.meta_title || loaderData.post.title} — TSB` },
          { name: "description", content: loaderData.post.meta_description || loaderData.post.excerpt || "" },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt || "" },
          { property: "og:type", content: "article" },
          ...(loaderData.post.featured_image ? [{ property: "og:image", content: loaderData.post.featured_image }] : []),
        ]
      : [{ title: "Article — TSB" }, { name: "robots", content: "noindex" }],
  }),
  component: PostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold">Article not found</h1>
      <Link to="/news" className="mt-4 inline-block text-[color:var(--tsb-green)]">← Back to news</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold">Something went wrong</h1>
      <Link to="/news" className="mt-4 inline-block text-[color:var(--tsb-green)]">← Back to news</Link>
    </div>
  ),
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All news
      </Link>
      <h1 className="mt-4 font-display text-3xl font-extrabold md:text-5xl">{post.title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">
        {post.published_at ? formatDate(post.published_at) : ""} · {post.author_name || "TSB Editorial"}
      </div>
      {post.featured_image && (
        <img src={post.featured_image} alt={post.title} className="mt-6 aspect-video w-full rounded-xl object-cover shadow-elegant" />
      )}
      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-foreground/90">
        {post.content}
      </div>
    </article>
  );
}
