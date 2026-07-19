// Bauchi State Local Government Areas
export const BAUCHI_LGAS = [
  "Alkaleri","Bauchi","Bogoro","Damban","Darazo","Dass","Gamawa","Ganjuwa",
  "Giade","Itas/Gadau","Jama'are","Katagum","Kirfi","Misau","Ningi","Shira",
  "Tafawa Balewa","Toro","Warji","Zaki",
] as const;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-NG", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function generateMembershipCard(member: {
  membership_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  gender?: string | null;
  lga: string;
  ward?: string | null;
  created_at: string;
  photo_url?: string | null;
}, verifyUrl: string): Promise<Blob> {
  const [{ jsPDF }, QRCode] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: [86, 54], orientation: "landscape" });
  // Background
  doc.setFillColor(245, 248, 252);
  doc.rect(0, 0, 86, 54, "F");
  // Blue header
  doc.setFillColor(31, 55, 128);
  doc.rect(0, 0, 86, 14, "F");
  // Green stripe
  doc.setFillColor(46, 139, 87);
  doc.rect(0, 14, 86, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("TINUBU SUPPORT BAUCHI 2027", 4, 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Official Membership Card", 4, 10.5);

  // Photo
  if (member.photo_url) {
    try { doc.addImage(member.photo_url, "JPEG", 4, 19, 20, 24); } catch { /* ignore */ }
  } else {
    doc.setFillColor(220, 226, 236);
    doc.rect(4, 19, 20, 24, "F");
  }

  // Details
  const fullName = [member.first_name, member.middle_name, member.last_name].filter(Boolean).join(" ");
  doc.setTextColor(31, 55, 128);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(fullName.toUpperCase(), 26, 22);

  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const rows: Array<[string, string]> = [
    ["ID No.", member.membership_number],
    ["LGA", member.lga],
    ["Ward", member.ward || "—"],
    ["Gender", member.gender || "—"],
    ["Issued", new Date(member.created_at).toLocaleDateString("en-NG")],
  ];
  let y = 26.5;
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(k + ":", 26, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, 36, y);
    y += 3.2;
  }

  // QR
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 200 });
  doc.addImage(qrDataUrl, "PNG", 66, 20, 16, 16);
  doc.setFontSize(5);
  doc.setTextColor(90, 90, 90);
  doc.text("Scan to verify", 66, 38);

  // Footer
  doc.setFillColor(46, 139, 87);
  doc.rect(0, 46, 86, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6);
  doc.text("Together for a Greater Nigeria • tinubusupportbauchi.ng", 4, 51);

  return doc.output("blob");
}

export async function generateQrDataUrl(text: string): Promise<string> {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(text, { margin: 1, width: 240 });
}