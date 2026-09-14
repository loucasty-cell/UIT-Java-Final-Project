import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, FileText, GraduationCap, Star, UserRound } from "lucide-react";
import { authService } from "@/services/auth.service";
import { skillsService } from "@/services/skills.service";
import { useAuth } from "@/context/auth-context";
import { userDisplayName, userInitials } from "@/lib/auth-validation";
import type { PublicUserSkillResponse, ReviewResponse, SkillCertificateResponse, SkillDirection } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustedMentorBadge } from "@/components/trusted-mentor-badge";

export const Route = createFileRoute("/users/$userId")({
  component: UserProfileRoute,
});

function UserProfileRoute() {
  const { userId } = Route.useParams();
  return <PublicUserProfile userId={userId} />;
}

export function PublicUserProfile({ userId }: { userId: string }) {
  const { user } = useAuth();
  const result = useQuery({
    queryKey: ["public-user-profile", userId],
    queryFn: async () => {
      const [profile, skills] = await Promise.all([
        authService.getPublicProfile(userId),
        authService.getPublicSkills(userId),
      ]);
      return { profile, skills };
    },
  });
  const reviewsResult = useQuery({
    queryKey: ["public-user-reviews", userId],
    queryFn: () => authService.getPublicReviews(userId),
  });
  const certificatesResult = useQuery({
    queryKey: ["public-user-certificates", userId],
    queryFn: () => authService.getPublicCertificates(userId),
  });
  const profile = result.data?.profile;
  const skills = result.data?.skills ?? [];
  const reviews = reviewsResult.data?.content ?? [];
  const certificates = certificatesResult.data ?? [];
  const displayName = userDisplayName(profile ?? null);
  const teaching = skills.filter((skill) => skill.direction === "TEACH");
  const learning = skills.filter((skill) => skill.direction === "LEARN");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      <Button asChild variant="ghost" className="-ml-3">
        <Link to="/mentors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to mentors
        </Link>
      </Button>

      {result.isPending && <p role="status">Loading member profile…</p>}
      {result.error && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <p role="alert" className="text-destructive">
              {result.error instanceof Error
                ? result.error.message
                : "Could not load this member profile."}
            </p>
            <Button onClick={() => void result.refetch()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {profile && !result.error && (
        <>
          <Card>
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {userInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {user?.id === profile.id && <Badge variant="secondary">This is you</Badge>}
                  {profile.trustedMentor && <TrustedMentorBadge />}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {[profile.major, profile.yearOfStudy ? `Year ${profile.yearOfStudy}` : null]
                    .filter(Boolean)
                    .join(" · ") || "SkillBridge member"}
                </p>
                <p className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {profile.reviewCount
                    ? `${(profile.averageRating ?? 0).toFixed(1)} from ${profile.reviewCount} review${profile.reviewCount === 1 ? "" : "s"}`
                    : "No reviews yet"}
                </p>
                {user?.id === profile.id && (
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/">Open my private profile</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" />
                  About
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {profile.bio?.trim() || "This member has not added a bio yet."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <SkillList
              title="Skills they can teach"
              icon={GraduationCap}
              skills={teaching}
              direction="TEACH"
            />
            <SkillList
              title="Skills they want to learn"
              icon={BookOpen}
              skills={learning}
              direction="LEARN"
            />
          </div>

          <CertificatesList
            userId={userId}
            certificates={certificates}
            isLoading={certificatesResult.isPending}
            hasError={certificatesResult.isError}
          />

          <ReviewsList
            reviews={reviews}
            isLoading={reviewsResult.isPending}
            hasError={reviewsResult.isError}
          />
        </>
      )}
    </div>
  );
}

function CertificatesList({
  userId,
  certificates,
  isLoading,
  hasError,
}: {
  userId: string;
  certificates: SkillCertificateResponse[];
  isLoading: boolean;
  hasError: boolean;
}) {
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openCertificate = async (certificate: SkillCertificateResponse) => {
    const viewer = window.open("", "_blank");
    setOpeningId(certificate.id);
    setError("");
    try {
      const file = await skillsService.downloadCertificate(userId, certificate.skill.id);
      const url = URL.createObjectURL(file);
      if (viewer) viewer.location.href = url;
      else window.open(url, "_blank");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      viewer?.close();
      setError(cause instanceof Error ? cause.message : "Could not open this certificate.");
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Certificates
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading certificatesâ€¦</p>}
        {hasError && <p className="text-sm text-muted-foreground">Certificates are not available right now.</p>}
        {!isLoading && !hasError && !certificates.length && (
          <p className="text-sm text-muted-foreground">This member has not uploaded any certificates yet.</p>
        )}
        {certificates.map((certificate) => (
          <div key={certificate.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{certificate.skill.name}</p>
              <p className="truncate text-xs text-muted-foreground">{certificate.fileName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={openingId === certificate.id}
              onClick={() => void openCertificate(certificate)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {openingId === certificate.id ? "Opening…" : "View certificate"}
            </Button>
          </div>
        ))}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

function ReviewsList({
  reviews,
  isLoading,
  hasError,
}: {
  reviews: ReviewResponse[];
  isLoading: boolean;
  hasError: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            Reviews
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading reviews…</p>}
        {hasError && (
          <p className="text-sm text-muted-foreground">Reviews are not available right now.</p>
        )}
        {!isLoading && !hasError && !reviews.length && (
          <p className="text-sm text-muted-foreground">This member has no reviews yet.</p>
        )}
        {!isLoading &&
          !hasError &&
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review }: { review: ReviewResponse }) {
  const reviewer = review.reviewerName?.trim() || "SkillBridge member";
  const reviewDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{reviewer}</p>
          {reviewDate && <p className="text-xs text-muted-foreground">{reviewDate}</p>}
        </div>
        <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"}`}
            />
          ))}
          <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
        {review.feedback?.trim() || "No written feedback provided."}
      </p>
    </article>
  );
}

function SkillList({
  title,
  icon: Icon,
  skills,
  direction,
}: {
  title: string;
  icon: typeof BookOpen;
  skills: PublicUserSkillResponse[];
  direction: SkillDirection;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{skill.skillName}</p>
              <p className="truncate text-xs text-muted-foreground">{skill.category}</p>
            </div>
            <Badge variant={direction === "TEACH" ? "default" : "secondary"}>
              {skill.level.toLowerCase()}
            </Badge>
          </div>
        ))}
        {!skills.length && (
          <p className="text-sm text-muted-foreground">
            No {direction === "TEACH" ? "teaching" : "learning"} skills added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
