import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { skillsService } from "@/services/skills.service";
import { ApiError, getAccessToken } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { SettingsSkills } from "@/components/settings-skills";
import { Certificates } from "@/components/dashboard-extras";
import type { UpdateUserProfileRequest } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NotificationPreferences } from "@/types/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · SkillBridge" }] }),
  component: SettingsPage,
});
function SettingsPage() {
  const { updateProfile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const signedIn = Boolean(getAccessToken());
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    enabled: signedIn,
  });
  const portfolio = useQuery({
    queryKey: ["settings-skills", "all"],
    queryFn: () => skillsService.getUserSkills(),
    enabled: signedIn,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [form, setForm] = useState<UpdateUserProfileRequest>({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  useEffect(() => {
    if (profile.data) {
      setAvatarUrl(profile.data.avatarUrl ?? "");
      setForm({
        firstName: profile.data.firstName,
        lastName: profile.data.lastName,
        displayName: profile.data.displayName,
        bio: profile.data.bio ?? "",
        major: profile.data.major ?? "",
        yearOfStudy: profile.data.yearOfStudy,
        timezone: profile.data.timezone ?? "",
      });
    }
  }, [profile.data]);
  const update = useMutation({
    mutationFn: () => {
      if (profile.data?.version === undefined)
        throw new Error("Your profile version is unavailable. Refresh and try again.");
      return updateProfile(form, profile.data.version);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile);
      toast.success("Profile updated successfully.");
    },
    onError: (failure) =>
      toast.error(
        failure instanceof ApiError && failure.message
          ? failure.message
          : failure instanceof Error
            ? failure.message
            : "Could not update your profile.",
      ),
  });
  const uploadAvatar = useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: async (updatedProfile) => {
      setAvatarUrl(updatedProfile.avatarUrl || "");
      queryClient.setQueryData(["profile"], updatedProfile);
      await refreshProfile();
      toast.success("Profile photo updated.");
    },
    onError: (failure) =>
      toast.error(failure instanceof Error ? failure.message : "Could not upload your profile photo."),
  });
  const passwordChange = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
      toast.success("Password changed successfully.");
    },
    onError: (failure) =>
      toast.error(failure instanceof Error ? failure.message : "Could not change your password."),
  });
  const notificationPreferences = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: authService.getNotificationPreferences,
    enabled: signedIn,
  });
  const updateNotificationPreferences = useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      authService.updateNotificationPreferences(preferences),
    onSuccess: (preferences) => {
      queryClient.setQueryData(["notification-preferences"], preferences);
      toast.success("Notification preferences saved.");
    },
    onError: (failure) =>
      toast.error(
        failure instanceof Error ? failure.message : "Could not save notification preferences.",
      ),
  });
  const setNotificationPreference = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    if (!notificationPreferences.data || updateNotificationPreferences.isPending) return;
    updateNotificationPreferences.mutate({ ...notificationPreferences.data, [key]: value });
  };
  const setField = (key: keyof UpdateUserProfileRequest, value: string) =>
    setForm((current) => ({
      ...current,
      [key]: key === "yearOfStudy" ? (value ? Number(value) : undefined) : value,
    }));
  if (!signedIn)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Sign in to manage your profile and preferences.</p>
            <Button asChild>
              <Link to="/login" search={{ redirect: "/settings" }}>
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  const displayName =
    form.displayName ||
    `${form.firstName ?? ""} ${form.lastName ?? ""}`.trim() ||
    "SkillBridge user";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (profile.isPending)
    return (
      <p role="status" className="p-8">
        Loading profile…
      </p>
    );
  if (profile.error)
    return (
      <p role="alert" className="p-8">
        Could not load profile. Refresh to retry.
      </p>
    );
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, skills, certificates, security, and notifications.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="profile">
            <UserRound className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  update.mutate();
                }}
                className="space-y-5"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setAvatarUrl(URL.createObjectURL(file));
                        uploadAvatar.mutate(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" /> Change photo
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPEG, PNG, or WebP up to 2 MB.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName ?? ""}
                      onChange={(e) => setField("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName ?? ""}
                      onChange={(e) => setField("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={form.displayName ?? ""}
                    onChange={(e) => setField("displayName", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={form.major ?? ""}
                      onChange={(e) => setField("major", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Academic year</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1"
                      max="10"
                      value={form.yearOfStudy ?? ""}
                      onChange={(e) => setField("yearOfStudy", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">About me</Label>
                  <Textarea
                    id="bio"
                    rows={5}
                    value={form.bio ?? ""}
                    onChange={(e) => setField("bio", e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={update.isPending || profile.data?.version === undefined}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {update.isPending ? "Saving…" : "Save profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="skills">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills I can teach</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsSkills direction="TEACH" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skills I want to learn</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsSkills direction="LEARN" />
              </CardContent>
            </Card>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            These preferences are used to match you with suitable mentors and learners.
          </p>
        </TabsContent>
        <TabsContent value="certificates">
          {portfolio.error && (
            <p role="alert" className="mb-3 text-destructive">
              Could not load your skills for certificate management.
            </p>
          )}
          <Certificates skills={portfolio.data ?? []} editable />
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password and security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use your current password to set a new password for this account.
              </p>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                Change password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders before scheduled sessions.
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.data?.sessionRemindersEnabled ?? false}
                  disabled={notificationPreferences.isPending || updateNotificationPreferences.isPending}
                  onCheckedChange={(checked) =>
                    setNotificationPreference("sessionRemindersEnabled", checked)
                  }
                  aria-label="Enable session reminders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New session requests</p>
                  <p className="text-sm text-muted-foreground">
                    Know when a learner requests your time.
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.data?.sessionRequestNotificationsEnabled ?? false}
                  disabled={notificationPreferences.isPending || updateNotificationPreferences.isPending}
                  onCheckedChange={(checked) =>
                    setNotificationPreference("sessionRequestNotificationsEnabled", checked)
                  }
                  aria-label="Enable new session request notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about new messages.</p>
                </div>
                <Switch
                  checked={notificationPreferences.data?.messageAlertsEnabled ?? false}
                  disabled={notificationPreferences.isPending || updateNotificationPreferences.isPending}
                  onCheckedChange={(checked) => setNotificationPreference("messageAlertsEnabled", checked)}
                  aria-label="Enable message alerts"
                />
              </div>
              {notificationPreferences.error ? (
                <p role="alert" className="text-xs text-destructive">
                  Could not load notification preferences. Refresh to try again.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your choices are saved automatically and apply to matching in-app alerts.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open && !passwordChange.isPending) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Your new password needs at least 8 characters, including a letter and a number.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (newPassword !== confirmPassword) {
                toast.error("New password and confirmation do not match.");
                return;
              }
              passwordChange.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
                disabled={passwordChange.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={passwordChange.isPending}>
                {passwordChange.isPending ? "Changing..." : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
