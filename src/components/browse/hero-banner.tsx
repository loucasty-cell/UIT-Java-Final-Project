import { Link } from "@tanstack/react-router";
import { Sparkles, Play, Bookmark, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] rounded-3xl bg-gradient-to-br from-background via-muted to-secondary p-8 sm:p-12 lg:p-16 text-foreground shadow-2xl">
      {/* pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="space-y-6">
          <Badge className="rounded-full bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 shadow-lg">
            <Sparkles className="mr-1 h-3 w-3" /> Featured Skill of the Day
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Master React & TypeScript
            <span className="block text-red-500">with peer mentors</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            Learn from top-rated Computer Science peers. Book a 60-min session with Skill Points,
            swap knowledge, or join free volunteer hours. Escrow-protected, 18-hour auto-release.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
              <Link to="/mentors">
                <Play className="mr-1.5 h-4 w-4 fill-current" /> Find a Mentor
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/40 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              <Link to="/watchlist">
                <Bookmark className="mr-1.5 h-4 w-4" /> My List
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 pt-1">
            <Badge variant="secondary" className="rounded-full bg-white/15 text-white border-0 shadow-md">
              +30 starter points
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-white/15 text-white border-0 shadow-md">
              0-point volunteer
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-white/15 text-white border-0 shadow-md">
              Skill swap
            </Badge>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
              <TrendingUp className="h-4 w-4" /> Trending now
            </div>
            <div className="mt-3 space-y-3">
              {[
                { name: "Priya Anand", skill: "React Advanced", pts: 50 },
                { name: "Kenji Watanabe", skill: "UI/UX", pts: 55 },
                { name: "Marcus Delgado", skill: "Calculus", pts: 40 },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-300">{m.skill}</p>
                  </div>
                  <Badge className="bg-white text-slate-900 rounded-full">{m.pts} Pts</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
