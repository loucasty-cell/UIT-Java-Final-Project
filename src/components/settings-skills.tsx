import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { skillsService } from "@/services/skills.service";
import type { SkillDirection, SkillLevel } from "@/types/api";
import { SkillLevelSelect } from "@/components/dashboard-extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsSkills({ direction }: { direction: SkillDirection }) {
  const queryClient = useQueryClient();
  const skills = useQuery({
    queryKey: ["settings-skills", direction],
    queryFn: () => skillsService.getUserSkills(direction),
  });
  const [name, setName] = useState("");
  const [level, setLevel] = useState<SkillLevel>("BEGINNER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const action = async (operation: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await operation();
      await queryClient.invalidateQueries({ queryKey: ["settings-skills"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save skill.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      {skills.isPending && <p role="status">Loading skills…</p>}
      {(error || skills.error) && (
        <p role="alert" className="text-destructive">
          {error || "Could not load skills."}
        </p>
      )}
      {skills.data?.map((skill) => (
        <div key={skill.id} className="space-y-2 rounded-lg border p-3">
          <p className="font-medium">{skill.skill.name}</p>
          <SkillLevelSelect
            id={`level-${skill.id}`}
            value={skill.level}
            onChange={(value) => {
              if (!busy)
                void action(() => skillsService.updateUserSkill(skill.id, { level: value }));
            }}
          />
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void action(() => skillsService.deleteUserSkill(skill.id))}
          >
            Remove {skill.skill.name}
          </Button>
        </div>
      ))}
      {!skills.isPending && !skills.error && !skills.data?.length && <p>No skills added yet.</p>}
      <form
        className="space-y-3 border-t pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return setError("Enter a skill name.");
          void action(async () => {
            await skillsService.addCustomUserSkill(name.trim(), direction, level);
            setName("");
          });
        }}
      >
        <div>
          <Label htmlFor={`skill-${direction}`}>New skill</Label>
          <Input
            id={`skill-${direction}`}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <SkillLevelSelect id={`new-level-${direction}`} value={level} onChange={setLevel} />
        <Button disabled={busy || skills.isPending || !!skills.error} type="submit">
          Add skill
        </Button>
      </form>
    </div>
  );
}
