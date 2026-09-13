import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TrustedMentorBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200"
      title="Consistently received positive reviews from completed sessions."
      aria-label="Trusted Mentor: consistently received positive reviews from completed sessions"
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Trusted Mentor
    </Badge>
  );
}
