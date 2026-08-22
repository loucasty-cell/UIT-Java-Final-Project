import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { B as Coins, H as Clock, K as CircleAlert, N as Handshake, O as Lock, P as HandHeart, X as Check, Y as ChevronDown, d as Star, f as Sparkles, t as X, v as Send, x as Plus, y as Search } from "../_libs/lucide-react.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as DialogDescription, c as DialogTitle, d as Label, f as cn, h as useAuth, i as DialogContent, n as Button, o as DialogFooter, r as Dialog, s as DialogHeader, u as Input } from "./auth-CmX3G0zg.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { n as CardContent, t as Card } from "./card-DFtAAVyG.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BixMpYkw.mjs";
import { t as Textarea } from "./textarea-T99n1zi2.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BQwYuVAq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-B6vj-_Ya.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-Bqk1W2uE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mentors-D8cOLqiJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var mySkills = [
	{
		name: "Java",
		level: "Advanced"
	},
	{
		name: "SQL",
		level: "Intermediate"
	},
	{
		name: "Data Structures",
		level: "Advanced"
	},
	{
		name: "Git",
		level: "Intermediate"
	}
];
var mentors = [
	{
		id: "priya",
		name: "Priya Anand",
		initials: "PA",
		major: "Computer Science, Year 4",
		rating: 4.9,
		reviews: 32,
		completedSessions: 84,
		cost: 50,
		modes: [
			"points",
			"exchange",
			"volunteer"
		],
		teach: [
			{
				name: "React",
				level: "Advanced"
			},
			{
				name: "TypeScript",
				level: "Advanced"
			},
			{
				name: "UI/UX",
				level: "Intermediate"
			}
		],
		wants: [{
			name: "Java",
			level: "Intermediate"
		}, {
			name: "System Design",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Thu",
			"Sat"
		],
		availableTimes: [
			"08:00",
			"11:00",
			"18:00"
		]
	},
	{
		id: "marcus",
		name: "Marcus Delgado",
		initials: "MD",
		major: "Mathematics, Year 3",
		rating: 4.8,
		reviews: 24,
		completedSessions: 58,
		cost: 40,
		modes: ["points", "exchange"],
		teach: [
			{
				name: "Linear Algebra",
				level: "Advanced"
			},
			{
				name: "Calculus",
				level: "Advanced"
			},
			{
				name: "Python",
				level: "Intermediate"
			}
		],
		wants: [{
			name: "SQL",
			level: "Beginner"
		}, {
			name: "Data Structures",
			level: "Intermediate"
		}],
		availableDays: [
			"Mon",
			"Wed",
			"Fri"
		],
		availableTimes: [
			"09:00",
			"13:00",
			"17:00"
		]
	},
	{
		id: "lena",
		name: "Lena Karlsson",
		initials: "LK",
		major: "English Literature, Year 2",
		rating: 4.7,
		reviews: 18,
		completedSessions: 37,
		cost: 30,
		modes: ["points", "volunteer"],
		teach: [{
			name: "Essay Writing",
			level: "Advanced"
		}, {
			name: "Academic English",
			level: "Intermediate"
		}],
		wants: [{
			name: "Public Speaking",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Thu",
			"Sun"
		],
		availableTimes: [
			"10:00",
			"14:00",
			"19:00"
		]
	},
	{
		id: "kenji",
		name: "Kenji Watanabe",
		initials: "KW",
		major: "Design, Year 3",
		rating: 4.9,
		reviews: 41,
		completedSessions: 91,
		cost: 55,
		modes: ["points", "exchange"],
		teach: [{
			name: "UI/UX",
			level: "Advanced"
		}, {
			name: "Figma",
			level: "Advanced"
		}],
		wants: [{
			name: "Git",
			level: "Beginner"
		}, {
			name: "React",
			level: "Beginner"
		}],
		availableDays: [
			"Wed",
			"Fri",
			"Sat"
		],
		availableTimes: [
			"08:30",
			"12:00",
			"18:30"
		]
	},
	{
		id: "amara",
		name: "Amara Okafor",
		initials: "AO",
		major: "Business, Year 4",
		rating: 4.6,
		reviews: 12,
		completedSessions: 26,
		cost: 35,
		modes: ["points", "volunteer"],
		teach: [{
			name: "Public Speaking",
			level: "Advanced"
		}, {
			name: "Marketing",
			level: "Intermediate"
		}],
		wants: [{
			name: "SQL",
			level: "Beginner"
		}],
		availableDays: [
			"Mon",
			"Thu",
			"Sat"
		],
		availableTimes: [
			"09:30",
			"15:00",
			"20:00"
		]
	},
	{
		id: "diego",
		name: "Diego Ramirez",
		initials: "DR",
		major: "Electrical Engineering, Year 4",
		rating: 4.8,
		reviews: 27,
		completedSessions: 63,
		cost: 45,
		modes: [
			"points",
			"exchange",
			"volunteer"
		],
		teach: [{
			name: "Circuits",
			level: "Advanced"
		}, {
			name: "MATLAB",
			level: "Intermediate"
		}],
		wants: [{
			name: "Java",
			level: "Beginner"
		}, {
			name: "Git",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Thu",
			"Sat"
		],
		availableTimes: [
			"08:00",
			"11:00",
			"18:00"
		]
	},
	{
		id: "sofia",
		name: "Sofia Bennett",
		initials: "SB",
		major: "Computer Science, Year 2",
		rating: 4.9,
		reviews: 29,
		completedSessions: 72,
		cost: 30,
		modes: [
			"points",
			"exchange",
			"volunteer"
		],
		teach: [{
			name: "Python for Beginners",
			level: "Beginner"
		}, {
			name: "Debugging Basics",
			level: "Beginner"
		}],
		wants: [{
			name: "UI/UX",
			level: "Beginner"
		}, {
			name: "Public Speaking",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Thu",
			"Sat"
		],
		availableTimes: [
			"08:00",
			"11:00",
			"18:00"
		]
	},
	{
		id: "noah",
		name: "Noah Kim",
		initials: "NK",
		major: "Software Engineering, Year 3",
		rating: 4.8,
		reviews: 33,
		completedSessions: 88,
		cost: 35,
		modes: ["points", "exchange"],
		teach: [{
			name: "HTML/CSS Basics",
			level: "Beginner"
		}, {
			name: "Responsive Layouts",
			level: "Intermediate"
		}],
		wants: [{
			name: "Data Visualization",
			level: "Beginner"
		}, {
			name: "Statistics",
			level: "Beginner"
		}],
		availableDays: [
			"Mon",
			"Wed",
			"Fri"
		],
		availableTimes: [
			"09:00",
			"12:00",
			"17:00"
		]
	},
	{
		id: "maya",
		name: "Maya Thompson",
		initials: "MT",
		major: "Information Systems, Year 4",
		rating: 4.9,
		reviews: 45,
		completedSessions: 104,
		cost: 45,
		modes: [
			"points",
			"exchange",
			"volunteer"
		],
		teach: [{
			name: "Intro to Data Structures",
			level: "Beginner"
		}, {
			name: "Java",
			level: "Intermediate"
		}],
		wants: [{
			name: "Figma",
			level: "Beginner"
		}, {
			name: "Marketing",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Fri",
			"Sun"
		],
		availableTimes: [
			"10:00",
			"14:00",
			"19:00"
		]
	},
	{
		id: "ethan",
		name: "Ethan Brooks",
		initials: "EB",
		major: "Cybersecurity, Year 2",
		rating: 4.7,
		reviews: 21,
		completedSessions: 49,
		cost: 25,
		modes: ["points", "volunteer"],
		teach: [{
			name: "Git & GitHub Basics",
			level: "Beginner"
		}, {
			name: "Command Line",
			level: "Beginner"
		}],
		wants: [{
			name: "Python",
			level: "Intermediate"
		}, {
			name: "Circuits",
			level: "Beginner"
		}],
		availableDays: [
			"Wed",
			"Thu",
			"Sat"
		],
		availableTimes: [
			"08:30",
			"13:30",
			"18:30"
		]
	},
	{
		id: "zara",
		name: "Zara Patel",
		initials: "ZP",
		major: "Interaction Design, Year 3",
		rating: 5,
		reviews: 38,
		completedSessions: 79,
		cost: 40,
		modes: ["points", "exchange"],
		teach: [{
			name: "Figma Fundamentals",
			level: "Beginner"
		}, {
			name: "Design Critique",
			level: "Intermediate"
		}],
		wants: [{
			name: "React",
			level: "Beginner"
		}, {
			name: "Git",
			level: "Beginner"
		}],
		availableDays: [
			"Mon",
			"Thu",
			"Sat"
		],
		availableTimes: [
			"09:30",
			"15:00",
			"20:00"
		]
	},
	{
		id: "liam",
		name: "Liam O'Connor",
		initials: "LO",
		major: "Applied Mathematics, Year 4",
		rating: 4.8,
		reviews: 31,
		completedSessions: 86,
		cost: 35,
		modes: [
			"points",
			"exchange",
			"volunteer"
		],
		teach: [{
			name: "Math Foundations",
			level: "Beginner"
		}, {
			name: "Calculus Prep",
			level: "Intermediate"
		}],
		wants: [{
			name: "SQL",
			level: "Beginner"
		}, {
			name: "Academic English",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Wed",
			"Fri"
		],
		availableTimes: [
			"08:00",
			"11:30",
			"16:30"
		]
	},
	{
		id: "aisha",
		name: "Aisha Rahman",
		initials: "AR",
		major: "Data Science, Year 3",
		rating: 4.9,
		reviews: 36,
		completedSessions: 95,
		cost: 45,
		modes: ["points", "exchange"],
		teach: [{
			name: "Python",
			level: "Intermediate"
		}, {
			name: "Pandas Basics",
			level: "Beginner"
		}],
		wants: [{
			name: "Public Speaking",
			level: "Beginner"
		}, {
			name: "Essay Writing",
			level: "Beginner"
		}],
		availableDays: [
			"Mon",
			"Wed",
			"Sat"
		],
		availableTimes: [
			"10:00",
			"13:00",
			"18:00"
		]
	},
	{
		id: "ben",
		name: "Ben Alvarez",
		initials: "BA",
		major: "Computer Engineering, Year 2",
		rating: 4.6,
		reviews: 17,
		completedSessions: 34,
		cost: 25,
		modes: ["points", "volunteer"],
		teach: [{
			name: "Intro Programming",
			level: "Beginner"
		}, {
			name: "C Basics",
			level: "Beginner"
		}],
		wants: [{
			name: "UI/UX",
			level: "Beginner"
		}, {
			name: "Marketing",
			level: "Beginner"
		}],
		availableDays: [
			"Tue",
			"Thu",
			"Sun"
		],
		availableTimes: [
			"09:00",
			"12:30",
			"17:30"
		]
	},
	{
		id: "nina",
		name: "Nina Flores",
		initials: "NF",
		major: "Web Development, Year 3",
		rating: 4.7,
		reviews: 26,
		completedSessions: 61,
		cost: 30,
		modes: [
			"points",
			"exchange",
			"volunteer"
		],
		teach: [{
			name: "JavaScript Basics",
			level: "Beginner"
		}, {
			name: "HTML/CSS Basics",
			level: "Beginner"
		}],
		wants: [{
			name: "System Design",
			level: "Beginner"
		}, {
			name: "Linear Algebra",
			level: "Beginner"
		}],
		availableDays: [
			"Mon",
			"Fri",
			"Sat"
		],
		availableTimes: [
			"08:00",
			"14:00",
			"19:30"
		]
	}
];
function levelClasses(level) {
	switch (level) {
		case "Advanced": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
		case "Intermediate": return "border-secondary/20 bg-accent text-primary dark:border-secondary/40 dark:bg-secondary/15 dark:text-secondary";
		case "Beginner": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
	}
}
var modeMeta = {
	points: {
		label: "Skill Points",
		icon: Coins
	},
	exchange: {
		label: "Skill Exchange",
		icon: Handshake
	},
	volunteer: {
		label: "Volunteer",
		icon: HandHeart
	}
};
var availableDayOptions = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
	"Weekends"
];
var availableTimeOptions = [
	"08:00 AM",
	"09:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"02:00 PM",
	"04:00 PM",
	"06:00 PM",
	"07:00 PM"
];
function MentorsPage() {
	const auth = useAuth();
	const [mentorFeed, setMentorFeed] = (0, import_react.useState)(mentors);
	const [query, setQuery] = (0, import_react.useState)("");
	const [level, setLevel] = (0, import_react.useState)("all");
	const [mode, setMode] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("most-sessions");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return [...mentorFeed.filter((m) => {
			if (mode !== "all" && !m.modes.includes(mode)) return false;
			if (level !== "all" && !m.teach.some((s) => s.level === level)) return false;
			if (!q) return true;
			return m.name.toLowerCase().includes(q) || m.major.toLowerCase().includes(q) || m.teach.some((s) => s.name.toLowerCase().includes(q)) || m.wants.some((s) => s.name.toLowerCase().includes(q));
		})].sort((a, b) => {
			if (sort === "highest-rated") return b.rating - a.rating || b.reviews - a.reviews;
			return b.completedSessions - a.completedSessions || b.rating - a.rating;
		});
	}, [
		mentorFeed,
		query,
		level,
		mode,
		sort
	]);
	const openCreateSession = () => {
		if (!auth.requireAuth("Please sign in to create a teaching session.")) return;
		setCreateOpen(true);
	};
	const addCreatedSession = (mentor) => {
		setMentorFeed((current) => [mentor, ...current]);
		setCreateOpen(false);
		toast.success("Teaching session published.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-primary",
						children: "Skill Exchange"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-bold tracking-tight sm:text-3xl",
						children: "Find a mentor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Browse peers by skill and book a session with points, an exchange, or as a volunteer."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "shrink-0 rounded-xl",
					onClick: openCreateSession,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Create Session"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "rounded-xl border-border/70 shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_190px_190px] lg:items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "search",
								placeholder: "Search by skill, name, or major...",
								value: query,
								onChange: (e) => setQuery(e.target.value),
								className: "h-10 rounded-xl pl-9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: level,
							onValueChange: (v) => setLevel(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-10 rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Level" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All levels"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Beginner",
									children: "Beginner"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Intermediate",
									children: "Intermediate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Advanced",
									children: "Advanced"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: mode,
							onValueChange: (v) => setMode(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-10 rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Mode" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All modes"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "points",
									children: "Skill Points"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "exchange",
									children: "Skill Exchange"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "volunteer",
									children: "Volunteer"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: sort,
							onValueChange: (v) => setSort(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-10 rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sort by" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "most-sessions",
								children: "Most sessions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "highest-rated",
								children: "Highest rated"
							})] })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Showing ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: filtered.length
						}),
						" mentors"
					]
				})
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "rounded-xl border-dashed",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col items-center justify-center gap-2 p-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-8 w-8 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "No mentors match those filters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Try broadening the level or mode."
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: filtered.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentorCard, {
					mentor: m,
					onRequest: () => {
						if (auth.requireAuth("Please sign in to request sessions or post content.")) setSelected(m);
					}
				}, m.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestSessionDialog, {
				mentor: selected,
				onClose: () => setSelected(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTeachingSessionDialog, {
				open: createOpen,
				onOpenChange: setCreateOpen,
				currentUser: auth.currentUser,
				onCreate: addCreatedSession
			})
		]
	});
}
function MentorCard({ mentor, onRequest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "flex h-full flex-col rounded-xl border-border/70 shadow-sm transition hover:shadow-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-1 flex-col gap-4 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: "h-12 w-12 shrink-0 ring-2 ring-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-primary font-semibold text-primary-foreground",
							children: mentor.initials
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate text-base font-semibold",
								children: mentor.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: mentor.major
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-1 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-amber-400 text-amber-400" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: mentor.rating.toFixed(1)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground",
										children: [
											"/ 5.0 · ",
											mentor.reviews,
											" reviews"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs font-medium text-muted-foreground",
								children: [mentor.completedSessions, " completed sessions"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: mentor.modes.map((mo) => {
						const M = modeMeta[mo];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "rounded-full border-secondary/20 bg-accent px-2 py-0.5 text-[11px] font-medium text-primary dark:border-secondary/40 dark:bg-secondary/15 dark:text-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(M.icon, { className: "mr-1 h-3 w-3" }), M.label]
						}, mo);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Can teach"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: mentor.teach.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", levelClasses(s.level)),
							children: [
								s.name,
								" · ",
								s.level
							]
						}, s.name))
					})]
				}),
				mentor.sessionSummary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-3 rounded-xl bg-accent/60 p-3 text-xs leading-relaxed text-muted-foreground",
					children: mentor.sessionSummary
				}),
				mentor.wants.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Wants to learn"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: mentor.wants.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "rounded-full border-0 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-muted dark:text-muted-foreground",
							children: [
								s.name,
								" · ",
								s.level
							]
						}, s.name))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 rounded-xl bg-muted/50 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Availability"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: mentor.availableDays.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-secondary/20",
								children: day
							}, day))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: mentor.availableTimes.map((time) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), time]
							}, time))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center justify-between border-t border-border/70 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-semibold text-foreground",
						children: [
							"From ",
							mentor.cost,
							" Pts",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-muted-foreground",
								children: "/ session"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "rounded-lg bg-primary text-white hover:bg-[#0F2742]",
						onClick: onRequest,
						children: "Request Session"
					})]
				})
			]
		})
	});
}
function CreateTeachingSessionDialog({ open, onOpenChange, currentUser, onCreate }) {
	const [sessionTitle, setSessionTitle] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("");
	const [skillLevel, setSkillLevel] = (0, import_react.useState)("Beginner");
	const [fee, setFee] = (0, import_react.useState)("20");
	const [description, setDescription] = (0, import_react.useState)("");
	const [selectedModes, setSelectedModes] = (0, import_react.useState)(["points"]);
	const [teachSkills, setTeachSkills] = (0, import_react.useState)([{
		name: "",
		level: "Beginner"
	}]);
	const [wantSkills, setWantSkills] = (0, import_react.useState)([]);
	const [availableDays, setAvailableDays] = (0, import_react.useState)([]);
	const [availableTimes, setAvailableTimes] = (0, import_react.useState)([]);
	const reset = () => {
		setSessionTitle("");
		setCategory("");
		setSkillLevel("Beginner");
		setFee("20");
		setDescription("");
		setSelectedModes(["points"]);
		setTeachSkills([{
			name: "",
			level: "Beginner"
		}]);
		setWantSkills([]);
		setAvailableDays([]);
		setAvailableTimes([]);
	};
	const cleanSkillRows = (skills) => skills.map((skill) => ({
		...skill,
		name: skill.name.trim()
	})).filter((skill) => skill.name.length > 0);
	const toggleValue = (value, values, setValues) => {
		setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
	};
	const toggleMode = (mode) => {
		setSelectedModes((modes) => modes.includes(mode) ? modes.filter((item) => item !== mode) : [...modes, mode]);
	};
	const updateSkill = (index, patch, setSkills) => {
		setSkills((skills) => skills.map((skill, skillIndex) => skillIndex === index ? {
			...skill,
			...patch
		} : skill));
	};
	const removeSkill = (index, setSkills, keepEmptyRow) => {
		setSkills((skills) => {
			const next = skills.filter((_, skillIndex) => skillIndex !== index);
			return next.length || !keepEmptyRow ? next : [{
				name: "",
				level: "Beginner"
			}];
		});
	};
	const submit = () => {
		const parsedFee = Number.parseInt(fee, 10);
		const cleanedTeach = cleanSkillRows(teachSkills);
		const cleanedWants = cleanSkillRows(wantSkills);
		if (!sessionTitle.trim() || !category.trim() || !description.trim() || Number.isNaN(parsedFee) || parsedFee < 0 || selectedModes.length === 0 || cleanedTeach.length === 0 || selectedModes.includes("exchange") && cleanedWants.length === 0 || availableDays.length === 0 || availableTimes.length === 0) {
			toast.error(selectedModes.includes("exchange") && cleanedWants.length === 0 ? "Add at least one skill you want to learn for Skill Exchange sessions." : "Please complete all session fields, modes, skills, and availability.");
			return;
		}
		const name = currentUser?.name ?? "Ava Ramirez";
		const mentorStats = currentUser?.mentorStats ?? {
			rating: 5,
			reviews: 0,
			completedSessions: 0
		};
		onCreate({
			id: `created-${crypto.randomUUID()}`,
			name,
			initials: currentUser?.avatar ?? getInitials(name),
			major: currentUser ? `${currentUser.major}, ${currentUser.academicYear}` : "Computer Science, Year 3",
			rating: mentorStats.rating,
			reviews: mentorStats.reviews,
			completedSessions: mentorStats.completedSessions,
			cost: parsedFee,
			sessionSummary: description.trim(),
			modes: selectedModes,
			teach: cleanedTeach,
			wants: cleanedWants,
			availableDays,
			availableTimes
		});
		reset();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (nextOpen) => {
			onOpenChange(nextOpen);
			if (!nextOpen) reset();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Teaching Session" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Post a structured teaching session so learners can book from your available slots." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "session-title",
								children: "Session Title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "session-title",
								value: sessionTitle,
								onChange: (event) => setSessionTitle(event.target.value),
								placeholder: "Advanced Python Data Structures",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "skill-category",
								children: "Skill / Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "skill-category",
								value: category,
								onChange: (event) => setCategory(event.target.value),
								placeholder: "Programming",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Skill Level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: skillLevel,
								onValueChange: (value) => setSkillLevel(value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "rounded-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Beginner",
										children: "Beginner"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Intermediate",
										children: "Intermediate"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Advanced",
										children: "Advanced"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "session-fee",
								children: "Points / Fee required"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "session-fee",
								type: "number",
								min: "0",
								value: fee,
								onChange: (event) => setFee(event.target.value),
								placeholder: "20",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Session Modes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-2 sm:grid-cols-3",
								children: Object.keys(modeMeta).map((mode) => {
									const M = modeMeta[mode];
									const checked = selectedModes.includes(mode);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: cn("flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition", checked ? "border-secondary/40 bg-accent text-primary" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked,
												onCheckedChange: () => toggleMode(mode)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(M.icon, { className: "h-4 w-4" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: M.label
											})
										]
									}, mode);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 rounded-2xl bg-muted/30 p-3 md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "CAN TEACH Skills" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: "These skills become the level badges shown on your mentor session card."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillTagEditor, {
								skills: teachSkills,
								addLabel: "Add Teaching Skill",
								keepOneRow: true,
								onAdd: () => setTeachSkills((skills) => [...skills, {
									name: "",
									level: skillLevel
								}]),
								onNameChange: (index, name) => updateSkill(index, { name }, setTeachSkills),
								onLevelChange: (index, level) => updateSkill(index, { level }, setTeachSkills),
								onRemove: (index) => removeSkill(index, setTeachSkills, true)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 rounded-2xl bg-muted/30 p-3 md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "WANTS TO LEARN Skills" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: "Add these when offering Skill Exchange sessions."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillTagEditor, {
								skills: wantSkills,
								addLabel: "Add Learning Skill",
								onAdd: () => setWantSkills((skills) => [...skills, {
									name: "",
									level: "Beginner"
								}]),
								onNameChange: (index, name) => updateSkill(index, { name }, setWantSkills),
								onLevelChange: (index, level) => updateSkill(index, { level }, setWantSkills),
								onRemove: (index) => removeSkill(index, setWantSkills, false)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
								label: "Available Days",
								placeholder: "Select days",
								options: availableDayOptions,
								selected: availableDays,
								onToggle: (value) => toggleValue(value, availableDays, setAvailableDays)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
								label: "Available Time Slots",
								placeholder: "Select time slots",
								options: availableTimeOptions,
								selected: availableTimes,
								onToggle: (value) => toggleValue(value, availableTimes, setAvailableTimes)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "session-description",
								children: "Description / Overview"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "session-description",
								value: description,
								onChange: (event) => setDescription(event.target.value),
								rows: 4,
								placeholder: "Describe what learners will practice and what they should know before joining.",
								className: "rounded-xl"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: submit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), "Publish Session"]
				})] })
			]
		})
	});
}
function SkillTagEditor({ skills, addLabel, keepOneRow = false, onAdd, onNameChange, onLevelChange, onRemove }) {
	const rows = skills.length ? skills : keepOneRow ? [{
		name: "",
		level: "Beginner"
	}] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [rows.map((skill, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_40px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: skill.name,
					onChange: (event) => onNameChange(index, event.target.value),
					placeholder: "Intro to Data Structures",
					className: "rounded-xl bg-white"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: skill.level,
					onValueChange: (value) => onLevelChange(index, value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "rounded-xl bg-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "Beginner",
							children: "Beginner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "Intermediate",
							children: "Intermediate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "Advanced",
							children: "Advanced"
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "rounded-xl bg-white",
					onClick: () => onRemove(index),
					"aria-label": "Remove skill",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})
			]
		}, index)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			className: "w-full rounded-xl border-dashed bg-white",
			onClick: onAdd,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), addLabel]
		})]
	});
}
function MultiSelectDropdown({ label, placeholder, options, selected, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-xs font-semibold text-slate-700",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-secondary/30 hover:bg-slate-50 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: selected.length ? "font-medium" : "text-muted-foreground",
						children: selected.length ? `${selected.length} selected` : placeholder
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				align: "start",
				className: "w-[var(--radix-popover-trigger-width)] rounded-xl border-slate-200 p-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-64 overflow-y-auto",
					children: options.map((option) => {
						const isSelected = selected.includes(option);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onToggle(option),
							className: cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition", isSelected ? "bg-accent font-semibold text-primary" : "text-slate-700 hover:bg-slate-50"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: option }), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-primary" })]
						}, option);
					})
				})
			})] }),
			selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: selected.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "secondary",
					className: "rounded-full border-0 bg-accent px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent",
					children: [item, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onToggle(item),
						className: "ml-1 rounded-full text-primary transition hover:text-[#0F2742]",
						"aria-label": `Remove ${item}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
					})]
				}, item))
			})
		]
	});
}
function getInitials(name) {
	return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}
function RequestSessionDialog({ mentor, onClose }) {
	const [selectedDay, setSelectedDay] = (0, import_react.useState)();
	const [time, setTime] = (0, import_react.useState)();
	const [tab, setTab] = (0, import_react.useState)("points");
	const [exchangeSkill, setExchangeSkill] = (0, import_react.useState)();
	const [note, setNote] = (0, import_react.useState)("");
	const open = !!mentor;
	const key = mentor?.id ?? "none";
	const resetForm = () => {
		setSelectedDay(void 0);
		setTime(void 0);
		setTab("points");
		setExchangeSkill(void 0);
		setNote("");
	};
	const handleClose = () => {
		resetForm();
		onClose();
	};
	const matchingSkills = (0, import_react.useMemo)(() => {
		if (!mentor) return [];
		const wantNames = new Set(mentor.wants.map((w) => w.name.toLowerCase()));
		return mySkills.filter((s) => wantNames.has(s.name.toLowerCase())).map((s) => s.name);
	}, [mentor]);
	const canSubmit = !!selectedDay && !!time && (tab === "points" || tab === "volunteer" || tab === "exchange" && !!exchangeSkill);
	const handleSubmit = () => {
		if (!mentor || !canSubmit) return;
		const modeLabel = tab === "points" ? `${mentor.cost} pts (escrow)` : tab === "exchange" ? `Exchange: ${exchangeSkill}` : "Volunteer (free)";
		toast.success(`Request sent to ${mentor.name}`, { description: `${selectedDay} at ${time} · ${modeLabel}` });
		handleClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => !v && handleClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto rounded-xl sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Request Session with ", mentor?.name ?? ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Choose a time, pick a payment mode, and add a note for your mentor." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-border dark:bg-muted/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-semibold text-slate-700",
							children: "Pick a day"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: (mentor?.availableDays ?? []).map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSelectedDay(day),
								className: cn("rounded-full px-4 py-2 text-sm transition", selectedDay === day ? "bg-primary font-semibold text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"),
								children: day
							}, day))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-semibold text-slate-700",
							children: "Pick a time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: (mentor?.availableTimes ?? []).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setTime(slot),
								className: cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition", time === slot ? "border-2 border-primary bg-accent font-semibold text-primary" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), slot]
							}, slot))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs font-medium",
						children: "Request mode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: tab,
						onValueChange: (v) => setTab(v),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid w-full grid-cols-3 rounded-lg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "points",
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "mr-1 h-3.5 w-3.5" }), "Skill Points"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "exchange",
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, { className: "mr-1 h-3.5 w-3.5" }), "Exchange"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "volunteer",
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandHeart, { className: "mr-1 h-3.5 w-3.5" }), "Volunteer"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "points",
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold text-amber-800 dark:text-amber-200",
												children: [mentor?.cost ?? 0, " points will be locked in Escrow"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-0.5 text-amber-700/90 dark:text-amber-300/90",
												children: [
													"Points transfer to ",
													mentor?.name.split(" ")[0],
													" only after the session is marked complete by both of you."
												]
											})]
										})]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "exchange",
								className: "mt-3",
								children: matchingSkills.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										className: "text-xs font-medium",
										children: [
											"Select a skill you possess that ",
											mentor?.name.split(" ")[0],
											" wants to learn"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: exchangeSkill,
										onValueChange: setExchangeSkill,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "rounded-lg",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a skill to offer" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: matchingSkills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: s,
											children: s
										}, s)) })]
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
									variant: "default",
									className: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "No matching skill exchange found" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
											className: "text-amber-800/90 dark:text-amber-300/90",
											children: "Please use Skill Points or Volunteer mode."
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "volunteer",
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandHeart, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-emerald-800 dark:text-emerald-200",
											children: "Volunteer mode — no points exchanged"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "rounded-full bg-emerald-600 text-white hover:bg-emerald-600",
										children: "Cost: FREE (0 Pts)"
									})]
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "note",
						className: "text-xs font-medium",
						children: "Message to mentor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "note",
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: `Hi ${mentor?.name.split(" ")[0] ?? ""}, I'd love your help with…`,
						rows: 3,
						className: "rounded-lg"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: handleClose,
						className: "rounded-lg",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleSubmit,
						disabled: !canSubmit,
						className: "rounded-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-1.5 h-4 w-4" }), "Send Request"]
					})]
				})
			]
		}, key)
	});
}
//#endregion
export { MentorsPage as component };
