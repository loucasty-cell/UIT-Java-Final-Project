import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorPreviewCard, type MentorPreviewItem } from "./mentor-preview-card";

interface SkillRailProps {
  title: string;
  subtitle?: string;
  items: MentorPreviewItem[];
  onRequestItem?: (item: MentorPreviewItem) => void;
}

export function SkillRail({ title, subtitle, items, onRequestItem }: SkillRailProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header with Chevrons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="h-8 w-8 rounded-full border-border/80 shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="h-8 w-8 rounded-full border-border/80 shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Embla Viewport */}
      <div className="overflow-hidden py-2 -my-2" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item) => (
            <MentorPreviewCard key={item.id} item={item} onRequest={onRequestItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
