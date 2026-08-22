import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { G as CircleCheck, N as Handshake, Q as CalendarClock, U as ClipboardList, X as Check, Y as ChevronDown, et as BellRing, t as X, v as Send, x as Plus } from "../_libs/lucide-react.mjs";
import { a as DialogDescription, c as DialogTitle, d as Label, f as cn, h as useAuth, i as DialogContent, n as Button, o as DialogFooter, r as Dialog, s as DialogHeader, u as Input } from "./auth-CmX3G0zg.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DFtAAVyG.mjs";
import { t as Textarea } from "./textarea-T99n1zi2.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BQwYuVAq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-B6vj-_Ya.mjs";
import { n as useNotifications } from "./notifications-HN8ChM6X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/noticeboard-DmMABUNi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initialRequests = [
	{
		id: "n1",
		requester: "Maya Chen",
		initials: "MC",
		skillTitle: "Python for Data Cleaning",
		category: "Data Science",
		description: "I understand basic Python, but I need help cleaning CSV files, handling missing values, and preparing data for charts.",
		availableDays: ["Tuesday", "Thursday"],
		availableTimes: ["06:00 PM", "08:00 PM"],
		preferredSchedule: "Tuesday, Thursday - 06:00 PM, 08:00 PM",
		level: "Beginner",
		timestamp: "12 min ago",
		status: "Open"
	},
	{
		id: "n2",
		requester: "Noah Williams",
		initials: "NW",
		skillTitle: "Git Merge Conflicts",
		category: "Developer Tools",
		description: "Looking for someone who can walk me through resolving conflicts in a team project without breaking everyone else's work.",
		availableDays: ["Saturday"],
		availableTimes: ["08:00 AM", "10:00 AM"],
		preferredSchedule: "Saturday - 08:00 AM, 10:00 AM",
		level: "Intermediate",
		timestamp: "1h ago",
		status: "Open"
	},
	{
		id: "n3",
		requester: "Ava Ramirez",
		initials: "AR",
		skillTitle: "Figma Components",
		category: "Design",
		description: "I want to learn how variants, auto-layout, and reusable design system components work in Figma.",
		availableDays: [
			"Monday",
			"Wednesday",
			"Friday"
		],
		availableTimes: ["02:00 PM", "04:00 PM"],
		preferredSchedule: "Monday, Wednesday, Friday - 02:00 PM, 04:00 PM",
		level: "Beginner",
		timestamp: "Yesterday",
		status: "Matched",
		offerMessage: "I can teach this with a quick UI kit exercise.",
		selectedOfferSlot: "Wednesday at 02:00 PM",
		selectedOfferDay: "Wednesday",
		selectedOfferTime: "02:00 PM"
	}
];
var levelOptions = [
	"Beginner",
	"Intermediate",
	"Advanced"
];
var availableDayOptions = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday"
];
var availableTimeOptions = [
	"08:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"02:00 PM",
	"04:00 PM",
	"06:00 PM",
	"08:00 PM"
];
function formatSchedule(days, times) {
	return `${days.join(", ")} - ${times.join(", ")}`;
}
function NoticeboardPage() {
	const auth = useAuth();
	const notifications = useNotifications();
	const [requests, setRequests] = (0, import_react.useState)(initialRequests);
	const [postOpen, setPostOpen] = (0, import_react.useState)(false);
	const [offerTarget, setOfferTarget] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		skillTitle: "",
		category: "",
		description: "",
		availableDays: [],
		availableTimes: [],
		level: "Beginner"
	});
	const [offerMessage, setOfferMessage] = (0, import_react.useState)("");
	const [selectedOfferDay, setSelectedOfferDay] = (0, import_react.useState)("");
	const [selectedOfferTime, setSelectedOfferTime] = (0, import_react.useState)("");
	const openPostModal = () => {
		if (!auth.requireAuth("Please sign in to post skill requests or contact learners.")) return;
		setPostOpen(true);
	};
	const submitRequest = () => {
		if (!form.skillTitle.trim() || !form.category.trim() || !form.description.trim() || form.availableDays.length === 0 || form.availableTimes.length === 0) {
			toast.error("Please add the request details and at least one available day and time.");
			return;
		}
		const requester = auth.currentUser?.name ?? "Ava Ramirez";
		const initials = auth.currentUser?.avatar ?? getInitials(requester);
		const newRequest = {
			id: crypto.randomUUID(),
			requester,
			initials,
			skillTitle: form.skillTitle.trim(),
			category: form.category.trim(),
			description: form.description.trim(),
			availableDays: form.availableDays,
			availableTimes: form.availableTimes,
			preferredSchedule: formatSchedule(form.availableDays, form.availableTimes),
			level: form.level,
			timestamp: "Just now",
			status: "Open"
		};
		setRequests((current) => [newRequest, ...current]);
		notifications.addNotification({
			title: "New mentor request",
			detail: `${requester} is looking for a mentor for ${newRequest.skillTitle}`,
			tone: "info"
		});
		toast.success("Noticeboard request posted.");
		setPostOpen(false);
		setForm({
			skillTitle: "",
			category: "",
			description: "",
			availableDays: [],
			availableTimes: [],
			level: "Beginner"
		});
	};
	const openOfferModal = (request) => {
		if (!auth.requireAuth("Please sign in to offer mentorship on noticeboard requests.")) return;
		setOfferTarget(request);
		setOfferMessage("");
		setSelectedOfferDay("");
		setSelectedOfferTime("");
	};
	const sendOffer = () => {
		if (!offerTarget) return;
		if (!selectedOfferDay || !selectedOfferTime) {
			toast.error("Please pick a day and time before sending your offer.");
			return;
		}
		const mentor = auth.currentUser?.name ?? "Ava Ramirez";
		const message = offerMessage.trim() || "I can help you learn this skill.";
		const selectedOfferSlot = `${selectedOfferDay} at ${selectedOfferTime}`;
		setRequests((current) => current.map((request) => request.id === offerTarget.id ? {
			...request,
			status: "Matched",
			offerMessage: message,
			selectedOfferSlot,
			selectedOfferDay,
			selectedOfferTime
		} : request));
		notifications.addNotification({
			title: "Mentor offer received",
			detail: `${mentor} offered to teach you ${offerTarget.skillTitle} on ${selectedOfferDay} at ${selectedOfferTime}!`,
			tone: "success"
		});
		toast.success("Offer sent to learner.");
		setOfferTarget(null);
		setOfferMessage("");
		setSelectedOfferDay("");
		setSelectedOfferTime("");
	};
	const toggleFormValue = (field, value) => {
		setForm((current) => {
			const values = current[field];
			return {
				...current,
				[field]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
			};
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl space-y-6 px-4 py-5 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-primary",
							children: "Learner Requests"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold tracking-tight sm:text-3xl",
							children: "Noticeboard"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm text-muted-foreground",
						children: "Can't find a mentor for a specific skill? Post a request for mentors to see."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "shrink-0 rounded-xl",
					onClick: openPostModal,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Post Request"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1fr_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: requests.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeRequestCard, {
						request,
						onOffer: () => openOfferModal(request)
					}, request.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "rounded-3xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "flex items-center gap-2 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "h-4 w-4 text-primary" }), "How it Works"]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Learners post a missing skill request." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mentors browse open cards and offer to teach." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Matched requests stay visible so everyone can see what is being covered." })
							]
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: postOpen,
				onOpenChange: setPostOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "rounded-2xl sm:max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Post a Skill Request" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Tell mentors what you want to learn and when you are available." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "skill-title",
										children: "Skill Title"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "skill-title",
										value: form.skillTitle,
										onChange: (event) => setForm((current) => ({
											...current,
											skillTitle: event.target.value
										})),
										placeholder: "Python for Beginners",
										className: "rounded-xl"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "skill-category",
										children: "Category"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "skill-category",
										value: form.category,
										onChange: (event) => setForm((current) => ({
											...current,
											category: event.target.value
										})),
										placeholder: "Programming",
										className: "rounded-xl"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Skill Level Needed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.level,
										onValueChange: (value) => setForm((current) => ({
											...current,
											level: value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "rounded-xl",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: levelOptions.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: level,
											children: level
										}, level)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
									label: "Available Days",
									placeholder: "Select days",
									options: availableDayOptions,
									selected: form.availableDays,
									onToggle: (value) => toggleFormValue("availableDays", value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
									label: "Available Time Slots",
									placeholder: "Select time slots",
									options: availableTimeOptions,
									selected: form.availableTimes,
									onToggle: (value) => toggleFormValue("availableTimes", value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 md:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "request-description",
										children: "Description / What you want to learn"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "request-description",
										value: form.description,
										onChange: (event) => setForm((current) => ({
											...current,
											description: event.target.value
										})),
										rows: 4,
										placeholder: "Describe what you are stuck on, your current level, and what kind of help would be useful.",
										className: "rounded-xl"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setPostOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: submitRequest,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), "Submit Request"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(offerTarget),
				onOpenChange: (open) => !open && setOfferTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "rounded-2xl sm:max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Offer to Teach" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							"Send a short note to ",
							offerTarget?.requester ?? "the learner",
							" about how you can help."
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-muted/40 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: offerTarget?.skillTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: offerTarget?.description
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 rounded-xl border border-secondary/20 bg-accent p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-primary",
									children: "Learner Availability"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-primary",
									children: offerTarget?.preferredSchedule
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold text-slate-700",
										children: "Pick a day"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: offerTarget?.availableDays.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedOfferDay(day),
											className: cn("rounded-full px-3 py-1.5 text-sm font-medium transition", selectedOfferDay === day ? "bg-primary text-white shadow-sm" : "border border-slate-200 bg-background text-slate-700 hover:bg-muted/60"),
											children: day
										}, day))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold text-slate-700",
										children: "Pick a time"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: offerTarget?.availableTimes.map((time) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedOfferTime(time),
											className: cn("rounded-full px-3 py-1.5 text-sm font-medium transition", selectedOfferTime === time ? "border-2 border-primary bg-background text-primary shadow-sm" : "border border-slate-200 bg-background text-slate-700 hover:bg-muted/60"),
											children: time
										}, time))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "offer-message",
								children: "Optional Message"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "offer-message",
								value: offerMessage,
								onChange: (event) => setOfferMessage(event.target.value),
								rows: 4,
								placeholder: "I can help you with this. I am free Friday afternoon...",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOfferTarget(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: sendOffer,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, { className: "h-4 w-4" }), "Send Offer"]
						})] })
					]
				})
			})
		]
	});
}
function NoticeRequestCard({ request, onOffer }) {
	const matched = request.status === "Matched";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "rounded-3xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							className: "h-11 w-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "bg-primary text-sm font-semibold text-primary-foreground",
								children: request.initials
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold text-foreground",
										children: request.skillTitle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "rounded-full",
										children: request.level
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "rounded-full border-0 " + (matched ? "bg-success/15 text-success hover:bg-success/15" : "bg-accent text-primary hover:bg-accent"),
										children: matched ? "Matched" : "Open"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"Posted by ",
									request.requester,
									" - ",
									request.timestamp
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: matched ? "secondary" : "default",
						className: "shrink-0 rounded-xl",
						onClick: onOffer,
						disabled: matched,
						children: matched ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), "Offer Sent"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, { className: "h-4 w-4" }), "Offer to Teach"] })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted-foreground",
					children: request.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "rounded-full bg-background",
						children: request.category
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-3.5 w-3.5" }),
							"Schedule: ",
							request.preferredSchedule
						]
					})]
				}),
				request.offerMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-xl border border-secondary/20 bg-accent p-3 text-sm text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Offer slot:"
						}),
						" ",
						request.selectedOfferSlot ?? request.preferredSchedule
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Latest offer:"
							}),
							" ",
							request.offerMessage
						]
					})]
				})
			]
		})
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
	return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}
//#endregion
export { NoticeboardPage as component };
