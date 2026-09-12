import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { skillsService } from "@/services/skills.service";
import { mentorsService } from "@/services/mentors.service";
import { walletService } from "@/services/wallet.service";
import type {
  MentorOfferingResponse,
  SkillCertificateResponse,
  SkillLevel,
  UserSkillResponse,
  WalletTransactionResponse,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { availabilitySummary, type MentorAvailabilitySlot } from "@/lib/mentor-availability";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const selectClass = "h-11 w-full rounded-md border bg-background px-3";
const collapsedTeachingPostCount = 3;
type AvailabilityDate = { date: string; times: string[] };
export function SkillLevelSelect({
  value,
  onChange,
  id = "skill-level",
}: {
  value: SkillLevel;
  onChange: (level: SkillLevel) => void;
  id?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>Skill level</Label>
      <select
        id={id}
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value as SkillLevel)}
      >
        <option value="BEGINNER">Beginner</option>
        <option value="INTERMEDIATE">Intermediate</option>
        <option value="ADVANCED">Advanced</option>
      </select>
    </div>
  );
}

export function DashboardExtras({ skills }: { skills: UserSkillResponse[] }) {
  return (
    <div className="space-y-6">
      <Certificates skills={skills} />
      <TeachingPosts editable />
      <ActivityLog />
    </div>
  );
}

