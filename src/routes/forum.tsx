import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      { title: "Volunteer Forum — SkillBridge" },
      {
        name: "description",
        content:
          "Find free peer mentoring sessions and community learning threads on SkillBridge.",
      },
      { property: "og:title", content: "Volunteer Forum — SkillBridge" },
      {
        property: "og:description",
        content: "Free peer mentoring and community learning threads.",
      },
    ],
  }),
  component: ForumPage,
});

type Comment = {
  id: string;
  author: string;
  initials: string;
  major: string;
  body: string;
};

type Post = {
  id: string;
  author: string;
  initials: string;
  major: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: Comment[];
};

const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    author: "Priya Nair",
    initials: "PN",
    major: "Computer Science, Year 4",
    title: "Offering free weekend Java OOP basics tutoring sessions!",
    content:
      "I've been TAing CS201 for two semesters and love breaking down inheritance, polymorphism, and interfaces with real examples. Saturdays 10am–12pm works for me — small groups of 2–3 preferred.",
    tags: ["Java", "OOP", "Beginner"],
    likes: 24,
    comments: [
      {
        id: "c1",
        author: "Marcus Lee",
        initials: "ML",
        major: "CS, Year 2",
        body: "Would love a slot next Saturday — abstract classes still trip me up!",
      },
      {
        id: "c2",
        author: "Sara Wu",
        initials: "SW",
        major: "IS, Year 2",
        body: "Do you cover generics too? Have a project due soon.",
      },
    ],
  },
  {
    id: "p2",
    author: "Diego Martinez",
    initials: "DM",
    major: "Data Science, Year 3",
    title: "Free SQL query optimization walkthroughs — bring your slow queries",
    content:
      "Happy to sit down with anyone struggling with EXPLAIN plans, indexing, or joins. Bring a real query and we'll tune it together.",
    tags: ["SQL", "Databases", "Intermediate"],
    likes: 17,
    comments: [],
  },
];

const TOP_MENTORS = [
  { name: "Priya Nair", major: "CS, Year 4", sessions: 14, initials: "PN" },
  { name: "Diego Martinez", major: "DS, Year 3", sessions: 11, initials: "DM" },
  { name: "Aisha Khan", major: "EE, Year 4", sessions: 9, initials: "AK" },
];

function ForumPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [bookingPost, setBookingPost] = useState<Post | null>(null);

  const toggleLike = (id: string) => {
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (liked[id] ? -1 : 1) } : p,
      ),
    );
  };

  const addComment = (postId: string, body: string) => {
    if (!body.trim()) return;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: crypto.randomUUID(),
                  author: "Alex Chen",
                  initials: "AC",
                  major: "CS, Year 3",
                  body,
                },
              ],
            }
          : p,
      ),
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Volunteer Learning Community
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Find free peer mentoring sessions and community learning threads.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" /> Create Volunteer Post
            </Button>
          </DialogTrigger>
          <CreatePostDialog
            onSubmit={(post) => {
              setPosts((ps) => [post, ...ps]);
              setCreateOpen(false);
              toast.success("Volunteer post published!");
            }}
          />
        </Dialog>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Feed */}
        <div className="space-y-6 lg:col-span-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={!!liked[post.id]}
              onLike={() => toggleLike(post.id)}
              onComment={(body) => addComment(post.id, body)}
              onRequest={() => setBookingPost(post)}
            />
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" /> Top Volunteer Mentors — This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {TOP_MENTORS.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{m.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.major}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {m.sessions}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" /> Forum Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Be respectful — everyone is here to learn.</p>
              <p>• Volunteer sessions are free; never ask for points.</p>
              <p>• Share resources; avoid solving graded assignments.</p>
              <p>• Report harassment or spam to moderators.</p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Booking modal (pre-set to Volunteer mode) */}
      <Dialog
        open={!!bookingPost}
        onOpenChange={(o) => !o && setBookingPost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request Free Session with {bookingPost?.author}
            </DialogTitle>
            <DialogDescription>
              Volunteer Mode — no points required.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Cost: FREE (0 Pts)
            </span>{" "}
            <span className="text-muted-foreground">— Volunteer Mode</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Preferred date & time</Label>
              <Input type="datetime-local" />
            </div>
            <div className="space-y-1.5">
              <Label>Message to mentor</Label>
              <Textarea placeholder="Briefly describe what you'd like help with…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingPost(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Request sent to ${bookingPost?.author}!`);
                setBookingPost(null);
              }}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostCard({
  post,
  liked,
  onLike,
  onComment,
  onRequest,
}: {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onComment: (body: string) => void;
  onRequest: () => void;
}) {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src="" />
            <AvatarFallback>{post.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{post.author}</p>
              <Badge
                variant="secondary"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              >
                <BadgeCheck className="h-3 w-3" /> Volunteer Mentor
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{post.major}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{post.content}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="outline" className="rounded-full">
              #{t}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={liked ? "text-rose-600" : ""}
            >
              <Heart
                className={`mr-1.5 h-4 w-4 ${liked ? "fill-current" : ""}`}
              />
              {post.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((o) => !o)}
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              {post.comments.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.success("Link copied to clipboard")}
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          </div>
          <Button onClick={onRequest} className="gap-2">
            Request Free Session
          </Button>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="sr-only">Toggle comments</CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {post.comments.map((c) => (
              <div key={c.id} className="flex gap-3 rounded-lg bg-muted/40 p-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{c.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium">{c.author}</p>
                    <p className="text-xs text-muted-foreground">{c.major}</p>
                  </div>
                  <p className="mt-0.5 text-sm">{c.body}</p>
                </div>
              </div>
            ))}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onComment(reply);
                setReply("");
              }}
            >
              <Input
                placeholder="Write a reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button type="submit" size="icon" aria-label="Send reply">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function CreatePostDialog({ onSubmit }: { onSubmit: (p: Post) => void }) {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("");
  const [desc, setDesc] = useState("");
  const [avail, setAvail] = useState("");

  const canSubmit = title && topics && desc;

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Create Volunteer Post</DialogTitle>
        <DialogDescription>
          Share what you can teach for free with the SkillBridge community.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Post title</Label>
          <Input
            placeholder="e.g. Free weekend React basics tutoring"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Topics / skills covered</Label>
          <Input
            placeholder="e.g. React, Hooks, State Management"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Experience description</Label>
          <Textarea
            placeholder="Briefly describe your background and what learners will get out of it."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Availability</Label>
          <Input
            placeholder="e.g. Sat 10am–12pm, Sun evenings"
            value={avail}
            onChange={(e) => setAvail(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              id: crypto.randomUUID(),
              author: "Alex Chen",
              initials: "AC",
              major: "Computer Science, Year 3",
              title,
              content: `${desc}${avail ? `\n\nAvailability: ${avail}` : ""}`,
              tags: topics.split(",").map((t) => t.trim()).filter(Boolean),
              likes: 0,
              comments: [],
            })
          }
        >
          Publish Post
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
