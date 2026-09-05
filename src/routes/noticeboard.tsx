import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Clock3, Lightbulb, Plus, Search, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { learningNeedsService } from "@/services/learning-needs.service";
import { skillsService } from "@/services/skills.service";
import type { LearningNeedResponse, UserSkillResponse } from "@/types/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/noticeboard")({ component: NoticeboardPage });
type NoticeboardMode = "POINTS" | "SKILL_SWAP" | "VOLUNTEER";
const modeLabel = (mode: NoticeboardMode) => ({
  POINTS: "Points (10 points)",
  SKILL_SWAP: "Skill exchange",
  VOLUNTEER: "Volunteer (free)",
}[mode]);

function NoticeboardPage() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<LearningNeedResponse[]>([]);
  const [teachSkills, setTeachSkills] = useState<UserSkillResponse[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [offering, setOffering] = useState<LearningNeedResponse | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [items, skills] = await Promise.all([
        learningNeedsService.list(),
        skillsService.getUserSkills("TEACH"),
      ]);
      setNeeds(items);
      setTeachSkills(skills);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load learning needs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useLiveRefresh(load);
  useEffect(() => {
    void load();
  }, [load]);

  const filteredNeeds = useMemo(() => {
    const value = query.trim().toLowerCase();
    return needs.filter(
      (need) =>
        !value ||
        need.title.toLowerCase().includes(value) ||
        need.skillName.toLowerCase().includes(value) ||
        need.description.toLowerCase().includes(value),
    );
  }, [needs, query]);

  const canTeach = (need: LearningNeedResponse) =>
    teachSkills.some((item) => item.skill.id === need.skillId);

  const remove = async (need: LearningNeedResponse) => {
    if (!window.confirm("Remove this learning need from the noticeboard?")) return;
    try {
      await learningNeedsService.remove(need.id);
      toast.success("Learning need removed");
      await load(true);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not remove the learning need.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Community learning</p>
          <h1 className="text-3xl font-bold">Learning Noticeboard</h1>
          <p className="text-sm text-muted-foreground">
            Ask for a skill that is not yet being offered in Find Mentors. Teachers with that skill can respond directly.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Post what I want to learn
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border bg-primary/5 p-4 text-sm sm:grid-cols-3">
        <p className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Learners post an unmet skill need.</p>
        <p className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Teachers offer help for skills they teach.</p>
        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> The learner receives a notification.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search requested skills"
        />
      </div>

      {loading && <p role="status">Loading learning needs…</p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!loading && !error && !filteredNeeds.length && (
        <Card><CardContent className="p-8 text-center">No learning needs match yet. Post the first one.</CardContent></Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredNeeds.map((need) => {
          const mine = need.learnerId === user?.id;
          const eligible = canTeach(need);
          return (
            <Card key={need.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{need.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">Posted by {need.learnerName}</p>
                  </div>
                  <Badge>{need.skillName}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{need.description}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary" className="gap-1"><Clock3 className="h-3.5 w-3.5" /> {need.durationMinutes} minutes</Badge>
                  {need.availabilityText && <Badge variant="outline">{need.availabilityText}</Badge>}
                  {(need.allowedModes?.length ? need.allowedModes : ["VOLUNTEER"]).map((mode) => (
                    <Badge key={mode} variant="outline">{modeLabel(mode as NoticeboardMode)}</Badge>
                  ))}
                  {need.exchangeSkillName && <Badge variant="outline">Exchange: {need.exchangeSkillName}</Badge>}
                  <Badge variant="outline">{need.offerCount} teacher offer{need.offerCount === 1 ? "" : "s"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mine ? (
                    <Button variant="outline" onClick={() => void remove(need)}><Trash2 className="mr-2 h-4 w-4" /> Remove notice</Button>
                  ) : (
                    <Button
                      disabled={!eligible || need.offeredByMe}
                      onClick={() => setOffering(need)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {need.offeredByMe ? "Offer sent" : "Offer to teach"}
                    </Button>
                  )}
                </div>
                {!mine && !eligible && (
                  <p className="text-xs text-muted-foreground">
                    Add {need.skillName} to your teaching skills before offering to teach it.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateNeed open={creating} teachSkills={teachSkills} onClose={() => setCreating(false)} reload={load} />
      <OfferToTeach need={offering} onClose={() => setOffering(null)} reload={load} />
    </div>
  );
}

function CreateNeed({ open, teachSkills, onClose, reload }: { open: boolean; teachSkills: UserSkillResponse[]; onClose: () => void; reload: (silent?: boolean) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("");
  const [duration, setDuration] = useState("60");
  const [modes, setModes] = useState<NoticeboardMode[]>(["VOLUNTEER"]);
  const [exchangeUserSkillId, setExchangeUserSkillId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const minutes = Number(duration);
    if (title.trim().length < 5) return setError("Enter a title with at least 5 characters.");
    if (!skillName.trim()) return setError("Enter the skill you want to learn.");
    if (description.trim().length < 20) return setError("Describe what you need in at least 20 characters.");
    if (!Number.isInteger(minutes) || minutes < 15 || minutes > 480)
      return setError("Choose a whole number of minutes from 15 to 480.");
    if (!modes.length) return setError("Choose at least one session mode.");
    if (modes.includes("SKILL_SWAP") && !exchangeUserSkillId)
      return setError("Choose the skill you can offer for a skill exchange.");
    setBusy(true);
    setError("");
    try {
      const skill = await skillsService.ensureLearningSkill(skillName);
      await learningNeedsService.create({
        title: title.trim(),
        skillId: skill.skill.id,
        description: description.trim(),
        availabilityText: availability.trim() || undefined,
        durationMinutes: minutes,
        allowedModes: modes,
        exchangeUserSkillId: modes.includes("SKILL_SWAP") ? exchangeUserSkillId : undefined,
      });
      toast.success("Learning need posted", { description: "Teachers who have this skill can now offer to teach." });
      setTitle(""); setSkillName(""); setDescription(""); setAvailability(""); setDuration("60"); setModes(["VOLUNTEER"]); setExchangeUserSkillId("");
      onClose();
      await reload(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not post the learning need.");
    } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>What do you want to learn?</DialogTitle><DialogDescription>Use this board when you cannot find an existing teaching post for the skill.</DialogDescription></DialogHeader>
        <div><Label htmlFor="need-title">Learning goal</Label><Input id="need-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} placeholder="Example: Learn Figma for my first UI project" /></div>
        <div><Label htmlFor="need-skill">Skill to learn</Label><Input id="need-skill" value={skillName} onChange={(event) => setSkillName(event.target.value)} maxLength={100} placeholder="Example: Figma" /><p className="text-xs text-muted-foreground">New skills are added to your learning portfolio.</p></div>
        <div><Label htmlFor="need-description">What help do you need?</Label><Textarea id="need-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} /></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="need-duration">Preferred length (minutes)</Label><Input id="need-duration" type="number" min="15" max="480" step="15" value={duration} onChange={(event) => setDuration(event.target.value)} /></div><div><Label htmlFor="need-availability">Availability</Label><Input id="need-availability" value={availability} onChange={(event) => setAvailability(event.target.value)} maxLength={500} placeholder="Example: Weekends" /></div></div>
        <div className="space-y-2"><Label>Session modes you accept</Label><p className="text-xs text-muted-foreground">Teachers can choose only from these modes.</p><div className="grid gap-2 sm:grid-cols-3">{(["POINTS", "SKILL_SWAP", "VOLUNTEER"] as NoticeboardMode[]).map((mode) => <label key={mode} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"><Checkbox checked={modes.includes(mode)} onCheckedChange={() => setModes((current) => current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode])} />{modeLabel(mode)}</label>)}</div></div>
        {modes.includes("SKILL_SWAP") && <div><Label htmlFor="exchange-skill">Your skill to exchange</Label><select id="exchange-skill" className="h-10 w-full rounded-md border bg-background px-3" value={exchangeUserSkillId} onChange={(event) => setExchangeUserSkillId(event.target.value)}><option value="">Choose a teaching skill</option>{teachSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.skill.name}</option>)}</select>{!teachSkills.length && <p className="text-xs text-destructive">Add a teaching skill in Settings before offering skill exchange.</p>}</div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy} onClick={() => void submit()}>Post learning need</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OfferToTeach({ need, onClose, reload }: { need: LearningNeedResponse | null; onClose: () => void; reload: (silent?: boolean) => Promise<void> }) {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const allowedModes = (need?.allowedModes?.length ? need.allowedModes : ["VOLUNTEER"]) as NoticeboardMode[];
  const [mode, setMode] = useState<NoticeboardMode>(allowedModes[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setMode(allowedModes[0]);
    setError("");
  }, [need?.id]);
  const submit = async () => {
    if (!need) return;
    const proposedStart = new Date(`${date}T${time}`);
    if (Number.isNaN(proposedStart.getTime()) || proposedStart.getTime() <= Date.now()) {
      setError("Choose a future date and time for this session.");
      return;
    }
    setBusy(true); setError("");
    try {
      await learningNeedsService.offerToTeach(need.id, {
        message,
        proposedStart: proposedStart.toISOString(),
        mode,
      });
      toast.success("Teaching offer sent", { description: `${need.learnerName} has been notified with your proposed time.` });
      setMessage(""); setDate(""); setTime(""); onClose(); await reload(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send your offer.");
    } finally { setBusy(false); }
  };
  return (
    <Dialog open={!!need} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Offer to teach {need?.skillName}</DialogTitle><DialogDescription>Choose a time that fits the learner's availability for this {need?.durationMinutes}-minute learning need.</DialogDescription></DialogHeader>
        <p className="rounded-md bg-muted px-3 py-2 text-sm">Learner availability: {need?.availabilityText || "Not specified"}</p>
        <div><Label htmlFor="offer-mode">Session mode</Label><select id="offer-mode" className="h-10 w-full rounded-md border bg-background px-3" value={mode} onChange={(event) => setMode(event.target.value as NoticeboardMode)}>{allowedModes.map((item) => <option key={item} value={item}>{modeLabel(item)}</option>)}</select>{mode === "SKILL_SWAP" && <p className="mt-1 text-xs text-muted-foreground">Learner offers: {need?.exchangeSkillName || "a teaching skill"}.</p>}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="offer-date">Proposed date</Label><Input id="offer-date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} /></div>
          <div><Label htmlFor="offer-time">Proposed time</Label><Input id="offer-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div>
        </div>
        <div><Label htmlFor="teaching-offer-message">Message (optional)</Label><Textarea id="teaching-offer-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Example: I can guide you through the basics and practise with you." /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy || !date || !time} onClick={() => void submit()}>Send teaching offer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
