import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/context/auth-context";
import { 
  MapPin, 
  BookOpen, 
  Award, 
  Hourglass, 
  Zap,
  Users,
  Star,
  MessageSquare,
  CheckCircle2,
  Edit2,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  MonitorPlay
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  component: ProfileRoute,
});

function ProfileRoute() {
  const { user, isInstructor } = useAuth();
  
  if (!user) return null;

  return (
    <div className="w-full bg-slate-50/50 dark:bg-background pb-20 pt-6 md:py-8 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        {isInstructor ? <InstructorProfile user={user} /> : <LearnerProfile user={user} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// LEARNER PROFILE (Left Side of Reference Image)
// ----------------------------------------------------------------------
function LearnerProfile({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column (Profile, About, Skills) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Profile Card */}
        <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
          {/* Banner */}
          <div className="h-28 bg-[#4338CA]"></div>
          <div className="px-5 pb-6 relative">
            <Avatar className="h-20 w-20 border-4 border-background -mt-10 mb-3 bg-muted">
              <AvatarImage src={user.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-xl">{user.firstName?.charAt(0) || "L"}</AvatarFallback>
            </Avatar>
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] rounded-full shadow-sm">
                <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
              </Button>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {user.name || "Sarah Chen"}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Aspiring UX Designer | Career Switcher
            </p>
            <div className="flex items-center text-[12px] text-muted-foreground mt-3">
              <MapPin className="w-3.5 h-3.5 mr-1" /> San Francisco, CA
            </div>
          </div>
        </Card>

        {/* About */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="w-3.5 h-3.5" />
              </div>
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Former marketing specialist transitioning into UX/UI design. Passionate about synthesizing user research into high-fidelity prototype experiences that resolve real-world friction. Actively completing professional specialization tracks.
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="p-1 rounded bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              {["Figma", "User Research", "Wireframing", "Prototyping", "HTML/CSS", "JavaScript", "Data Analysis"].map(skill => (
                <Badge key={skill} variant="secondary" className="bg-secondary/60 hover:bg-secondary text-xs font-medium rounded-full px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Right Column (Stats, Certificates, Enrolled, Education) */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="12" label="Courses Completed" icon={<BookOpen className="w-4 h-4 text-blue-600" />} />
          <StatCard value="5" label="Certificates Earned" icon={<Award className="w-4 h-4 text-purple-600" />} />
          <StatCard value="340" label="Hours Learned" icon={<Hourglass className="w-4 h-4 text-sky-600" />} />
          <StatCard value="28d" label="Current Streak" icon={<Zap className="w-4 h-4 text-amber-500" />} />
        </div>

        {/* Certificates & Credentials */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Certificates & Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CertificateCard 
                letter="G" color="bg-blue-600" 
                provider="Google · Coursera" date="Jan 2026" 
                title="Google UX Design Professional" 
              />
              <CertificateCard 
                letter="I" color="bg-indigo-700" 
                provider="IBM · Coursera" date="Nov 2025" 
                title="IBM Data Science Professional" 
              />
              <CertificateCard 
                letter="M" color="bg-blue-500" 
                provider="Meta · Coursera" date="Sep 2025" 
                title="Meta Front-End Developer" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Split (Enrolled vs Activity) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Learned (Completed Sessions) */}
          <Card className="rounded-2xl border-border/60 shadow-sm h-full">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Learned
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <LearnedSessionItem title="Advanced Prototyping and Interaction Design" mentor="Dr. James Rivera" date="Aug 12" />
              <LearnedSessionItem title="Introduction to HTML, CSS, and Responsive Layouts" mentor="Sarah Chen" date="Jul 28" />
              <LearnedSessionItem title="Modern React Architecture Patterns" mentor="Alex K." date="Jul 15" />
            </CardContent>
          </Card>

          {/* Education & Activity */}
          <Card className="rounded-2xl border-border/60 shadow-sm h-full">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Education & Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Education Item */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">San Jose State University</h4>
                  <p className="text-[12px] text-muted-foreground mt-0.5">B.S. Business Administration (Marketing)</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">2019 - 2023</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h5>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span className="text-[13px] text-foreground/90">Completed Module 4 of Advanced Prototyping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span className="text-[13px] text-foreground/90">Earned certificate in Google UX Design</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------
// INSTRUCTOR PROFILE (Right Side of Reference Image)
// ----------------------------------------------------------------------
function InstructorProfile({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column (Profile, About, Expertise) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Profile Card */}
        <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
          {/* Banner */}
          <div className="h-28 bg-[#0F6456]"></div>
          <div className="px-5 pb-6 relative">
            <Avatar className="h-20 w-20 border-4 border-background -mt-10 mb-3 bg-muted">
              <AvatarImage src={user.avatarUrl || "https://i.pravatar.cc/150?u=drjames"} className="object-cover" />
              <AvatarFallback className="text-xl">{user.firstName?.charAt(0) || "J"}</AvatarFallback>
            </Avatar>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] rounded-full shadow-sm">
                Follow
              </Button>
              <Button size="sm" className="h-7 px-3 text-[11px] rounded-full shadow-sm bg-indigo-600 hover:bg-indigo-700">
                Connect
              </Button>
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center">
              {user.name || "Dr. James Rivera"}
              <CheckCircle2 className="w-4 h-4 text-blue-500 ml-1.5" fill="currentColor" stroke="white" />
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Senior Data Scientist at TechCorp | Instructor
            </p>
            <div className="flex items-center text-[12px] text-muted-foreground mt-3">
              <MapPin className="w-3.5 h-3.5 mr-1" /> New York, NY
            </div>
          </div>
        </Card>

        {/* About */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="w-3.5 h-3.5" />
              </div>
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Over 12 years of industry experience developing statistical models, production neural networks, and scalable pipeline systems. I love teaching data engineering and statistics in highly digestible formats. Passionate about empowering the next wave of engineers.
            </p>
          </CardContent>
        </Card>

        {/* Expertise & Skills */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="p-1 rounded bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Award className="w-3.5 h-3.5" />
              </div>
              Expertise & Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              <SkillTag name="Python" count="99+" />
              <SkillTag name="Machine Learning" count="87" />
              <SkillTag name="TensorFlow" count="64" />
              <SkillTag name="Statistics" count="52" />
              <SkillTag name="Deep Learning" count="45" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Right Column (Stats, Sessions, Experience, Certs) */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="8" label="Courses Created" icon={<MonitorPlay className="w-4 h-4 text-indigo-600" />} />
          <StatCard value="45,200" label="Total Students" icon={<Users className="w-4 h-4 text-blue-600" />} />
          <StatCard value="4.8/5" label="Average Rating" icon={<Star className="w-4 h-4 text-amber-500" />} />
          <StatCard value="2,340" label="Total Reviews" icon={<MessageSquare className="w-4 h-4 text-purple-600" />} />
        </div>

        {/* Available Sessions */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-primary" /> Available Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SessionCard 
                title="Neural Networks 101" 
                rating="4.9" students="18,400"
                gradient="from-slate-900 to-indigo-900"
              />
              <SessionCard 
                title="Python Data Engineering" 
                rating="4.8" students="15,200"
                gradient="from-amber-500 to-orange-700"
              />
              <SessionCard 
                title="Advanced Machine Learning" 
                rating="4.7" students="11,600"
                gradient="from-purple-900 to-fuchsia-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Split (Experience vs Certifications) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Experience */}
          <Card className="rounded-2xl border-border/60 shadow-sm h-full">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 border-b border-border/40">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold">Senior Data Scientist</h4>
                  <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">2021 - Present</span>
                </div>
                <p className="text-[12px] text-muted-foreground mb-2">TechCorp Inc.</p>
                <p className="text-[13px] text-foreground/80 leading-relaxed">
                  Leading enterprise modeling pipelines & core product analytics structures.
                </p>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold">Lead Machine Learning Engineer</h4>
                  <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">2017 - 2021</span>
                </div>
                <p className="text-[12px] text-muted-foreground mb-2">Arcline Systems</p>
                <p className="text-[13px] text-foreground/80 leading-relaxed">
                  Designed proprietary high-throughput neural routing engines.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Certifications & Reviews */}
          <Card className="rounded-2xl border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Certifications & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md font-medium px-3 py-1 text-xs">
                  AWS Certified ML Specialist
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md font-medium px-3 py-1 text-xs">
                  Google Cloud Professional Data Engineer
                </Badge>
              </div>

              <div className="space-y-4">
                <ReviewItem name="Alex K." rating="5.0" text="The bootcamp python course has a fantastic learning curve. Highly structured." />
                <Separator />
                <ReviewItem name="Elena R." rating="5.0" text="Dr. James explains complex backprop calculus with visual metaphors that clicked instantly." />
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SHARED UI COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          <div className="p-2 bg-secondary rounded-xl">
            {icon}
          </div>
        </div>
        <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
      </CardContent>
    </Card>
  );
}

function CertificateCard({ letter, color, provider, date, title }: { letter: string, color: string, provider: string, date: string, title: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4 shadow-sm bg-card hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${color} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
          {letter}
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{provider}</p>
          <p className="text-[10px] text-muted-foreground/70">{date}</p>
        </div>
      </div>
      <h4 className="text-[13px] font-bold leading-snug mb-3">{title}</h4>
      <a href="#" className="text-[11px] font-medium text-primary flex items-center gap-1 hover:underline">
        View Certificate <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function LearnedSessionItem({ title, mentor, date, avatarUrl }: { title: string, mentor: string, date: string, avatarUrl?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10 border shadow-sm">
        <AvatarImage src={avatarUrl || `https://i.pravatar.cc/150?u=${mentor}`} />
        <AvatarFallback className="text-xs">{mentor.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold leading-snug truncate">{title}</h4>
        <p className="text-[12px] text-muted-foreground truncate">Mentored by {mentor}</p>
      </div>
      <div className="text-[11px] font-medium text-muted-foreground shrink-0 bg-secondary px-2 py-1 rounded-md">{date}</div>
    </div>
  );
}

function ProgressItem({ title, instructor, progress }: { title: string, instructor: string, progress: number }) {
  return (
    <div>
      <h4 className="text-[13px] font-bold leading-snug">{title}</h4>
      <p className="text-[12px] text-muted-foreground mt-0.5 mb-3">{instructor}</p>
      <div className="flex items-center gap-3">
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[12px] font-bold w-8 text-right">{progress}%</span>
      </div>
    </div>
  );
}

function SkillTag({ name, count }: { name: string, count: string }) {
  return (
    <div className="flex items-center gap-1.5 border border-border/60 rounded-full pl-3 pr-1 py-1 bg-card">
      <span className="text-xs font-medium">{name}</span>
      <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

function SessionCard({ title, rating, students, gradient }: { title: string, rating: string, students: string, gradient: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm bg-card group">
      <div className={`h-24 w-full bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        {/* Abstract design elements to mock the course images */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="text-white/80 font-bold tracking-widest text-[10px] uppercase z-10 text-center px-4 leading-tight shadow-sm">
          {title}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-[12px] font-bold">{rating}</span>
          <span className="text-[11px] text-muted-foreground">({students} students)</span>
        </div>
        <Button variant="secondary" size="sm" className="w-full text-[11px] h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
          View Detail
        </Button>
      </div>
    </div>
  );
}

function ReviewItem({ name, rating, text }: { name: string, rating: string, text: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border shadow-sm">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${name}`} />
            <AvatarFallback className="text-[9px]">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-[12px] font-bold">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-bold">{rating}</span>
        </div>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed pl-8">
        "{text}"
      </p>
    </div>
  );
}

