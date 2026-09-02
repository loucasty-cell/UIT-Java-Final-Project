import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  showText?: boolean;
  className?: string;
};

export function BrandLogo({ showText = true, className }: BrandLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
        aria-hidden="true"
      >
        <GraduationCap className="size-5" />
      </div>
      {showText && (
        <div className="flex min-w-0 flex-col justify-center">
          <span className="truncate text-sm font-bold leading-tight text-brand-navy">
            SkillBridge
          </span>
          <span className="truncate text-[11px] font-medium leading-tight text-brand-blue">
            Learn. Teach. Earn.
          </span>
        </div>
      )}
    </div>
  );
}
