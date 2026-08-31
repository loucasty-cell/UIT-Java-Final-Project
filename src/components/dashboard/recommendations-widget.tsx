import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { useMentorsSearchQuery } from '@/hooks/api/use-mentors';
import { useUserSkillsQuery } from '@/hooks/api/use-skills';

export function RecommendationsWidget() {
  const { data: skills } = useUserSkillsQuery();
  const { data: mentorsData } = useMentorsSearchQuery();
  
  const mentors = Array.isArray(mentorsData) 
    ? mentorsData 
    : (mentorsData && 'content' in mentorsData && Array.isArray((mentorsData as any).content))
    ? (mentorsData as any).content
    : [];

  // Get user's LEARN skills (what they want to learn)
  const learnSkills = skills
    ?.filter(s => s.direction === 'LEARN')
    .map(s => (s.skill?.name || '').toLowerCase())
    .filter(Boolean) || [];
  
  // Filter mentors whose TEACH skills match user's LEARN skills
  const recommendedMentors = mentors
    ?.filter((m: any) => {
      if (!m.skills || !Array.isArray(m.skills)) return false;
      return m.skills.some((s: any) => {
        const skillName = typeof s === 'string' ? s : (s?.name || '');
        return learnSkills.includes(skillName.toLowerCase());
      });
    })
    .slice(0, 3);
  
  // If user has no matching mentors but we have mentors, show top rated mentors
  const displayMentors = (recommendedMentors && recommendedMentors.length > 0)
    ? recommendedMentors
    : mentors.slice(0, 3);

  // Don't show if no mentors at all
  if (!displayMentors?.length) {
    return null;
  }
  
  return (
    <Card className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Recommended for You
        </CardTitle>
        <CardDescription className="text-xs">Based on your learning goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayMentors.map((mentor: any) => {
          const mentorSkills: string[] = Array.isArray(mentor.skills)
            ? mentor.skills.map((s: any) => typeof s === 'string' ? s : s?.name || '').filter(Boolean)
            : [];
          
          const matchingSkills = mentorSkills.filter(s => 
            learnSkills.includes(s.toLowerCase())
          );
          const shownSkills = matchingSkills.length > 0 ? matchingSkills : mentorSkills;
          
          const initials = (mentor.name || 'Mentor')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div 
              key={mentor.mentorId || mentor.id} 
              className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 hover:border-purple-400 dark:hover:border-purple-600 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 shrink-0 border-2 border-purple-200 dark:border-purple-700">
                  <AvatarFallback className="text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {mentor.name}
                    </p>
                    {mentor.averageRating !== undefined && mentor.averageRating > 0 && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-foreground">
                          {Number(mentor.averageRating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {mentor.bio && (
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {mentor.bio}
                    </p>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {shownSkills.slice(0, 2).map((skillName: string) => (
                      <Badge 
                        key={skillName} 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-4 bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-medium"
                      >
                        {skillName}
                      </Badge>
                    ))}
                    {shownSkills.length > 2 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        +{shownSkills.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                className="rounded-xl shrink-0 ml-2 bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs font-semibold"
                asChild
              >
                <Link to="/mentors">View</Link>
              </Button>
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          className="w-full rounded-xl mt-1 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs font-semibold h-8" 
          asChild
        >
          <Link to="/mentors">
            Explore All Mentors <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
