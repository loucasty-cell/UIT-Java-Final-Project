import { cn } from "@/lib/utils";

type BrandLogoProps = {
  showText?: boolean;
  className?: string;
};

export function BrandLogo({ showText = true, className }: BrandLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <img
        src="/skillbridge-logo.png"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
      />
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
