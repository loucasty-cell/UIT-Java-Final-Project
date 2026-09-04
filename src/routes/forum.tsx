import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Calendar, Flag, HandHeart, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
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
  const [posts, setPosts] = useState<ForumPostSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [create, setCreate] = useState(false);
  const [booking, setBooking] = useState<ForumPostSummaryResponse | null>(null);
  const [reporting, setReporting] = useState<ForumPostSummaryResponse | null>(null);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const p = await forumService.getPosts(undefined, undefined, { page: 0, size: 100 });
      setPosts(p);
      setError("");
    } catch (f) {
      setError(f instanceof Error ? f.message : "Unable to load community posts.");
    } finally {
      setLoading(false);
    }
  }, []);
  useLiveRefresh(load);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Community</p>
          <h1 className="text-3xl font-bold">Volunteer Forum</h1>
          <p className="text-sm text-muted-foreground">
            Share your skills, offer free sessions, and learn together.
          </p>
        </div>
        <Button onClick={() => setCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Post Volunteer Session
        </Button>
      </div>
      {loading && <p role="status">Loading posts…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
          <Button variant="link" onClick={() => void load()}>
            Retry
          </Button>
        </p>
      )}
      {!loading && !posts.length && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            No volunteer posts yet. Create the first one.
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
            <PostDiscussion post={post} reload={load} />
            {(post.availability || post.availabilityText) && (
              <p className="text-sm">
                <Calendar className="mr-1 inline h-4 w-4" />
                {post.availability || post.availabilityText}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={post.author?.id === user?.id || !post.skillTags?.length}
                onClick={() => setBooking(post)}
              >
                <HandHeart className="mr-2 h-4 w-4" />
                Request Volunteer Session
              </Button>
              <Button
                variant="outline"
                disabled={post.author?.id === user?.id}
                onClick={() => setReporting(post)}
              >
                <Flag className="mr-2 h-4 w-4" />
                Report Post
              </Button>
              <Button variant="ghost" onClick={() => void load()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <CreatePost open={create} close={() => setCreate(false)} reload={load} />
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
  const [availability, setAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setError("");
    if (title.trim().length < 5) return setError("Enter a title with at least 5 characters.");
    if (!skillName.trim()) return setError("Enter the skill you want to teach.");
    if (description.trim().length < 20)
      return setError("Describe your session in at least 20 characters.");
    setBusy(true);
    try {
      const teachingSkill = await skillsService.ensureTeachingSkill(skillName);
      await forumService.createPost({
        title: title.trim(),
        description: description.trim(),
        skillIds: [teachingSkill.skill.id],
        availabilityText: availability.trim() || undefined,
        active: true,
      });
      toast.success("Volunteer post published for all users");
      close();
      setTitle("");
      setDescription("");
      setSkillName("");
      setAvailability("");
      await reload();
    } catch (f) {
      setError(f instanceof Error ? f.message : "Could not publish post.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post a volunteer session</DialogTitle>
          <DialogDescription>
            Offer a free learning session to the SkillBridge community.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
          />
        </div>
        <div>
          <Label htmlFor="post-skill">Skill</Label>
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
          <Label htmlFor="post-description">Description</Label>
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
        <div>
          <Label htmlFor="post-availability">Availability</Label>
          <Input
            id="post-availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Example: Weekdays after 5 PM"
            maxLength={500}
          />
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
            {busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Publish
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
  const submit = async () => {
    if (!post?.author?.id || !post.skillTags?.[0]) return;
    setBusy(true);
    try {
      await learningRequestsService.createRequest({
        mentorId: post.author.id,
        requestedSkillId: post.skillTags[0].id,
        mode: "VOLUNTEER",
        scheduledStart: new Date(`${date}T${time}`).toISOString(),
        durationMinutes: 60,
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
      toast.error(f instanceof Error ? f.message : "Could not request session.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!post} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request volunteer session</DialogTitle>
          <DialogDescription>
            Request {post?.skillTags?.[0]?.name} help from {post?.author?.displayName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date</Label>
            <Input
              aria-label="Volunteer session date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onInput={(e) => setDate(e.currentTarget.value)}
            />
          </div>
          <div>
            <Label>Time</Label>
            <Input
              aria-label="Volunteer session time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onInput={(e) => setTime(e.currentTarget.value)}
            />
          </div>
        </div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What would you like help with?"
        />
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !date || !time} onClick={() => void submit()}>
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
