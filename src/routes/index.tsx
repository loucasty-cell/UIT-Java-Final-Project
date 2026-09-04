import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, CalendarCheck, Coins, LoaderCircle, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { sessionsService } from "@/services/sessions.service";
import { skillsService } from "@/services/skills.service";
import { walletService } from "@/services/wallet.service";
import type { SkillDirection, UserSkillResponse, WalletBalanceResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardExtras, SkillLevelSelect } from "@/components/dashboard-extras";
import type { SkillLevel } from "@/types/api";

export const Route = createFileRoute("/")({ component: Dashboard });
function Dashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletBalanceResponse | null>(null);
  const [skills, setSkills] = useState<UserSkillResponse[]>([]);
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<SkillDirection | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, s, sessions] = await Promise.all([
        walletService.getBalance(),
        skillsService.getUserSkills(),
        sessionsService.listSessions(),
      ]);
      setWallet(w);
      setSkills(s);
      setActive(
        sessions.filter((x) => ["ACCEPTED", "SCHEDULED", "STARTED"].includes(x.status)).length,
      );
      setCompleted(sessions.filter((x) => x.status === "COMPLETED").length);
      setError("");
    } catch (f) {
      setError(f instanceof Error ? f.message : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const remove = async (skill: UserSkillResponse) => {
    try {
      await skillsService.deleteUserSkill(skill.id);
      toast.success(`${skill.skill.name} removed`);
      await load();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not remove skill.");
    }
  };
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
      <div>
        <p className="text-sm text-muted-foreground">
          Welcome, {user?.displayName || user?.firstName || user?.email}
        </p>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live account data from SkillBridge.</p>
      </div>
      {loading && <p role="status">Loading dashboard…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
          <Button variant="link" onClick={() => void load()}>
            Retry
          </Button>
        </p>
      )}
      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={Coins} label="Available points" value={wallet?.availablePoints ?? 0} />
            <Metric icon={Coins} label="Points held" value={wallet?.heldPoints ?? 0} />
            <Metric icon={CalendarCheck} label="Active sessions" value={active} />
            <Metric icon={CalendarCheck} label="Completed sessions" value={completed} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SkillCard
              title="Skills I can teach"
              icon={Users}
              skills={skills.filter((s) => s.direction === "TEACH")}
              add={() => setAdding("TEACH")}
              remove={remove}
            />
            <SkillCard
              title="Skills I want to learn"
              icon={BookOpen}
              skills={skills.filter((s) => s.direction === "LEARN")}
              add={() => setAdding("LEARN")}
              remove={remove}
            />
          </div>
          <Card>
            <CardContent className="flex flex-wrap gap-3 p-5">
              <Button asChild>
                <Link to="/mentors">Find a mentor</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/sessions">View My Sessions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/forum">Volunteer Forum</Link>
              </Button>
            </CardContent>
          </Card>
          <DashboardExtras skills={skills} reloadSkills={load} />
        </>
      )}
      <AddSkill direction={adding} close={() => setAdding(null)} reload={load} />
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function SkillCard({
  title,
  icon: Icon,
  skills,
  add,
  remove,
}: {
  title: string;
  icon: typeof Users;
  skills: UserSkillResponse[];
  add: () => void;
  remove: (s: UserSkillResponse) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button size="sm" onClick={add}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <Badge key={s.id} variant="secondary" className="gap-2 py-1">
            {s.skill.name} · {s.level.toLowerCase()}
            <button aria-label={`Remove ${s.skill.name}`} onClick={() => void remove(s)}>
              <Trash2 className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {!skills.length && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
      </CardContent>
    </Card>
  );
}
function AddSkill({
  direction,
  close,
  reload,
}: {
  direction: SkillDirection | null;
  close: () => void;
  reload: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<SkillLevel>("BEGINNER");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!direction || !name.trim()) return;
    setBusy(true);
    try {
      await skillsService.addCustomUserSkill(name.trim(), direction, level);
      toast.success("Skill added");
      close();
      setName("");
      await reload();
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not add skill.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!direction} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {direction === "TEACH" ? "teaching" : "learning"} skill</DialogTitle>
          <DialogDescription>
            Enter any skill name. Existing catalog skills are reused automatically.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="new-skill">Skill name</Label>
          <Input
            id="new-skill"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>
        <SkillLevelSelect value={level} onChange={setLevel} />
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !name.trim()} onClick={() => void submit()}>
            {busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Add skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
