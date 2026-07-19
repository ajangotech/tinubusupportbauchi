import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import Logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — TSB 2027" },
      { name: "description", content: "Sign in or create an account on Tinubu Support Bauchi 2027." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("")),
});

function AuthPage() {
  const nav = useNavigate();
  const { user, login, register } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/dashboard" });
  }, [user, nav]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = loginSchema.safeParse(fd);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = signupSchema.safeParse(fd);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      await register({
        name: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        phone: parsed.data.phone || undefined,
      });
      toast.success("Account created. Complete your membership next.");
      nav({ to: "/register" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <img src={Logo}  className="mx-auto"  width={100} />
        <h1 className="mt-4 font-display text-3xl font-extrabold">Member Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in or create an account to continue</p>
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-card">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-4 space-y-3">
              <Field name="email" label="Email" type="email" />
              <Field name="password" label="Password" type="password" />
              <Button type="submit" variant="tsbGreen" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-4 space-y-3">
              <Field name="fullName" label="Full name" />
              <Field name="email" label="Email" type="email" />
              <Field name="phone" label="Phone (optional)" />
              <Field name="password" label="Password (min 6)" type="password" />
              <Button type="submit" variant="tsbGreen" className="w-full" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms. <Link to="/contact" className="underline">Need help?</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={type !== "text" || name !== "phone"} className="mt-1.5" />
    </div>
  );
}
