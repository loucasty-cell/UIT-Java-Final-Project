import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, MapPin, Mail } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  major: string | null;
  yearOfStudy: number | null;
  roles: string[];
  onEdit?: () => void;
}

/**
 * PHASE 2: User Profile Display Component
 * 
 * Displays real user profile information from backend:
 * - Real name (displayName || firstName + lastName)
 * - Real email
 * - Real avatar with fallback
 * - Real bio
 * - Real major/yearOfStudy as subtitle
 * - Role badges
 * - Edit button for future Phase 9 functionality
 */
export function ProfileHeader({
  name,
  email,
  avatar,
  bio,
  major,
  yearOfStudy,
  roles,
  onEdit,
}: ProfileHeaderProps) {
  // Generate initials for avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Determine subtitle from major and yearOfStudy
  const subtitle = major
    ? `${major}${yearOfStudy ? ` - Year ${yearOfStudy}` : ""}`
    : "Student";

  // Determine if user is instructor
  const isInstructor = roles?.includes("INSTRUCTOR") || roles?.includes("MENTOR");

  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
      {/* Header Background */}
      <div className="h-28 bg-gradient-to-r from-blue-500 to-cyan-500" />

      {/* Profile Content */}
      <div className="px-5 pb-6 pt-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 gap-4">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-white shadow-md -mt-16">
              <AvatarImage src={avatar || ""} alt={name} />
              <AvatarFallback className="bg-blue-500 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 pt-2">
              <h1 className="text-2xl font-bold text-foreground">{name}</h1>
              <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>

              {/* Role Badges */}
              <div className="flex gap-2 flex-wrap">
                {isInstructor && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Instructor
                  </Badge>
                )}
                {roles?.includes("USER") && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Learner
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="gap-2 mt-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Bio Section */}
        {bio && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-foreground/90">{bio}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <a href={`mailto:${email}`} className="hover:text-foreground transition">
            {email}
          </a>
        </div>
      </div>
    </Card>
  );
}
