import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, Coins, Flag, AlertTriangle, Trash2, ShieldAlert, Check, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "SkillBridge" },
      {
        name: "description",
        content:
          "Moderate flagged content, manage reported users, and tune platform reward settings for SkillBridge.",
      },
      { property: "og:title", content: "Admin Portal — SkillBridge" },
      {
        property: "og:description",
        content:
          "Moderate flagged content, manage reported users, and tune platform reward settings.",
      },
    ],
  }),
  component: AdminPage,
});

type FlaggedRow = {
  id: string;
  type: "Forum Post" | "Comment" | "Session Message";
  author: string;
  major: string;
  reason: string;
  date: string;
  excerpt: string;
};

type ReportedUser = {
  id: string;
  name: string;
  major: string;
  reports: number;
  lastReport: string;
  status: "Under Review" | "Warned" | "Active";
};

const initialFlagged: FlaggedRow[] = [
  {
    id: "f1",
    type: "Forum Post",
    author: "Jordan M.",
    major: "Business Admin",
    reason: "Inappropriate Language",
    date: "Jul 22, 2026",
    excerpt: "Selling exam answers for BUS 201 — DM me...",
  },
  {
    id: "f2",
    type: "Comment",
    author: "Ravi K.",
    major: "Mechanical Eng.",
    reason: "Fraudulent Activity",
    date: "Jul 21, 2026",
    excerpt: "Pay me 100 pts off-platform and I'll do your homework.",
  },
  {
    id: "f3",
    type: "Forum Post",
    author: "Elena V.",
    major: "Psychology",
    reason: "Spam",
    date: "Jul 20, 2026",
    excerpt: "Check out this external tutoring site!!! (link)",
  },
  {
    id: "f4",
    type: "Session Message",
    author: "Tom H.",
    major: "Physics",
    reason: "Inappropriate Language",
    date: "Jul 19, 2026",
    excerpt: "Used offensive language toward peer mentor.",
  },
];

const initialReported: ReportedUser[] = [
  {
    id: "u1",
    name: "Jordan M.",
    major: "Business Admin",
    reports: 3,
    lastReport: "Jul 22, 2026",
    status: "Under Review",
  },
  {
    id: "u2",
    name: "Ravi K.",
    major: "Mechanical Eng.",
    reports: 2,
    lastReport: "Jul 21, 2026",
    status: "Warned",
  },
];

const stats = [
  {
    label: "Total Platform Users",
    value: "1,240",
    icon: Users,
    tone: "bg-accent text-primary",
  },
  {
    label: "Points in Escrow",
    value: "3,500 Pts",
    icon: Coins,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    label: "Flagged Posts / Comments",
    value: "4 Pending",
    icon: Flag,
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    label: "Active Disputes",
    value: "2",
    icon: AlertTriangle,
    tone: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
];

function AdminPage() {
  const [flagged, setFlagged] = useState<FlaggedRow[]>(initialFlagged);
  const [reported] = useState<ReportedUser[]>(initialReported);

  const [warnOpen, setWarnOpen] = useState(false);
  const [warnTarget, setWarnTarget] = useState<{
    name: string;
    major: string;
  } | null>(null);
  const [warnReason, setWarnReason] = useState("");
  const [warnMessage, setWarnMessage] = useState("");

  const [settings, setSettings] = useState({
    registration: 50,
    review: 5,
    escrowHours: 18,
  });

  const openWarning = (name: string, major: string) => {
    setWarnTarget({ name, major });
    setWarnReason("");
    setWarnMessage("");
    setWarnOpen(true);
  };

  const submitWarning = () => {
    if (!warnReason || !warnMessage.trim()) {
      toast.error("Please select a reason and write a message.");
      return;
    }
    toast.success(`Warning sent to ${warnTarget?.name}.`);
    setWarnOpen(false);
  };

  const deleteRow = (id: string) => {
    setFlagged((rows) => rows.filter((r) => r.id !== id));
    toast.success("Content removed.");
  };

  const dismissRow = (id: string) => {
    setFlagged((rows) => rows.filter((r) => r.id !== id));
    toast("Flag dismissed.");
  };

  const saveSettings = () => {
    toast.success("System settings saved.");
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Admin
          </Badge>
          <span className="text-xs text-muted-foreground">Platform health & moderation</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Review flagged content, manage user reports, and configure platform rewards.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-xl">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold tracking-tight">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Moderation queue */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>
            Review flagged content, reported users, and manage system-wide reward settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flagged" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="flagged">Flagged Posts</TabsTrigger>
              <TabsTrigger value="users">Reported Users</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
            </TabsList>

            {/* Flagged posts */}
            <TabsContent value="flagged" className="mt-4">
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flagged.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          Queue clear. Nothing to review. 🎉
                        </TableCell>
                      </TableRow>
                    ) : (
                      flagged.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="max-w-xs">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit rounded-full text-[10px]">
                                {row.type}
                              </Badge>
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                "{row.excerpt}"
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px]">
                                  {initials(row.author)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{row.author}</p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {row.major}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              {row.reason}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.date}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteRow(row.id)}
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openWarning(row.author, row.major)}
                              >
                                <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                                Warn
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => dismissRow(row.id)}>
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Dismiss
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Reported users */}
            <TabsContent value="users" className="mt-4">
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Last Report</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reported.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[11px]">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{u.name}</p>
                              <p className="text-[11px] text-muted-foreground">{u.major}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{u.reports}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.lastReport}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.status === "Warned"
                                ? "rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                : "rounded-full"
                            }
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWarning(u.name, u.major)}
                          >
                            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                            Issue Warning
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* System settings */}
            <TabsContent value="settings" className="mt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg">Registration Bonus Points</Label>
                    <Input
                      id="reg"
                      type="number"
                      value={settings.registration}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, registration: Number(e.target.value) }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Awarded once when a new student joins SkillBridge.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rev">Forum Contribution Points</Label>
                    <Input
                      id="rev"
                      type="number"
                      value={settings.review}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, review: Number(e.target.value) }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Awarded when a forum answer is marked helpful.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mile">Escrow Auto-Release (hours)</Label>
                    <Input
                      id="mile"
                      type="number"
                      value={settings.escrowHours}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, escrowHours: Number(e.target.value) }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Hours before escrowed points release automatically.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-accent p-4 dark:bg-muted/40">
                  <h3 className="text-sm font-semibold">Current Reward Summary</h3>
                  <Separator className="my-3" />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-semibold">+{settings.registration} Pts</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Forum contribution</span>
                      <span className="font-semibold">+{settings.review} Pts</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Escrow auto-release</span>
                      <span className="font-semibold">{settings.escrowHours} hrs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={saveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save System Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Warning modal */}
      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Account Warning</DialogTitle>
            <DialogDescription>
              The user will receive an in-app notice and this warning will be logged.
            </DialogDescription>
          </DialogHeader>

          {warnTarget && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials(warnTarget.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{warnTarget.name}</p>
                <p className="text-xs text-muted-foreground">{warnTarget.major}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Warning Reason</Label>
            <Select value={warnReason} onValueChange={setWarnReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="violent">Violent content</SelectItem>
                <SelectItem value="fraud">Fraudulent activity</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="msg">Message to User</Label>
            <Textarea
              id="msg"
              rows={4}
              placeholder="Explain the violation and next steps..."
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setWarnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitWarning}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Send Account Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
