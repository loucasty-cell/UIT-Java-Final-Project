import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { guestOnly } from "@/lib/route-guards";
import { normalizeRoles, getPostLoginRedirect } from "@/lib/rbac";

export const Route = createFileRoute("/login")({
  beforeLoad: guestOnly,
  head: () => ({
    meta: [
      { title: "Login — SkillBridge" },
      {
        name: "description",
        content: "Sign in to SkillBridge — Learn, Teach, and Earn skill points.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regMajor, setRegMajor] = useState("");
  const [regYear, setRegYear] = useState(1);
  const [regReferralCode, setRegReferralCode] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await login({ email: loginEmail, password: loginPassword });
      const roles = normalizeRoles(response.user?.roles || []);
      const target = getPostLoginRedirect(roles);
      toast.success(`Welcome back${response.user?.displayName ? `, ${response.user.displayName}` : ""}!`);
      navigate({ to: target });
    } catch (err: any) {
      const message = err?.message || "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regFirstName || !regLastName || !regDisplayName || !regMajor) {
      toast.error("Please fill in all required fields");
      return;
    }

    setRegLoading(true);
    try {
      const response = await register({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        displayName: regDisplayName,
        major: regMajor,
        yearOfStudy: regYear,
        referralCode: regReferralCode.trim() || undefined,
      });
      const bonus = regReferralCode.trim() ? " +30 starter & +5 referral bonus" : " +30 starter points";
      toast.success(`Account created! You received${bonus} 🎉`);
      // backend awards +30, +5 referral if code valid — not client-calculated
      navigate({ to: "/" });
    } catch (err: any) {
      const message = err?.message || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-12 lg:flex">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SkillBridge</h1>
              <p className="text-sm text-sky-300">Learn. Teach. Earn.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Share your skills.<br />
              Grow together.
            </h2>
            <p className="mt-4 max-w-md text-lg text-slate-300">
              Connect with mentors and learners in your university. Trade skills, earn points, 
              and build your expertise — all for free.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge className="rounded-full bg-sky-500/20 text-sky-300 border-sky-500/30 px-3 py-1">
              <Sparkles className="mr-1 h-3 w-3" />
              +30 starter points
            </Badge>
            <Badge className="rounded-full bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1">
              Skill swap: 0 points
            </Badge>
            <Badge className="rounded-full bg-violet-500/20 text-violet-300 border-violet-500/30 px-3 py-1">
              Volunteer mentoring
            </Badge>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-500">© 2026 SkillBridge · University of IT</p>
        </div>
      </div>

      {/* Right panel — auth forms */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SkillBridge</h1>
              <p className="text-xs text-muted-foreground">Learn. Teach. Earn.</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-2">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-11"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-11 pr-10"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={loginLoading}>
                      {loginLoading ? "Signing in..." : "Sign In"}
                      {!loginLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-first">First Name</Label>
                        <Input
                          id="reg-first"
                          placeholder="Alex"
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-last">Last Name</Label>
                        <Input
                          id="reg-last"
                          placeholder="Chen"
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-display">Display Name</Label>
                      <Input
                        id="reg-display"
                        placeholder="Alex Chen"
                        value={regDisplayName}
                        onChange={(e) => setRegDisplayName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pr-10"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-major">Major</Label>
                        <Input
                          id="reg-major"
                          placeholder="Computer Science"
                          value={regMajor}
                          onChange={(e) => setRegMajor(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-year">Year</Label>
                        <Input
                          id="reg-year"
                          type="number"
                          min={1}
                          max={6}
                          value={regYear}
                          onChange={(e) => setRegYear(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-referral">Referral Code (optional)</Label>
                      <Input
                        id="reg-referral"
                        placeholder="Enter referral code for +5 bonus pts"
                        value={regReferralCode}
                        onChange={(e) => setRegReferralCode(e.target.value)}
                      />
                    </div>

                    <div className="rounded-lg bg-sky-50 p-3 text-center">
                      <p className="text-sm text-sky-700">
                        <Sparkles className="mr-1 inline h-4 w-4" />
                        You'll receive <span className="font-bold">+30 starter points</span> on signup!
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={regLoading}>
                      {regLoading ? "Creating account..." : "Create Account"}
                      {!regLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0" />
          </Card>
        </div>
      </div>
    </div>
  );
}
