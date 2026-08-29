import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { requireAuth } from "@/lib/route-guards";
import { HeroBanner } from "@/components/browse/hero-banner";
import { SkillRail } from "@/components/browse/skill-rail";
import { useMentorsSearchQuery } from "@/hooks/api/use-mentors";
import { useUserSkillsQuery } from "@/hooks/api/use-skills";
import type { MentorPreviewItem } from "@/components/browse/mentor-preview-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/browse")({
  beforeLoad: requireAuth,
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    return {
      q: typeof search.q === "string" ? search.q : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Browse Skills & Mentors — SkillBridge" },
      {
        name: "description",
        content:
          "Netflix-style immersive skill rails, top trending mentors, and peer learning recommendations.",
      },
    ],
  }),
  component: BrowsePage,
});

const SEED_MENTORS: MentorPreviewItem[] = [
  {
    id: "m-priya",
    name: "Priya Anand",
    major: "Computer Science, Year 4",
    initials: "PA",
    rating: 4.9,
    reviews: 32,
    cost: 50,
    modes: ["points", "exchange", "volunteer"],
    skills: [
      { name: "React", level: "Advanced" },
      { name: "TypeScript", level: "Advanced" },
      { name: "UI/UX", level: "Intermediate" },
    ],
  },
  {
    id: "m-marcus",
    name: "Marcus Delgado",
    major: "Mathematics, Year 3",
    initials: "MD",
    rating: 4.8,
    reviews: 24,
    cost: 40,
    modes: ["points", "exchange"],
    skills: [
      { name: "Linear Algebra", level: "Advanced" },
      { name: "Calculus", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
    ],
  },
  {
    id: "m-kenji",
    name: "Kenji Watanabe",
    major: "Design, Year 3",
    initials: "KW",
    rating: 4.9,
    reviews: 41,
    cost: 55,
    modes: ["points", "exchange"],
    skills: [
      { name: "UI/UX", level: "Advanced" },
      { name: "Figma", level: "Advanced" },
    ],
  },
  {
    id: "m-diego",
    name: "Diego Ramirez",
    major: "Electrical Engineering, Year 4",
    initials: "DR",
    rating: 4.8,
    reviews: 27,
    cost: 45,
    modes: ["points", "exchange", "volunteer"],
    skills: [
      { name: "Circuits", level: "Advanced" },
      { name: "MATLAB", level: "Intermediate" },
    ],
  },
  {
    id: "m-lena",
    name: "Lena Karlsson",
    major: "English Literature, Year 2",
    initials: "LK",
    rating: 4.7,
    reviews: 18,
    cost: 30,
    modes: ["points", "volunteer"],
    skills: [
      { name: "Essay Writing", level: "Advanced" },
      { name: "Academic English", level: "Intermediate" },
    ],
  },
  {
    id: "m-amara",
    name: "Amara Okafor",
    major: "Business, Year 4",
    initials: "AO",
    rating: 4.6,
    reviews: 12,
    cost: 35,
    modes: ["points", "volunteer"],
    skills: [
      { name: "Public Speaking", level: "Advanced" },
      { name: "Marketing", level: "Intermediate" },
    ],
  },
];

function BrowsePage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();

  const { data: apiMentors } = useMentorsSearchQuery({ search: q });
  const { data: userLearnSkills } = useUserSkillsQuery("LEARN");

  const mentors: MentorPreviewItem[] = useMemo(() => {
    const list: any[] = Array.isArray(apiMentors) ? apiMentors : (apiMentors as any)?.content || [];
    if (list.length > 0) {
      return list.map((m: any) => ({
        id: m.mentorId || m.id,
        name: m.name || m.displayName || "Peer Mentor",
        major: m.major || "Computer Science",
        initials: (m.name || "PM")
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        rating: m.averageRating ?? 4.8,
        reviews: m.reviewCount ?? 15,
        cost: m.hourlyRatePoints ?? 35,
        modes: ["points", "exchange", "volunteer"] as any,
        skills: (m.skills || []).map((s: any) => ({
          name: s.name,
          level: s.level || "Intermediate",
        })),
      }));
    }
    return SEED_MENTORS;
  }, [apiMentors]);

  // Top 10 Rail (ranked by reviews and ratings)
  const topTenMentors = useMemo(() => {
    return [...mentors]
      .sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
      .slice(0, 10)
      .map((m, index) => ({
        ...m,
        rankNumber: index + 1,
      }));
  }, [mentors]);

  // Programming Rail
  const programmingMentors = useMemo(() => {
    const techSkills = new Set([
      "react",
      "typescript",
      "java",
      "python",
      "sql",
      "circuits",
      "matlab",
    ]);
    return mentors.filter((m) => m.skills.some((s) => techSkills.has(s.name.toLowerCase())));
  }, [mentors]);

  // Design & Soft Skills Rail
  const designMentors = useMemo(() => {
    const creative = new Set(["ui/ux", "figma", "essay writing", "public speaking", "marketing"]);
    return mentors.filter((m) => m.skills.some((s) => creative.has(s.name.toLowerCase())));
  }, [mentors]);

  const handleRequestItem = (item: MentorPreviewItem) => {
    navigate({ to: "/mentors" });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
      {/* Hero Billboard */}
      <HeroBanner />

      {/* Netflix Rails */}
      <div className="space-y-10">
        {/* Top 10 Rail */}
        <SkillRail
          title="Top 10 Mentors in SkillBridge This Week"
          subtitle="Highest rated peer instructors ranked by student community reviews"
          items={topTenMentors}
          onRequestItem={handleRequestItem}
        />

        {/* Personalized "Because you want to learn" rail */}
        {userLearnSkills && userLearnSkills.length > 0 && (
          <SkillRail
            title={`Because you want to learn ${(userLearnSkills?.[0] as any)?.skillName || (userLearnSkills?.[0] as any)?.skill?.name || "new skills"}`}
            subtitle="Curated mentors matching your learning portfolio interests"
            items={programmingMentors}
            onRequestItem={handleRequestItem}
          />
        )}

        {/* Programming & Engineering Rail */}
        <SkillRail
          title="Programming, Algorithms & Software Engineering"
          subtitle="Hands-on 1-on-1 code walkthroughs, system design, and debugging"
          items={programmingMentors}
          onRequestItem={handleRequestItem}
        />

        {/* Design, Writing & Soft Skills */}
        <SkillRail
          title="Design, Writing & Leadership Skills"
          subtitle="UI/UX design reviews, essay editing, public speaking, and presentation coaching"
          items={designMentors}
          onRequestItem={handleRequestItem}
        />
      </div>
    </div>
  );
}
