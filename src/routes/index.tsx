import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Coins,
  FileText,
  Lock,
  Minus,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
  Upload,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBridge" },
      {
        name: "description",
        content:
          "Your SkillBridge dashboard: wallet balance, skills, certificates, and point activity.",
      },
      { property: "og:title", content: "Dashboard — SkillBridge" },
      {
        property: "og:description",
        content:
          "Your SkillBridge dashboard: wallet balance, skills, certificates, and point activity.",
      },
    ],
  }),
  component: Dashboard,
});

type Metric = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Coins;
  accent: string;
};

const metrics: Metric[] = [
  {
    label: "Wallet Balance",
    value: "50 Pts",
    hint: "15 pts held in escrow",
    icon: Coins,
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    label: "Total Earned",
    value: "120 Pts",
    hint: "+12 this week",
    icon: TrendingUp,
    accent: "text-primary bg-accent dark:bg-accent",
  },
  {
    label: "Total Spent",
    value: "70 Pts",
    hint: "Across 6 sessions",
    icon: TrendingDown,
    accent: "text-muted-foreground bg-muted dark:bg-muted",
  },
  {
    label: "Completed Sessions",
    value: "8",
    hint: "3 as mentor · 5 as learner",
    icon: CalendarCheck,
    accent: "text-primary bg-accent dark:bg-accent",
  },
];

const teachSkills = [
  { name: "Java", level: "Advanced" as const },
  { name: "SQL", level: "Intermediate" as const },
  { name: "Data Structures", level: "Advanced" as const },
  { name: "Git", level: "Intermediate" as const },
];

const learnSkills = [
  { name: "React", level: "Beginner" as const },
  { name: "UI/UX", level: "Beginner" as const },
  { name: "TypeScript", level: "Intermediate" as const },
];

const activity = [
  {
    date: "Jul 22, 2026",
    activity: "Mentored Priya A. — Data Structures",
    type: "earn" as const,
    amount: 15,
  },
  {
    date: "Jul 21, 2026",
    activity: "Booked session — Linear Algebra",
    type: "spend" as const,
    amount: 10,
  },
  {
    date: "Jul 20, 2026",
    activity: "Forum answer marked helpful",
    type: "earn" as const,
    amount: 5,
  },
  {
    date: "Jul 18, 2026",
    activity: "Booked session — Essay Review",
    type: "spend" as const,
    amount: 10,
  },
  {
    date: "Jul 15, 2026",
    activity: "Mentored Sam O. — Java OOP",
    type: "earn" as const,
    amount: 20,
  },
  {
    date: "Jul 12, 2026",
    activity: "Booked session — SQL Joins",
    type: "spend" as const,
    amount: 10,
  },
];

function levelClasses(level: "Advanced" | "Intermediate" | "Beginner") {
  switch (level) {
    case "Advanced":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "Intermediate":
      return "bg-accent text-primary dark:bg-accent dark:text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
  }
}

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-2xl bg-card p-4 ring-1 ring-border " + className}>{children}</div>
  );
}

