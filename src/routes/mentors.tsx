import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Coins, HandHeart, Handshake, LoaderCircle, Search, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { mentorsService } from "@/services/mentors.service";
import {
  learningRequestsService,
  type LearningRequestMode,
} from "@/services/learning-requests.service";
import { skillsService } from "@/services/skills.service";
import type { MentorSearchResponse, UserSkillResponse, MentorOfferingResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { userInitials } from "@/lib/auth-validation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/mentors")({
  component: MentorsPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
});

function MentorsPage() {
  const { q } = Route.useSearch();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorSearchResponse[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => setQuery(q || ""), [q]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MentorSearchResponse | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mentorsService.searchMentors();
      const rows = Array.isArray(result) ? result : result.content;
      setMentors(rows.filter((mentor) => mentor.user?.id && mentor.user.id !== user?.id));
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load mentors.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  useEffect(() => {
    void load();
  }, [load]);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return mentors.filter(
      (mentor) =>
        !value ||
        mentor.user.displayName.toLowerCase().includes(value) ||
        mentor.user.major?.toLowerCase().includes(value) ||
        mentor.matchingTeachSkills.some((skill) => skill.name.toLowerCase().includes(value)),
    );
  }, [mentors, query]);
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
      <div>
        <p className="text-sm font-medium text-primary">Skill Exchange</p>
        <h1 className="text-3xl font-bold">Find a mentor</h1>
        <p className="text-sm text-muted-foreground">
          Book real point, skill exchange, or volunteer sessions.
        </p>
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by mentor, major, or skill"
        />
      </div>
      {loading && <p role="status">Loading mentors…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error}{" "}
          <Button variant="link" onClick={() => void load()}>
            Retry
          </Button>
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            No mentor profiles are available yet. A user must add a teaching skill or mentor
            offering first.
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((mentor) => (
          <Card key={mentor.user.id}>
            <CardContent className="space-y-4 p-5">
              <Link
                to="/users/$userId"
                params={{ userId: mentor.user.id }}
                aria-label={`View ${mentor.user.displayName}'s profile`}
                className="flex items-center gap-3 rounded-lg outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentor.user.avatarUrl} alt="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials(mentor.user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold underline-offset-4 hover:underline">
                    {mentor.user.displayName}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {mentor.user.major || "SkillBridge member"}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {mentor.ratingCount
                      ? `${mentor.rating.toFixed(1)} (${mentor.ratingCount})`
                      : "No reviews yet"}
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap gap-1">
                {mentor.matchingTeachSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {mentor.activeModes.map((mode) => (
                  <Badge key={mode} variant="outline">
                    {mode.replace("SKILL_SWAP", "Exchange")}
                  </Badge>
                ))}
              </div>
              <Button
                className="w-full"
                disabled={!mentor.matchingTeachSkills.length}
                onClick={() => setSelected(mentor)}
              >
                Request Session
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <RequestDialog mentor={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function RequestDialog({
  mentor,
  onClose,
}: {
  mentor: MentorSearchResponse | null;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<LearningRequestMode>("POINTS");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [offered, setOffered] = useState("");
  const [myTeach, setMyTeach] = useState<UserSkillResponse[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [requestedSkillId, setRequestedSkillId] = useState("");
  const [offerings, setOfferings] = useState<MentorOfferingResponse[]>([]);
  const [offeringId, setOfferingId] = useState("");
  const selectedOffering = offerings.find((item) => item.id === offeringId);
  useEffect(() => {
    if (!mentor) return;
    setRequestedSkillId(mentor.matchingTeachSkills[0]?.id || "");
    setError("");
    setOfferingId("");
    setOfferings([]);
    void Promise.all([
      skillsService.getUserSkills("TEACH"),
      mentorsService.getMentorDetail(mentor.user.id),
    ])
      .then(([mine, detail]) => {
        setMyTeach(mine);
        const activeOfferings = detail.activeOfferings || [];
        const firstOffering = activeOfferings[0];
        setOfferings(activeOfferings);
        setOfferingId(firstOffering?.id || "");
        if (firstOffering) {
          setRequestedSkillId(firstOffering.skill.id);
          setMode(firstOffering.modes[0]);
        } else {
          setError("This mentor has no published teaching posts available.");
        }
      })
      .catch((failure: unknown) =>
        setError(failure instanceof Error ? failure.message : "Could not load skills."),
      );
  }, [mentor]);
  const submit = async () => {
    if (!mentor || !date || !time) return;
    setPending(true);
    setError("");
    try {
      if (new Date(`${date}T${time}`).getTime() <= Date.now())
        throw new Error("Choose a future date and time.");
      let offeredUserSkillId: string | undefined;
      if (mode === "SKILL_SWAP") {
        let owned = myTeach.find(
          (item) => item.skill.name.toLowerCase() === offered.trim().toLowerCase(),
        );
        if (!owned) owned = await skillsService.addCustomUserSkill(offered.trim(), "TEACH");
        offeredUserSkillId = owned.id;
        setMyTeach((previous) =>
          previous.some((item) => item.id === owned.id) ? previous : [...previous, owned],
        );
      }
      await learningRequestsService.createRequest({
        mentorId: mentor.user.id,
        mentorOfferingId: selectedOffering?.id,
        requestedSkillId,
        mode,
        offeredUserSkillId,
        scheduledStart: new Date(`${date}T${time}`).toISOString(),
        durationMinutes: selectedOffering?.duration || 60,
        message: message.trim() || undefined,
      });
      toast.success("Session request sent", {
        description: "It is now listed under My Sessions → Learner.",
      });
      setDate("");
      setTime("");
      setMessage("");
      setOffered("");
      setMode("POINTS");
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to send request.");
    } finally {
      setPending(false);
    }
  };
  return (
    <Dialog open={!!mentor} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Session with {mentor?.user.displayName}</DialogTitle>
          <DialogDescription>
            The mentor can accept this request from their Mentor tab.
          </DialogDescription>
        </DialogHeader>
        {offerings.length > 0 && (
          <div>
            <Label htmlFor="booking-offering">Teaching post</Label>
            <select
              id="booking-offering"
              className="h-11 w-full rounded-md border bg-background px-3"
              value={offeringId}
              onChange={(event) => {
                const item = offerings.find((o) => o.id === event.target.value);
                setOfferingId(event.target.value);
                if (item) {
                  setRequestedSkillId(item.skill.id);
                  setMode(item.modes[0]);
                }
              }}
            >
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.skill.name} · {o.duration} min · {o.price} points · {o.modes.join(", ")}
                </option>
              ))}
            </select>
            {selectedOffering?.availability && (
              <p className="text-sm text-muted-foreground">{selectedOffering.availability}</p>
            )}
          </div>
        )}
        <div>
          <Label htmlFor="requested-skill">Skill to learn</Label>
          <select
            id="requested-skill"
            className="h-11 w-full rounded-md border bg-background px-3"
            value={requestedSkillId}
            disabled={!!selectedOffering}
            onChange={(event) => setRequestedSkillId(event.target.value)}
          >
            {mentor?.matchingTeachSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="request-date">Date</Label>
            <Input
              id="request-date"
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onInput={(e) => setDate(e.currentTarget.value)}
            />
          </div>
          <div>
            <Label htmlFor="request-time">Time</Label>
            <Input
              id="request-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onInput={(e) => setTime(e.currentTarget.value)}
            />
          </div>
        </div>
        <Tabs value={mode} onValueChange={(value) => setMode(value as LearningRequestMode)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger
              value="POINTS"
              disabled={!!selectedOffering && !selectedOffering.modes.includes("POINTS")}
            >
              <Coins className="mr-1 h-4 w-4" />
              Points
            </TabsTrigger>
            <TabsTrigger
              value="SKILL_SWAP"
              disabled={!!selectedOffering && !selectedOffering.modes.includes("SKILL_SWAP")}
            >
              <Handshake className="mr-1 h-4 w-4" />
              Exchange
            </TabsTrigger>
            <TabsTrigger
              value="VOLUNTEER"
              disabled={!!selectedOffering && !selectedOffering.modes.includes("VOLUNTEER")}
            >
              <HandHeart className="mr-1 h-4 w-4" />
              Volunteer
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "POINTS" && (
          <p className="text-sm text-muted-foreground">
            This {selectedOffering?.duration || 60}-minute request costs{" "}
            {selectedOffering?.price ?? 10} points, held until completion or cancellation.
          </p>
        )}
        {mode === "SKILL_SWAP" && (
          <div>
            <Label htmlFor="offered-skill">Skill you can offer</Label>
            <Input
              id="offered-skill"
              value={offered}
              onChange={(e) => setOffered(e.target.value)}
              placeholder="Enter any skill"
              maxLength={100}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter any skill. New names are added to your teaching skills automatically.
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="request-message">Message</Label>
          <Textarea
            id="request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              pending ||
              !selectedOffering ||
              !date ||
              !time ||
              (mode === "SKILL_SWAP" && !offered.trim())
            }
            onClick={() => void submit()}
          >
            {pending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Send Request
          </Button>
        </DialogFooter>
        <Link to="/sessions" className="text-center text-xs text-primary underline">
          View My Sessions
        </Link>
      </DialogContent>
    </Dialog>
  );
}
