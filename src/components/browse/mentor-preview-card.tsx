import { Link } from "@tanstack/react-router";
import { Star, Coins, Handshake, HandHeart, Plus, Check, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWatchlist } from "@/hooks/use-watchlist";

export interface MentorPreviewItem {
  id: string;
  name: string;
  major: string;
  initials: string;
  rating: number;
  reviews: number;
  cost: number;
  modes: ("points" | "exchange" | "volunteer")[];
  skills: { name: string; level: string }[];
  badge?: string;
  rankNumber?: number;
}

interface MentorPreviewCardProps {
  item: MentorPreviewItem;
  onRequest?: (item: MentorPreviewItem) => void;
}

export function MentorPreviewCard({ item, onRequest }: MentorPreviewCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist({
      type: "MENTOR",
      targetId: item.id,
      title: item.name,
      subtitle: `${item.major} · ${item.skills.map((s) => s.name).join(", ")}`,
      rating: item.rating,
    });
  };

  return (
    <div className="group relative flex-none w-[280px] sm:w-[320px] transition-all duration-300 hover:z-20 hover:scale-110 origin-center will-change-transform">
      <Card className="h-full rounded-2xl border-border bg-card shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-primary/40">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          {/* Top Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {item.rankNumber && (
                <span className="text-4xl font-extrabold text-muted-foreground/30 leading-none select-none">
                  {item.rankNumber}
                </span>
              )}
              <Avatar className="h-11 w-11 ring-2 ring-primary/20 transition group-hover:ring-primary">
                <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-xs">
                  {item.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate text-foreground">{item.name}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{item.major}</p>
                <div className="flex items-center gap-1 text-[11px] mt-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{item.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({item.reviews})</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              aria-label="Add to list"
            >
              {inWatchlist ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Teaches Skills */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Teaches
            </p>
            <div className="flex flex-wrap gap-1">
              {item.skills.slice(0, 3).map((s) => (
                <Badge
                  key={s.name}
                  variant="outline"
                  className="rounded-full text-[10px] px-2 py-0 border-border bg-secondary/80 text-foreground"
                >
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Modes and Cost */}
          <div className="pt-3 border-t flex items-center justify-between mt-auto">
            <div className="text-xs">
              <span className="text-muted-foreground">From </span>
              <span className="font-bold text-foreground">{item.cost} Pts</span>
            </div>

            <Button
              size="sm"
              onClick={() => onRequest?.(item)}
              asChild={!onRequest}
              className="rounded-xl text-xs h-8 px-3 shadow-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {onRequest ? (
                <span>Request</span>
              ) : (
                <Link to="/mentors">
                  <Play className="mr-1 h-3 w-3 fill-current" /> Book
                </Link>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