function Dashboard() {
  const [certificates, setCertificates] = useState<{ name: string; size: string }[]>([
    { name: "Java SE 21 Certified.pdf", size: "412 KB" },
    { name: "SQL Fundamentals — Coursera.pdf", size: "228 KB" },
    { name: "Intro to Data Structures — Stanford.pdf", size: "356 KB" },
  ]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pending, setPending] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!pending) return;
    setCertificates((c) => [
      {
        name: pending.name,
        size: `${Math.max(1, Math.round(pending.size / 1024))} KB`,
      },
      ...c,
    ]);
    setPending(null);
    setUploadOpen(false);
    toast.success("Certificate uploaded");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
      {/* Welcome banner */}
      <section className="rounded-2xl bg-brand-navy px-5 py-5 text-brand-pale sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-pale">
              Fall 2026 · Week 3
            </p>
            <h1 className="mt-1 truncate text-inherit text-xl font-semibold tracking-tight sm:text-2xl">
              Welcome back, Alex
            </h1>
            <p className="mt-1 text-sm text-brand-pale/90">
              You have 2 sessions coming up this week — the next one is Thursday at 4:00 PM.
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-brand-bright"
          >
            <Link to="/mentors">
              Find a mentor
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Panel key={m.label} className="flex items-center gap-3">
            <span className={"grid h-10 w-10 shrink-0 place-items-center rounded-xl " + m.accent}>
              <m.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-semibold tracking-tight text-foreground">{m.value}</p>
              <p className="truncate text-[11px] text-muted-foreground">{m.hint}</p>
            </div>
          </Panel>
        ))}
      </section>

      {/* Profile + skills */}
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                  AC
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-foreground">Alex Chen</h2>
                <p className="truncate text-xs text-muted-foreground">Computer Science, Year 3</p>
                <Badge
                  variant="secondary"
                  className="mt-1.5 rounded-full border-0 bg-emerald-50 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  Verified mentor
                </Badge>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-3 divide-x divide-border text-center">
              {[
                { v: "4.9", l: "Rating" },
                { v: "23", l: "Reviews" },
                { v: "8", l: "Sessions" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-base font-semibold text-foreground">{s.v}</p>
                  <p className="text-[11px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              title="Certificates"
              subtitle="Verified credentials"
              action={
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 rounded-lg text-primary hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload certificate</DialogTitle>
                      <DialogDescription>
                        PDFs only. Certificates are reviewed before appearing on your public
                        profile.
                      </DialogDescription>
                    </DialogHeader>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition hover:border-brand-bright hover:bg-accent dark:bg-muted/40"
                    >
                      <UploadCloud className="h-7 w-7 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {pending ? pending.name : "Click to select a PDF"}
                      </p>
                      <p className="text-xs text-muted-foreground">Max 10 MB · PDF only</p>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setPending(e.target.files?.[0] ?? null)}
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPending(null);
                          setUploadOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpload} disabled={!pending}>
                        Upload
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              }
            />
            <ul className="mt-2 divide-y divide-border">
              {certificates.map((c) => (
                <li key={c.name} className="flex items-center gap-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">PDF · {c.size}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="lg:col-span-2">
          <SectionTitle
            title="Skills I can teach"
            subtitle="Shown on your mentor profile"
            action={
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 rounded-lg text-primary hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            }
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {teachSkills.map((s) => (
              <Badge
                key={s.name}
                variant="secondary"
                className={
                  "rounded-full border-0 px-2.5 py-1 text-xs font-medium " + levelClasses(s.level)
                }
              >
                {s.name} · {s.level}
              </Badge>
            ))}
          </div>

          <Separator className="my-4" />

          <SectionTitle
            title="Skills I want to learn"
            subtitle="Used to match you with mentors"
            action={
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 rounded-lg text-primary hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add
              </Button>
            }
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {learnSkills.map((s) => (
              <Badge
                key={s.name}
                variant="secondary"
                className={
                  "rounded-full border-0 px-2.5 py-1 text-xs font-medium " + levelClasses(s.level)
                }
              >
                {s.name} · {s.level}
              </Badge>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-start gap-2.5 rounded-xl bg-accent px-3 py-2.5 dark:bg-muted/40">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">15 pts are currently in escrow.</span>{" "}
              Points held for booked sessions transfer to your mentor once both sides confirm
              completion.
            </p>
          </div>
        </Panel>
      </section>

      {/* Activity log */}
      <section>
        <Panel className="p-0">
          <div className="px-4 pt-4">
            <SectionTitle
              title="Activity log"
              subtitle="Recent point transactions"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-muted-foreground"
                >
                  Export CSV
                </Button>
              }
            />
          </div>
          <div className="mt-2 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Date</TableHead>
                  <TableHead className="h-9 text-xs">Activity</TableHead>
                  <TableHead className="h-9 text-xs">Type</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((row, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="whitespace-nowrap py-2.5 pl-4 text-xs text-muted-foreground">
                      {row.date}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-foreground">{row.activity}</TableCell>
                    <TableCell className="py-2.5">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
                          (row.type === "earn"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground")
                        }
                      >
                        {row.type === "earn" ? (
                          <Plus className="mr-0.5 h-3 w-3" />
                        ) : (
                          <Minus className="mr-0.5 h-3 w-3" />
                        )}
                        {row.type === "earn" ? "Earned" : "Spent"}
                      </span>
                    </TableCell>
                    <TableCell
                      className={
                        "py-2.5 pr-4 text-right text-sm font-semibold tabular-nums " +
                        (row.type === "earn"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground")
                      }
                    >
                      {row.type === "earn" ? "+" : "−"}
                      {row.amount} Pts
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
      </section>
    </div>
  );
}
