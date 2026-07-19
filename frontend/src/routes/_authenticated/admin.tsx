import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Building2, FileText, Calendar, MessageSquare, ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/tsb-utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { adminApi, blogApi, eventsApi, leadershipApi, toList, ApiError } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPanel,
  head: () => ({ meta: [{ title: "Admin — TSB" }, { name: "robots", content: "noindex" }] }),
});

const STAFF_ROLES = ["super_admin", "admin", "membership_officer", "corporate_officer", "editor"];

function reportError(err: unknown) {
  toast.error(err instanceof ApiError ? err.message : "Request failed");
}

function AdminPanel() {
  const nav = useNavigate();
  const { user, logout, loading } = useAuth();

  const roles: string[] = user?.roles ?? (user?.role ? [user.role] : []);
  const isStaff = roles.some((r) => STAFF_ROLES.includes(r));

  const stats = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!isStaff,
    queryFn: async () => {
      try {
        const s = await adminApi.dashboard();
        return (s as any)?.stats ?? s;
      } catch {
        return {} as any;
      }
    },
  });

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-extrabold">Staff access only</h1>
        <p className="mt-2 text-muted-foreground">You don't have an admin role assigned. Contact a super admin to be added.</p>
        <Button asChild variant="outline" className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  async function signOut() {
    await logout();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  const s: any = stats.data ?? {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">TSB Admin</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Control Panel</h1>
        </div>
        <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users />} label="Members" value={s.members ?? s.total_members ?? 0} sub={`${s.pendingMembers ?? s.pending_members ?? 0} pending`} tone="green" />
        <StatCard icon={<Building2 />} label="Corporate" value={s.corporate ?? s.corp ?? s.total_corporates ?? 0} sub={`${s.pendingCorp ?? s.pending_corporates ?? 0} pending`} tone="blue" />
        <StatCard icon={<FileText />} label="Blog posts" value={s.posts ?? s.total_posts ?? 0} tone="green" />
        <StatCard icon={<Calendar />} label="Events" value={s.events ?? s.total_events ?? 0} tone="blue" />
      </div>

      <Tabs defaultValue="members" className="mt-10">
        <TabsList className="w-full flex-wrap justify-start">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
          <TabsTrigger value="posts">Blog</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="leaders">Leadership</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="members"><MembersTab /></TabsContent>
        <TabsContent value="corporate"><CorporateTab /></TabsContent>
        <TabsContent value="posts"><PostsTab /></TabsContent>
        <TabsContent value="events"><EventsTab /></TabsContent>
        <TabsContent value="leaders"><LeadersTab /></TabsContent>
        <TabsContent value="messages"><MessagesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, value, label, sub, tone }: { icon: React.ReactNode; value: number; label: string; sub?: string; tone: "green" | "blue" }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-full ${tone === "green" ? "gradient-green" : "gradient-blue"} text-white`}>{icon}</div>
        <div>
          <div className="font-display text-2xl font-extrabold">{Number(value).toLocaleString()}</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
      </div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function MembersTab() {
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["admin-members", q],
    queryFn: async () => toList<any>(await adminApi.members({ search: q || undefined, limit: 200 })),
  });

  async function approve(id: string) { try { await adminApi.approveMember(id); toast.success("Approved"); list.refetch(); } catch (e) { reportError(e); } }
  async function suspend(id: string) { try { await adminApi.suspendMember(id); toast.success("Suspended"); list.refetch(); } catch (e) { reportError(e); } }

  function exportCsv() {
    const rows = list.data ?? [];
    const headers = ["membership_number","first_name","last_name","gender","phone","email","lga","ward","status","created_at"];
    const csv = [headers.join(","), ...rows.map((r: any) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tsb-members.csv"; a.click();
  }

  return (
    <Card className="mt-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search name, phone, ID…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">LGA</th><th className="p-2">Phone</th><th className="p-2">Joined</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {list.data?.map((m: any) => (
              <tr key={m.id} className="border-b">
                <td className="p-2 font-mono text-xs">{m.membership_number}</td>
                <td className="p-2">{m.first_name} {m.last_name}</td>
                <td className="p-2">{m.lga}</td>
                <td className="p-2">{m.phone}</td>
                <td className="p-2">{formatDate(m.created_at)}</td>
                <td className="p-2"><Badge variant={m.status === "approved" ? "default" : "secondary"}>{m.status}</Badge></td>
                <td className="p-2 space-x-1">
                  <Button size="sm" variant="outline" onClick={() => approve(m.id)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => suspend(m.id)}>Suspend</Button>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No members yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CorporateTab() {
  const list = useQuery({
    queryKey: ["admin-corp"],
    queryFn: async () => toList<any>(await adminApi.corporates({ limit: 200 })),
  });
  async function approve(id: string) { try { await adminApi.approveCorporate(id); toast.success("Approved"); list.refetch(); } catch (e) { reportError(e); } }
  async function reject(id: string) { try { await adminApi.rejectCorporate(id); toast.success("Rejected"); list.refetch(); } catch (e) { reportError(e); } }

  return (
    <Card className="mt-4 p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">Reg. No</th><th className="p-2">Organization</th><th className="p-2">Type</th><th className="p-2">Contact</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {list.data?.map((o: any) => (
              <tr key={o.id} className="border-b">
                <td className="p-2 font-mono text-xs">{o.registration_number}</td>
                <td className="p-2">{o.organization_name}</td>
                <td className="p-2">{o.organization_type}</td>
                <td className="p-2">{o.contact_person}<br/><span className="text-xs text-muted-foreground">{o.phone}</span></td>
                <td className="p-2"><Badge variant={o.status === "approved" ? "default" : "secondary"}>{o.status}</Badge></td>
                <td className="p-2 space-x-1">
                  <Button size="sm" variant="outline" onClick={() => approve(o.id)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => reject(o.id)}>Reject</Button>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No corporate registrations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PostsTab() {
  const [creating, setCreating] = useState(false);
  const list = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => toList<any>(await blogApi.adminList()),
  });
  const cats = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => toList<any>(await blogApi.categories()),
  });

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const fd = new FormData(el);
    if (!fd.get("title") || !fd.get("content")) return toast.error("Title and content are required");
    try {
      await blogApi.create(fd);
      toast.success("Post saved");
      setCreating(false);
      list.refetch();
      el.reset();
    } catch (err) { reportError(err); }
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    try { await blogApi.delete(id); toast.success("Deleted"); list.refetch(); } catch (e) { reportError(e); }
  }

  return (
    <div className="mt-4 space-y-4">
      <Button onClick={() => setCreating(!creating)} variant="tsbGreen">{creating ? "Cancel" : "New post"}</Button>
      {creating && (
        <Card className="p-4">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Title</Label><Input name="title" required /></div>
            <div><Label>Category</Label>
              <select name="category_id" className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">—</option>
                {cats.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><Label>Status</Label>
              <select name="status" className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm" defaultValue="published">
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
            </div>
            <div><Label>Author name</Label><Input name="author_name" defaultValue="TSB Editorial" /></div>
            <div><Label>Featured image</Label><Input type="file" name="featured_image" accept="image/*" /></div>
            <div className="sm:col-span-2"><Label>Excerpt</Label><Textarea name="excerpt" rows={2} /></div>
            <div className="sm:col-span-2"><Label>Content</Label><Textarea name="content" rows={10} required /></div>
            <div className="sm:col-span-2"><Button variant="tsbGreen">Save post</Button></div>
          </form>
        </Card>
      )}
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">Title</th><th className="p-2">Status</th><th className="p-2">Date</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {list.data?.map((p: any) => (
              <tr key={p.id} className="border-b"><td className="p-2">{p.title}</td>
                <td className="p-2"><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></td>
                <td className="p-2">{formatDate(p.created_at)}</td>
                <td className="p-2 space-x-1"><Button size="sm" variant="outline" onClick={() => del(p.id)}>Delete</Button></td></tr>
            ))}
            {list.data?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No posts yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function EventsTab() {
  const [creating, setCreating] = useState(false);
  const list = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => toList<any>(await eventsApi.adminList()),
  });
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const fd = new FormData(el);
    if (!fd.get("title") || !fd.get("event_date")) return toast.error("Title and date required");
    try { await eventsApi.create(fd); toast.success("Created"); list.refetch(); setCreating(false); el.reset(); } catch (err) { reportError(err); }
  }
  async function del(id: string) {
    if (!confirm("Delete this event?")) return;
    try { await eventsApi.delete(id); toast.success("Deleted"); list.refetch(); } catch (e) { reportError(e); }
  }
  return (
    <div className="mt-4 space-y-4">
      <Button onClick={() => setCreating(!creating)} variant="tsbBlue">{creating ? "Cancel" : "New event"}</Button>
      {creating && (
        <Card className="p-4"><form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Title</Label><Input name="title" required /></div>
          <div><Label>Date & time</Label><Input type="datetime-local" name="event_date" required /></div>
          <div><Label>Location</Label><Input name="location" /></div>
          <div className="sm:col-span-2"><Label>Image</Label><Input type="file" name="image" accept="image/*" /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea name="description" rows={4} /></div>
          <div className="sm:col-span-2"><Button variant="tsbBlue">Save event</Button></div>
        </form></Card>
      )}
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">Title</th><th className="p-2">Date</th><th className="p-2">Location</th><th className="p-2">Actions</th></tr></thead>
          <tbody>{list.data?.map((e: any) => (
            <tr key={e.id} className="border-b"><td className="p-2">{e.title}</td><td className="p-2">{formatDate(e.event_date)}</td><td className="p-2">{e.location || "—"}</td><td className="p-2"><Button size="sm" variant="outline" onClick={() => del(e.id)}>Delete</Button></td></tr>
          ))}
          {list.data?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No events yet.</td></tr>}</tbody>
        </table>
      </Card>
    </div>
  );
}

function LeadersTab() {
  const list = useQuery({
    queryKey: ["admin-leaders"],
    queryFn: async () => toList<any>(await leadershipApi.adminList()),
  });
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const fd = new FormData(el);
    try { await leadershipApi.create(fd); toast.success("Added"); list.refetch(); el.reset(); } catch (err) { reportError(err); }
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    try { await leadershipApi.delete(id); list.refetch(); } catch (e) { reportError(e); }
  }
  return (
    <div className="mt-4 space-y-4">
      <Card className="p-4">
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <div><Label>Full name</Label><Input name="full_name" required /></div>
          <div><Label>Position</Label><Input name="position" required /></div>
          <div className="sm:col-span-2"><Label>Bio</Label><Textarea name="bio" rows={2} /></div>
          <div><Label>Photo</Label><Input type="file" name="photo" accept="image/*" /></div>
          <div><Label>Sort order</Label><Input type="number" name="sort_order" defaultValue="0" /></div>
          <div><Label>Facebook</Label><Input name="facebook_url" /></div>
          <div><Label>X/Twitter</Label><Input name="twitter_url" /></div>
          <div><Label>Instagram</Label><Input name="instagram_url" /></div>
          <div className="sm:col-span-2"><Button variant="tsbGreen">Add leader</Button></div>
        </form>
      </Card>
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">Name</th><th className="p-2">Position</th><th className="p-2">Actions</th></tr></thead>
          <tbody>{list.data?.map((l: any) => <tr key={l.id} className="border-b"><td className="p-2">{l.full_name}</td><td className="p-2">{l.position}</td><td className="p-2"><Button size="sm" variant="outline" onClick={() => del(l.id)}>Delete</Button></td></tr>)}
          {list.data?.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Add leadership team members above.</td></tr>}</tbody>
        </table>
      </Card>
    </div>
  );
}

function MessagesTab() {
  const list = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => toList<any>(await adminApi.messages({ limit: 100 })),
  });
  async function markRead(id: string) {
    try { await adminApi.updateMessage(id, { is_read: true }); list.refetch(); } catch (e) { reportError(e); }
  }
  return (
    <div className="mt-4 space-y-3">
      {list.data?.map((m: any) => (
        <Card key={m.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted"><MessageSquare className="h-4 w-4" /></div>
            <div className="font-semibold">{m.name}</div>
            <span className="text-sm text-muted-foreground">{m.email} · {m.phone || ""}</span>
            {!m.is_read && <Badge variant="destructive">New</Badge>}
            <span className="ml-auto text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
          </div>
          {m.subject && <div className="mt-2 font-medium">{m.subject}</div>}
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
          {!m.is_read && <Button size="sm" variant="outline" className="mt-3" onClick={() => markRead(m.id)}>Mark as read</Button>}
        </Card>
      ))}
      {list.data?.length === 0 && <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">No messages yet.</div>}
    </div>
  );
}
