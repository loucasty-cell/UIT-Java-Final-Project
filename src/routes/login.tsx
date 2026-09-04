import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.login({ email, password });
      await navigate({ to: "/wallet", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="flex min-h-[70vh] items-center justify-center p-6"><Card className="w-full max-w-md"><CardHeader><CardTitle>Sign in to SkillBridge</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>{error && <p className="text-sm text-destructive">{error}</p>}<Button className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button><p className="text-center text-sm text-muted-foreground"><Link className="text-primary hover:underline" to="/">Back to dashboard</Link></p></form></CardContent></Card></div>;
}