export function Certificates({
  skills,
  editable = false,
}: {
  skills: UserSkillResponse[];
  editable?: boolean;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<SkillCertificateResponse[]>([]);
  const [open, setOpen] = useState(false);
  const [skillId, setSkillId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setItems(await skillsService.getMyCertificates());
  }, []);
  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);
  const action = async (operation: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update certificate.");
    } finally {
      setBusy(false);
    }
  };
  const upload = async () => {
    if (!skillId) throw new Error("Choose the skill this certificate belongs to.");
    if (!file || file.size === 0) throw new Error("Choose a PDF certificate.");
    if (!file.name.toLowerCase().endsWith(".pdf"))
      throw new Error("Only PDF certificates are supported.");
    if (file.size > 5 * 1024 * 1024) throw new Error("The PDF must be 5 MB or smaller.");
    await skillsService.uploadCertificate(skillId, file);
    await load();
    setOpen(false);
    setFile(null);
    toast.success("Certificate uploaded");
  };
  const uniqueSkills = [...new Map(skills.map((s) => [s.skill.id, s.skill])).values()];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Certificates</CardTitle>
        {editable && (
          <Button
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            Upload certificate
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Your uploaded credentials. One PDF per skill; uploading again replaces it.
        </p>
        {!items.length && <p>No certificates uploaded yet.</p>}
        {items.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b py-3"
          >
            <div>
              <p className="font-medium">{c.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {c.skill?.name} · {Math.ceil(c.fileSize / 1024)} KB
              </p>
            </div>
            {editable && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      if (!user) return;
                      const blob = await skillsService.downloadCertificate(user.id, c.skill.id);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = c.fileName;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    })
                  }
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete ${c.fileName}?`))
                      void action(async () => {
                        await skillsService.deleteCertificate(c.skill.id);
                        await load();
                      });
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
        {error && !open && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {editable && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
              <DialogHeader>
                <DialogTitle>Upload certificate</DialogTitle>
                <DialogDescription>
                  PDF only, up to 5 MB. Add a skill to your portfolio first.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="certificate-skill">Certificate skill</Label>
                <select
                  id="certificate-skill"
                  className={selectClass}
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                >
                  <option value="">Choose your skill</option>
                  {uniqueSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="certificate-file">PDF file</Label>
                <Input
                  id="certificate-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={busy} onClick={() => void action(upload)}>
                  {busy ? "Uploading…" : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

export function TeachingPosts({
  editable = false,
  reloadSkills,
}: {
  editable?: boolean;
  reloadSkills?: () => Promise<void>;
}) {
  const [items, setItems] = useState<MentorOfferingResponse[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<SkillLevel>("BEGINNER");
  const [points, setPoints] = useState(true);
  const [exchange, setExchange] = useState(true);
  const [volunteer, setVolunteer] = useState(false);
  const [cost, setCost] = useState("10");
  const [duration, setDuration] = useState("60");
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDate[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [postToRemove, setPostToRemove] = useState<MentorOfferingResponse | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setItems(await mentorsService.getMyOfferings());
  }, []);
  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);
  const publish = async () => {
    setError("");
    if (!name.trim()) return setError("Enter the skill you want to teach.");
    if (!points && !exchange && !volunteer) return setError("Choose at least one session mode.");
    if (!Number.isInteger(Number(duration)) || Number(duration) < 15 || Number(duration) > 180)
      return setError("Duration must be 15–180 minutes.");
    if (
      points &&
      (!cost.trim() || !Number.isInteger(Number(cost)) || Number(cost) < 0 || Number(cost) > 10000)
    )
      return setError("Point cost must be a whole number from 0 to 10,000.");
    if (!availabilityDates.length) return setError("Add at least one available date and time.");
    if (availabilityDates.some((entry) => !entry.date || !entry.times.length || entry.times.some((time) => !time)))
      return setError("Each availability entry needs a date and at least one time.");
    const availabilitySlots: MentorAvailabilitySlot[] = availabilityDates.flatMap((entry) =>
      entry.times.map((time) => ({ date: entry.date, time })),
    );
    if (new Set(availabilitySlots.map((slot) => `${slot.date}-${slot.time}`)).size !== availabilitySlots.length)
      return setError("Add each available time only once per date.");
    setBusy(true);
    try {
      const skill = await skillsService.ensureTeachingSkill(name, level);
      await mentorsService.createOffering({
        teachUserSkillId: skill.id,
        pointCost: points ? Number(cost) : 0,
        pointsEnabled: points,
        skillSwapEnabled: exchange,
        volunteerEnabled: volunteer,
        duration: Number(duration),
        availabilityText: availabilitySummary(availabilitySlots),
        availabilitySlots,
      });
      setOpen(false);
      setName("");
      setAvailabilityDates([]);
      await load();
      await reloadSkills?.();
      toast.success("Teaching post published in Find Mentors");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish teaching post.");
    } finally {
      setBusy(false);
    }
  };
  const visibleItems = showAll ? items : items.slice(0, collapsedTeachingPostCount);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>My teaching posts</CardTitle>
        {editable && (
          <Button
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            Add teaching post
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Publish sessions for other members to book from Find Mentors.
        </p>
        {!items.length && <p>No teaching posts yet.</p>}
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div>
              <h3 className="font-semibold">{item.skill.name}</h3>
              <p>
                {item.duration} minutes ·{" "}
                {item.modes
                  .map((m) => (m === "SKILL_SWAP" ? "Exchange" : m.toLowerCase()))
                  .join(", ")}
                {item.modes.includes("POINTS") ? ` · ${item.price} points` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.availabilitySlots?.length
                  ? availabilitySummary(item.availabilitySlots)
                  : item.availability}
              </p>
              <p>{item.active ? "Published" : "Hidden"}</p>
            </div>
            {editable && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await mentorsService.updateOffering(item.id, { active: !item.active });
                      await load();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not update post.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {item.active ? "Hide post" : "Publish again"}
                </Button>
                <Button variant="destructive" disabled={busy} onClick={() => setPostToRemove(item)}>
                  Remove post
                </Button>
              </div>
            )}
          </div>
        ))}
        {!showAll && items.length > collapsedTeachingPostCount && (
          <Button variant="outline" className="w-full" onClick={() => setShowAll(true)}>
            See more
          </Button>
        )}
        {error && !open && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <AlertDialog
          open={!!postToRemove}
          onOpenChange={(isOpen) => {
            if (!isOpen && !busy) setPostToRemove(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove teaching post?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove “{postToRemove?.skill.name}” from your teaching posts? Learners will no longer be able to book it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={busy}
                onClick={async (event) => {
                  event.preventDefault();
                  if (!postToRemove) return;
                  setBusy(true);
                  setError("");
                  try {
                    await mentorsService.deleteOffering(postToRemove.id);
                    setItems((current) => current.filter((item) => item.id !== postToRemove.id));
                    setPostToRemove(null);
                    toast.success("Teaching post removed");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not remove post.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Removing..." : "Remove post"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {editable && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex h-[870px] max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0">
              <DialogHeader className="shrink-0 border-b px-6 py-5 pr-12">
                <DialogTitle>Create teaching post</DialogTitle>
                <DialogDescription>Choose your skill, session length, accepted modes, and specific available dates.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
              <div>
                <Label htmlFor="teaching-name">Teaching skill</Label>
                <Input
                  id="teaching-name"
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter any skill"
                />
              </div>
              <SkillLevelSelect id="teaching-level" value={level} onChange={setLevel} />
              <div className="flex flex-wrap gap-4">
                {(
                  [
                    ["Points", points, setPoints],
                    ["Exchange", exchange, setExchange],
                    ["Volunteer", volunteer, setVolunteer],
                  ] as const
                ).map(([label, checked, change]) => (
                  <label key={label} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => change(e.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="teaching-duration">Duration (minutes)</Label>
                  <Input
                    id="teaching-duration"
                    type="number"
                    min={15}
                    max={180}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                {points && (
                  <div>
                    <Label htmlFor="teaching-cost">Point cost</Label>
                    <Input
                      id="teaching-cost"
                      type="number"
                      min={0}
                      max={10000}
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Available dates and session times</Label>
                <p className="text-xs text-muted-foreground">
                  Add each date, then add every session start time you can teach on that date.
                </p>
                {availabilityDates.map((entry, dateIndex) => (
                  <div key={dateIndex} className="space-y-2 rounded-md border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        className="min-w-0 flex-1"
                        aria-label={`Availability ${dateIndex + 1} date`}
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={entry.date}
                        onChange={(event) =>
                          setAvailabilityDates((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === dateIndex ? { ...item, date: event.target.value } : item,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setAvailabilityDates((current) =>
                            current.filter((_, itemIndex) => itemIndex !== dateIndex),
                          )
                        }
                      >
                        Remove date
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.times.map((time, timeIndex) => (
                        <div key={timeIndex} className="flex items-center gap-1">
                          <Input
                            className="w-36"
                            aria-label={`Availability ${dateIndex + 1} time ${timeIndex + 1}`}
                            type="time"
                            value={time}
                            onChange={(event) =>
                              setAvailabilityDates((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === dateIndex
                                    ? {
                                        ...item,
                                        times: item.times.map((itemTime, itemTimeIndex) =>
                                          itemTimeIndex === timeIndex ? event.target.value : itemTime,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Remove time ${time}`}
                            onClick={() =>
                              setAvailabilityDates((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === dateIndex
                                    ? { ...item, times: item.times.filter((_, itemTimeIndex) => itemTimeIndex !== timeIndex) }
                                    : item,
                                ),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAvailabilityDates((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === dateIndex ? { ...item, times: [...item.times, "09:00"] } : item,
                          ),
                        )
                      }
                    >
                      Add time
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setAvailabilityDates((current) => [...current, { date: "", times: ["09:00"] }])
                  }
                >
                  Add available date
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              </div>
              <DialogFooter className="shrink-0 border-t px-6 py-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={busy} onClick={() => void publish()}>
                  {busy ? "Publishing…" : "Publish teaching post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityLog() {
  const [items, setItems] = useState<WalletTransactionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true);
    try {
      const data = await walletService.getTransactions({ page, size: 10 });
      setItems(data.content);
      setLast(data.last);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load activity.");
    } finally {
      setBusy(false);
    }
  }, [page]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Activity log</CardTitle>
        <Button
          variant="outline"
          onClick={() =>
            void walletService.exportTransactionsCsv().catch((e: Error) => setError(e.message))
          }
        >
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Recent point transactions</p>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Activity</th>
                <th className="p-2">Points</th>
                <th className="p-2">Held</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    {item.description ||
                      (item.type || item.eventType || "Transaction").replaceAll("_", " ")}
                  </td>
                  <td className="p-2">
                    {item.availableDelta > 0 ? "+" : ""}
                    {item.availableDelta}
                  </td>
                  <td className="p-2">{item.heldDelta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!busy && !items.length && <p>No activity yet.</p>}
        <div className="flex gap-2">
          <Button variant="outline" disabled={busy || page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={busy || last} onClick={() => setPage(page + 1)}>
            Next
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => void load()}>
            Refresh activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
