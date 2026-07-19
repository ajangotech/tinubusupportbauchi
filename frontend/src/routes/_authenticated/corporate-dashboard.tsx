import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/tsb-utils";
import { corporateApi } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/corporate-dashboard")({
  component: CorpDash,
  head: () => ({ meta: [{ title: "Corporate Dashboard — TSB" }, { name: "robots", content: "noindex" }] }),
});

async function downloadCert(org: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  doc.setFillColor(245, 248, 252); doc.rect(0, 0, 297, 210, "F");
  doc.setDrawColor(31, 55, 128); doc.setLineWidth(2); doc.rect(10, 10, 277, 190);
  doc.setDrawColor(46, 139, 87); doc.setLineWidth(0.5); doc.rect(14, 14, 269, 182);
  doc.setFont("helvetica","bold"); doc.setFontSize(24); doc.setTextColor(31,55,128);
  doc.text("TINUBU SUPPORT BAUCHI 2027", 148, 40, { align: "center" });
  doc.setFontSize(14); doc.setTextColor(46,139,87);
  doc.text("Certificate of Corporate Registration", 148, 52, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(60,60,60); doc.setFont("helvetica","normal");
  doc.text("This is to certify that", 148, 80, { align: "center" });
  doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(31,55,128);
  doc.text(org.organization_name, 148, 95, { align: "center" });
  doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.setTextColor(60,60,60);
  doc.text("has been officially registered as a corporate supporter of the movement.", 148, 110, { align: "center" });
  doc.setFont("helvetica","bold"); doc.setFontSize(14);
  doc.text(`Registration No: ${org.registration_number}`, 148, 130, { align: "center" });
  doc.setFont("helvetica","normal"); doc.setFontSize(10);
  doc.text(`Issued on ${new Date(org.created_at).toLocaleDateString("en-NG")}`, 148, 140, { align: "center" });
  doc.setDrawColor(31,55,128); doc.line(60, 175, 130, 175); doc.line(167, 175, 237, 175);
  doc.setFontSize(9); doc.text("Coordinator, TSB 2027", 95, 181, { align: "center" });
  doc.text("State Secretary", 202, 181, { align: "center" });
  doc.save(`TSB-CORP-${org.registration_number}.pdf`);
}

function CorpDash() {
  const org = useQuery({
    queryKey: ["my-corp"],
    queryFn: async () => {
      try {
        const res = await corporateApi.profile();
        return (res as any)?.organization ?? res;
      } catch {
        return null;
      }
    },
  });

  if (org.isLoading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  if (!org.data) return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-extrabold">No organization on file</h1>
      <Button asChild variant="tsbBlue" className="mt-6"><Link to="/corporate-register">Register organization</Link></Button>
    </div>
  );

  const o = org.data;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full gradient-blue text-white"><Building2 /></div>
        <div>
          <h1 className="font-display text-3xl font-extrabold">{o.organization_name}</h1>
          <div className="font-mono text-sm text-muted-foreground">{o.registration_number}</div>
        </div>
        <Badge className="ml-auto uppercase" variant={o.status === "approved" ? "default" : "secondary"}>{o.status}</Badge>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border bg-card p-6 shadow-card sm:grid-cols-2">
        <Row k="Type" v={o.organization_type} />
        <Row k="CAC number" v={o.cac_number || "—"} />
        <Row k="Contact person" v={o.contact_person} />
        <Row k="Phone" v={o.phone} />
        <Row k="Email" v={o.email} />
        <Row k="LGA" v={o.lga || "—"} />
        <Row k="Website" v={o.website || "—"} />
        <Row k="Registered on" v={formatDate(o.created_at)} />
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="tsbBlue" onClick={() => downloadCert(o)} disabled={o.status !== "approved"}>
          <Download /> {o.status === "approved" ? "Download certificate" : "Awaiting approval"}
        </Button>
        <Button asChild variant="outline"><Link to="/contact">Support</Link></Button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b py-1.5 last:border-none">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{v}</span>
    </div>
  );
}
