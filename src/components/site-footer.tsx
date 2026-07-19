import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-[color:var(--tsb-blue)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={Logo}  className="" width={150} />
          </div>
          <p className="mt-4 text-sm text-white/70">
            A citizen movement supporting good governance, unity and development
            in Bauchi State and across Nigeria.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="X" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <div className="font-display text-sm font-bold uppercase tracking-wide">Explore</div>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/about" className="hover:text-white">About TSB</Link></li>
            <li><Link to="/leadership" className="hover:text-white">Leadership</Link></li>
            <li><Link to="/news" className="hover:text-white">News</Link></li>
            <li><Link to="/events" className="hover:text-white">Events</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-sm font-bold uppercase tracking-wide">Get involved</div>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/register" className="hover:text-white">Become a member</Link></li>
            <li><Link to="/corporate-register" className="hover:text-white">Corporate supporter</Link></li>
            <li><Link to="/verify" className="hover:text-white">Verify membership</Link></li>
            <li><Link to="/auth" className="hover:text-white">Member sign-in</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-sm font-bold uppercase tracking-wide">Contact</div>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> TSB Secretariat, Bauchi, Bauchi State, Nigeria</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /> +234 800 000 0000</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> info@tinubusupportbauchi.ng</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Tinubu Support Bauchi 2027. Together for a Greater Nigeria.
      </div>
    </footer>
  );
}