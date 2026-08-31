import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: string;
  progress?: number;
}

interface SkillsDisplayProps {
  learnSkills: Skill[];
  teachSkills: Skill[];
  showTeaching?: boolean;
}

function SkillLevelBadge({ level }: { level: string }) {
  const levelMap: { [key: string]: { color: string; label: string } } = {
    BEGINNER: { color: "bg-blue-100 text-blue-800", label: "Beginner" },
    INTERMEDIATE: { color: "bg-green-100 text-green-800", label: "Intermediate" },
    ADVANCED: { color: "bg-purple-100 text-purple-800", label: "Advanced" },
    EXPERT: { color: "bg-amber-100 text-amber-800", label: "Expert" },
  };

  const config = levelMap[level] || { color: "bg-gray-100 text-gray-800", label: level };

  return (
    <Badge className={`${config.color} text-xs`}>
      {config.label}
    </Badge>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-foreground">{skill.name}</h3>
        <SkillLevelBadge level={skill.level} />
      </div>
      
      {skill.progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">{skill.progress}%</span>
          </div>
          <Progress value={skill.progress} className="h-2" />
        </div>
      )}
    </div>
  );
}

/**
 * PHASE 3: Skills Display Component
 * 
 * Shows:
 * - Learn skills array from backend
 * - Teach skills array (if instructor)
 * - Skill level badges (Beginner/Intermediate/Advanced/Expert)
 * - Progress visualization
 */
export function SkillsDisplay({
  learnSkills,
  teachSkills,
  showTeaching = false,
}: SkillsDisplayProps) {
  const hasLearnSkills = learnSkills && learnSkills.length > 0;
  const hasTeachSkills = teachSkills && teachSkills.length > 0 && showTeaching;

  if (!hasLearnSkills && !hasTeachSkills) {
    return (
      <Card className="p-8 text-center rounded-2xl border-0 shadow-sm">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No skills added yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learn Skills */}
      {hasLearnSkills && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-bold">Skills I'm Learning</h2>
            <Badge variant="secondary">{learnSkills.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learnSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Teach Skills */}
      {hasTeachSkills && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5" />
            <h2 className="text-lg font-bold">Skills I Teach</h2>
            <Badge variant="secondary">{teachSkills.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
