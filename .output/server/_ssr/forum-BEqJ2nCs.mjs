import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { E as MessageCircle, M as Heart, X as Check, Y as ChevronDown, d as Star, g as Share2, m as ShieldCheck, t as X, tt as BadgeCheck, v as Send, x as Plus } from "../_libs/lucide-react.mjs";
import { n as CollapsibleTrigger$1, r as Root, t as CollapsibleContent$1 } from "../_libs/@radix-ui/react-collapsible+[...].mjs";
import { a as DialogDescription, c as DialogTitle, d as Label, f as cn, h as useAuth, i as DialogContent, n as Button, o as DialogFooter, r as Dialog, s as DialogHeader, u as Input } from "./auth-CmX3G0zg.mjs";
import { t as Separator } from "./separator-DYjBf1a5.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DFtAAVyG.mjs";
import { t as Textarea } from "./textarea-T99n1zi2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-B6vj-_Ya.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forum-BEqJ2nCs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Collapsible = Root;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = CollapsibleContent$1;
var AVAILABLE_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday"
];
var AVAILABLE_TIMES = [
	"08:00 AM",
	"09:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"01:00 PM",
	"02:00 PM",
	"03:00 PM",
	"04:00 PM",
	"05:00 PM",
	"06:00 PM",
	"07:00 PM",
	"08:00 PM"
];
var INITIAL_POSTS = [{
	id: "p1",
	author: "Priya Nair",
	initials: "PN",
	major: "Computer Science, Year 4",
	title: "Offering free weekend Java OOP basics tutoring sessions!",
	content: "I've been TAing CS201 for two semesters and love breaking down inheritance, polymorphism, and interfaces with real examples. Saturdays 10am–12pm works for me — small groups of 2–3 preferred.",
	tags: [
		"Java",
		"OOP",
		"Beginner"
	],
	availableDays: ["Saturday"],
	availableTimes: ["10:00 AM"],
	likes: 24,
	comments: [{
		id: "c1",
		author: "Marcus Lee",
		initials: "ML",
		major: "CS, Year 2",
		body: "Would love a slot next Saturday — abstract classes still trip me up!"
	}, {
		id: "c2",
		author: "Sara Wu",
		initials: "SW",
		major: "IS, Year 2",
		body: "Do you cover generics too? Have a project due soon."
	}]
}, {
	id: "p2",
	author: "Diego Martinez",
	initials: "DM",
	major: "Data Science, Year 3",
	title: "Free SQL query optimization walkthroughs — bring your slow queries",
	content: "Happy to sit down with anyone struggling with EXPLAIN plans, indexing, or joins. Bring a real query and we'll tune it together.",
	tags: [
		"SQL",
		"Databases",
		"Intermediate"
	],
	availableDays: [
		"Tuesday",
		"Thursday",
		"Saturday"
	],
	availableTimes: [
		"08:00 AM",
		"02:00 PM",
		"06:00 PM"
	],
	likes: 17,
	comments: []
}];
var TOP_MENTORS = [
	{
		name: "Priya Nair",
		major: "CS, Year 4",
		sessions: 14,
		initials: "PN"
	},
	{
		name: "Diego Martinez",
		major: "DS, Year 3",
		sessions: 11,
		initials: "DM"
	},
	{
		name: "Aisha Khan",
		major: "EE, Year 4",
		sessions: 9,
		initials: "AK"
	}
];
function ForumPage() {
	const auth = useAuth();
	const [posts, setPosts] = (0, import_react.useState)(INITIAL_POSTS);
	const [liked, setLiked] = (0, import_react.useState)({});
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [bookingPost, setBookingPost] = (0, import_react.useState)(null);
	const [selectedDay, setSelectedDay] = (0, import_react.useState)("");
	const [selectedTime, setSelectedTime] = (0, import_react.useState)("");
	const closeBooking = () => {
		setBookingPost(null);
		setSelectedDay("");
		setSelectedTime("");
	};
	const toggleLike = (id) => {
		setLiked((l) => ({
			...l,
			[id]: !l[id]
		}));
		setPosts((ps) => ps.map((p) => p.id === id ? {
			...p,
			likes: p.likes + (liked[id] ? -1 : 1)
		} : p));
	};
	const addComment = (postId, body) => {
		if (!body.trim()) return;
		setPosts((ps) => ps.map((p) => p.id === postId ? {
			...p,
			comments: [...p.comments, {
				id: crypto.randomUUID(),
				author: "Alex Chen",
				initials: "AC",
				major: "CS, Year 3",
				body
			}]
		} : p));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-7xl p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "Volunteer Learning Community"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Find free peer mentoring sessions and community learning threads."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open: createOpen,
					onOpenChange: setCreateOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						className: "gap-2",
						onClick: () => {
							if (auth.requireAuth("Please sign in to request sessions or post content.")) setCreateOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create Volunteer Post"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePostDialog, { onSubmit: (post) => {
						setPosts((ps) => [post, ...ps]);
						setCreateOpen(false);
						toast.success("Volunteer post published!");
					} })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-6 lg:col-span-2",
					children: posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
						post,
						liked: !!liked[post.id],
						onLike: () => toggleLike(post.id),
						onComment: (body) => addComment(post.id, body),
						onRequest: () => {
							if (auth.requireAuth("Please sign in to request sessions or post content.")) setBookingPost(post);
						}
					}, post.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "rounded-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Top Volunteer Mentors — This Week"
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "space-y-4",
							children: TOP_MENTORS.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
										children: i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
										className: "h-9 w-9",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: m.initials })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: m.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs text-muted-foreground",
											children: m.major
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 text-xs font-medium text-amber-600",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-current" }), m.sessions]
									})
								]
							}, m.name))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "rounded-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "flex items-center gap-2 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-primary" }), " Forum Guidelines"]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-2 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "• Be respectful — everyone is here to learn." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "• Volunteer sessions are free; never ask for points." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "• Share resources; avoid solving graded assignments." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "• Report harassment or spam to moderators." })
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!bookingPost,
				onOpenChange: (o) => !o && closeBooking(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Request Free Session with ", bookingPost?.author] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Volunteer Mode — no points required." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-emerald-700 dark:text-emerald-400",
								children: "Cost: FREE (0 Pts)"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "— Volunteer Mode"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-border dark:bg-muted/30",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold text-slate-700",
									children: "Pick a day"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: (bookingPost?.availableDays ?? []).map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
									children: (bookingPost?.availableTimes ?? []).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSelectedTime(slot),
										className: cn("rounded-full px-4 py-2 text-sm transition", selectedTime === slot ? "border-2 border-primary bg-accent font-semibold text-primary" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"),
										children: slot
									}, slot))
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Message to mentor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { placeholder: "Briefly describe what you'd like help with…" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: closeBooking,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !selectedDay || !selectedTime,
						onClick: () => {
							toast.success(`Request sent to ${bookingPost?.author}!`, { description: `${selectedDay} at ${selectedTime}` });
							closeBooking();
						},
						children: "Send Request"
					})] })
				] })
			})
		]
	});
}
function PostCard({ post, liked, onLike, onComment, onRequest }) {
	const [reply, setReply] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
					className: "h-11 w-11",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: "" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: post.initials })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: post.author
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3 w-3" }), " Volunteer Mentor"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: post.major
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: post.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: post.content
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: post.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "rounded-full",
						children: ["#", t]
					}, t))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-muted/30 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-slate-700 dark:text-slate-300",
						children: "Available days"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 flex flex-wrap gap-1.5",
						children: post.availableDays.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-accent px-2.5 py-1 font-medium text-primary",
							children: day
						}, day))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-slate-700 dark:text-slate-300",
						children: "Time slots"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 flex flex-wrap gap-1.5",
						children: post.availableTimes.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-background dark:text-slate-300 dark:ring-border",
							children: slot
						}, slot))
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: onLike,
								className: liked ? "text-rose-600" : "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `mr-1.5 h-4 w-4 ${liked ? "fill-current" : ""}` }), post.likes]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setOpen((o) => !o),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mr-1.5 h-4 w-4" }), post.comments.length]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => toast.success("Link copied to clipboard"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "mr-1.5 h-4 w-4" }), " Share"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onRequest,
						className: "gap-2",
						children: "Request Free Session"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
						className: "sr-only",
						children: "Toggle comments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleContent, {
						className: "space-y-3 pt-2",
						children: [post.comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 rounded-lg bg-muted/40 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								className: "h-8 w-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "text-xs",
									children: c.initials
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: c.author
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: c.major
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-sm",
									children: c.body
								})]
							})]
						}, c.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								onComment(reply);
								setReply("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Write a reply…",
								value: reply,
								onChange: (e) => setReply(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "icon",
								"aria-label": "Send reply",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
							})]
						})]
					})]
				})
			]
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
					className: "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-secondary/30 hover:bg-slate-50 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted/50",
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
function CreatePostDialog({ onSubmit }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [topics, setTopics] = (0, import_react.useState)("");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [availableDays, setAvailableDays] = (0, import_react.useState)([]);
	const [availableTimes, setAvailableTimes] = (0, import_react.useState)([]);
	const canSubmit = title && topics && desc && availableDays.length > 0 && availableTimes.length > 0;
	const toggleValue = (value, values, setValues) => {
		setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Volunteer Post" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Share what you can teach for free with the SkillBridge community." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Post title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "e.g. Free weekend React basics tutoring",
							value: title,
							onChange: (e) => setTitle(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Topics / skills covered" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "e.g. React, Hooks, State Management",
							value: topics,
							onChange: (e) => setTopics(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Experience description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "Briefly describe your background and what learners will get out of it.",
							value: desc,
							onChange: (e) => setDesc(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
							label: "Available Days",
							placeholder: "Select days",
							options: AVAILABLE_DAYS,
							selected: availableDays,
							onToggle: (day) => toggleValue(day, availableDays, setAvailableDays)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
							label: "Available Time Slots",
							placeholder: "Select time slots",
							options: AVAILABLE_TIMES,
							selected: availableTimes,
							onToggle: (slot) => toggleValue(slot, availableTimes, setAvailableTimes)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: !canSubmit,
				onClick: () => onSubmit({
					id: crypto.randomUUID(),
					author: "Alex Chen",
					initials: "AC",
					major: "Computer Science, Year 3",
					title,
					content: desc,
					tags: topics.split(",").map((t) => t.trim()).filter(Boolean),
					availableDays,
					availableTimes,
					likes: 0,
					comments: []
				}),
				children: "Publish Post"
			}) })
		]
	});
}
//#endregion
export { ForumPage as component };
