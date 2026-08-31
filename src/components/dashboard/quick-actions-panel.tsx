import { Calendar, Plus, Upload, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

interface QuickActionsPanelProps {
  onAddSkill: () => void;
  onUploadCertificate: () => void;
}

export function QuickActionsPanel({ onAddSkill, onUploadCertificate }: QuickActionsPanelProps) {
  return (
    <Card className="rounded-3xl border-2 border-[#1e90ff]/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-[#1e90ff]/40 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 font-semibold tracking-tight">
          <Sparkles className="h-4 w-4 text-[#1e90ff]" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            className="rounded-2xl h-auto py-4 px-3 flex-col gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white shadow-xs"
          >
            <Link to="/mentors">
              <Users className="h-5 w-5" />
              <span className="text-sm font-semibold">Find Mentor</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-2xl h-auto py-4 px-3 flex-col gap-2 border-border hover:border-[#1e90ff] hover:bg-secondary/50 transition"
          >
            <Link to="/sessions">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-semibold">View Sessions</span>
            </Link>
          </Button>

          <Button
            onClick={onAddSkill}
            variant="outline"
            className="rounded-2xl h-auto py-4 px-3 flex-col gap-2 border-border hover:border-[#1e90ff] hover:bg-secondary/50 transition"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-semibold">Add Skill</span>
          </Button>

          <Button
            onClick={onUploadCertificate}
            variant="outline"
            className="rounded-2xl h-auto py-4 px-3 flex-col gap-2 border-border hover:border-[#1e90ff] hover:bg-secondary/50 transition"
          >
            <Upload className="h-5 w-5" />
            <span className="text-sm font-semibold">Upload Cert</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
