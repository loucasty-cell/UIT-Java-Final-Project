import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  Flag,
  Gift,
  HandHeart,
  LoaderCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { forumService } from "@/services/forum.service";
import { learningRequestsService } from "@/services/learning-requests.service";
import { moderationService } from "@/services/moderation.service";
import { skillsService } from "@/services/skills.service";
import type { ForumCommentResponse, ForumPostSummaryResponse } from "@/types/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AvailabilityEditor, availabilitySlotsFromDates, type AvailabilityDate } from "@/components/availability-editor";
import { availableDates, availableTimes, availabilitySummary, localDateTimeWithOffset } from "@/lib/mentor-availability";

export const Route = createFileRoute("/forum")({ component: ForumPage });
const reportReasons = [
  "Spam",
  "Inappropriate language",
  "Fraud or scam",
  "Harassment",
  "Unsafe content",
  "Other",
];
function ForumPage() {
  const { user } = useAuth();
  const [create, setCreate] = useState(false);
  const [booking, setBooking] = useState<ForumPostSummaryResponse | null>(null);
  const [reporting, setReporting] = useState<ForumPostSummaryResponse | null>(null);

  const postsQuery = useQuery({
    queryKey: ["forum-posts"],
    queryFn: () => forumService.getPosts(undefined, undefined, { page: 0, size: 100 }),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const loading = postsQuery.isLoading;
  const error = postsQuery.error;
  const posts = postsQuery.data ?? [];

  const reload = async (silent = false) => {
    if (!silent) await postsQuery.refetch();
  };
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Free skill sharing</p>
          <h1 className="text-3xl font-bold">Volunteer Forum</h1>
          <p className="text-sm text-muted-foreground">
            Offer a skill for free, or request help from another community member.
          </p>
        </div>
        <Button onClick={() => setCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Offer a free session
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-primary/5 px-4 py-3 text-sm">
        <Gift className="h-4 w-4 text-primary" />
        <span className="font-medium">Every session here is free.</span>
        <span className="text-muted-foreground">
          No points are held or charged when a learner requests one.
        </span>
      </div>
      {loading && <p role="status">Loading posts…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error instanceof Error ? error.message : "Unable to load community posts."}
          <Button variant="link" onClick={() => void reload()}>
            Retry
          </Button>
        </p>
      )}
      {!loading && !posts.length && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            No free sessions yet. Offer the first one by sharing a skill you can teach.
          </CardContent>
        </Card>
      )}
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex justify-between gap-3">
              <div>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {post.author?.displayName || post.authorName || "SkillBridge member"} ·{" "}
                  {new Date(post.timestamp || post.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-1">
                {post.skillTags?.map((skill) => (
                  <Badge key={skill.id}>{skill.name}</Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <PostDiscussion post={post} reload={reload} />
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge className="gap-1" variant="secondary">
                <Gift className="h-3.5 w-3.5" />
                Free session · 0 points
              </Badge>
              <Badge className="gap-1" variant="outline">
                <Clock3 className="h-3.5 w-3.5" />
                {post.durationMinutes || 60} minutes
              </Badge>
            </div>
            {(post.availability || post.availabilityText) && (
              <p className="text-sm">
                <Calendar className="mr-1 inline h-4 w-4" />
                {post.availability || post.availabilityText}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={
                  post.author?.id === user?.id || !post.author?.id || !post.skillTags?.length
                }
                onClick={() => setBooking(post)}
              >
                <HandHeart className="mr-2 h-4 w-4" />
                Request free session
              </Button>
              <Button
                variant="outline"
                disabled={post.author?.id === user?.id}
                onClick={() => setReporting(post)}
              >
                <Flag className="mr-2 h-4 w-4" />
                Report Post
              </Button>
              <Button variant="ghost" onClick={() => void reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            {!post.skillTags?.length && post.author?.id !== user?.id && (
              <p className="text-xs text-muted-foreground">
                This older post needs a skill tag before a learner can request it.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      <CreatePost open={create} close={() => setCreate(false)} reload={reload} />
      <VolunteerRequest post={booking} close={() => setBooking(null)} />
      <PostReport post={reporting} close={() => setReporting(null)} />
    </div>
  );
}
function CreatePost({
  open,
  close,
  reload,
}: {
  open: boolean;
  close: () => void;
  reload: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillName, setSkillName] = useState("");
  const [error, setError] = useState("");
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDate[]>([]);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setError("");
    if (title.trim().length < 5) return setError("Enter a title with at least 5 characters.");
    if (!skillName.trim()) return setError("Enter the skill you want to teach.");
    if (description.trim().length < 20)
      return setError("Describe your session in at least 20 characters.");
    const duration = Number(durationMinutes);
    if (!Number.isInteger(duration) || duration < 15 || duration > 480)
      return setError("Choose a whole number of minutes from 15 to 480.");
    const availabilitySlots = availabilitySlotsFromDates(availabilityDates);
    if (!availabilitySlots.length || availabilityDates.some((entry) => !entry.date || !entry.times.length || entry.times.some((time) => !time)))
      return setError("Add at least one available date and time.");
    if (new Set(availabilitySlots.map((slot) => `${slot.date}-${slot.time}`)).size !== availabilitySlots.length)
      return setError("Add each available time only once per date.");
    setBusy(true);
    try {
      const teachingSkill = await skillsService.ensureTeachingSkill(skillName);
      await forumService.createPost({
        title: title.trim(),
        description: description.trim(),
        skillIds: [teachingSkill.skill.id],
        availabilityText: availabilitySummary(availabilitySlots),
        availabilitySlots,
        durationMinutes: duration,
        active: true,
      });
      toast.success("Volunteer post published for all users");
      close();
      setTitle("");
      setDescription("");
      setSkillName("");
      setAvailabilityDates([]);
      setDurationMinutes("60");
      await reload();
    } catch (f) {
      setError(f instanceof Error ? f.message : "Could not publish post.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offer a free session</DialogTitle>
          <DialogDescription>
            Tell learners what you can teach. Requests created from this post always cost 0 points.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="post-title">Session title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
          />
        </div>
        <div>
          <Label htmlFor="post-skill">Skill to teach</Label>
          <Input
            id="post-skill"
            value={skillName}
            onChange={(event) => setSkillName(event.target.value)}
            maxLength={100}
            placeholder="Enter a skill, e.g. Java"
          />
          <p className="text-xs text-muted-foreground">
            New skills are added to your teaching portfolio.
          </p>
        </div>
        <div>
          <Label htmlFor="post-description">What will learners practise?</Label>
          <Textarea
            id="post-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
          />
          <p className="text-xs text-muted-foreground">
            At least 20 characters ({description.trim().length}/20).
          </p>
        </div>
        <AvailabilityEditor value={availabilityDates} onChange={setAvailabilityDates} idPrefix="post-availability" />
        <div>
          <Label htmlFor="post-duration">Session length (minutes)</Label>
          <Input
            id="post-duration"
            type="number"
            min="15"
            max="480"
            step="15"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">Choose from 15 minutes to 8 hours.</p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void submit()}>
            {busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Publish free session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function VolunteerRequest({
  post,
  close,
}: {
  post: ForumPostSummaryResponse | null;
  close: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const availabilitySlots = post?.availabilitySlots ?? [];
  const bookableDates = useMemo(() => availableDates(availabilitySlots), [availabilitySlots]);
  const bookableTimes = useMemo(() => availableTimes(availabilitySlots, date), [availabilitySlots, date]);
  const submit = async () => {
    if (!post?.author?.id || !post.skillTags?.[0]) return;
    const scheduledStart = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledStart.getTime()) || scheduledStart.getTime() <= Date.now()) {
      setError("Choose a future date and time.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await learningRequestsService.createRequest({
        mentorId: post.author.id,
        requestedSkillId: post.skillTags[0].id,
        mode: "VOLUNTEER",
        scheduledStart: localDateTimeWithOffset(date, time),
        availabilityDate: date,
        availabilityTime: time,
        durationMinutes: post.durationMinutes || 60,
        message: message.trim() || undefined,
        sourceForumPostId: post.id,
      });
      toast.success("Volunteer request sent", {
        description: "View it under My Sessions → Learner.",
      });
      close();
      setDate("");
      setTime("");
      setMessage("");
    } catch (f) {
      setError(f instanceof Error ? f.message : "Could not request session.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!post} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a free session</DialogTitle>
          <DialogDescription>
            Request {post?.skillTags?.[0]?.name} help from {post?.author?.displayName}. This session
            costs 0 points.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          Available: {availabilitySlots.length ? availabilitySummary(availabilitySlots) : "No dates published"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date</Label>
            <select
              aria-label="Volunteer session date"
              value={date}
              disabled={!availabilitySlots.length}
              className="h-11 w-full rounded-md border bg-background px-3"
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
            >
              <option value="">Select an available date</option>
              {bookableDates.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Time</Label>
            <select
              aria-label="Volunteer session time"
              value={time}
              disabled={!date}
              className="h-11 w-full rounded-md border bg-background px-3"
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">Select an available time</option>
              {bookableTimes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What would you like help with?"
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !date || !time || !availabilitySlots.length} onClick={() => void submit()}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function PostReport({ post, close }: { post: ForumPostSummaryResponse | null; close: () => void }) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!post || !user || !reason) return;
    setBusy(true);
    try {
      await moderationService.flagContent({
        reporterId: user.id,
        targetType: "FORUM_POST",
        targetId: post.id,
        reason,
        details,
      });
      toast.success("Report sent to the admin portal");
      close();
      setReason("");
      setDetails("");
    } catch (f) {
      toast.error(f instanceof Error ? f.message : "Could not submit report.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!post} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this post</DialogTitle>
          <DialogDescription>Tell administrators why this content needs review.</DialogDescription>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a reason" />
          </SelectTrigger>
          <SelectContent>
            {reportReasons.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={2000}
          placeholder="Additional details"
        />
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !reason} onClick={() => void submit()}>
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostDiscussion({
  post,
  reload,
}: {
  post: ForumPostSummaryResponse;
  reload: (silent?: boolean) => Promise<void>;
}) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState(post.description || post.excerpt || "");
  const [comments, setComments] = useState<ForumCommentResponse[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const refreshDiscussion = async () => {
    const [full, result] = await Promise.all([
      forumService.getPost(post.id),
      forumService.getComments(post.id, { page: 0, size: 100 }),
    ]);
    setDescription(full.description || "");
    setComments(Array.isArray(result) ? result : result.content);
    setExpanded(true);
  };
  const action = async (operation: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await operation();
      await reload(true);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Could not update post.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={busy}
          aria-pressed={!!post.likedByMe}
          onClick={() =>
            void action(() =>
              post.likedByMe ? forumService.unlikePost(post.id) : forumService.likePost(post.id),
            )
          }
        >
          {post.likedByMe ? "Unlike" : "Like"} ({post.likeCount})
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => void action(refreshDiscussion)}>
          Read post & comments ({post.commentCount})
        </Button>
        {post.author?.id === user?.id && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Delete this volunteer post?"))
                void action(() => forumService.deletePost(post.id));
            }}
          >
            Delete post
          </Button>
        )}
      </div>
      {expanded && (
        <div className="space-y-3 border-t pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md bg-muted p-3">
              <p className="text-sm font-semibold">
                {comment.author?.displayName || comment.authorName}
              </p>
              <p className="whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))}
          {!comments.length && <p className="text-sm text-muted-foreground">No comments yet.</p>}
          <Label htmlFor={`comment-${post.id}`}>Add a comment</Label>
          <Textarea
            id={`comment-${post.id}`}
            value={body}
            maxLength={2000}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button
            disabled={busy || !body.trim()}
            onClick={() =>
              void action(async () => {
                await forumService.addComment(post.id, { body: body.trim() });
                setBody("");
                await refreshDiscussion();
              })
            }
          >
            Post comment
          </Button>
        </div>
      )}
    </div>
  );
}
