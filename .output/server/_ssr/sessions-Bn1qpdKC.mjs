import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { B as Coins, F as Gift, G as CircleCheck, H as Clock, I as Flag, R as ExternalLink, d as Star, k as Link } from "../_libs/lucide-react.mjs";
import { a as DialogDescription, c as DialogTitle, h as useAuth, i as DialogContent, n as Button, o as DialogFooter, r as Dialog, s as DialogHeader, u as Input } from "./auth-CmX3G0zg.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DFtAAVyG.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BixMpYkw.mjs";
import { t as Textarea } from "./textarea-T99n1zi2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-Bqk1W2uE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sessions-Bn1qpdKC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INITIAL_SESSIONS = [
	{
		id: "s1",
		counterpart: "Priya Nair",
		initials: "PN",
		role: "Mentor",
		date: "Jul 24, 2026",
		time: "3:00 PM",
		mode: "Skill Points",
		points: 50,
		status: "SCHEDULED",
		meetUrl: "https://meet.google.com/abc-defg-hij"
	},
	{
		id: "s2",
		counterpart: "Marcus Lee",
		initials: "ML",
		role: "Learner",
		date: "Jul 26, 2026",
		time: "6:30 PM",
		mode: "Skill Exchange",
		points: 0,
		status: "SCHEDULED",
		meetUrl: "https://meet.google.com/xyz-1234-lmn"
	},
	{
		id: "p1",
		counterpart: "Aisha Khan",
		initials: "AK",
		role: "Mentor",
		date: "Jul 29, 2026",
		time: "5:00 PM",
		mode: "Skill Points",
		points: 40,
		status: "PENDING"
	},
	{
		id: "p2",
		counterpart: "Noah Kim",
		initials: "NK",
		role: "Learner",
		date: "Jul 30, 2026",
		time: "11:00 AM",
		mode: "Volunteer",
		points: 0,
		status: "PENDING"
	},
	{
		id: "c1",
		counterpart: "Diego Martinez",
		initials: "DM",
		role: "Mentor",
		date: "Jul 15, 2026",
		time: "4:00 PM",
		mode: "Skill Points",
		points: 30,
		status: "COMPLETED",
		meetUrl: "https://meet.google.com/diego-demo"
	},
	{
		id: "c2",
		counterpart: "Sara Wu",
		initials: "SW",
		role: "Learner",
		date: "Jul 10, 2026",
		time: "2:00 PM",
		mode: "Volunteer",
		points: 0,
		status: "COMPLETED"
	},
	{
		id: "d1",
		counterpart: "Jordan Blake",
		initials: "JB",
		role: "Mentor",
		date: "Jul 08, 2026",
		time: "7:00 PM",
		mode: "Skill Points",
		points: 25,
		status: "DISPUTED"
	}
];
var mentorIssueCategories = [
	"Learner No-Show",
	"Unprofessional Behavior",
	"Technical/Connection Issues",
	"Inappropriate Content",
	"Other"
];
var learnerIssueCategories = [
	"Mentor No-Show",
	"Scam / Invalid Content",
	"Unprofessional Behavior",
	"Technical Issues",
	"Other"
];
function statusBadge(status) {
	switch (status) {
		case "SCHEDULED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: "border-amber-500/30 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400",
			children: "Scheduled"
		});
		case "PENDING": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: "border-blue-500/30 bg-blue-500/15 text-blue-700 hover:bg-blue-500/15 dark:text-blue-400",
			children: "Pending Request"
		});
		case "COMPLETED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400",
			children: "Completed"
		});
		case "DISPUTED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: "border-rose-500/30 bg-rose-500/15 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400",
			children: "Disputed"
		});
	}
}
function SessionsPage() {
	const auth = useAuth();
	const [sessions, setSessions] = (0, import_react.useState)(INITIAL_SESSIONS);
	const [reviewSession, setReviewSession] = (0, import_react.useState)(null);
	const [issueSession, setIssueSession] = (0, import_react.useState)(null);
	const mentorSessions = sessions.filter((session) => session.role === "Mentor");
	const learnerSessions = sessions.filter((session) => session.role === "Learner");
	(0, import_react.useEffect)(() => {
		if (!auth.isLoggedIn) auth.openLogin("Please sign in to access My Sessions.");
	}, [auth]);
	if (!auth.isLoggedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto w-full max-w-3xl px-4 py-12 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-2xl p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Sign in required"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Please sign in to view and manage your sessions."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 rounded-xl",
					onClick: () => auth.openLogin("Please sign in to access My Sessions."),
					children: "Sign In"
				})
			]
		})
	});
	const updateSession = (id, patch) => {
		setSessions((current) => current.map((session) => session.id === id ? {
			...session,
			...patch
		} : session));
	};
	const submitReview = () => {
		if (!reviewSession) return;
		auth.awardPoints(3);
		updateSession(reviewSession.id, { status: "COMPLETED" });
		setReviewSession(null);
		toast.success("Review submitted. +3 Pts added to your wallet.");
	};
	const submitIssue = () => {
		if (!issueSession) return;
		updateSession(issueSession.id, { status: "DISPUTED" });
		setIssueSession(null);
		toast.error("Issue reported. Admin will review this session.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-7xl p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "My Sessions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Manage sessions you teach and sessions where you are learning."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				className: "mb-6 border-amber-500/40 bg-amber-500/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-600" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
						className: "text-amber-800 dark:text-amber-300",
						children: "Auto-complete pending"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
						className: "text-amber-800/90 dark:text-amber-200/90",
						children: "Session on July 20 marked complete by mentor. Points will auto-transfer in 18 hours if no dispute is raised."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "mentor",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full grid-cols-2 sm:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "mentor",
							children: "As Mentor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "learner",
							children: "As Learner"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "mentor",
						className: "mt-6 space-y-4",
						children: mentorSessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionCard, {
							session,
							view: "mentor",
							onMeetSave: (url) => updateSession(session.id, { meetUrl: url }),
							onComplete: () => {
								updateSession(session.id, { status: "COMPLETED" });
								toast.success("Session marked as completed.");
							},
							onReport: () => setIssueSession(session)
						}, session.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "learner",
						className: "mt-6 space-y-4",
						children: learnerSessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionCard, {
							session,
							view: "learner",
							onComplete: () => setReviewSession(session),
							onReport: () => setIssueSession(session)
						}, session.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewDialog, {
				session: reviewSession,
				onClose: () => setReviewSession(null),
				onSubmit: submitReview
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueDialog, {
				session: issueSession,
				onClose: () => setIssueSession(null),
				onSubmit: submitIssue
			})
		]
	});
}
function SessionCard({ session, view, onMeetSave, onComplete, onReport }) {
	const [meetDraft, setMeetDraft] = (0, import_react.useState)(session.meetUrl ?? "");
	const canAct = session.status === "SCHEDULED" || session.status === "PENDING";
	const joinUrl = session.meetUrl || "https://meet.google.com/new";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: "h-11 w-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: session.initials })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base",
						children: ["Session with ", session.counterpart]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["You are the ", session.role.toLowerCase()]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0",
					children: statusBadge(session.status)
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 text-sm sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: session.date
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: session.time
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Mode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [session.mode, session.points > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-1 inline-flex items-center gap-1 text-amber-600",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-3.5 w-3.5" }),
									session.points,
									" Pts Locked in Escrow"
								]
							})]
						})] })
					]
				}),
				view === "mentor" && canAct && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-border dark:bg-muted/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: meetDraft,
							onChange: (event) => setMeetDraft(event.target.value),
							placeholder: "Paste Google Meet URL",
							className: "rounded-xl border-slate-200 focus-visible:ring-secondary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "rounded-xl border-secondary/25 text-primary hover:bg-accent hover:text-[#0F2742]",
							onClick: () => {
								onMeetSave?.(meetDraft.trim());
								toast.success("Google Meet link saved.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "mr-1.5 h-4 w-4" }), "Save Link"]
						})]
					}), session.meetUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: session.meetUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" }), "Google Meet Link Added"]
					})]
				}),
				view === "learner" && canAct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: joinUrl,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1.5 h-4 w-4" }), " Join Google Meet"]
					})
				}),
				canAct && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onComplete,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1.5 h-4 w-4" }), " Mark Session as Completed"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700",
						onClick: onReport,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "mr-1.5 h-4 w-4" }), " Report Issue"]
					})]
				})
			]
		})]
	});
}
function ReviewDialog({ session, onClose, onSubmit }) {
	const [rating, setRating] = (0, import_react.useState)(0);
	const [hover, setHover] = (0, import_react.useState)(0);
	const [review, setReview] = (0, import_react.useState)("");
	const close = () => {
		setRating(0);
		setHover(0);
		setReview("");
		onClose();
	};
	const submit = () => {
		if (rating === 0) return;
		setRating(0);
		setHover(0);
		setReview("");
		onSubmit();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!session,
		onOpenChange: (open) => !open && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Leave Review & Rating" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Share feedback for your session with ",
					session?.counterpart,
					"."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm font-medium",
							children: "Rate your session"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-1",
							children: [
								1,
								2,
								3,
								4,
								5
							].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onMouseEnter: () => setHover(value),
								onMouseLeave: () => setHover(0),
								onClick: () => setRating(value),
								className: "p-1",
								"aria-label": `${value} star`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-7 w-7 transition-colors ${(hover || rating) >= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}` })
							}, value))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm font-medium",
							children: "Feedback"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "What went well? What could improve?",
							value: review,
							onChange: (event) => setReview(event.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/30",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-emerald-800 dark:text-emerald-300",
								children: "Earn +3 Pts for leaving a review!"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: close,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						disabled: rating === 0,
						children: "Submit Review"
					})]
				})
			]
		})
	});
}
function IssueDialog({ session, onClose, onSubmit }) {
	const [category, setCategory] = (0, import_react.useState)("");
	const [details, setDetails] = (0, import_react.useState)("");
	const categories = session?.role === "Mentor" ? mentorIssueCategories : learnerIssueCategories;
	const close = () => {
		setCategory("");
		setDetails("");
		onClose();
	};
	const submit = () => {
		if (!category) return;
		setCategory("");
		setDetails("");
		onSubmit();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!session,
		onOpenChange: (open) => !open && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Report Issue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Select the issue category for your session with ",
					session?.counterpart,
					"."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCategory(item),
							className: `rounded-xl border px-3 py-2 text-left text-sm transition ${category === item ? "border-secondary bg-accent font-semibold text-primary" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`,
							children: item
						}, item))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: details,
						onChange: (event) => setDetails(event.target.value),
						placeholder: "Add any details for the admin team...",
						className: "rounded-xl"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: close,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !category,
					onClick: submit,
					children: "Submit Report"
				})] })
			]
		})
	});
}
//#endregion
export { SessionsPage as component };
