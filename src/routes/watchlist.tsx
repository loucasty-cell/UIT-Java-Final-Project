import { createFileRoute, Link } from "@tanstack/react-router";
import { BookmarkCheck, Trash2, Play, Sparkles, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/route-guards";
import { useWatchlist } from "@/hooks/use-watchlist";

export const Route = createFileRoute("/watchlist")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "My List — SkillBridge" },
      {
        name: "description",
        content: "Your saved skills and mentors on SkillBridge.",
      },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { items, removeFromWatchlist } = useWatchlist();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My List</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Skills and peer mentors you've saved for future learning sessions.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/browse">Browse More Skills</Link>
        </Button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-bold text-lg">Your List is Empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Explore skills and mentors on the Browse page and tap "Add to My List" to bookmark
              them here.
            </p>
            <Button asChild className="rounded-xl mt-2 shadow-sm font-semibold">
              <Link to="/browse">Explore Browse Rails</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group rounded-2xl border-border/70 shadow-sm transition hover:shadow-md flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] ${
                        item.type === "SKILL"
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {item.type === "SKILL" ? "Skill Track" : "Peer Mentor"}
                    </Badge>
                    <button
                      onClick={() => removeFromWatchlist(item.targetId)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      aria-label="Remove from list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base line-clamp-1">{item.title}</h3>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}

                  {item.rating && (
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-xl text-xs shadow-sm font-semibold"
                  >
                    <Link to="/mentors">
                      <Play className="mr-1 h-3 w-3 fill-current" /> Book Session
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
